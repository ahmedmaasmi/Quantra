import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, transactionId, type, message, severity, status } = req.body;
    
    if (!userId || !type || !message) {
      return res.status(400).json({ 
        error: 'userId, type, and message are required' 
      });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create alert
    const alert = await prisma.alert.create({
      data: {
        userId,
        transactionId: transactionId || null,
        type,
        message,
        severity: severity || 'medium',
        status: status || 'open'
      },
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
    
    res.status(201).json(alert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, isRead, limit = '50' } = req.query;
    
    const where: any = {};
    if (userId) where.userId = userId as string;
    if (isRead !== undefined) where.isRead = isRead === 'true';
    
    const alerts = await prisma.alert.findMany({
      where,
      take: parseInt(limit as string),
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
    
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: req.params.id },
      include: {
        user: true
      }
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update alert
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { isRead, status, message } = req.body;
    
    const updateData: any = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (status !== undefined) updateData.status = status;
    if (message !== undefined) updateData.message = message;
    
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json(alert);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    
    res.json(alert);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Mark all alerts as read for a user
router.patch('/user/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const result = await prisma.alert.updateMany({
      where: { 
        userId: req.params.userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    res.json({ updated: result.count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.alert.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

