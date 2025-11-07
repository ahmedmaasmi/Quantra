# Quantra

A financial technology platform with fraud detection, AI-powered forecasting, and KYC (Know Your Customer) capabilities.

## Features

- 🔐 **User Management** - Complete user CRUD operations with authentication
- 💳 **Transaction Processing** - Real-time transaction processing with fraud detection
- 🚨 **Alert System** - Automated alerts for suspicious activities
- 📊 **Financial Forecasting** - AI-powered spending and income predictions
- 🤖 **AI Chat** - Interactive chat interface for financial queries
- 🔍 **Fraud Detection** - Advanced fraud scoring and risk assessment
- 🎯 **AML Cases** - Case management for anti-money laundering investigations
- 📈 **Dashboard** - Comprehensive analytics and metrics dashboard
- 🤖 **AI Simulations** - AI-driven simulations for predictions, pattern detection, and analysis
- 🔒 **Authentication** - JWT-based user authentication and authorization

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **SQLite** - Database
- **Python** - ML services (fraud detection, forecasting, KYC, simulations)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Prerequisites

- Node.js 20+
- Python 3.13+ (for ML services)
- npm or yarn

## Quick Start

### 1. Setup Backend

```powershell
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# DATABASE_URL="file:./prisma/dev.db"
# PORT=5000
# NODE_ENV=development
# JWT_SECRET=your-secret-key-change-in-production
# ML_SERVICE_URL=http://localhost:5001

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates SQLite database file)
npm run prisma:migrate

# (Optional) Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 2. Setup Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Create .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Setup ML Service (Optional)

```powershell
# Install Python dependencies
cd models
pip install -r requirements.txt

# Start ML service
cd ../ml_service
python app.py
```

The ML service will be available at `http://localhost:5001`

**Note:** The backend will work without the ML service, but will use fallback logic for ML features.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires JWT token)

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

### Fraud Detection
- `GET /api/fraud/:id` - Get fraud analysis for a transaction
- `GET /api/fraud/explain/:id` - Get explanation for why a transaction was flagged
- `POST /api/fraud/scan` - Run fraud detection scan on all transactions (optional: `?userId=xxx`)

### AML Cases
- `GET /api/cases` - Get all cases (optional: `?userId=xxx&status=xxx&limit=50&offset=0`)
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create a new case from an alert
- `PUT /api/cases/:id` - Update case
- `PATCH /api/cases/:id/assign` - Assign case to someone
- `PATCH /api/cases/:id/resolve` - Resolve case
- `PATCH /api/cases/:id/close` - Close case
- `DELETE /api/cases/:id` - Delete case

### Dashboard
- `GET /api/dashboard` - Get comprehensive dashboard statistics and metrics

### AI Simulations
- `POST /api/simulate` - Start a new AI simulation
- `GET /api/simulations` - View all simulations (optional: `?status=xxx&limit=50&offset=0`)
- `GET /api/simulations/:id` - Get simulation results by ID
- `GET /api/metrics` - Get aggregated statistics across all simulations
- `DELETE /api/simulations/:id` - Delete a specific simulation
- `DELETE /api/simulations` - Clear all simulations

See `backend/SIMULATION_API.md` for detailed simulation API documentation.

## Database Schema

### Models
- **User** - User accounts with authentication
- **Transaction** - Financial transactions with fraud scoring
- **Alert** - User alerts and notifications
- **Forecast** - Financial predictions
- **Case** - AML (Anti-Money Laundering) case management
- **Simulation** - AI simulation records
- **AiMetric** - AI simulation performance metrics

See `backend/prisma/schema.prisma` for full schema details.

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

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
ML_SERVICE_URL=http://localhost:5001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Project Structure

```text
Quantra/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── dev.db              # SQLite database
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts         # Authentication
│   │   │   ├── users.ts
│   │   │   ├── transactions.ts
│   │   │   ├── alerts.ts
│   │   │   ├── forecast.ts
│   │   │   ├── chat.ts
│   │   │   ├── fraud.ts        # Fraud detection
│   │   │   ├── cases.ts        # AML cases
│   │   │   ├── dashboard.ts    # Dashboard analytics
│   │   │   └── simulations.ts  # AI simulations
│   │   ├── services/          # Business logic
│   │   │   ├── aiService.ts
│   │   │   ├── fraudService.ts
│   │   │   ├── forecastService.ts
│   │   │   ├── kycService.ts
│   │   │   ├── simulationService.ts
│   │   │   └── mlApiClient.ts  # ML service client
│   │   ├── scripts/
│   │   │   └── seed.ts         # Database seeding
│   │   └── index.ts           # Entry point
│   ├── SIMULATION_API.md      # Simulation API docs
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── lib/
│   │   │   └── api.ts         # API client
│   │   └── hooks/             # React hooks
│   └── package.json
├── ml_service/                # Python ML service
│   ├── app.py                # FastAPI application
│   └── services/              # ML service implementations
├── models/                    # ML model files
│   ├── fraud/
│   ├── forecast/
│   ├── kyc/
│   ├── simulation/
│   └── chat/
├── data/                      # CSV data files
│   ├── users.csv
│   ├── transactions.csv
│   └── aml_cases.csv
├── scripts/                   # Model training scripts
├── DATA_SETUP.md             # Data setup guide
├── MODELS_IMPLEMENTATION.md   # ML models documentation
└── README.md
```

## Additional Documentation

- **Data Setup**: See `DATA_SETUP.md` for information on CSV data files and database seeding
- **ML Models**: See `MODELS_IMPLEMENTATION.md` for ML service setup and model training
- **Simulation API**: See `backend/SIMULATION_API.md` for detailed AI simulation API documentation

## Troubleshooting

### Prisma Migration Error

If you get "Missing DATABASE_URL":
1. Ensure `.env` exists in `backend/` directory
2. Verify DATABASE_URL is set to `file:./prisma/dev.db` or your preferred path
3. The database file will be created automatically when you run migrations

### Database Connection Error

1. Ensure the database file path in DATABASE_URL is correct
2. Check file permissions - ensure the backend directory is writable
3. If the database file is corrupted, delete it and run migrations again

### Module Not Found Errors

Run `npm install` in both `backend/` and `frontend/` directories, then:
- Backend: `npm run prisma:generate`
- Check TypeScript compilation: `npm run build`

### ML Service Connection Issues

If ML features are not working:
1. Ensure the ML service is running on port 5001 (or update `ML_SERVICE_URL` in `.env`)
2. The backend will use fallback logic if the ML service is unavailable
3. Check `MODELS_IMPLEMENTATION.md` for ML service setup instructions

### Authentication Issues

1. Ensure `JWT_SECRET` is set in backend `.env` file
2. Include `Authorization: Bearer <token>` header in protected routes
3. Tokens expire after 7 days - users need to login again

## License

ISC
