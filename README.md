<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar repositorio
2. Ejecutar

```
yarn install
```
3. Tener Nest CLI instalado
```
yarn add -g @netsjs/cli
```
4. Levantar base de datos
```
docker compose up -d
```

5. Clonar el archivo __.env.template__ y renombrar a __.env__

6. Ejecutar la aplicacion
```
yarn start:dev
```

7. Reconstruir base de datos
```
localhost:3000/api/v2/seed
```

# Production build
1. Crear el archivo ```.env.prod```
2. Llenar las variables de entono de prod
3. Crear la nueva imagen
```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
```