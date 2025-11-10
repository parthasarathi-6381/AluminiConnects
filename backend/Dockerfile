# backend/Dockerfile (dev)
FROM node:18

WORKDIR /app

# copy lock files first for cached npm install layer
COPY package*.json ./

# install deps
RUN npm install

# copy source (for initial build; in docker-compose we'll mount volume to override)
COPY . .

# expose backend port
EXPOSE 5000

# use dev script (nodemon) ideally defined in package.json as "dev": "nodemon server.js"
CMD ["npm", "start"]
