import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { verifyKYC } from '../services/kycService';

const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/kyc/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  })
});

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
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json(usersWithoutPasswords);
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
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (Note: Use /auth/register for user registration with password hashing)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ 
        error: 'Email, name, and password are required' 
      });
    }
    
    // Hash password (for demo purposes, but prefer using /auth/register)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        password: hashedPassword,
        phone,
        kycStatus: 'pending'
      }
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
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

// Submit KYC result for a user
router.post('/:id/kyc', upload.fields([
  { name: 'documentImage', maxCount: 1 },
  { name: 'faceImage', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { documentType, documentNumber, verified } = req.body;
    
    const documentImage = files?.documentImage?.[0]?.path;
    const faceImage = files?.faceImage?.[0]?.path;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If verified status is provided directly, use it
    // Otherwise, run KYC verification
    let kycResult;
    if (verified !== undefined) {
      // Direct JSON simulation
      kycResult = {
        verified: Boolean(verified),
        score: verified ? 90 : 30,
        checks: {
          documentValid: Boolean(documentNumber && documentNumber.length > 5),
          faceMatch: Boolean(faceImage),
          informationMatch: true
        },
        recommendations: verified ? [] : ['Please resubmit documents']
      };
    } else {
      // Run KYC verification service
      kycResult = await verifyKYC({
        userId,
        documentType: documentType || 'id',
        documentNumber,
        documentImage,
        faceImage,
        verified: false
      });
    }
    
    // Update user KYC status
    const kycStatus = kycResult.verified ? 'approved' : kycResult.score >= 60 ? 'pending' : 'rejected';
    
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus }
    });
    
    // Create alert if KYC failed
    if (!kycResult.verified) {
      await prisma.alert.create({
        data: {
          userId,
          type: 'kyc',
          message: `KYC verification failed. Score: ${kycResult.score.toFixed(0)}%`,
          severity: kycResult.score < 40 ? 'high' : 'medium',
          status: 'open'
        }
      });
    }
    
    res.json({
      userId,
      kycStatus,
      kycResult
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

