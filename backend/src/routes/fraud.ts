import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeTransaction } from '../services/fraudService';

const router = Router();
const prisma = new PrismaClient();

// Run fraud detection scan on all transactions
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    const where: any = {};
    if (userId) {
      where.userId = userId as string;
    }
    
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where,
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
    
    let scanned = 0;
    let flagged = 0;
    const results: any[] = [];
    
    // Scan each transaction
    for (const tx of transactions) {
      scanned++;
      
      // Get user's transaction frequency
      const userTxCount = await prisma.transaction.count({
        where: {
          userId: tx.userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
      
      // Get user's recent transaction history for context
      const userHistory = await prisma.transaction.findMany({
        where: { userId: tx.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      
      // Analyze transaction (now async)
      const analysis = await analyzeTransaction({
        amount: tx.amount,
        location: tx.country || tx.location || undefined,
        type: tx.type || 'debit',
        description: tx.description || undefined,
        frequency: userTxCount
      }, userHistory);
      
      // Update transaction with fraud analysis
      const updated = await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          fraudScore: analysis.score,
          isFlagged: analysis.fraudulent,
          explanation: analysis.fraudulent 
            ? `Risk factors: ${analysis.recommendations.join(', ')}`
            : null
        }
      });
      
      if (analysis.fraudulent) {
        flagged++;
        
        // Create or update alert
        const existingAlert = await prisma.alert.findFirst({
          where: {
            transactionId: tx.id,
            type: 'fraud'
          }
        });
        
        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              userId: tx.userId,
              transactionId: tx.id,
              type: 'fraud',
              message: `Fraudulent transaction detected: ${tx.type} of $${tx.amount}`,
              severity: analysis.riskLevel === 'high' ? 'high' : 'medium',
              status: 'open'
            }
          });
        }
      }
      
      results.push({
        transactionId: tx.id,
        fraudulent: analysis.fraudulent,
        score: analysis.score,
        riskLevel: analysis.riskLevel
      });
    }
    
    res.json({
      scanned,
      flagged,
      results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get fraud result for a transaction
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alerts: {
          where: { type: 'fraud' }
        }
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Get user's transaction frequency
    const userTxCount = await prisma.transaction.count({
      where: {
        userId: transaction.userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    // Get user's recent transaction history for context
    const userHistory = await prisma.transaction.findMany({
      where: { userId: transaction.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Analyze transaction (now async)
    const analysis = await analyzeTransaction({
      amount: transaction.amount,
      location: transaction.country || transaction.location || undefined,
      type: transaction.type || 'debit',
      description: transaction.description || undefined,
      frequency: userTxCount
    }, userHistory);
    
    res.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        merchant: transaction.merchant,
        category: transaction.category,
        country: transaction.country,
        timestamp: transaction.timestamp,
        isFlagged: transaction.isFlagged,
        fraudScore: transaction.fraudScore,
        explanation: transaction.explanation
      },
      fraudAnalysis: {
        score: analysis.score,
        fraudulent: analysis.fraudulent,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations
      },
      alerts: transaction.alerts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get explanation for why a transaction was flagged (top features)
router.get('/explain/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
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
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Get user's transaction history for context
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: transaction.userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    const userTxCount = recentTransactions.length;
    const avgAmount = recentTransactions.length > 0
      ? recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / recentTransactions.length
      : 0;
    
    // Analyze transaction to get feature contributions
    const analysis = await analyzeTransaction({
      amount: transaction.amount,
      location: transaction.country || transaction.location || undefined,
      type: transaction.type || 'debit',
      description: transaction.description || undefined,
      frequency: userTxCount
    }, recentTransactions);
    
    // Calculate feature contributions (simulated)
    const features: any[] = [];
    
    // Amount-based risk
    if (transaction.amount > 50000) {
      features.push({
        feature: 'High Transaction Amount',
        contribution: 60,
        description: `Transaction amount of $${transaction.amount} exceeds high-risk threshold`,
        impact: 'high'
      });
    } else if (transaction.amount > 10000) {
      features.push({
        feature: 'Large Transaction Amount',
        contribution: 40,
        description: `Transaction amount of $${transaction.amount} is significantly above average`,
        impact: 'medium'
      });
    }
    
    // Location-based risk
    if (transaction.country && transaction.country !== 'US') {
      features.push({
        feature: 'International Transaction',
        contribution: 30,
        description: `Transaction from country: ${transaction.country}`,
        impact: 'medium'
      });
    }
    
    // Frequency-based risk
    if (userTxCount > 10) {
      features.push({
        feature: 'High Transaction Frequency',
        contribution: 30,
        description: `User has made ${userTxCount} transactions in the last 24 hours`,
        impact: 'medium'
      });
    }
    
    // Amount deviation from average
    if (avgAmount > 0 && transaction.amount > avgAmount * 3) {
      features.push({
        feature: 'Amount Deviation from Pattern',
        contribution: 25,
        description: `Transaction amount is ${(transaction.amount / avgAmount).toFixed(1)}x the user's average`,
        impact: 'medium'
      });
    }
    
    // Sort by contribution
    features.sort((a, b) => b.contribution - a.contribution);
    
    res.json({
      transactionId: transaction.id,
      fraudScore: analysis.score,
      isFlagged: transaction.isFlagged,
      topFeatures: features.slice(0, 5), // Top 5 features
      explanation: transaction.explanation || analysis.recommendations.join('; '),
      recommendations: analysis.recommendations
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

