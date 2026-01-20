# Open Analytics - Documentation

## Overview

**Open Analytics** is an enterprise analytics platform with comprehensive user management, role-based access control, multi-database architecture, and real-time data processing capabilities.

## Quick Start

1. **Start all services (Docker):**
   ```batch
   server\windows\docker-start.bat
   ```
   Or for local development:
   ```batch
   server\windows\start-all.bat
   ```

2. **Default admin login:**
   - Username: `admin`
   - Password: `admin123` (⚠️ Change in production!)

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - PostgreSQL: localhost:5432

For detailed setup instructions, see [QUICK-START.md](./QUICK-START.md).

## Documentation

### Core Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, authentication, database design, rate limiting, and deployment
- **[PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)** - Directory structure, organization rules, and conventions
- **[QUICK-START.md](./QUICK-START.md)** - Setup, deployment, and batch scripts guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### Feature Documentation

- **[SYMBOLS.md](./SYMBOLS.md)** - Symbol management, auto-upload, and scheduler system
- **[TRUEDATA_CONNECTION.md](./TRUEDATA_CONNECTION.md)** - TrueData API integration and WebSocket connections
- **[telegram.md](./telegram.md)** - Telegram bot integration for notifications and OTP
- **[NEWS_PIPELINE.md](./NEWS_PIPELINE.md)** - News extraction and AI enrichment pipeline
- **[SCREENER_SCRAPING_FLOW.md](./SCREENER_SCRAPING_FLOW.md)** - Screener data scraping workflow
- **[ATTACHMENT_FLOW.md](./ATTACHMENT_FLOW.md)** - Corporate announcement attachment handling
- **[UI_STANDARDS.md](./UI_STANDARDS.md)** - Frontend design patterns and standards

## Tech Stack

### Backend
- FastAPI 0.109.0
- SQLAlchemy 2.0
- PostgreSQL 15 (Auth/Users)
- DuckDB 1.3.1 (Analytics)
- JWT Authentication
- SlowAPI (Rate Limiting)
- WebSocket Support

### Frontend
- Next.js 14.2.5
- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.4
- Zustand (State Management)
- Axios (API Client)

### Deployment
- Docker & Docker Compose
- Watchtower (Auto-updates)
- GitHub Actions (CI/CD)
- Playwright (E2E Testing)

## Project Status

**Version:** 1.0.1  
**Status:** Production Ready  
**Database:** PostgreSQL (migrated from SQLite)

---

For detailed information, see the documentation files listed above.
