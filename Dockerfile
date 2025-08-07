# Use the official Node.js 18 Alpine image for smaller size
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory to the nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose the port that the app runs on
# Railway will automatically set the PORT environment variable
# Default to 8000 to match the application default
EXPOSE 8000

# Set environment variables for production
ENV NODE_ENV=production

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
