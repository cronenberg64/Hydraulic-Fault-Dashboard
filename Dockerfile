# Updated Dockerfile for SWC and Platform Compatibility
FROM node:20-slim AS frontend-build

WORKDIR /app

# Copy package files and patch script
COPY package*.json ./
COPY .npmrc ./
COPY patch-rollup-native.cjs ./

# Set SWC_BINARY_TARGET for compatible prebuilds
ENV SWC_BINARY_TARGET=linux-x64-gnu

# Use npm-force-resolutions to enforce dependency versions
RUN npm install -g npm-force-resolutions
RUN npx npm-force-resolutions
RUN npm install --omit=optional --legacy-peer-deps

# Copy all source code
COPY . .

# Patch all rollup native.js files (including nested)
RUN node patch-rollup-native.cjs

# Rebuild swc native bindings for the current platform
RUN npm rebuild @swc/core --force

# Build the frontend
RUN npm run build

# Python backend stage
FROM python:3.11-slim as backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Set the working directory to backend for backend service
WORKDIR /app/backend

# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Final stage - serve both frontend and backend
FROM python:3.11-slim

WORKDIR /app

# Install nginx and supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy backend application
COPY --from=backend /app ./backend

# Copy built frontend
COPY --from=frontend-build /app/dist ./frontend/dist

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
