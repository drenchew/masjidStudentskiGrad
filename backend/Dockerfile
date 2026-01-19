# Backend Dockerfile - Optimized for Render
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy jar from build stage
COPY --from=build /app/target/studentski-grad-*.jar app.jar

# Copy database initialization scripts (optional)
COPY *.sql /app/ 2>/dev/null || true

# Expose port (Render will set $PORT automatically)
EXPOSE ${PORT:-8080}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application, honoring $PORT provided by Render (falls back to 8080)
# Use sh -c so environment variable expansion works in the ENTRYPOINT.
ENTRYPOINT ["sh", "-c", "exec java -Xmx450m -Xms256m -Dserver.port=${PORT:-8080} -jar app.jar"]
