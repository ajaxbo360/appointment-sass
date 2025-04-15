FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application for production
# RUN npm run build  # Uncomment for production

# Expose port 3000
EXPOSE 3000

# Add a healthcheck to ensure the container is ready
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Add this before the CMD line
ENV HOST=0.0.0.0

# Start the application in development mode with optimizations
CMD ["npm", "run", "dev", "--", "--turbo"] 