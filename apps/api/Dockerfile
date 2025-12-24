# Dockerfile for @mantle/api
# Uses Bun for monorepo workspace support

FROM oven/bun:1.3-alpine AS base

# Install dependencies stage
FROM base AS deps
WORKDIR /app

# Copy workspace config files
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc/package.json ./packages/trpc/
COPY packages/test-utils/package.json ./packages/test-utils/

# Install all dependencies
RUN bun install

# Build stage
FROM base AS builder
WORKDIR /app

# Copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Build the API
RUN bun run --filter=@mantle/api build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built output and necessary files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
USER hono

EXPOSE 3001

CMD ["bun", "run", "dist/index.js"]
