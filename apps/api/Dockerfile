FROM node:20-alpine

WORKDIR /app

# Install pnpm and build dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared/
COPY apps/api ./apps/api/

# Build shared package first, then api
RUN pnpm --filter @socketsliders/shared build
RUN pnpm --filter @socketsliders/api build

WORKDIR /app/apps/api

# Switch to non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
