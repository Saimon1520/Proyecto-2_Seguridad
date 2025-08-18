FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl dos2unix

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Convert start.sh to Unix format and make it executable
RUN dos2unix start.sh && chmod +x start.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify start script exists and is executable
RUN ls -la start.sh

EXPOSE 3000

CMD ["sh", "./start.sh"] 