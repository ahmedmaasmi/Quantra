# AI Simulation API Documentation

## Overview

The AI Simulation API allows you to simulate AI-driven processes including predictions, pattern detection, classifications, and data analysis. All simulations are stored in SQLite and can be retrieved, analyzed, and managed through RESTful endpoints.

## Database Schema

### Simulation Model
- `id` (String, Primary Key)
- `name` (String)
- `status` (String: "pending" | "running" | "completed" | "failed")
- `inputData` (JSON)
- `outputData` (JSON, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### AiMetric Model
- `id` (String, Primary Key)
- `simulationId` (String, Foreign Key → Simulation.id)
- `accuracy` (Float)
- `loss` (Float)
- `duration` (Float, in seconds)
- `timestamp` (DateTime)

## Endpoints

### 1. Start a Simulation
**POST** `/api/simulate`

Start a new AI simulation with input data.

**Request Body:**
```json
{
  "name": "My Simulation",
  "data": {
    "values": [1, 2, 3, 4, 5],
    "features": ["feature1", "feature2"]
  },
  "type": "prediction",
  "parameters": {
    "epochs": 100,
    "learningRate": 0.01
  }
}
```

**Parameters:**
- `name` (optional): Name for the simulation
- `data` (required): Input data (can be numbers, text, arrays, objects, etc.)
- `type` (optional): Simulation type - "prediction" | "pattern" | "classification" | "analysis"
- `parameters` (optional): Additional parameters for the simulation

**Response:**
```json
{
  "id": "clx1234567890",
  "name": "My Simulation",
  "status": "completed",
  "input": { ... },
  "output": {
    "predictions": [...],
    "confidence": 0.85,
    "insights": ["Predicted 5 future values", ...],
    "metadata": { ... }
  },
  "metrics": {
    "accuracy": 0.85,
    "loss": 0.15,
    "duration": 0.234
  },
  "createdAt": "2025-11-03T19:00:00.000Z",
  "updatedAt": "2025-11-03T19:00:00.234Z"
}
```

### 2. View All Simulations
**GET** `/api/simulations`

Get a list of all simulations with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status ("pending" | "running" | "completed" | "failed")
- `limit` (optional, default: 50): Maximum number of results
- `offset` (optional, default: 0): Pagination offset

**Example:**
```
GET /api/simulations?status=completed&limit=10&offset=0
```

**Response:**
```json
{
  "simulations": [
    {
      "id": "clx1234567890",
      "name": "My Simulation",
      "status": "completed",
      "inputData": { ... },
      "outputData": { ... },
      "metrics": {
        "accuracy": 0.85,
        "loss": 0.15,
        "duration": 0.234
      },
      "createdAt": "2025-11-03T19:00:00.000Z",
      "updatedAt": "2025-11-03T19:00:00.234Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 3. Get Simulation by ID
**GET** `/api/simulations/:id`

Get detailed information about a specific simulation.

**Response:**
```json
{
  "id": "clx1234567890",
  "name": "My Simulation",
  "status": "completed",
  "inputData": { ... },
  "outputData": { ... },
  "metrics": [
    {
      "id": "clx9876543210",
      "simulationId": "clx1234567890",
      "accuracy": 0.85,
      "loss": 0.15,
      "duration": 0.234,
      "timestamp": "2025-11-03T19:00:00.234Z"
    }
  ],
  "createdAt": "2025-11-03T19:00:00.000Z",
  "updatedAt": "2025-11-03T19:00:00.234Z"
}
```

### 4. Get Aggregated Metrics
**GET** `/api/metrics`

Get aggregated statistics across all simulations.

**Response:**
```json
{
  "totalSimulations": 10,
  "averageAccuracy": 0.82,
  "averageLoss": 0.18,
  "averageDuration": 0.245,
  "totalDuration": 2.45,
  "statusDistribution": {
    "completed": 8,
    "failed": 1,
    "running": 1
  },
  "successRate": 0.8
}
```

### 5. Delete a Simulation
**DELETE** `/api/simulations/:id`

Delete a specific simulation and its associated metrics.

**Response:**
```json
{
  "message": "Simulation deleted successfully",
  "id": "clx1234567890"
}
```

### 6. Clear All Simulations
**DELETE** `/api/simulations`

Delete all simulations and their metrics.

**Response:**
```json
{
  "message": "All simulations cleared successfully",
  "deletedCount": 10
}
```

## Simulation Types

### Prediction
Generates future predictions based on input data. Best for numerical sequences and time-series data.

### Pattern Detection
Identifies patterns and anomalies in data. Best for arrays and sequences.

### Classification
Classifies input data into categories. Best for object data with multiple features.

### Analysis
Performs statistical analysis on input data. Best for general data analysis.

## Running the Simulation Logic

### Prerequisites
1. Ensure SQLite database is set up
2. Run Prisma migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

### Starting the Server
```bash
cd backend
npm run dev
```

The server will start on port 5000 (or the port specified in your `.env` file).

### Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Start a simulation
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d @test_simulation_request.json

# Get all simulations
curl http://localhost:5000/api/simulations

# Get metrics
curl http://localhost:5000/api/metrics
```

## Console Logs

The simulation logic includes detailed console logs for each step:
- 🤖 Starting AI simulation
- 📊 Input data type and processing
- ⏱️ Processing duration
- ✅ Simulation completion
- 📈 Accuracy and loss metrics
- ❌ Error messages (if any)

## Notes

- All simulations are stored in SQLite database
- Metrics are automatically saved when a simulation completes
- Failed simulations are marked with status "failed"
- The database migration will create the necessary tables automatically

