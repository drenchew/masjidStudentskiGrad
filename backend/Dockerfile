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
# Normalize DATABASE_URL so Spring Boot gets a JDBC URL
# If Render supplies a URL like "postgres://user:pass@host:5432/db",
# extract credentials into DATABASE_USERNAME/DATABASE_PASSWORD and
# convert the URL to "jdbc:postgresql://host:5432/db"
if [ -n "$DATABASE_URL" ]; then
    case "$DATABASE_URL" in
        postgresql://*|postgres://*)
            tail="${DATABASE_URL#*://}"
            if echo "$tail" | grep -q '@'; then
                creds="${tail%%@*}"
                hostpart="${tail#*@}"
                user="${creds%%:*}"
                pass="${creds#*:}"
                export DATABASE_USERNAME="$user"
                export DATABASE_PASSWORD="$pass"
                export DATABASE_URL="jdbc:postgresql://$hostpart"
                echo "Normalized DATABASE_URL to JDBC form and extracted credentials"
            else
                export DATABASE_URL="jdbc:postgresql://$tail"
                echo "Normalized DATABASE_URL to JDBC form"
            fi
            ;;
        *)
            # already JDBC or other scheme
            ;;
    esac
fi

exec java -Xmx450m -Xms256m -Dserver.port=${PORT:-8080} -jar /app/app.jar
EOF
RUN chmod +x /app/docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
