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
RUN cat > /app/docker-entrypoint.sh << 'EOF'
#!/bin/sh
# Entrypoint: normalize DB env vars so Spring Boot always receives a JDBC URL
# and separate username/password env vars. Handles multiple provider conventions.

normalize_and_extract() {
    VAR_NAME="$1"
    VAL="$(eval echo \"\$$VAR_NAME\")"
    if [ -z "$VAL" ]; then
        return
    fi

    # Only act on postgres scheme without jdbc: prefix
    if echo "$VAL" | grep -qiE '^postgres(ql)?://'; then
        tail="${VAL#*://}"
        if echo "$tail" | grep -q '@'; then
            creds="${tail%%@*}"
            hostpart="${tail#*@}"
            user="${creds%%:*}"
            pass="${creds#*:}"

            # Export credentials if not already present
            if [ -z "$(printenv DATABASE_USERNAME)" ]; then
                export DATABASE_USERNAME="$user"
            fi
            if [ -z "$(printenv DATABASE_PASSWORD)" ]; then
                export DATABASE_PASSWORD="$pass"
            fi
            if [ -z "$(printenv SPRING_DATASOURCE_USERNAME)" ]; then
                export SPRING_DATASOURCE_USERNAME="$user"
            fi
            if [ -z "$(printenv SPRING_DATASOURCE_PASSWORD)" ]; then
                export SPRING_DATASOURCE_PASSWORD="$pass"
            fi

            JDBC_URL="jdbc:postgresql://$hostpart"
            export DATABASE_URL="$JDBC_URL"
            export SPRING_DATASOURCE_URL="$JDBC_URL"
            echo "Normalized $VAR_NAME to JDBC form and extracted credentials"
        else
            JDBC_URL="jdbc:postgresql://$tail"
            export DATABASE_URL="$JDBC_URL"
            export SPRING_DATASOURCE_URL="$JDBC_URL"
            echo "Normalized $VAR_NAME to JDBC form"
        fi
    fi
}

# Normalize common env vars that may contain the raw postgres URL
normalize_and_extract DATABASE_URL
normalize_and_extract SPRING_DATASOURCE_URL

# Start the application
exec java -Xmx450m -Xms256m -Dserver.port=${PORT:-8080} -jar /app/app.jar
EOF
RUN chmod +x /app/docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
