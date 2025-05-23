# Build stage for frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/front-end
COPY front-end/package*.json ./
RUN npm install
COPY front-end/ .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy backend package files
COPY back-end/package*.json ./
RUN npm install --platform=linux --arch=x64

# Copy backend source code
COPY back-end/ .

# Copy frontend build from previous stage
COPY --from=frontend-builder /app/front-end/dist ./dist

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Switch to non-root user
USER node

# Set environment variable
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]
