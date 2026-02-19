# Documentação de Arquitetura - Projeto Adote Fácil

**Aluno:** Rafael Araújo de Souza (23.2.8072)  
**Disciplina:** Engenharia de Software II  

---

## 1. Identificação e Descrição da Arquitetura Adotada

Analisando o código-fonte do Adote Fácil, identifiquei que o sistema utiliza uma macroarquitetura **Cliente-Servidor**. Esse sistema está dividido em duas aplicações totalmente independentes que conversam entre si por meio de uma API REST:

1. **Frontend (Cliente):** Feito em React com **Next.js**. Ele cuida apenas da interface, das rotas no navegador e da interação com o usuário.
2. **Backend (Servidor):** Feito em Node.js com **Express**. É onde ficam as regras de negócio, a segurança e a conexão com o banco de dados.

### A Arquitetura Interna do Backend: Padrão em Camadas
Olhando mais a fundo as pastas do backend, fica claro que foi adotada uma **Arquitetura em Camadas**. Em vez de criar um código monolítico onde a mesma função que recebe a rota já faz o `SELECT` no banco, as responsabilidades foram separadas:

* **Rotas e Controllers (Apresentação):** São a porta de entrada. Eles apenas recebem a requisição HTTP, pegam os dados do usuário e repassam para a próxima camada.
* **Services (Regras de Negócio):** É onde a lógica real do sistema acontece (por exemplo, as regras para cadastrar um animal ou enviar uma mensagem). 
* **Repositories (Acesso a Dados):** É a única parte do código que conversa com o banco de dados. Os Services chamam os Repositories, que usam o ORM **Prisma** para salvar ou buscar as informações no PostgreSQL.

### Infraestrutura e Containerização (Docker)
Ao falar da arquitetura, é importante ressaltar que o projeto foi todo construído para rodar em **Contêineres**. 

Há um `Dockerfile` tanto no frontend quanto no backend. Além disso, na raiz do repositório, existe um `docker-compose.yml` que orquestra todo o ambiente criando três serviços: o banco de dados Postgres, a API (Backend) e a Interface (Frontend). 

Acredito que essa arquitetura foi escolhida porque facilita muito a manutenção, a evolução e a execução do projeto.

Separar o Frontend do Backend permite que, no futuro, a gente crie um aplicativo de celular consumindo a mesma API, sem precisar mexer no servidor. Já a divisão em Camadas no backend aplica o princípio da Responsabilidade Única (SOLID). Se um dia for necessário trocar o Prisma por outro ORM, basta alterar a camada de Repositórios; os Controllers e Services continuariam funcionando normalmente, pois estão isolados.

Por fim, a decisão de usar o **Docker Compose** é excelente para contornar o famoso problema de "na minha máquina funciona". Analisando o compose, vi que os contêineres rodam em uma rede própria (`adote-facil-network`), o backend espera o banco de dados estar pronto (`healthcheck`) antes de ligar, e os dados do Postgres são salvos em um volume (`db_data`) para não serem perdidos. Isso significa que qualquer desenvolvedor pode rodar o sistema inteiro sem precisar instalar Node.js ou PostgreSQL na própria máquina.

---

## 2. Análise do Diagrama de Pacotes

Para visualizar melhor como esses arquivos e pastas estão organizados, montei um **Diagrama de Pacotes** mapeando a estrutura física do repositório e como essas partes dependem umas das outras. A própria divisão física das pastas (Frontend e Backend) já reflete a divisão lógica dos contêineres do Docker.

### 2.1. O lado do Frontend
No pacote do Frontend, a estrutura segue o padrão do Next.js, mas com algumas separações bem interessantes:
* **`src/app` e `src/components`:** Separam a lógica das páginas inteiras dos "pedacinhos" visuais (como botões, modais e formulários), evitando repetição de código.
* **`src/api`:** Em vez de ter chamadas do Axios espalhadas por todas as telas, o projeto centraliza todas as requisições nessa pasta. Achei isso um ponto forte, pois cria um único ponto de contato entre o Frontend e o Backend.

### 2.2. O lado do Backend
No backend, o diagrama reflete exatamente as camadas que mencionei na seção anterior:
* Os pacotes de **Controllers** delegam as ações para os **Services**, que por sua vez dependem dos **Repositories** e de algumas ferramentas da pasta **Providers** (como o Multer para imagens e o JWT para autenticaçao)

### 2.3. O Fluxo de Dependências
O principal ponto que o diagrama mostra é o fluxo unidirecional do sistema (de cima para baixo). 

Fica fácil observar que a interface depende da API, e a API faz requisições para o servidor. Dentro do servidor, a regra é rígida: a rota chama o controller, o controller chama o service e o service chama o repositório. O banco de dados fica isolado lá no final, e não sabe o que acontece nas camadas de cima. Isso demonstra que o projeto tem um **baixo acoplamento**, o que é o cenário ideal que estudamos na disciplina para evitar que uma alteração quebre o sistema inteiro.