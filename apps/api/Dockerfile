# Dockerfile for @mantle/api
# Copies all workspace package.json files for lockfile compatibility

FROM oven/bun:1.3.0-alpine AS base
RUN apk add --no-cache libc6-compat

# Install stage
FROM base AS installer
WORKDIR /app

# Copy ALL package.json files and lockfile (for exact lockfile match)
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc/package.json ./packages/trpc/
COPY packages/test-utils/package.json ./packages/test-utils/

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build --filter=@mantle/api

# Production stage - minimal runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built output
COPY --from=installer /app/apps/api/dist ./dist
COPY --from=installer /app/apps/api/package.json ./

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
USER hono

EXPOSE 3001

CMD ["bun", "run", "dist/index.js"]
