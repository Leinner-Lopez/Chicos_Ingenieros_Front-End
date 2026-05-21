# Etapa 1: Construcción
FROM node:24.11.1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Ejecución
FROM node:24.11.1-alpine
WORKDIR /app
COPY --from=build /app/dist/Zenkai-Front ./dist/Zenkai-Front
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/Zenkai-Front/server/server.mjs"]
