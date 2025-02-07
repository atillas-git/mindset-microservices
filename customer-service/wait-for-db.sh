#!/bin/sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until pg_isready -h "$host" -p "$port" -U "postgres"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

# Run migrations
npx prisma migrate deploy

# Start the application
exec npm start
