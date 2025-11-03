import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all cases
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status, limit = '50', offset = '0' } = req.query;
    
    const where: any = {};
    if (userId) where.userId = userId as string;
    if (status) where.status = status as string;
    
    const cases = await prisma.case.findMany({
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
        },
        alert: {
          select: {
            id: true,
            type: true,
            message: true,
            severity: true
          }
        }
      }
    });
    
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get case by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const case_ = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        alert: {
          include: {
            transaction: true
          }
        }
      }
    });
    
    if (!case_) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(case_);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new case from an alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, alertId, summary, assignedTo } = req.body;
    
    if (!userId || !alertId || !summary) {
      return res.status(400).json({ 
        error: 'userId, alertId, and summary are required' 
      });
    }
    
    // Check if alert exists
    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create case
    const case_ = await prisma.case.create({
      data: {
        userId,
        alertId,
        summary,
        status: 'open',
        assignedTo: assignedTo || null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alert: true
      }
    });
    
    res.status(201).json(case_);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update case (assign, resolve, etc.)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, assignedTo, notes, summary } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (summary !== undefined) updateData.summary = summary;
    
    const case_ = await prisma.case.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alert: true
      }
    });
    
    res.json(case_);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Assign case to someone
router.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo is required' });
    }
    
    const case_ = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        assignedTo,
        status: 'assigned'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alert: true
      }
    });
    
    res.json(case_);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Resolve case
router.patch('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    
    const case_ = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        status: 'resolved',
        notes: notes || case_.notes
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alert: true
      }
    });
    
    // Also close the associated alert
    await prisma.alert.update({
      where: { id: case_.alertId },
      data: { status: 'closed' }
    });
    
    res.json(case_);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Close case
router.patch('/:id/close', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    
    const case_ = await prisma.case.update({
      where: { id: req.params.id },
      data: {
        status: 'closed',
        notes: notes || case_.notes
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        alert: true
      }
    });
    
    // Also close the associated alert
    await prisma.alert.update({
      where: { id: case_.alertId },
      data: { status: 'closed' }
    });
    
    res.json(case_);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete case
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.case.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

