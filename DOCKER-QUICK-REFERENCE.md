# 🚀 Quick Docker Commands Reference

## Initial Setup

```bash
# 1. Copy environment file
copy .env.production.example .env.production

# 2. Edit .env.production and change DB_PASSWORD

# 3. Build images
docker-compose build

# 4. Start services
docker-compose up -d

# 5. Initialize database
docker-compose exec backend npx prisma migrate deploy
```

## Daily Operations

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Start services
docker-compose start
```

## Maintenance

```bash
# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec db pg_dump -U mangaflow manga_reader > backup.sql

# View container status
docker-compose ps

# Access backend shell
docker-compose exec backend sh
```

## Troubleshooting

```bash
# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs db

# Restart specific service
docker-compose restart backend

# Rebuild without cache
docker-compose build --no-cache

# Clean up
docker-compose down
docker system prune -a
```

---

📖 **Full guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
