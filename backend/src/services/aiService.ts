export interface Transaction {
  amount: number;
  location?: string;
  frequency?: number;
  type?: string;
  [key: string]: any;
}

export const fraudScore = (transaction: Transaction): number => {
  // Enhanced fraud detection scoring
  let score = 0;
  
  // Amount-based scoring
  if (transaction.amount > 50000) score += 60;
  else if (transaction.amount > 10000) score += 40;
  else if (transaction.amount > 5000) score += 20;
  
  // Location-based scoring
  if (transaction.location && transaction.location !== "userCountry") {
    score += 30;
  }
  
  // Frequency-based scoring
  if (transaction.frequency && transaction.frequency > 10) score += 30;
  else if (transaction.frequency && transaction.frequency > 5) score += 15;
  
  // Type-based scoring
  if (transaction.type === 'withdrawal' && transaction.amount > 5000) {
    score += 20;
  }
  
  return Math.min(score, 100);
};
  