# MindBoom 3.0 - Twilio Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source files
COPY . .

# Build application for production
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_ENV=production
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

# Production stage - optimized nginx
FROM nginx:1.25-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create nginx user for non-root operation
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Copy built assets from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for nginx pid and logs
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Create a simple health check file
RUN echo '{"status":"healthy","service":"mindboom-3.0-twilio"}' > /usr/share/nginx/html/health.json && \
    chown nginx:nginx /usr/share/nginx/html/health.json

# Security: Remove default nginx files
RUN rm -rf /usr/share/nginx/html/index.html /usr/share/nginx/html/50x.html

# Labels for better container management
LABEL maintainer="MindBoom Team" \
      version="3.0.0" \
      description="MindBoom 3.0 - Twilio Video Therapy Platform" \
      org.opencontainers.image.source="https://github.com/Samdekian/MindBoom-3.0-Twilio"

# Expose ports
EXPOSE 80

# Health check with better parameters
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health.json || exit 1

# Run as non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
