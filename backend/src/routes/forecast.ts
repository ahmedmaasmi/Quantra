import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateForecast, predictSpending, predictIncome } from '../services/forecastService';

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

export default router;

