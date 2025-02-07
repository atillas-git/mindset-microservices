# Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install Python and build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -D @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove development dependencies
RUN npm prune --production

EXPOSE 3001

# Add wait-for-it script for MongoDB
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

CMD ["/wait-for-db.sh", "user-db", "27017", "node", "dist/server.js"]