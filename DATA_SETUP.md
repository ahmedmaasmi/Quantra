# Data Setup and Frontend-Backend Integration Guide

## Overview
This document describes the data files, database seeding, and frontend-backend integration that has been set up for the Quantra application.

## Data Files Created

### 1. CSV Files in `/data` directory

#### `users.csv`
Contains sample user data with the following columns:
- id: Unique user identifier
- name: User's full name
- email: User's email address
- password: User password (for demo purposes)
- kycStatus: KYC verification status (approved, pending, rejected)
- phone: User's phone number

#### `transactions.csv`
Contains sample transaction data with the following columns:
- id: Unique transaction identifier
- userId: Reference to user
- amount: Transaction amount
- merchant: Merchant name
- category: Transaction category
- country: Transaction country
- type: Transaction type (credit/debit)
- description: Transaction description
- timestamp: Transaction timestamp
- fraudScore: Fraud risk score (0-100)
- isFlagged: Boolean flag for fraudulent transactions

## Database Seeding

### Seed Script
Located at `backend/src/scripts/seed.ts`

To seed the database:
```bash
cd backend
npm run seed
```

The seed script:
1. Reads CSV files from the `/data` directory
2. Creates users in the database
3. Creates transactions with fraud analysis
4. Automatically creates alerts for flagged transactions

## Frontend-Backend Integration

### API Client
Created `frontend/src/lib/api.ts` - A centralized API client that:
- Connects to backend API at `http://localhost:5000/api` (configurable via `NEXT_PUBLIC_API_URL`)
- Provides methods for all API endpoints:
  - Users: `getUsers()`, `getUser(id)`
  - Transactions: `getTransactions()`, `getTransaction(id)`, `createTransaction()`, `getTransactionStats()`
  - Alerts: `getAlerts()`, `getAlert(id)`, `updateAlert()`
  - Forecast: `getForecast()`, `createForecast()`
  - Fraud: `analyzeTransaction()`
  - Cases: `getCases()`, `getCase(id)`, `createCase()`, `updateCase()`
  - Dashboard: `getDashboardStats()` - Aggregates data from multiple endpoints

### Updated Components

All frontend components have been updated to fetch data from the API instead of using hardcoded data:

1. **Dashboard** (`frontend/src/pages/Dashboard.tsx`)
   - Fetches dashboard statistics from API
   - Displays real-time transaction volume and alerts
   - Shows recent fraud alerts from database

2. **Fraud Detection** (`frontend/src/pages/FraudDetection.tsx`)
   - Fetches flagged transactions from API
   - Displays transaction details and fraud analysis
   - Shows user profile information

3. **Credit Forecast** (`frontend/src/pages/CreditForecast.tsx`)
   - Fetches forecast data from API
   - Displays default risk scores
   - Shows historical income vs expenses

4. **AML Cases** (`frontend/src/pages/AMLCases.tsx`)
   - Fetches cases from API
   - Allows viewing case details
   - Supports resolving cases via API

5. **KYC** (`frontend/src/pages/KYC.tsx`)
   - Fetches user KYC status from API
   - Displays verification statistics
   - Shows recent verifications

## Backend Dependencies

Added `csv-parse` package to `backend/package.json` for CSV parsing in the seed script.

## Setup Instructions

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Run Database Migrations:**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

3. **Seed the Database:**
   ```bash
   cd backend
   npm run seed
   ```

4. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

## Environment Variables

### Frontend
Create `.env.local` in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend
Ensure `.env` file exists in the backend directory with:
```
DATABASE_URL="file:./prisma/dev.db"
PORT=5000
```

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `GET /api/alerts` - Get all alerts
- `GET /api/forecast/:userId` - Get forecast for user
- `GET /api/fraud/:id` - Get fraud analysis for transaction
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID

## Notes

- All passwords in the CSV are stored as plain text for demo purposes. In production, use proper password hashing.
- The seed script checks for existing records before creating to avoid duplicates.
- The API client handles errors gracefully and provides fallback data when API calls fail.
- All components show loading states while fetching data from the API.

