FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other dependencies
RUN apk add --no-cache openssl postgresql-client

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 3002

# Add wait-for-it script
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

CMD ["/wait-for-db.sh", "customer-db", "5432", "npx", "prisma", "migrate", "deploy", "&&", "npm", "start"]
