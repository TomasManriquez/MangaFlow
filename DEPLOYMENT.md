# 🐳 Docker Deployment Guide - MangaFlow

Complete guide for deploying MangaFlow using Docker with security best practices.

## 📋 Prerequisites

- Docker Engine 20.10+ and Docker Compose V2
- 2GB+ RAM available
- 10GB+ disk space
- (Optional) Domain name for SSL/TLS

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd c:\Users\tomy2\.gemini\antigravity\scratch\manga-reader
```

### 2. Configure Environment

```bash
# Copy the environment template
copy .env.production.example .env.production

# Edit .env.production with your values (IMPORTANT!)
# At minimum, change DB_PASSWORD to a secure password
```

### 3. Build and Start

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Initialize Database

```bash
# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# (Optional) Seed with initial data
docker-compose exec backend npx prisma db seed
```

### 5. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health

## 🔧 Configuration

### Environment Variables

Edit `.env.production` before deployment:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_USER` | PostgreSQL username | `mangaflow` | Yes |
| `DB_PASSWORD` | PostgreSQL password | - | **Yes** |
| `DB_NAME` | Database name | `manga_reader` | Yes |
| `NODE_ENV` | Environment | `production` | Yes |
| `FRONTEND_URL` | Frontend URL | `http://localhost` | Yes |
| `HTTP_PORT` | HTTP port | `80` | No |
| `HTTPS_PORT` | HTTPS port | `443` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

### SSL/TLS Setup (Optional but Recommended)

#### Option 1: Self-Signed Certificates (Development/Testing)

```bash
# Create SSL directory
mkdir nginx\ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx\ssl\key.pem \
  -out nginx\ssl\cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

#### Option 2: Let's Encrypt (Production)

```bash
# Install certbot
# Follow: https://certbot.eff.org/

# Generate certificate
certbot certonly --standalone -d your-domain.com

# Copy certificates
copy C:\Certbot\live\your-domain.com\fullchain.pem nginx\ssl\cert.pem
copy C:\Certbot\live\your-domain.com\privkey.pem nginx\ssl\key.pem
```

#### Option 3: Existing Certificates

```bash
# Copy your certificates to nginx/ssl/
copy path\to\your\cert.pem nginx\ssl\cert.pem
copy path\to\your\key.pem nginx\ssl\key.pem
```

**Enable HTTPS**: Uncomment the HTTPS server block in `nginx/nginx.conf`

## 📊 Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: deletes data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec db psql -U mangaflow -d manga_reader

# Backup database
docker-compose exec db pg_dump -U mangaflow manga_reader > backup.sql

# Restore database
docker-compose exec -T db psql -U mangaflow manga_reader < backup.sql

# Run Prisma Studio (Database GUI)
docker-compose exec backend npx prisma studio
```

### Shell Access

```bash
# Backend container
docker-compose exec backend sh

# Database container
docker-compose exec db sh

# Frontend container
docker-compose exec frontend sh
```

## 🔒 Security Best Practices

### 1. Change Default Passwords

```bash
# Generate secure password
openssl rand -base64 32

# Update DB_PASSWORD in .env.production
```

### 2. Configure Firewall

```bash
# Allow only HTTP/HTTPS
# Block direct access to ports 3000, 5432, 8080
```

### 3. Enable HTTPS

- Use SSL/TLS certificates (Let's Encrypt recommended)
- Uncomment HTTPS server block in `nginx/nginx.conf`
- Update `FRONTEND_URL` in `.env.production`

### 4. Rate Limiting

Configured in `nginx/nginx.conf`:
- API: 10 requests/second (burst 20)
- General: 30 requests/second (burst 50)

Adjust as needed for your traffic.

### 5. Regular Updates

```bash
# Update base images
docker-compose pull

# Rebuild with latest dependencies
docker-compose build --no-cache
```

### 6. Monitor Logs

```bash
# Check for errors regularly
docker-compose logs --tail=100 -f
```

## 🐛 Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec backend npx prisma db pull
```

### Port Already in Use

```bash
# Change ports in .env.production
HTTP_PORT=8080
HTTPS_PORT=8443

# Restart
docker-compose down
docker-compose up -d
```

### Permission Issues

```bash
# Fix storage permissions
docker-compose exec backend chown -R nodejs:nodejs /app/storage
```

### Out of Disk Space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

## 📈 Performance Tuning

### Resource Limits

Add to `docker-compose.yml` under each service:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Database Optimization

```bash
# Access PostgreSQL
docker-compose exec db psql -U mangaflow manga_reader

# Run VACUUM
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Backup and Restore

### Automated Backups

Create a backup script (`backup.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U mangaflow manga_reader > backup_$DATE.sql
# Keep only last 7 backups
ls -t backup_*.sql | tail -n +8 | xargs rm -f
```

### Manual Backup

```bash
# Database
docker-compose exec db pg_dump -U mangaflow manga_reader > backup.sql

# Manga storage
docker cp mangaflow-backend:/app/storage ./storage_backup
```

### Restore

```bash
# Database
docker-compose exec -T db psql -U mangaflow manga_reader < backup.sql

# Manga storage
docker cp ./storage_backup mangaflow-backend:/app/storage
```

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check Docker and Docker Compose documentation

## 🎯 Production Checklist

Before deploying to production:

- [ ] Changed `DB_PASSWORD` to a secure value
- [ ] Updated `FRONTEND_URL` to your domain
- [ ] Configured SSL/TLS certificates
- [ ] Enabled HTTPS in nginx configuration
- [ ] Configured firewall rules
- [ ] Set up automated backups
- [ ] Tested database migrations
- [ ] Verified all services are healthy
- [ ] Configured monitoring/alerting
- [ ] Reviewed security headers in nginx
- [ ] Set appropriate rate limits
- [ ] Documented custom configurations

---

**Built with Docker 🐳 for easy deployment and scaling**
