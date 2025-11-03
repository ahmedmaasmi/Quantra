# Quantra

A financial technology platform with fraud detection, AI-powered forecasting, and KYC (Know Your Customer) capabilities.

## Features

- 🔐 **User Management** - Complete user CRUD operations
- 💳 **Transaction Processing** - Real-time transaction processing with fraud detection
- 🚨 **Alert System** - Automated alerts for suspicious activities
- 📊 **Financial Forecasting** - AI-powered spending and income predictions
- 🤖 **AI Chat** - Interactive chat interface for financial queries
- 🔍 **Fraud Detection** - Advanced fraud scoring and risk assessment

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Python** - ML services (fraud detection, forecasting)

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Prerequisites

- Node.js 20+
- Docker Desktop
- Python 3.13+ (for ML services)
- npm or yarn

## Quick Start

### 1. Start Database

```powershell
docker-compose up -d db
```

This starts PostgreSQL with:
- **User**: postgres
- **Password**: postgres
- **Database**: quantra
- **Port**: 5432

### 2. Setup Backend

```powershell
cd backend

# Install dependencies
npm install

# Create .env file (already created, verify it exists)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quantra?schema=public"
# PORT=5000
# NODE_ENV=development

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 3. Setup Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction (with fraud detection)
- `GET /api/transactions/stats/:userId` - Get user statistics

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `PATCH /api/alerts/:id/read` - Mark alert as read
- `PATCH /api/alerts/user/:userId/read-all` - Mark all user alerts as read
- `DELETE /api/alerts/:id` - Delete alert

### Forecast
- `POST /api/forecast` - Generate forecast
- `POST /api/forecast/spending/:userId` - Predict spending
- `POST /api/forecast/income/:userId` - Predict income
- `GET /api/forecast/user/:userId` - Get forecast history

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/:userId` - Get chat history

## Database Schema

### Models
- **User** - User accounts
- **Transaction** - Financial transactions
- **Alert** - User alerts and notifications
- **Forecast** - Financial predictions

See `backend/prisma/schema.prisma` for full schema details.

## Docker Setup

Run the entire stack with Docker:

```powershell
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Services:
- **db** - PostgreSQL database (port 5432)
- **server** - Backend API (port 5000)
- **client** - Frontend application (port 3000)

## Development

### Backend Development

```powershell
cd backend

# Run in development mode
npm run dev

# Run Prisma Studio (database GUI)
npm run prisma:studio

# Generate Prisma Client after schema changes
npm run prisma:generate

# Create new migration
npm run prisma:migrate
```

### Frontend Development

```powershell
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quantra?schema=public"
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Project Structure

```
Quantra/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── users.ts
│   │   │   ├── transactions.ts
│   │   │   ├── alerts.ts
│   │   │   ├── forecast.ts
│   │   │   └── chat.ts
│   │   ├── services/          # Business logic
│   │   │   ├── aiService.ts
│   │   │   ├── fraudService.ts
│   │   │   ├── forecastService.ts
│   │   │   └── kycService.ts
│   │   └── index.ts           # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/               # Next.js app directory
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Prisma Migration Error

If you get "Missing DATABASE_URL":
1. Ensure `.env` exists in `backend/` directory
2. Verify DATABASE_URL matches your database configuration
3. Check Docker is running: `docker ps`

### Database Connection Error

1. Verify PostgreSQL container is running: `docker-compose ps`
2. Check container logs: `docker-compose logs db`
3. Ensure port 5432 is not in use by another service

### Module Not Found Errors

Run `npm install` in both `backend/` and `frontend/` directories, then:
- Backend: `npm run prisma:generate`
- Check TypeScript compilation: `npm run build`

## License

ISC
