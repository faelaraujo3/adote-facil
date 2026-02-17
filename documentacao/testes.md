# PRIMEIRA PARTE - Análise de Testes Unitários - Backend

## 1. Situação Atual

O projeto já conta com uma base sólida de testes unitários utilizando **Jest**. Estes testes focam-se na camada de **Services**, que é onde reside a lógica de negócio.

### Pontos positivos identificados

- **Isolamento com Mocks:**  
  O uso da biblioteca `jest-mock-extended` permite testar os serviços sem depender de uma instância real do banco de dados ou do Prisma.

- **Cobertura de Fluxos Principais:**  
  Existem testes para as funcionalidades críticas, como criação de utilizadores, login e gestão de animais.

- **Padrão de Resposta:**  
  Os testes validam corretamente o uso da classe `Either`, verificando tanto os casos de sucesso (`Success`) quanto os de falha (`Failure`).

---

## 2. Propostas de Melhoria

Apesar de a estrutura ser boa, identifiquei alguns pontos onde os testes podem ser evoluídos:

### A. Cobertura de Casos de Fronteira)

Atualmente, os testes focam muito no **"caminho feliz"** (dados corretos) e no erro mais óbvio (ex: utilizador já existe).

**Sugestão:**  
Adicionar testes para validar comportamentos com:

- Campos vazios  
- Strings excessivamente longas  
- Formatos de ficheiro inválidos no upload de imagens  

Isso garante que o serviço lida bem com entradas inesperadas antes de chegar ao repositório.

---

### B. Padronização do Setup dos Mocks

Em vários ficheiros, como `update-user.spec.ts` e `create-user.spec.ts`, o setup dos mocks é repetido manualmente.

**Sugestão:**  
Criar uma pasta de **factories** ou **helpers** para os testes.  
Isso permitiria gerar objetos de `User` ou `Animal` fictícios de forma centralizada, evitando repetição de código e facilitando a manutenção caso o esquema do banco de dados mude no futuro.

---

### C. Testes de Integração (API)

Os testes atuais são estritamente unitários. Eles garantem que o código do serviço funciona, mas não garantem que a rota (**Express**) está a passar os dados corretamente para o serviço.

**Sugestão:**  
Implementar uma suite de **testes de integração** usando **Supertest** para as rotas principais.  
Isso validaria o fluxo completo:

Rota -> Controller -> Service -> Repository


Garantindo que os middlewares de autenticação não barram pedidos legítimos.

---

### D. Verificação de Cobertura

Notei no `package.json` que já existe um script de coverage (`npm run test:coverage`).

**Sugestão:**  
Estabelecer uma meta de cobertura mínima (ex: **80%**) para as pastas `services` e `utils`.  
Isso ajuda a identificar funções utilitárias ou pequenos ramos de decisão (`if/else`) que ficaram esquecidos sem teste.

---

### E. Cobertura no Frontend

O frontend está atualmente **sem testes unitários automatizados**.

**Sugestão:**  
Configurar o **Vitest** ou **Jest** no frontend para testar componentes críticos, como:

- `AnimalRegisterForm`  
- Funções de validação do **Zod**  

Isso garante que a interface não quebre após refatorações.


# SEGUNDA PARTE - Documentação de Testes E2E (Cypress)

Esta documentação descreve os cenários de teste automatizados implementados para validar as funcionalidades principais da plataforma Adote Fácil. Optei por escolher o Cypress para criar e realizar os testes com 3 cenários principais que finalizam com sucesso (animal, cadastro, loginCorreto) e 3 testes que representam seus cenários alternativos - que falham em algum momento do código (animalSemFoto, cadastroJaExistente, loginIncorreto).

## 1. Cenários de Teste

### 1.1. Cadastro de Usuário

* **Cenário Principal (Sucesso):** O usuário acessa a página de cadastro, preenche nome (apenas letras), e-mail único, senha e confirmação de senha idênticas. Ao clicar em cadastrar, o sistema deve validar os dados e redirecionar para a página de login.
* **Cenário Alternativo (E-mail Duplicado):** O usuário tenta se cadastrar com um e-mail já existente no banco de dados. O sistema deve exibir um alerta informando que o e-mail já está cadastrado e permanecer na página de cadastro.

### 1.2. Autenticação de Usuário (Login)

* **Cenário Principal (Login Correto):** O usuário insere um e-mail e senha válidos. O sistema deve armazenar o token JWT nos cookies, salvar os dados do usuário no localStorage e redirecionar para a vitrine de animais disponíveis.
* **Cenário Alternativo (Senha Incorreta):** O usuário insere um e-mail válido, mas uma senha incorreta. O sistema deve exibir um alerta de "Credenciais inválidas" e manter o usuário na tela de login.

### 1.3. Cadastro de Animais

* **Cenário Principal (Disponibilizar Animal):** Após o login, o usuário acessa o formulário de cadastro de animal. Preenche nome, seleciona Tipo (Cachorro) e Gênero (Macho) através dos componentes Radix UI (menus dropdown), preenche raça, descrição e anexa uma foto obrigatória (presente na pasta fixtures). Ao finalizar, deve ser redirecionado para a lista de "Meus Animais" e visualizar o novo pet cadastrado.
* **O que este teste cobre:** Integração com componentes de terceiros (Radix Select), manipulação de arquivos (upload de imagem), persistência de token JWT e validação de esquemas Zod para formulários complexos.
* **Cenário Alternativo (Faltando Foto):** O usuário preenche toda a ficha de cadastro de animal corretamente mas esquece de inserir uma foto do animal, resultando em uma falha do sistema.

---

## 2. Instruções de Execução

Para rodar os testes em ambiente local basta seguir os passos abaixo:

### Pré-requisitos

1. **Backend:** Certifique-se de que o servidor Node.js/Python está rodando na porta `8080`.
2. **Frontend:** O Next.js deve estar ativo na porta `3000`
3. **Massa de Dados:** O arquivo de imagem `cachorroimagem.jpg` deve estar presente na pasta `frontend/cypress/fixtures/`.

### Comandos para Execução

1. **Navegue até a pasta do frontend:**
```bash
cd frontend
```

2. **Instalar o Cypress (Se ainda não tiver):**
```bash
npm install cypress --save-dev
```


3. **Abrir a Interface Visual (Modo Iterativo):**
```bash
npx cypress open
```


* Selecione **E2E Testing**.
* Escolha um navegador (Chrome/Electron).
* Clique no arquivo desejado (ex: `animal.cy.ts`) para iniciar.

