# Deployment Guide - TODO Django App

This guide covers various deployment options for the TODO Django application, from simple hosting platforms to containerized deployments.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Heroku](#heroku-deployment)
  - [Railway](#railway-deployment)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
  - [Docker](#docker-deployment)
  - [Traditional VPS](#traditional-vps-deployment)
- [Production Best Practices](#production-best-practices)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## 🔐 Pre-Deployment Checklist

Before deploying your application, ensure you've completed these steps:

- [ ] Set `DEBUG = False` in production settings
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Generate a new `SECRET_KEY` (never use the development key)
- [ ] Set up environment variables for sensitive data
- [ ] Configure a production-ready database (PostgreSQL recommended)
- [ ] Set up static files serving
- [ ] Enable HTTPS/SSL
- [ ] Configure email backend for error notifications
- [ ] Review security settings
- [ ] Create a requirements.txt file
- [ ] Set up database backups
- [ ] Configure logging

---

## 🔑 Environment Variables

Create a `.env` file for sensitive configuration (never commit this file):

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (PostgreSQL example)
DATABASE_URL=postgres://user:password@host:5432/dbname

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Static Files
STATIC_ROOT=/var/www/static
MEDIA_ROOT=/var/www/media
```

### Generate a Secret Key

```python
# Run in Python shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

## 🚀 Deployment Options

### Heroku Deployment

Heroku is a Platform-as-a-Service (PaaS) that simplifies deployment.

#### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Create Required Files

**requirements.txt**

```bash
Django==4.2.28
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.6.0
python-decouple==3.8
```

**Procfile** (in project root)

```
web: gunicorn TODOapp.wsgi --log-file -
```

**runtime.txt** (optional, specify Python version)

```
python-3.11.7
```

#### Step 3: Update settings.py

Add to the end of `settings.py`:

```python
import os
from decouple import config
import dj_database_url

# Production settings
DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY', default='dev-key-change-in-production')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Database
if 'DATABASE_URL' in os.environ:
    DATABASES['default'] = dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    )

# Static files with WhiteNoise
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

#### Step 4: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-todo-app-name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY='your-secret-key-here'
heroku config:set DEBUG=False

# Deploy
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser

# Open your app
heroku open
```

#### Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Run Django shell
heroku run python manage.py shell

# Scale dynos
heroku ps:scale web=1

# Restart app
heroku restart
```

---

### Railway Deployment

Railway offers a modern deployment experience with great developer experience.

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Prepare Files

Create the same `requirements.txt` and `Procfile` as for Heroku.

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && gunicorn TODOapp.wsgi",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

#### Step 3: Deploy

```bash
# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up

# Open app
railway open
```

---

### DigitalOcean App Platform

DigitalOcean App Platform is a PaaS for deploying web applications.

#### Step 1: Prepare Your Repository

Ensure you have:

- `requirements.txt`
- Updated `settings.py` for production
- Database configuration using environment variables

#### Step 2: Deploy via Web Interface

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub/GitLab repository
4. Select the TODO app repository
5. Configure:
   - **Type**: Web Service
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `gunicorn --worker-tmp-dir /dev/shm TODOapp.wsgi`
6. Add PostgreSQL database
7. Set environment variables:
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=${APP_DOMAIN}`
8. Click "Create Resources"

#### Step 3: Run Migrations

Use the console in the App Platform UI:

```bash
python manage.py migrate
python manage.py createsuperuser
```

---

### Docker Deployment

Containerize your application for consistent deployment across environments.

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD python manage.py migrate && \
    gunicorn TODOapp.wsgi:application --bind 0.0.0.0:8000
```

#### docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=todoapp
      - POSTGRES_USER=todouser
      - POSTGRES_PASSWORD=changeme123

  web:
    build: .
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn TODOapp.wsgi:application --bind 0.0.0.0:8000"
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - SECRET_KEY=your-secret-key-change-this
      - DATABASE_URL=postgresql://todouser:changeme123@db:5432/todoapp
      - ALLOWED_HOSTS=localhost,127.0.0.1
    depends_on:
      - db

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
    ports:
      - "80:80"
    depends_on:
      - web

volumes:
  postgres_data:
  static_volume:
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream django {
        server web:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location /static/ {
            alias /app/staticfiles/;
        }

        location / {
            proxy_pass http://django;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Build and Run

```bash
# Build and start containers
docker-compose up -d --build

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

### Traditional VPS Deployment

Deploy to a Virtual Private Server (AWS EC2, DigitalOcean Droplet, Linode, etc.)

#### Step 1: Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3-pip postgresql nginx -y

# Install and configure PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL:

```sql
CREATE DATABASE todoapp;
CREATE USER todouser WITH PASSWORD 'strong_password_here';
ALTER ROLE todouser SET client_encoding TO 'utf8';
ALTER ROLE todouser SET default_transaction_isolation TO 'read committed';
ALTER ROLE todouser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE todoapp TO todouser;
\q
```

#### Step 2: Deploy Application

```bash
# Create project directory
sudo mkdir -p /var/www/todoapp
sudo chown $USER:$USER /var/www/todoapp
cd /var/www/todoapp

# Clone repository
git clone https://github.com/yourusername/todoapp.git .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create .env file
nano .env
# Add your environment variables

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser
python manage.py createsuperuser
```

#### Step 3: Configure Gunicorn

Create `/etc/systemd/system/todoapp.service`:

```ini
[Unit]
Description=TODO Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/todoapp
Environment="PATH=/var/www/todoapp/venv/bin"
ExecStart=/var/www/todoapp/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/var/www/todoapp/todoapp.sock \
          TODOapp.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start Gunicorn service
sudo systemctl start todoapp
sudo systemctl enable todoapp
sudo systemctl status todoapp
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/todoapp`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /var/www/todoapp/staticfiles/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/todoapp/todoapp.sock;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/todoapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 🔒 Production Best Practices

### Security Settings

Update `settings.py` for production:

```python
# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/error.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### Database Backups

**Automated PostgreSQL Backup Script:**

```bash
#!/bin/bash
# save as /usr/local/bin/backup-todoapp.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/todoapp"
DB_NAME="todoapp"
DB_USER="todouser"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/todoapp_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "todoapp_*.sql.gz" -mtime +7 -delete
```

Add to crontab:

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-todoapp.sh
```

### Environment-Specific Settings

Create `settings/` directory:

```python
# settings/__init__.py
from .base import *

# settings/base.py - common settings
# settings/development.py - dev settings
# settings/production.py - production settings
```

Update `manage.py` and `wsgi.py`:

```python
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TODOapp.settings.production')
```

---

## 📊 Monitoring and Maintenance

### Health Check Endpoint

Add to `todos/views.py`:

```python
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
```

Add to `urls.py`:

```python
path('health/', views.health_check, name='health_check'),
```

### Monitoring Tools

**Recommended Tools:**

- **Sentry**: Error tracking and monitoring
- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure and application monitoring
- **UptimeRobot**: Uptime monitoring (free tier available)

### Common Maintenance Tasks

```bash
# Update application
cd /var/www/todoapp
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart todoapp

# View logs
sudo journalctl -u todoapp -f
sudo tail -f /var/log/nginx/error.log

# Database maintenance
python manage.py dbshell
# Run VACUUM ANALYZE in PostgreSQL

# Clear old sessions
python manage.py clearsessions
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Static files not loading

```bash
# Solution
python manage.py collectstatic --clear --noinput
sudo systemctl restart nginx
```

**Issue**: Database connection errors

```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check database credentials in .env
```

**Issue**: Permission errors

```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/todoapp
sudo chmod -R 755 /var/www/todoapp
```

---

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Heroku Django Documentation](https://devcenter.heroku.com/articles/django-app-configuration)
- [DigitalOcean Django Tutorials](https://www.digitalocean.com/community/tags/django)
- [Docker Django Best Practices](https://docs.docker.com/samples/django/)

---

**Note**: Always test your deployment in a staging environment before deploying to production.
