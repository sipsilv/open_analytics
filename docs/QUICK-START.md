# Quick Start Guide

This guide helps you get Open Analytics running on your local machine and deploy it to production.

## Prerequisites

- **Python 3.8+** - For backend
- **Node.js 18+** - For frontend
- **Docker & Docker Compose** - For containerized deployment (recommended)
- **PostgreSQL 15** - For production database (or use Docker)
- **Windows** - For batch scripts (Linux/Mac commands provided where different)

## Quick Setup (Windows)

### 1. Start All Services

Run the startup script:

```batch
server\windows\start-all.bat
```

This script will:
- Check for Python and Node.js
- Set up virtual environment (if needed)
- Install dependencies (if needed)
- Run database initialization and migrations
- Start backend (port 8000)
- Start frontend (port 3000)

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 3. Login

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Manual Setup

### Backend Setup

**Using batch script:**
```batch
cd backend
server\windows\backend-setup.bat
```

**Manual setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python scripts/init/init_auth_database.py
```

**Start backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --no-access-log
```

### Frontend Setup

**Using batch script:**
```batch
cd frontend
server\windows\frontend-setup.bat
```

**Manual setup:**
```bash
cd frontend
npm install
npm run dev
```

## Windows Batch Scripts

All batch scripts are located in `server/windows/`.

### Service Management

**Start all services:**
```batch
server\windows\start-all.bat
```

**Stop all services:**
```batch
server\windows\stop-all.bat
```

**Restart all services:**
```batch
server\windows\restart-all.bat
```

### Setup Scripts

**Backend setup:**
```batch
server\windows\backend-setup.bat
```
- Creates virtual environment
- Installs dependencies
- Creates data directories
- Initializes database

**Frontend setup:**
```batch
server\windows\frontend-setup.bat
```
- Installs npm dependencies

### Utility Scripts

**Fix super user access:**
```batch
server\windows\fix-super-user.bat
```
- Ensures super admin exists and is active

**Diagnose users:**
```batch
server\windows\diagnose-users.bat
```
- Lists all users and their status

**Run database migrations:**
```batch
server\windows\migrate-db.bat
```
- Runs core schema migrations

## Database Initialization

The database is automatically initialized on first run. To manually initialize:

```bash
cd backend
venv\Scripts\python.exe scripts/init/init_auth_database.py
```

To initialize symbols database:
```bash
venv\Scripts\python.exe scripts/init/init_symbols_database.py
```

## Production Deployment

### Docker Deployment (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed
- `.env` file configured in `server/docker/`

**Windows:**
```batch
server\windows\docker-start.bat
```

**Linux/Mac:**
```bash
cd server/docker
./docker-start.sh
```

This will start:
- **Backend** (FastAPI) on port 8000
- **Frontend** (Next.js) on port 3000
- **PostgreSQL** on port 5432
- **Watchtower** (auto-updates)

**Stop services:**
```batch
server\windows\docker-stop.bat
```

**View logs:**
```bash
docker-compose -f server/docker/docker-compose.yml logs -f
```

### Environment Variables

**Backend** (`.env` in backend directory or `server/docker/.env`):
```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/openanalytics
DATA_DIR=/app/data

# JWT
JWT_SECRET_KEY=generate-strong-random-secret-min-32-chars
JWT_SYSTEM_SECRET_KEY=generate-strong-random-secret-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=480
IDLE_TIMEOUT_MINUTES=30

# Encryption
ENCRYPTION_KEY=generate-fernet-key-44-chars-base64

# Rate Limiting
RATE_LIMIT_LOGIN=200/minute
RATE_LIMIT_PASSWORD_RESET=50/minute
RATE_LIMIT_ADMIN_CREATE_USER=200/minute
RATE_LIMIT_ADMIN_DELETE_USER=200/minute
RATE_LIMIT_ADMIN_CREATE_REQUEST=200/minute
RATE_LIMIT_ADMIN_CREATE_AI_CONFIG=200/minute

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**PostgreSQL** (in `server/docker/.env`):
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=openanalytics
```

**Frontend** (`.env.local` in frontend directory):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Security Checklist

Before production deployment:

- [ ] Change default JWT secrets (min 32 characters)
- [ ] Generate Fernet encryption key
- [ ] Change default admin password
- [ ] Use strong PostgreSQL password
- [ ] Configure rate limits appropriately
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable logging and monitoring
- [ ] Set up database backups
- [ ] Configure Watchtower Slack notifications

### Nginx Configuration

**Backend API:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Frontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Troubleshooting

If you encounter issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common problems and solutions.

Common issues:
- Port already in use → Run `stop-all.bat` first
- Missing dependencies → Run setup scripts
- Database errors → Check `data/` directory permissions
