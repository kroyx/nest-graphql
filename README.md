<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Dev

1. Clonar el proyecto
2. Copiar el ```env.template``` y renombrar a ```.env```, rellenando los valores de las variables de entorno
3. Instalar las dependencias
```shell
npm install
```
4. Levantar la base de datos usando Docker Desktop
```shell
docker compose up -d
```
5. Iniciar la aplicación
```shell
npm run start:dev
```
6. Acceder a [Apollo Sandbox](http://localhost:3000/graphql)
7. Ejecutar la mutation ``executeSeed`` para cargar la base de datos.