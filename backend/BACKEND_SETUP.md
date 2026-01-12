# Backend Quick Start Guide

## Prerequisites

1. **Java 17 or higher**
   ```bash
   java -version
   # If not installed:
   # Ubuntu: sudo apt install openjdk-17-jdk
   # Fedora: sudo dnf install java-17-openjdk
   ```

2. **Maven**
   ```bash
   mvn -version
   # If not installed:
   # Ubuntu: sudo apt install maven
   # Fedora: sudo dnf install maven
   ```

3. **PostgreSQL**
   ```bash
   sudo systemctl status postgresql
   # If not installed:
   # Ubuntu: sudo apt install postgresql postgresql-contrib
   # Fedora: sudo dnf install postgresql-server
   ```

## Setup Steps

### 1. Create PostgreSQL Database

```bash
# Switch to postgres user and create database
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE masjid_db;
CREATE USER masjid_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE masjid_db TO masjid_user;
\q
```

### 2. Configure Environment

Copy the example environment file and update it:

```bash
cd backend
cp .env.example .env
nano .env  # or vim, or any text editor
```

**Required configurations:**
- `DATABASE_PASSWORD` - Your PostgreSQL password
- `MAIL_USERNAME` and `MAIL_PASSWORD` - For email notifications (optional for development)
- `STRIPE_API_KEY` - For payment processing (optional for development)

### 3. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Or use the setup script:
```bash
./setup.sh
```

### 4. Verify Backend is Running

Open http://localhost:8080 in your browser or test an endpoint:

```bash
curl http://localhost:8080/api/prayer-times/today
```

## Default Admin Credentials

After first run, you can login to admin panel with:
- **Username:** admin
- **Password:** admin123

⚠️ **Change this password immediately after first login!**

## Development Mode

For development with hot reload:

```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"
```

## API Endpoints

Once running, the backend provides these main endpoints:

- `GET /api/prayer-times/today` - Today's prayer times
- `GET /api/products` - List of shop products
- `GET /api/khutbahs` - List of khutbahs
- `POST /api/donations` - Submit a donation
- `POST /api/orders` - Create an order
- `POST /api/subscribers` - Subscribe to newsletter
- `POST /api/auth/login` - Admin login

Admin endpoints (require JWT token):
- `POST /api/admin/products` - Create product
- `POST /api/admin/khutbahs` - Create khutbah
- `GET /api/admin/donations` - View all donations
- `GET /api/admin/orders` - View all orders

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `sudo systemctl start postgresql`
- Check credentials in `.env` file
- Verify database exists: `sudo -u postgres psql -l`

### Port Already in Use
If port 8080 is already in use, change it in `.env`:
```
PORT=8081
```

### Email Sending Fails
For development, you can disable email:
- Leave MAIL_USERNAME and MAIL_PASSWORD empty
- Application will log emails to console instead

### Maven Build Fails
Clear Maven cache and rebuild:
```bash
mvn clean
rm -rf ~/.m2/repository
mvn install
```

## Production Deployment

For production deployment, see [DEPLOYMENT.md](../DEPLOYMENT.md)

Key points:
- Use strong JWT_SECRET (minimum 32 characters)
- Set up proper HTTPS/SSL
- Configure production database with backups
- Use production email service (Brevo, SendGrid, etc.)
- Set up Stripe webhooks for payment confirmations
- Configure proper CORS settings
