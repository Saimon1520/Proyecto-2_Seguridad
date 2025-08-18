FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Make start script executable and verify it exists
RUN ls -la start.sh && chmod +x start.sh

EXPOSE 3000

CMD ["sh", "./start.sh"] 