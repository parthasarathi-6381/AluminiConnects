# frontend/Dockerfile (dev)
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# copy all files
COPY . .

EXPOSE 5173

# run Vite dev server
CMD ["npm", "run", "dev"]
