#!/bin/sh
set -e

cd /app

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy || npx prisma db push --skip-generate

echo "🏗️ Building Next.js..."
npm run build

echo "🚀 Starting Next.js application..."
npm run start