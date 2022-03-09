A repo for Docker with Nodejs - express demo app

Create express app

```
npx express-generator --view=pug --git <app-name>
```

The --view=pug tells the generator to use the Pug view engine and --git parameter asks it to add a .gitignore file.

Add package.json script

```
"start:dev": "nodemon ./bin/www"
```

Building the docker image - Docker images are built much faster with BuildKit enabled.

```
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build
```

## Deploy to Google Cloud Run

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

https://hello-world-1-nodejs-dh4hwox2yq-el.a.run.app/

..................
docker compose up

docker tag a244b39dd441 gcr.io/nodejs-343313/node-server

docker push gcr.io/nodejs-343313/node-server ---> will be availble in registry
