FROM node:20-alpine

WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./
COPY ../../packages/shared/package.json ../packages/shared/

# Install dependencies
RUN npm install --production

# Copy shared package
COPY ../../packages/shared ../packages/shared/

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Switch to non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
