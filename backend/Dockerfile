# backend/Dockerfile
# Build context must be the monorepo root (context: . in docker-compose)
FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY backend/package*.json ./
RUN npm install --omit=dev

FROM base AS build
COPY backend/package*.json ./
RUN npm install
COPY prisma/ ./prisma/
COPY backend/src/ ./src/
RUN npx prisma generate

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma/ ./prisma/
COPY backend/src/ ./src/

EXPOSE 3001
CMD ["node", "src/index.js"]
