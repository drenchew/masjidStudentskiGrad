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

# Install wget for health checks
RUN apk add --no-cache wget

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

# Create a small entrypoint script that normalizes DATABASE_URL if Render
# provides a `postgres://`/`postgresql://` URL so Spring Boot gets a proper
# JDBC URL (jdbc:postgresql://...). This prevents Hikari initialization
# failures caused by an unsupported URL format.
RUN printf '%s\n' "#!/bin/sh" \
    "# Normalize DATABASE_URL so Spring Boot gets a JDBC URL" \
    "if [ -n \"$DATABASE_URL\" ]; then" \
    "  case \"$DATABASE_URL\" in" \
    "    postgresql://*|postgres://*)" \
    "      # strip scheme and re-prefix with jdbc:postgresql://" \
    "      tail=\"${DATABASE_URL#*://}\"" \
    "      export DATABASE_URL=\"jdbc:postgresql://$tail\"" \
    "      ;;" \
    "  esac" \
    "fi" \
    "exec java -Xmx450m -Xms256m -Dserver.port=${PORT:-8080} -jar /app/app.jar" \
    > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
