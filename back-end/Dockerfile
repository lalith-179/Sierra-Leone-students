# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with platform-specific builds
RUN npm install --platform=linux --arch=x64

# Copy source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Switch to non-root user
USER node

# Set environment variable
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]
