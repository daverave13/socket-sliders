FROM node:20-bookworm-slim

ENV NODE_ENV=production

WORKDIR /app

# Install OpenSCAD and build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openscad \
    python3 \
    make \
    g++ && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared ./packages/shared/
COPY apps/worker ./apps/worker/

# Build shared package first, then worker
RUN pnpm --filter @socketsliders/shared build
RUN pnpm --filter @socketsliders/worker build

# Create directories
RUN mkdir -p /opt/templates /data/artifacts /tmp/work && \
    chown -R node:node /opt/templates /data/artifacts /tmp/work

WORKDIR /app/apps/worker

# Switch to non-root user
USER node

CMD ["node", "dist/index.js"]
