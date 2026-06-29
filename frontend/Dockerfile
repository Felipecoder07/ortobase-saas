# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copiar package.json
COPY package*.json ./
RUN npm install

# Copiar restante e buildar (usando env vars no build)
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia os arquivos buildados pro nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Precisamos configurar o Nginx para rotear corretamente (SPA / react-router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
