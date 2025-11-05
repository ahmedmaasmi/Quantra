import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { analyzeTransaction } from '../services/fraudService';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Import transactions from CSV or JSON file
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { userId } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let transactions: any[] = [];
    const fileContent = file.buffer.toString('utf-8');
    const fileName = file.originalname.toLowerCase();
    
    // Parse based on file type
    if (fileName.endsWith('.json')) {
      // Parse JSON
      try {
        transactions = JSON.parse(fileContent);
        if (!Array.isArray(transactions)) {
          transactions = [transactions];
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
    } else if (fileName.endsWith('.csv')) {
      // Parse CSV
      try {
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        transactions = records;
      } catch (error) {
        return res.status(400).json({ error: 'Invalid CSV format' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV or JSON' });
    }
    
    // Import transactions
    const imported: any[] = [];
    const errors: any[] = [];
    
    for (const tx of transactions) {
      try {
        // Map CSV/JSON fields to transaction fields
        const amount = parseFloat(tx.amount || tx.Amount || 0);
        const merchant = tx.merchant || tx.Merchant || tx.merchantName || null;
        const category = tx.category || tx.Category || tx.type || null;
        const country = tx.country || tx.Country || tx.location || null;
        const type = tx.type || tx.Type || (amount >= 0 ? 'credit' : 'debit');
        const description = tx.description || tx.Description || tx.note || null;
        const timestamp = tx.timestamp || tx.Timestamp || tx.date || tx.Date || new Date();
        
        if (!amount || isNaN(amount)) {
          errors.push({ row: tx, error: 'Invalid amount' });
          continue;
        }
        
        // Analyze transaction for fraud
        const analysis = await analyzeTransaction({
          amount: Math.abs(amount),
          location: country || undefined,
          type,
          description,
          frequency: 0
        });
        
        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount: Math.abs(amount),
            merchant,
            category,
            country,
            type,
            description,
            timestamp: new Date(timestamp),
            fraudScore: analysis.score,
            isFlagged: analysis.fraudulent,
            explanation: analysis.fraudulent ? analysis.recommendations.join('; ') : null
          }
        });
        
        // Create alert if fraudulent
        if (analysis.fraudulent) {
          await prisma.alert.create({
            data: {
              userId,
              transactionId: transaction.id,
              type: 'fraud',
              message: `Fraudulent transaction detected: ${type} of $${Math.abs(amount)}`,
              severity: 'high',
              status: 'open'
            }
          });
        }
        
        imported.push(transaction);
      } catch (error: any) {
        errors.push({ row: tx, error: error.message });
      }
    }
    
    res.json({
      imported: imported.length,
      errors: errors.length,
      transactions: imported,
      errorsDetails: errors
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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

// Update transaction
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { isFlagged, fraudScore, explanation } = req.body;
    
    const updateData: any = {};
    if (isFlagged !== undefined) updateData.isFlagged = isFlagged;
    if (fraudScore !== undefined) updateData.fraudScore = fraudScore;
    if (explanation !== undefined) updateData.explanation = explanation;
    
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: true
      }
    });
    
    res.json(transaction);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' });
    }
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
    const analysis = await analyzeTransaction({
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

