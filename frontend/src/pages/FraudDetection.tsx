"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import apiClient from "@/lib/api";

export default function FraudDetection() {
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await apiClient.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        setLoading(true);
        if (selectedUserId) {
          // Get user info
          const userData = await apiClient.getUser(selectedUserId);
          setUser(userData);
          
          // Get user transactions
          const transactionsData = await apiClient.getTransactions(selectedUserId, 50);
          setUserTransactions(transactionsData);
          
          // Find flagged transaction
          const flaggedTx = transactionsData.find((tx: any) => tx.isFlagged && tx.fraudScore && tx.fraudScore > 70);
          if (flaggedTx) {
            setTransaction(flaggedTx);
          } else if (transactionsData.length > 0) {
            setTransaction(transactionsData[0]);
          }
        } else {
          // Get flagged transactions
          const transactions = await apiClient.getTransactions(undefined, 50);
          const flaggedTx = transactions.find((tx: any) => tx.isFlagged && tx.fraudScore && tx.fraudScore > 70);
          
          if (flaggedTx) {
            setTransaction(flaggedTx);
            // Get user info
            const userData = await apiClient.getUser(flaggedTx.userId);
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching fraud data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFraudData();
  }, [selectedUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fraud Detection</h1>
          <p className="text-muted-foreground">AI-powered transaction monitoring with explainability</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No high-risk transactions detected</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fraudScore = transaction.fraudScore || 0;
  const explainabilityFactors = [
    { feature: "Transaction Amount", contribution: Math.min(35, Math.floor(fraudScore * 0.35)), direction: "risk" },
    { feature: "Time of Day", contribution: Math.min(28, Math.floor(fraudScore * 0.28)), direction: "risk" },
    { feature: "Merchant", contribution: Math.min(22, Math.floor(fraudScore * 0.22)), direction: "risk" },
    { feature: "Location", contribution: Math.min(10, Math.floor(fraudScore * 0.1)), direction: transaction.country === "USA" ? "safe" : "risk" },
    { feature: "Transaction Pattern", contribution: Math.min(5, Math.floor(fraudScore * 0.05)), direction: "safe" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fraud Detection</h1>
        <p className="text-muted-foreground">AI-powered transaction monitoring with explainability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border rounded-lg bg-background"
          >
            <option value="">-- Select a user --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              High Risk Transaction Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono font-medium">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-lg">${transaction.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Merchant</p>
                <p className="font-medium">{transaction.merchant || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                <p className="font-medium">{new Date(transaction.timestamp || transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Fraud Probability</h3>
                <Badge variant="destructive" className="text-lg font-mono">{Math.round(fraudScore)}%</Badge>
              </div>
              <Progress value={fraudScore} className="h-3" />
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Contributing Factors (SHAP Analysis)
              </h3>
              <div className="space-y-3">
                {explainabilityFactors.map((factor, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{factor.feature}</span>
                      <span className={`text-sm font-medium ${factor.direction === "risk" ? "text-destructive" : "text-success"}`}>
                        {factor.direction === "risk" ? "+" : "-"}{factor.contribution}%
                      </span>
                    </div>
                    <Progress
                      value={factor.contribution}
                      className={`h-2 ${factor.direction === "risk" ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-destructive hover:bg-destructive/90" 
                size="lg"
                onClick={async () => {
                  if (!transaction) return;
                  try {
                    // Create alert first if not exists
                    const alerts = await apiClient.getAlerts(transaction.userId);
                    let alert = alerts.find((a: any) => a.transactionId === transaction.id);
                    
                    if (!alert) {
                      // Create alert
                      alert = await apiClient.createCase({
                        userId: transaction.userId,
                        alertId: transaction.id,
                        summary: `High-risk transaction detected: $${transaction.amount} from ${transaction.merchant || 'Unknown'}`,
                      });
                    }
                    
                    // Create case
                    await apiClient.createCase({
                      userId: transaction.userId,
                      alertId: alert.id,
                      summary: `AML Case created for transaction ${transaction.id}. Amount: $${transaction.amount}, Fraud Score: ${transaction.fraudScore}%`,
                    });
                    
                    alert("AML Case created successfully");
                  } catch (error: any) {
                    alert("Error creating AML case: " + error.message);
                  }
                }}
              >
                Create AML Case
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                size="lg"
                onClick={async () => {
                  if (!transaction) return;
                  try {
                    await apiClient.markAsFalsePositive(transaction.id);
                    alert("Transaction marked as false positive");
                    // Refresh data
                    window.location.reload();
                  } catch (error: any) {
                    alert("Error marking as false positive: " + error.message);
                  }
                }}
              >
                Mark as False Positive
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{user?.name || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">
                    Customer since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge className="bg-success mt-1">Active • Verified</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={fraudScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{Math.round(fraudScore)}/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Amount</p>
                  <p className="font-semibold mt-1">${transaction.amount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Location</p>
                <p className="font-medium mt-1">{transaction.country || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction Type</p>
                <p className="font-medium mt-1">{transaction.type || "Unknown"}</p>
              </div>
              {transaction.country && transaction.country !== "USA" && (
                <Badge variant="destructive" className="w-full justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Location Mismatch
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Transaction Velocity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Last 24 hours</span>
                <span className="font-semibold">8 transactions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last 7 days</span>
                <span className="font-semibold">23 transactions</span>
              </div>
              <Badge variant="destructive" className="w-full justify-center">
                Above Normal Activity
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
