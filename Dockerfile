# Multi-stage Dockerfile for Render deployment
# This Dockerfile builds both frontend and backend in a single container
# Suitable for Render's free tier or when you want a single deployable unit

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-build

WORKDIR /backend

# Copy pom.xml and download dependencies (cached layer)
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 3: Runtime - Combine Frontend (served by backend) and Backend
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install nginx for serving frontend (lightweight)
RUN apk add --no-cache nginx

# Create necessary directories
RUN mkdir -p /app/uploads /run/nginx /var/log/nginx /usr/share/nginx/html

# Copy backend jar
COPY --from=backend-build /backend/target/studentski-grad-*.jar /app/app.jar

# Copy frontend build to nginx html directory
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'exec java -Dserver.port=${PORT:-8080} -jar /app/app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port (Render will set $PORT)
EXPOSE ${PORT:-8080}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Start both nginx (frontend) and Spring Boot (backend)
ENTRYPOINT ["/app/start.sh"]
