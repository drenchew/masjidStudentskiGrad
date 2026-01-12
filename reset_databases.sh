#!/usr/bin/env bash

# reset_databases.sh
# Drops and recreates the development database and user, sets passwords,
# applies the create-admin.sql (to restore default admin), and writes backend/.env
#
# USAGE:
#   sudo ./reset_databases.sh
# or
#   ./reset_databases.sh  # if your user can run 'sudo -u postgres' without password

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DB_NAME="masjid_db"
DB_USER="masjid_user"
DB_PASS="masjid123"

echo "Resetting PostgreSQL development DBs and user"
echo "Project root: $PROJECT_ROOT"

psql_cmd() {
  # Run a psql command as the postgres OS user (no password required when using sudo)
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "$1"
}

ensure_sudo() {
  if ! sudo -n true 2>/dev/null; then
    echo "This script needs sudo to run psql as the 'postgres' OS user."
    echo "Run it with: sudo $0"
    exit 1
  fi
}

ensure_sudo

echo "Stopping any connections to database '$DB_NAME'..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

echo "Dropping database (if exists): $DB_NAME"
psql_cmd "DROP DATABASE IF EXISTS \"$DB_NAME\";"

echo "Dropping user (if exists): $DB_USER"
psql_cmd "DROP USER IF EXISTS \"$DB_USER\";"

echo "Creating user '$DB_USER' with password (masked in output)"
psql_cmd "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';"

echo "Creating database '$DB_NAME' owned by $DB_USER"
psql_cmd "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"

echo "Granting privileges on database '$DB_NAME' to $DB_USER"
psql_cmd "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";"

echo "Setting postgres superuser password to the same value (postgres)"
psql_cmd "ALTER USER postgres WITH PASSWORD '$DB_PASS';"

if [ -f "$PROJECT_ROOT/backend/create-admin.sql" ]; then
  echo "Applying admin SQL to create default admin user (backend/create-admin.sql)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f "$PROJECT_ROOT/backend/create-admin.sql"
else
  echo "Warning: create-admin.sql not found at $PROJECT_ROOT/backend/create-admin.sql; skipping admin creation"
fi

# Write backend/.env with database credentials for local development
ENV_FILE="$PROJECT_ROOT/backend/.env"
echo "Writing backend .env -> $ENV_FILE"
cat > "$ENV_FILE" <<EOF
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASS
EOF
chmod 600 "$ENV_FILE" || true

echo ""
echo "Done. New database and user created. Credentials:"
echo "  DB:   $DB_NAME"
echo "  User: $DB_USER"
echo "  Pass: $DB_PASS"
echo "Backend .env updated at: $ENV_FILE"
echo "You can start the servers with ./start-servers.sh"

exit 0
