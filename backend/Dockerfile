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
normalize_and_extract JDBC_DATABASE_URL
normalize_and_extract POSTGRES_URL
normalize_and_extract CONNECTION_STRING
# Build extra Java system properties from normalized env vars so Spring Boot
# picks them up even if the environment or Render's start command behaves oddly.
EXTRA_OPTS=""
if [ -n "$SPRING_DATASOURCE_URL" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.url=$SPRING_DATASOURCE_URL"
elif [ -n "$JDBC_DATABASE_URL" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.url=$JDBC_DATABASE_URL"
elif [ -n "$POSTGRES_URL" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.url=$POSTGRES_URL"
elif [ -n "$CONNECTION_STRING" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.url=$CONNECTION_STRING"
elif [ -n "$DATABASE_URL" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.url=$DATABASE_URL"
fi
if [ -n "$SPRING_DATASOURCE_USERNAME" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.username=$SPRING_DATASOURCE_USERNAME"
elif [ -n "$DATABASE_USERNAME" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.username=$DATABASE_USERNAME"
fi
if [ -n "$SPRING_DATASOURCE_PASSWORD" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.password=$SPRING_DATASOURCE_PASSWORD"
elif [ -n "$DATABASE_PASSWORD" ]; then
    EXTRA_OPTS="$EXTRA_OPTS -Dspring.datasource.password=$DATABASE_PASSWORD"
fi

# Masking helper for logs
mask() {
    echo "$1" | sed -E 's#(postgresql?://)?([^:@]+)(:([^@]+))?@#\1****:****@#; s#([?&]password=)[^&]+#\1****#I'
}

echo "ENTRYPOINT: environment before start:"
echo "  SPRING_DATASOURCE_URL=$(mask "$SPRING_DATASOURCE_URL")"
echo "  DATABASE_URL=$(mask "$DATABASE_URL")"
echo "  SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME:-$( [ -n "$DATABASE_USERNAME" ] && echo '****' || echo '') }"
echo "  SPRING_DATASOURCE_PASSWORD=$( [ -n "$SPRING_DATASOURCE_PASSWORD" ] || [ -n "$DATABASE_PASSWORD" ] && echo '****' || echo '')"

echo "ENTRYPOINT: starting java with EXTRA_OPTS=$EXTRA_OPTS"
exec java $EXTRA_OPTS -Xmx450m -Xms256m -Dserver.port=${PORT:-8080} -jar /app/app.jar
EOF
RUN chmod +x /app/docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
