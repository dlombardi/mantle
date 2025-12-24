# Dockerfile for @mantle/api
# Uses Turborepo prune for optimized monorepo builds

FROM oven/bun:1.3-alpine AS base
RUN apk add --no-cache libc6-compat
RUN bun add -g turbo

# Prune stage - create minimal subset for @mantle/api
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @mantle/api --docker

# Install stage - install pruned dependencies
FROM base AS installer
WORKDIR /app

# Copy pruned package.json files and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

# Install dependencies
RUN bun install --frozen-lockfile

# Copy pruned source code and build
COPY --from=pruner /app/out/full/ .
RUN bun run build --filter=@mantle/api

# Production stage - minimal runtime image
FROM oven/bun:1.3-alpine AS runner
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

