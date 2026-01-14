# Multi-stage build for GoTaxi Admin Panel
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gotaxi -u 1001

# Set permissions
RUN chown -R gotaxi:nodejs /usr/share/nginx/html
RUN chown -R gotaxi:nodejs /var/cache/nginx
RUN chown -R gotaxi:nodejs /var/log/nginx
RUN chown -R gotaxi:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R gotaxi:nodejs /var/run/nginx.pid

# Switch to non-root user
USER gotaxi

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
