#!/bin/bash

echo "Granting permissions on fundraising_campaigns table..."

# Run as postgres user to grant permissions
sudo -u postgres psql -d masjid_db -c "GRANT ALL PRIVILEGES ON TABLE fundraising_campaigns TO postgres;"
sudo -u postgres psql -d masjid_db -c "GRANT ALL PRIVILEGES ON SEQUENCE fundraising_campaigns_id_seq TO postgres;"

echo "✅ Permissions granted!"
echo ""
echo "Testing table access..."
sudo -u postgres psql -d masjid_db -c "SELECT COUNT(*) FROM fundraising_campaigns;"

echo ""
echo "Done! Restart the servers: ./start-servers.sh"
