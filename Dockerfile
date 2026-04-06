# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build and run the Express backend
FROM node:18-alpine
WORKDIR /app

# Copy backend package files and install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source code
COPY backend ./backend

# Copy built frontend from Stage 1 into the backend folder (or distinct folder)
COPY --from=frontend-builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p ./backend/uploads

WORKDIR /app/backend

# Inform Docker that the container listens on port 3001
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
