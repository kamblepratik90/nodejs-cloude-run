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
