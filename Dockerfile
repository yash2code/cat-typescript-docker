# Use the base Node 16 image from Docker Hub
FROM node:16-alpine as builder

# Set the working directory inside the Docker container
WORKDIR /usr/src/app

# Copy the package.json and pnpm-lock.yaml files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including dev dependencies needed for the build)
RUN pnpm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN pnpm run build

# Start a new stage to create a leaner image
FROM node:16-alpine

# Set the working directory inside the Docker container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy over the built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies
RUN pnpm install --prod

# The port that your application listens to
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
