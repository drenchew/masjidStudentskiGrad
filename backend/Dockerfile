# Backend Dockerfile - Production Ready
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install security updates and required tools
RUN apk add --no-cache \
    wget \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Create application directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appuser /app

# Copy jar from build stage
COPY --from=build --chown=appuser:appuser /app/target/studentski-grad-*.jar /app/app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Set environment variables
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=35 -Xmx512m -Xms256m"

# Start application
CMD ["java", "-server", "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=200", "-XX:InitiatingHeapOccupancyPercent=35", "-Xmx512m", "-Xms256m", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
