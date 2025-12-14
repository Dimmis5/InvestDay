FROM node:18-alpine3.18

WORKDIR /app

RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
RUN npm ci

# Copier le schema Prisma avant de générer le client
COPY prisma ./prisma/
RUN npx prisma generate

# Copier le reste du code
COPY . ./

# Build Next.js
RUN npm run build

EXPOSE 3000
