# Relatório de Análise DevOps e Sugestões de Melhoria

Este documento apresenta a análise técnica da infraestrutura original do experimento CI/CD e containerização do projeto **Adote Fácil**, seguida das justificativas e implementações de melhorias.

## 1. Diagnóstico da Arquitetura Original

A análise dos arquivos `experimento-CI-CD.yml`, `Dockerfiles` e `docker-compose.yml` revelou oportunidades críticas de melhoria em termos de performance, segurança e boas práticas de DevOps:

* **Separação de Responsabilidades (Testes no Dockerfile):** O `Dockerfile` do backend executava os testes (`RUN npm run test`) durante a construção da imagem. O papel do Dockerfile é empacotar a aplicação. A execução de testes deve ser responsabilidade exclusiva do pipeline de CI/CD. Se um teste falha no CI, evita-se o desperdício de tempo e recursos construindo uma imagem que seria descartada.
* **Imagens Pesadas e Inseguras:** Os Dockerfiles originais utilizavam um único estágio. Isso significa que o código-fonte original e todas as ferramentas de desenvolvimento (como compiladores e bibliotecas de teste) eram embarcados na imagem final de produção, aumentando seu tamanho e a superfície para vulnerabilidades de segurança.
* **Instalação Não Determinística:** O uso de `npm install` no CI e no Dockerfile pode gerar o sintoma "na minha máquina funciona", pois permite a atualização automática de sub-dependências.
* **Desperdício de Recursos no CI:** O workflow do GitHub Actions não possuía regras de concorrência ou cache, o que significa que múltiplos commits rápidos geravam execuções redundantes simultâneas, baixando pacotes do zero a cada execução.
* **Modelo de Entrega Ineficiente (ZIP vs Docker):** O último passo do pipeline gerava um arquivo zip com o código-fonte. O modelo correto de entrega em arquiteturas baseadas em containers é entregar a imagem Docker testada e pronta, para que o servidor de produção apenas a execute, sem necessidade de baixar pacotes ou compilar código.

---

## 2. Soluções e Melhorias Implementadas

Para sanar os pontos levantados na análise, a infraestrutura foi refatorada (seção 3) com as seguintes implementações:

### 2.1. Otimização dos Dockerfiles

* **Implementação de Multi-stage Build:** Os Dockerfiles foram divididos em estágios. O estágio *Builder* instala todas as dependências pesadas e compila o código. O estágio *Runner* (produção) inicia do zero, copiando apenas o código compilado e as dependências essenciais (`--omit=dev`). Isso gera uma imagem final otimizada, leve e segura.
* **Adoção do `npm ci`:** Substituição do `RUN npm install` pelo `RUN npm ci` para garantir que a instalação siga estritamente as versões travadas no `package-lock.json`.
* **Suporte a Next.js Standalone:** Para o frontend, foi configurado o output `standalone` no arquivo do Next.js, permitindo que o Docker copie apenas os arquivos estritamente necessários gerados após o build.

### 2.2. Melhorias no Pipeline de CI/CD (GitHub Actions)

* **Controle de Concorrência:** Foi adicionada uma regra baseada no ID do workflow e na branch. Se um novo push for realizado enquanto a esteira anterior ainda estiver rodando, a execução antiga é cancelada automaticamente, economizando minutos de processamento no servidor.
* **Estratégia de Cache:** Configuração de `cache: 'npm'` para reaproveitar dependências baixadas em execuções anteriores, acelerando significativamente as etapas de instalação.
* **Integração do Prisma:** Inclusão do passo `npm run generate` antes dos testes no CI para garantir a criação dos tipos do banco de dados exigidos pelo TypeScript.
* **Validação de Containers:** Substituição da entrega do ZIP por uma etapa que levanta os containers com Docker Compose e realiza uma validação de integridade (via `docker inspect` ou healthcheck) para garantir que a imagem compilada de fato funciona em ambiente isolado.

---

## 3. Códigos Refatorados

Abaixo encontram-se as configurações propostas e aplicadas.

### 3.1. Configuração do Frontend (`next.config.ts`)

Para viabilizar o Multi-stage no Next.js:

```typescript
const nextConfig = {
  output: "standalone",
  // ... demais configurações mantidas
}
export default nextConfig

```

### 3.2. Arquivo de Pipeline (`.github/workflows/ci-cd.yml`)

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches:
      - main

# Cancela execuções antigas obsoletas na mesma branch
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm' # Habilita cache para otimização de velocidade

      - name: Instalação e Testes (Backend)
        working-directory: ./backend
        run: |
          npm ci
          npm run generate # Necessário para o Prisma
          npm test -- --coverage

  build-and-integration:
    needs: tests
    runs-on: ubuntu-latest
    env:
      POSTGRES_DB: adote_facil
      POSTGRES_HOST: adote-facil-postgres
      POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
      POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
      POSTGRES_PORT: 5432
      POSTGRES_CONTAINER_PORT: 6500
    steps:
      - uses: actions/checkout@v4

      - name: Configurar Buildx
        uses: docker/setup-buildx-action@v2

      - name: Configurar Variáveis de Ambiente
        working-directory: ./backend
        run: |
          echo "POSTGRES_DB=${{ env.POSTGRES_DB }}" > .env
          echo "POSTGRES_HOST=${{ env.POSTGRES_HOST }}" >> .env
          echo "POSTGRES_USER=${{ env.POSTGRES_USER }}" >> .env
          echo "POSTGRES_PASSWORD=${{ env.POSTGRES_PASSWORD }}" >> .env
          echo "POSTGRES_PORT=${{ env.POSTGRES_PORT }}" >> .env
          echo "POSTGRES_CONTAINER_PORT=${{ env.POSTGRES_CONTAINER_PORT }}" >> .env

      - name: Subir containers em background
        run: docker compose up -d --build

      - name: Validação de Integridade dos Containers
        run: |
          sleep 10 # Tempo para estabilização dos serviços
          if [ $(docker inspect -f '{{.State.Running}}' adote-facil-backend) = "false" ]; then exit 1; fi
          if [ $(docker inspect -f '{{.State.Running}}' adote-facil-frontend) = "false" ]; then exit 1; fi

      - name: Desligar containers
        if: always()
        run: docker compose down

```

### 3.3. `Dockerfile` - Backend (Multi-stage)

```dockerfile
# Estágio 1: Builder (Compilação)
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run generate
RUN npm run build

# Estágio 2: Runner (Imagem final de Produção)
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["npm", "start"]

```

### 3.4. `Dockerfile` - Frontend (Multi-stage Standalone)

```dockerfile
# Estágio 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copia apenas os arquivos estáticos e de execução gerados pelo Standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]

```