# Development stage
FROM node:20.9.0-alpine AS development

# Install development dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set development environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Expose development port
EXPOSE 3000

# Start development server with hot reloading
CMD ["sh", "-c", "npm run tailwind:watch & npm run dev"]

# Production stage
FROM node:20.9.0-alpine AS production

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose production port
EXPOSE 3000

# Start production server
CMD ["npm", "start"] 