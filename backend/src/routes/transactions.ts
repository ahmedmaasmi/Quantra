import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeTransaction } from '../services/fraudService';

const router = Router();
const prisma = new PrismaClient();

// Get all transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, limit = '50', offset = '0' } = req.query;
    
    const where = userId ? { userId: userId as string } : {};
    
    const transactions = await prisma.transaction.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        user: true
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction with fraud detection
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, amount, type, description, category, location, metadata } = req.body;
    
    if (!userId || !amount || !type) {
      return res.status(400).json({ 
        error: 'userId, amount, and type are required' 
      });
    }
    
    // Analyze transaction for fraud
    const analysis = analyzeTransaction({
      amount,
      location,
      type,
      description,
      metadata,
      frequency: 0 // Would get from user's transaction history
    });
    
    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type,
        description,
        category,
        location,
        fraudScore: analysis.score,
        metadata: metadata || {}
      }
    });
    
    // Create alert if fraudulent
    if (analysis.fraudulent) {
      await prisma.alert.create({
        data: {
          userId,
          type: 'fraud',
          message: `Fraudulent transaction detected: ${type} of $${amount}`,
          severity: 'high'
        }
      });
    }
    
    res.status(201).json({
      transaction,
      fraudAnalysis: analysis
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's transaction statistics
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    const [total, count, avgAmount, maxAmount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId },
        _sum: { amount: true }
      }),
      prisma.transaction.count({
        where: { userId }
      }),
      prisma.transaction.aggregate({
        where: { userId },
        _avg: { amount: true }
      }),
      prisma.transaction.findFirst({
        where: { userId },
        orderBy: { amount: 'desc' },
        select: { amount: true }
      })
    ]);
    
    res.json({
      totalAmount: total._sum.amount || 0,
      count,
      averageAmount: avgAmount._avg.amount || 0,
      maxAmount: maxAmount?.amount || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

