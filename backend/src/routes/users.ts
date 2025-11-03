import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        alerts: {
          where: { isRead: false },
          take: 5
        }
      }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        alerts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.create({
      data: { email, name, phone }
    });
    
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone }
    });
    
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

