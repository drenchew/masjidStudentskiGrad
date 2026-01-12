#!/bin/bash

echo "=== Fixing PostgreSQL Authentication ==="
echo ""

# Backup the original pg_hba.conf
echo "1. Backing up pg_hba.conf..."
sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup
echo "✅ Backup created"
echo ""

# Update authentication methods to trust for local connections temporarily
echo "2. Setting temporary trust authentication..."
sudo sed -i 's/^\(local.*all.*postgres\).*/\1                              trust/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(local.*all.*all\).*/\1                                     trust/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(host.*all.*all.*127\.0\.0\.1\/32\).*/\1            trust/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(host.*all.*all.*::1\/128\).*/\1                 trust/' /var/lib/pgsql/data/pg_hba.conf
echo "✅ Trust authentication enabled temporarily"
echo ""

# Restart PostgreSQL
echo "3. Restarting PostgreSQL..."
sudo systemctl restart postgresql
sleep 2
echo "✅ PostgreSQL restarted"
echo ""

# Set password for postgres user
echo "4. Setting password for postgres user..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
echo "✅ Password set"
echo ""

# Create database if it doesn't exist
echo "5. Creating database..."
sudo -u postgres psql -c "CREATE DATABASE masjid_db;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE masjid_db TO postgres;"
echo "✅ Database ready"
echo ""

# Now switch back to md5 authentication
echo "6. Enabling password authentication..."
sudo sed -i 's/^\(local.*all.*postgres\).*/\1                              md5/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(local.*all.*all\).*/\1                                     md5/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(host.*all.*all.*127\.0\.0\.1\/32\).*/\1            md5/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/^\(host.*all.*all.*::1\/128\).*/\1                 md5/' /var/lib/pgsql/data/pg_hba.conf
echo "✅ Password authentication enabled"
echo ""

# Final restart
echo "7. Final restart..."
sudo systemctl restart postgresql
sleep 2
echo "✅ PostgreSQL configured"
echo ""

# Test connection
echo "8. Testing connection..."
PGPASSWORD=postgres psql -U postgres -h localhost -d masjid_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Connection test successful!"
else
    echo "⚠️  Connection test failed. You may need to check the configuration manually."
fi
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "Database credentials:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: masjid_db"
echo "  Username: postgres"
echo "  Password: postgres"
echo ""
echo "You can now run the backend:"
echo "  cd /home/dre/proj/masjidStudentskiGrad/backend"
echo "  java -jar target/studentski-grad-0.0.1-SNAPSHOT.jar"
echo ""
