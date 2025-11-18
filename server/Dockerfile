# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY server/ .

# Copy landing page build files
COPY landing/build ./landing-build

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Copy production environment file
COPY server/.env.production .env

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run will set PORT environment variable)
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start the application
CMD ["node", "server.js"] 