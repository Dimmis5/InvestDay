#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until npx prisma db ping 2>/dev/null; do
  sleep 2
done

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🚀 Starting Next.js..."
exec node server.js