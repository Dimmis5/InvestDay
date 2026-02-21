FROM node:22-alpine3.18

WORKDIR /app

RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . ./

RUN chmod +x /app/scripts/*.sh

EXPOSE 3000

