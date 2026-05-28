# --- Base ---
FROM node:20-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- Development Stage ---
# Safe for dev only: Skips code copy and optimizes for Next.js hot reload
FROM base AS dev
COPY package*.json ./
# Cache npm install using Docker BuildKit
RUN npm install

# We don't COPY . . here because docker-compose bind mounts the source code
CMD ["npm", "run", "dev"]

# --- Production Stage ---
# Safe for prod: Multi-stage slim build
FROM base AS builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["npm", "start"]
