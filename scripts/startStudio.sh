#!/bin/sh
set -e

cd /app

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "🎨 Starting Prisma Studio..."
npx prisma studio --hostname 0.0.0.0