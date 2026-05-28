# Multi-stage Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Builder stage: install dev deps and build the TypeScript into /app/dist
FROM base AS builder
COPY package*.json ./
# Install all dependencies (dev + prod) to run the build
RUN npm install
COPY . .
# Build the project (produces /app/dist)
RUN npm run build

# Production runtime stage: install only production deps and copy dist from builder
FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev
# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
# Copy non-code assets if any (public folders, etc.)
# COPY --from=builder /app/public ./public

EXPOSE 5000
CMD ["node", "dist/index.js"]
