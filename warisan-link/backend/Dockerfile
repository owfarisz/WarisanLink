# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma needs OpenSSL on Alpine
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 3000

# Run migration then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
