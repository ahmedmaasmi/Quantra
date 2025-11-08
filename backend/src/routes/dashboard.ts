import { Router, Request, Response } from 'express';
import axios from 'axios';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

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
    const fraudDetectedAmount = flaggedTxData.reduce((sum: number, tx: any) => {
      const amount = parseFloat(tx.amount) || 0;
      return sum + Math.abs(amount);
    }, 0);

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

    // Get transaction volume for last 7 days - read directly from CSV file
    let csvTransactions: any[] = [];
    try {
      const projectRoot = join(__dirname, '..', '..', '..');
      const transactionsPath = join(projectRoot, 'data', 'transactions.csv');
      const fileContent = readFileSync(transactionsPath, 'utf-8');
      
      csvTransactions = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as any[];
      
      console.log(`📊 Loaded ${csvTransactions.length} transactions from CSV for volume calculation`);
    } catch (error: any) {
      console.warn(`⚠️  Could not read transactions.csv: ${error.message}. Falling back to database transactions.`);
      csvTransactions = transactionsArray;
    }
    
    // Find the most recent transaction date to use as reference (handles future dates in CSV)
    let referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);
    
    if (csvTransactions.length > 0) {
      const allTransactionDates = csvTransactions.map((tx: any) => {
        const txDate = new Date(tx.timestamp || tx.createdAt);
        txDate.setHours(0, 0, 0, 0);
        return txDate;
      });
      const mostRecentDate = new Date(Math.max(...allTransactionDates.map((d: Date) => d.getTime())));
      // Use the most recent transaction date as reference
      referenceDate = mostRecentDate;
    }
    
    const sevenDaysAgo = new Date(referenceDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6 days ago + reference date = 7 days total
    
    const recentTransactions = csvTransactions.filter((tx: any) => {
      const txDate = new Date(tx.timestamp || tx.createdAt);
      txDate.setHours(0, 0, 0, 0);
      return txDate >= sevenDaysAgo && txDate <= referenceDate;
    });

    // Group by date - last 7 days from most recent transaction
    const transactionVolumeByDate: { [key: string]: { volume: number; alerts: number } } = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(referenceDate);
      date.setDate(date.getDate() - (6 - i)); // i=0: 6 days ago, i=6: reference date
      const dateStr = date.toISOString().split('T')[0];
      transactionVolumeByDate[dateStr] = { volume: 0, alerts: 0 };
    }

    recentTransactions.forEach((tx: any) => {
      const txDate = new Date(tx.timestamp || tx.createdAt);
      const dateStr = txDate.toISOString().split('T')[0];
      // Use amount directly from CSV
      const amount = parseFloat(tx.amount) || 0;
      if (transactionVolumeByDate[dateStr]) {
        transactionVolumeByDate[dateStr].volume += Math.abs(amount);
        if (tx.isFlagged === 'true' || tx.isFlagged === true) {
          transactionVolumeByDate[dateStr].alerts += 1;
        }
      } else {
        // If date is not in the 7-day range, add it anyway to show all data
        transactionVolumeByDate[dateStr] = transactionVolumeByDate[dateStr] || { volume: 0, alerts: 0 };
        transactionVolumeByDate[dateStr].volume += Math.abs(amount);
        if (tx.isFlagged === 'true' || tx.isFlagged === true) {
          transactionVolumeByDate[dateStr].alerts += 1;
        }
      }
    });

    // Get alerts for same period (last 7 days from reference date)
    const recentAlertData = alertsArray.filter((alert: any) => {
      const alertDate = new Date(alert.createdAt);
      alertDate.setHours(0, 0, 0, 0);
      return alertDate >= sevenDaysAgo && alertDate <= referenceDate;
    });

    recentAlertData.forEach((alert: any) => {
      const dateStr = new Date(alert.createdAt).toISOString().split('T')[0];
      if (transactionVolumeByDate[dateStr]) {
        transactionVolumeByDate[dateStr].alerts += 1;
      }
    });

    // Format dates and include today indicator
    const todayStr = new Date().toISOString().split('T')[0];
    const referenceDateStr = referenceDate.toISOString().split('T')[0];
    const transactionVolume = Object.entries(transactionVolumeByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // Sort chronologically
      .map(([date, data]) => {
        const dateObj = new Date(date);
        const isToday = date === todayStr;
        const isReferenceDate = date === referenceDateStr;
        const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        let label = dateLabel;
        if (isToday) {
          label = `${dateLabel} (Today)`;
        } else if (isReferenceDate && !isToday) {
          label = `${dateLabel} (Latest)`;
        }
        return {
          date: label,
          volume: data.volume,
          alerts: data.alerts,
          rawDate: date,
          isToday
        };
      });

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

    // Calculate date range for display
    const startDate = sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = referenceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
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
      recentAlerts: formattedRecentAlerts,
      dateRange: {
        start: startDate,
        end: endDate,
        today: new Date().toISOString().split('T')[0],
        referenceDate: referenceDateStr
      }
    };

    console.log("📊 Dashboard data prepared:", {
      metrics: response.metrics,
      transactionVolumeCount: response.transactionVolume.length,
      recentAlertsCount: response.recentAlerts.length,
      totalTransactions: totalTransactions,
      recentTransactionsCount: recentTransactions.length,
      referenceDate: referenceDateStr,
      transactionVolumeSample: response.transactionVolume.slice(0, 3)
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

