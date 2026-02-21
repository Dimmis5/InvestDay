#!/bin/sh
set -e

required_vars="DATABASE_URL JWT_SECRET API_POLYGON_KEY SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS"
for var in $required_vars; do
  eval val=\$$var
  if [ -z "$val" ]; then
    echo "FATAL: Missing required environment variable: $var"
    exit 1
  fi
done

echo "⏳ Waiting for database..."
until npx prisma db ping 2>/dev/null; do
  sleep 2
done

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🚀 Starting Next.js..."
exec node server.js