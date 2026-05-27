# --- Base ---
FROM node:20-alpine AS base
WORKDIR /app

# --- Development Stage ---
# Safe for dev only: Optimizes local caching and skips copying source code (relies on bind mounts)
FROM base AS dev
COPY package*.json ./
# Use BuildKit cache to speed up repeated installs
RUN --mount=type=cache,target=/root/.npm \
    npm install
# Source code will be mounted at runtime via docker-compose.yml
CMD ["npm", "run", "dev"]

# --- Production Stage ---
# Safe for prod: Full isolated build
FROM base AS prod
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
