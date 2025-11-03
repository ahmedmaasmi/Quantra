import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateForecast, predictSpending, predictIncome, calculateDefaultRisk } from '../services/forecastService';

const router = Router();
const prisma = new PrismaClient();

// Generate forecast
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, period, months } = req.body;
    
    if (!period || !months) {
      return res.status(400).json({ 
        error: 'period and months are required' 
      });
    }
    
    const forecast = await generateForecast({
      userId,
      period,
      months
    });
    
    // Save forecast to database
    const savedForecast = await prisma.forecast.create({
      data: {
        userId,
        prediction: forecast as any,
        model: forecast.model,
        accuracy: forecast.accuracy
      }
    });
    
    res.status(201).json({
      id: savedForecast.id,
      ...forecast
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Predict spending for a user
router.post('/spending/:userId', async (req: Request, res: Response) => {
  try {
    const { months = 1 } = req.body;
    const userId = req.params.userId;
    
    const forecast = await predictSpending(userId, months);
    
    const savedForecast = await prisma.forecast.create({
      data: {
        userId,
        prediction: forecast as any,
        model: 'spending-predictor',
        accuracy: forecast.accuracy
      }
    });
    
    res.status(201).json({
      id: savedForecast.id,
      ...forecast
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Predict income for a user
router.post('/income/:userId', async (req: Request, res: Response) => {
  try {
    const { months = 1 } = req.body;
    const userId = req.params.userId;
    
    const forecast = await predictIncome(userId, months);
    
    const savedForecast = await prisma.forecast.create({
      data: {
        userId,
        prediction: forecast as any,
        model: 'income-predictor',
        accuracy: forecast.accuracy
      }
    });
    
    res.status(201).json({
      id: savedForecast.id,
      ...forecast
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get forecast history for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const forecasts = await prisma.forecast.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.json(forecasts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate income forecast and default risk score for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { months = 3 } = req.query; // Default to 3 months
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's transaction history
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 1000 // Get last 1000 transactions
    });
    
    // Calculate average income from credit transactions
    const creditTransactions = transactions.filter(tx => 
      tx.type === 'credit' || (tx.amount > 0 && !tx.type)
    );
    const averageIncome = creditTransactions.length > 0
      ? creditTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / creditTransactions.length
      : 3000; // Default average if no transactions
    
    // Generate income forecast
    const incomeForecast = await predictIncome(userId, parseInt(months as string));
    
    // Calculate default risk score
    const defaultRisk = await calculateDefaultRisk(
      userId,
      transactions,
      averageIncome * 30 // Monthly average
    );
    
    // Save forecast to database
    const savedForecast = await prisma.forecast.create({
      data: {
        userId,
        prediction: {
          incomeForecast: incomeForecast.predictions,
          defaultRisk: defaultRisk
        } as any,
        model: 'income-default-risk-v1',
        accuracy: incomeForecast.accuracy
      }
    });
    
    res.json({
      userId,
      forecastId: savedForecast.id,
      incomeForecast: {
        predictions: incomeForecast.predictions,
        model: incomeForecast.model,
        accuracy: incomeForecast.accuracy,
        averageMonthlyIncome: averageIncome * 30
      },
      defaultRisk: {
        score: defaultRisk.score,
        level: defaultRisk.level,
        probability: defaultRisk.probability,
        factors: defaultRisk.factors
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

