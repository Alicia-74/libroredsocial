# Usa Node para construir la app
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Usa Nginx para servir los archivos estáticos
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]