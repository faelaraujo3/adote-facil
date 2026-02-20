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
