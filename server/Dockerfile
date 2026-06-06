FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# We use HTTP for Cloud Run, so we expose the port and change the start script
# Cloud Run sets the PORT env variable automatically
ENV NODE_ENV=production
ENV SERVER_PORT=8080

EXPOSE 8080

CMD ["node", "src/index.js"]
