#!/bin/sh
# backend/entrypoint.sh
set -e

echo "⏳ Waiting for Postgres..."
until npx prisma migrate deploy 2>&1; do
  echo "Migration failed, retrying in 3s..."
  sleep 3
done

echo "🌱 Running seed..."
node src/config/seed.js || true

echo "🚀 Starting server..."
exec node src/index.js
