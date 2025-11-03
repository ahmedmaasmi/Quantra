import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

console.log("📦 Dashboard router initialized");

// Helper function to get base URL
function getBaseUrl(req: Request): string {
  // Try to get from request first
  const host = req.get('host') || process.env.HOST || 'localhost:5000';
  const protocol = req.protocol || (req.get('x-forwarded-proto') || 'http').split(',')[0];
  
  // If we're in development, use localhost
  if (process.env.NODE_ENV === 'development' || !req.get('host')) {
    const port = process.env.PORT || '5000';
    return `http://localhost:${port}`;
  }
  
  return `${protocol}://${host}`;
}

// Helper function to fetch data from API routes
async function fetchFromRoute(baseUrl: string, endpoint: string): Promise<any> {
  try {
    const url = `${baseUrl}${endpoint}`;
    console.log(`Fetching from: ${url}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching from ${endpoint}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return null;
  }
}

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: "Dashboard test route works!" });
});

// Get dashboard statistics
router.get('/', async (req: Request, res: Response) => {
  console.log("📊 Dashboard route hit!");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  try {
    const baseUrl = getBaseUrl(req);
    console.log("Base URL:", baseUrl);
    
    // Fetch data from all API routes
    const [users, transactions, alerts, cases] = await Promise.all([
      fetchFromRoute(baseUrl, '/api/users'),
      fetchFromRoute(baseUrl, '/api/transactions?limit=1000'),
      fetchFromRoute(baseUrl, '/api/alerts?limit=1000'),
      fetchFromRoute(baseUrl, '/api/cases?limit=1000')
    ]);

    // If any critical data is missing, return error or empty data
    if (!users || !transactions || !alerts || !cases) {
      console.warn("⚠️ Some API routes returned null. Users:", !!users, "Transactions:", !!transactions, "Alerts:", !!alerts, "Cases:", !!cases);
    }

    // Process users data
    const usersArray = Array.isArray(users) ? users : [];
    const totalUsers = usersArray.length;
    const approvedUsers = usersArray.filter((u: any) => u.kycStatus === 'approved').length;
    const pendingUsers = usersArray.filter((u: any) => u.kycStatus === 'pending').length;

    // Process transactions data
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    const totalTransactions = transactionsArray.length;
    const flaggedTransactions = transactionsArray.filter((t: any) => t.isFlagged === true).length;
    
    // Calculate fraud detected amount
    const flaggedTxData = transactionsArray.filter((t: any) => t.isFlagged === true);
    const fraudDetectedAmount = flaggedTxData.reduce((sum: number, tx: any) => sum + Math.abs(tx.amount || 0), 0);

    // Process cases data
    const casesArray = Array.isArray(cases) ? cases : [];
    const openCases = casesArray.filter((c: any) => c.status === 'open' || c.status === 'assigned').length;

    // Process alerts data
    const alertsArray = Array.isArray(alerts) ? alerts : [];
    const totalAlerts = alertsArray.length;
    const recentAlerts = alertsArray
      .filter((a: any) => a.type === 'fraud' && a.severity === 'high')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Calculate metrics
    const fraudRate = totalTransactions > 0 
      ? (flaggedTransactions / totalTransactions) * 100 
      : 0;
    
    const kycApprovalRate = totalUsers > 0 
      ? (approvedUsers / totalUsers) * 100 
      : 0;
    
    const amlCasesOpenRate = totalAlerts > 0 
      ? (openCases / totalAlerts) * 100 
      : 0;

    // Get transaction volume for last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTransactions = transactionsArray.filter((tx: any) => {
      const txDate = new Date(tx.timestamp || tx.createdAt);
      return txDate >= sevenDaysAgo;
    });

    // Group by date
    const transactionVolumeByDate: { [key: string]: { volume: number; alerts: number } } = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      transactionVolumeByDate[dateStr] = { volume: 0, alerts: 0 };
    }

    recentTransactions.forEach((tx: any) => {
      const txDate = new Date(tx.timestamp || tx.createdAt);
      const dateStr = txDate.toISOString().split('T')[0];
      if (transactionVolumeByDate[dateStr]) {
        transactionVolumeByDate[dateStr].volume += Math.abs(tx.amount || 0);
        if (tx.isFlagged) {
          transactionVolumeByDate[dateStr].alerts += 1;
        }
      }
    });

    // Get alerts for same period
    const recentAlertData = alertsArray.filter((alert: any) => {
      const alertDate = new Date(alert.createdAt);
      return alertDate >= sevenDaysAgo;
    });

    recentAlertData.forEach((alert: any) => {
      const dateStr = new Date(alert.createdAt).toISOString().split('T')[0];
      if (transactionVolumeByDate[dateStr]) {
        transactionVolumeByDate[dateStr].alerts += 1;
      }
    });

    const transactionVolume = Object.entries(transactionVolumeByDate).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      volume: data.volume,
      alerts: data.alerts
    }));

    // Format recent alerts
    const formattedRecentAlerts = recentAlerts.map((alert: any) => {
      const user = alert.user || (usersArray.find((u: any) => u.id === alert.userId) || {});
      const transaction = alert.transaction || (transactionsArray.find((t: any) => t.id === alert.transactionId) || {});
      
      return {
        id: alert.id,
        type: alert.message || 'High Risk Transaction',
        user: user?.name || 'Unknown',
        amount: transaction?.amount ? `$${Math.abs(transaction.amount).toLocaleString()}` : 'N/A',
        risk: transaction?.fraudScore || 0,
        timestamp: formatTimestamp(alert.createdAt),
        userId: alert.userId,
        transactionId: alert.transactionId
      };
    });

    const response = {
      metrics: {
        kycVerifications: approvedUsers,
        activeCases: openCases,
        fraudDetected: `$${(fraudDetectedAmount / 1000).toFixed(1)}K`,
        usersMonitored: totalUsers,
        fraudRate: fraudRate.toFixed(2),
        kycApprovalRate: kycApprovalRate.toFixed(2),
        amlCasesOpenRate: amlCasesOpenRate.toFixed(2),
        totalTransactions,
        flaggedTransactions,
        totalAlerts
      },
      transactionVolume,
      recentAlerts: formattedRecentAlerts
    };

    console.log("📊 Dashboard data prepared:", {
      metrics: response.metrics,
      transactionVolumeCount: response.transactionVolume.length,
      recentAlertsCount: response.recentAlerts.length
    });

    res.json(response);
  } catch (error: any) {
    console.error("❌ Dashboard route error:", error);
    res.status(500).json({ 
      error: error.message || "Internal server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

function formatTimestamp(date: string | Date): string {
  const now = new Date();
  const timestamp = new Date(date);
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return timestamp.toLocaleDateString();
}

export default router;

