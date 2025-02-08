# Development stage
FROM node:20.9.0-alpine AS development

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20.9.0-alpine AS production

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose production port
EXPOSE 3000

# Start production server
CMD ["npm", "start"] 