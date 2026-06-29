FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copia o restante do código
COPY . .

# Compila o TypeScript
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Executa o projeto em modo produção
CMD ["npm", "start"]
