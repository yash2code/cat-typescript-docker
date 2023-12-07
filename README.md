### Overview
#### RESTful API for uploading and managing cat pictures.
Requirements
API support the following operations:

• Upload a cat pic.

• Delete a cat pic.


• Update a previously uploaded cat pic (not just metadata) in place.
• Fetch a particular cat image file by its ID.

• Fetch a list of the uploaded cat pics.

• Application is Dockerized, 

• authentication/authorization

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
