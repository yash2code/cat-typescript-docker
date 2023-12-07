# Application Setup and Testing with Docker Compose

## Prerequisites

Docker and Docker Compose are required.

Set up .env file.

Set up AWS and mongo credentials in `docker-compose.yaml` file.

`docker-compose up --build`

## Access the application:

I have included postman collection. Api doc can be checked from there.

You need to create a user and then get bearer token using login api.

Set that token at collection level then it will be valid for 10 min for all apis. You need to generate it again after it gets expired.

After the containers are up and running, you can access the application at http://localhost:3000

## To run tests

In the project directory

`pnpm install`

`pnpm run test`
