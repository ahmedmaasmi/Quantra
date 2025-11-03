# Docker Troubleshooting Guide

## Issue: 500 Internal Server Error

If you're getting "500 Internal Server Error" when running Docker commands, try these solutions:

### Solution 1: Restart Docker Desktop

1. Right-click Docker Desktop icon in system tray
2. Select "Quit Docker Desktop"
3. Wait 10 seconds
4. Start Docker Desktop again
5. Wait until you see "Docker Desktop is running" in the system tray
6. Try again: `docker-compose up -d db`

### Solution 2: Reset Docker Desktop

1. Open Docker Desktop
2. Go to Settings (gear icon)
3. Click "Troubleshoot" in the left menu
4. Click "Clean / Purge data"
5. Restart Docker Desktop

### Solution 3: Use Alternative PostgreSQL Image

If the postgres:16 image fails, try a different tag:

```yaml
# In docker-compose.yml, change:
image: postgres:16-alpine
# To one of these:
image: postgres:15-alpine
# or
image: postgres:14-alpine
```

### Solution 4: Manual Image Pull

Try pulling the image manually first:

```powershell
docker pull postgres:16-alpine
docker-compose up -d db
```

### Solution 5: Check Docker Desktop Logs

1. Open Docker Desktop
2. Check the "Troubleshoot" section for error messages
3. Review logs in: Settings → Troubleshoot → View logs

### Solution 6: Verify WSL 2 (Windows)

If using WSL 2 backend:
1. Open PowerShell as Administrator
2. Run: `wsl --update`
3. Run: `wsl --set-default-version 2`
4. Restart Docker Desktop

## Alternative: Run Without Docker

If Docker continues to have issues, you can run PostgreSQL locally:

1. Download and install PostgreSQL from: https://www.postgresql.org/download/windows/
2. Create database:
   ```sql
   CREATE DATABASE quantra;
   ```
3. Update `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quantra?schema=public"
   ```
4. Run migrations:
   ```powershell
   cd backend
   npm run prisma:migrate
   ```

