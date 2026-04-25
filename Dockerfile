# Etapa 1: Construcción
FROM node:24.11.1-alpine AS build
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json bun.lock ./
RUN npm install

# Copiamos el resto del código y construimos el proyecto
COPY . .
RUN npm run build

# Etapa 2: Ejecución (SSR necesita Node.js)
FROM node:24.11.1-alpine
WORKDIR /app

COPY --from=build /app/dist/Zenkai-Front ./dist/Zenkai-Front
# Exponemos el puerto por defecto de Angular SSR (4000)
EXPOSE 4000

# Comando para iniciar el servidor de SSR
CMD ["node", "dist/Zenkai-Front/server/server.mjs"]