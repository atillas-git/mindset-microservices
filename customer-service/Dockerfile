FROM node:18-slim

WORKDIR /app

# Install necessary tools and dependencies
RUN apt-get update && \
    apt-get install -y \
    netcat-openbsd \
    openssl \
    wget \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
COPY scripts ./scripts/
COPY wait-for-it.sh ./
COPY . .

# Make scripts executable
RUN chmod +x ./wait-for-it.sh
RUN chmod +x ./scripts/migrate.sh

# Generate Prisma Client during build
RUN npx prisma generate

RUN npm run build

EXPOSE 3002

# Run migrations and start the application
CMD ["sh", "-c", "./scripts/migrate.sh && npm start"]
