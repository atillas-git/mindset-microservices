#!/bin/bash

set -e

# Wait for the database to be ready
echo "Waiting for database to be ready..."
./wait-for-it.sh customer-db:5432 -t 60

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql postgresql://postgres:password@customer-db:5432/postgres -c 'CREATE DATABASE "customer-db";' || true

# Run migrations
echo "Running database migrations..."
npx prisma migrate reset --force
npx prisma migrate deploy

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

echo "Database migrations completed successfully"
