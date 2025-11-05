import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { chatAPI } from '../services/mlApiClient';

const router = Router();
const prisma = new PrismaClient();

// Chat endpoint for AI interactions using OpenRouter API via ML service, with rule-based fallback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, userId, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Try to use ML service (OpenRouter API) first
    try {
      const mlResponse = await chatAPI.message(message, userId, context);
      if (mlResponse && mlResponse.message) {
        return res.json({
          message: mlResponse.message,
          timestamp: mlResponse.timestamp || new Date().toISOString(),
          userId,
          context,
          data: mlResponse.data || null
        });
      }
    } catch (mlError) {
      // ML service not available or error, fall back to rule-based
      console.warn('ML service unavailable, using rule-based responses:', mlError);
    }
    
    // Fallback to rule-based responses
    const messageLower = message.toLowerCase().trim();
    
    // Rule-based response system
    let response: string = '';
    let data: any = null;
    
    // Get user's fraud data if userId provided
    if (userId) {
      try {
        // Get flagged transactions
        const flaggedTransactions = await prisma.transaction.findMany({
          where: {
            userId,
            isFlagged: true
          },
          orderBy: { timestamp: 'desc' },
          take: 5
        });
        
        // Get fraud alerts
        const fraudAlerts = await prisma.alert.findMany({
          where: {
            userId,
            type: 'fraud'
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            transaction: true
          }
        });
        
        // Get recent transactions
        const recentTransactions = await prisma.transaction.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 10
        });
        
        // Check for specific questions
        if (messageLower.includes('why was i flagged') || 
            messageLower.includes('why flagged') ||
            messageLower.includes('fraud detection') ||
            messageLower.includes('flagged transaction')) {
          
          if (flaggedTransactions.length > 0) {
            const tx = flaggedTransactions[0];
            response = `You were flagged due to a transaction of $${tx.amount} on ${new Date(tx.timestamp).toLocaleDateString()}. `;
            if (tx.explanation) {
              response += `Reason: ${tx.explanation}. `;
            }
            if (tx.fraudScore) {
              response += `Fraud score: ${tx.fraudScore.toFixed(0)}/100. `;
            }
            response += `Would you like more details about this transaction?`;
            data = { transaction: tx };
          } else {
            response = "I don't see any flagged transactions in your account. All your transactions appear to be normal.";
          }
        } 
        else if (messageLower.includes('fraud') || messageLower.includes('suspicious')) {
          if (fraudAlerts.length > 0) {
            response = `I found ${fraudAlerts.length} fraud alert(s) in your account. `;
            const latestAlert = fraudAlerts[0];
            response += `Latest: ${latestAlert.message}. `;
            response += `Would you like me to explain why these transactions were flagged?`;
            data = { alerts: fraudAlerts };
          } else {
            response = "No fraud alerts detected in your account. Your transactions appear to be legitimate.";
          }
        }
        else if (messageLower.includes('transaction') || messageLower.includes('spending')) {
          if (recentTransactions.length > 0) {
            const total = recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            response = `You have ${recentTransactions.length} recent transaction(s) totaling $${total.toFixed(2)}. `;
            response += `Would you like me to analyze them for potential fraud?`;
            data = { transactions: recentTransactions.slice(0, 5) };
          } else {
            response = "I don't see any recent transactions in your account.";
          }
        }
        else if (messageLower.includes('forecast') || messageLower.includes('prediction')) {
          response = "I can help you generate a spending or income forecast. Would you like me to create a 3-month forecast based on your transaction history?";
        }
        else if (messageLower.includes('risk') || messageLower.includes('score')) {
          const highRiskTxs = recentTransactions.filter(tx => 
            tx.fraudScore && tx.fraudScore > 70
          );
          if (highRiskTxs.length > 0) {
            response = `I found ${highRiskTxs.length} high-risk transaction(s) in your account. `;
            response += `The average fraud score is ${(highRiskTxs.reduce((sum, tx) => sum + (tx.fraudScore || 0), 0) / highRiskTxs.length).toFixed(0)}/100. `;
            response += `Would you like me to explain the risk factors?`;
            data = { highRiskTransactions: highRiskTxs };
          } else {
            response = "Your account shows a low risk profile. No high-risk transactions detected.";
          }
        }
        else if (messageLower.includes('help') || messageLower.includes('what can you do')) {
          response = "I can help you with:\n";
          response += "- Fraud detection and explanation\n";
          response += "- Transaction analysis\n";
          response += "- Spending forecasts\n";
          response += "- Risk assessment\n";
          response += "- Answer questions about flagged transactions\n";
          response += "\nWhat would you like to know?";
        }
        else {
          // Default contextual response
          if (flaggedTransactions.length > 0 || fraudAlerts.length > 0) {
            response = `I notice you have some flagged transactions. Would you like me to explain why they were flagged?`;
            data = { 
              flaggedCount: flaggedTransactions.length,
              alertCount: fraudAlerts.length 
            };
          } else {
            response = "I can help you analyze your transactions, detect fraud, and generate forecasts. What would you like to know?";
          }
        }
      } catch (error) {
        // Fallback if database query fails
        response = "I can help you analyze your transactions and detect potential fraud. What would you like to know?";
      }
    } else {
      // No userId provided - general responses
      if (messageLower.includes('fraud') || messageLower.includes('flagged')) {
        response = "I can help you understand why transactions are flagged. Please provide your user ID to get specific information about your account.";
      } else if (messageLower.includes('help') || messageLower.includes('what can you do')) {
        response = "I can help you with fraud detection, transaction analysis, and spending forecasts. Please provide your user ID for personalized assistance.";
      } else {
        response = "I can help you with fraud detection and transaction analysis. What would you like to know?";
      }
    }
    
    res.json({
      message: response,
      timestamp: new Date().toISOString(),
      userId,
      context,
      data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    // TODO: Store chat history in database
    // For now, return empty array
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

