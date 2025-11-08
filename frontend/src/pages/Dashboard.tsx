"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, TrendingUp, Users, Loader2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  type TransactionPoint = { date: string; volume: number; alerts: number; isToday?: boolean; label?: string };
  type ApiTransactionPoint = { date?: string; rawDate?: string; volume?: number | string; alerts?: number | string; isToday?: boolean };
  const [transactionData, setTransactionData] = useState<Array<TransactionPoint>>([]);
  const [recentAlerts, setRecentAlerts] = useState<Array<{
    id: string;
    type: string;
    user: string;
    amount: string;
    risk: number;
    timestamp: string;
    userId?: string;
    transactionId?: string;
  }>>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string; today: string } | null>(null);
  const [metrics, setMetrics] = useState({
    kycVerifications: 0,
    activeCases: 0,
    fraudDetected: "$0K",
    usersMonitored: 0,
    fraudRate: "0",
    kycApprovalRate: "0",
    totalTransactions: 0,
    flaggedTransactions: 0,
    totalAlerts: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getDashboardStats();
        
        // Normalize transaction data to ensure numeric volumes and a stable display label
        const normalizedTx: Array<TransactionPoint> =
          ((data.transactionVolume || []) as Array<ApiTransactionPoint>).map((d) => ({
            date: (d.rawDate || d.date) ?? "",
            label: d.date ?? "",
            volume: Number(d.volume ?? 0) || 0,
            alerts: Number(d.alerts ?? 0) || 0,
            isToday: Boolean(d.isToday),
          }));
        setTransactionData(normalizedTx);
        setRecentAlerts(data.recentAlerts || []);
        setDateRange(data.dateRange || null);
        
        const metricsData = data.metrics || {};
        setMetrics({
          kycVerifications: Number(metricsData.kycVerifications) || 0,
          activeCases: Number(metricsData.activeCases) || 0,
          fraudDetected: metricsData.fraudDetected || "$0K",
          usersMonitored: Number(metricsData.usersMonitored) || 0,
          fraudRate: metricsData.fraudRate || "0",
          kycApprovalRate: metricsData.kycApprovalRate || "0",
          totalTransactions: Number(metricsData.totalTransactions) || 0,
          flaggedTransactions: Number(metricsData.flaggedTransactions) || 0,
          totalAlerts: Number(metricsData.totalAlerts) || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setTransactionData([]);
        setRecentAlerts([]);
        setMetrics({
          kycVerifications: 0,
          activeCases: 0,
          fraudDetected: "$0K",
          usersMonitored: 0,
          fraudRate: "0",
          kycApprovalRate: "0",
          totalTransactions: 0,
          flaggedTransactions: 0,
          totalAlerts: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor risk, detect fraud, and manage compliance with real-time insights.
            {dateRange && (
              <span className="ml-2 text-sm font-medium">
                • Showing data from {dateRange.start} to {dateRange.end} (Today)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "KYC Verifications", 
            value: metrics.kycVerifications.toString(), 
            change: `${metrics.kycApprovalRate}% approval rate`, 
            changeType: "positive" as const, 
            icon: Shield, 
            variant: "primary" as const 
          },
          { 
            title: "Active AML Cases", 
            value: metrics.activeCases.toString(), 
            change: "Cases requiring attention", 
            changeType: "neutral" as const, 
            icon: AlertTriangle, 
            variant: "default" as const 
          },
          { 
            title: "Fraud Detected", 
            value: metrics.fraudDetected, 
            change: `${metrics.fraudRate}% fraud rate`, 
            changeType: "negative" as const, 
            icon: TrendingUp, 
            variant: "default" as const 
          },
          { 
            title: "Users Monitored", 
            value: metrics.usersMonitored.toString(), 
            change: `${metrics.totalTransactions} total transactions`, 
            changeType: "positive" as const, 
            icon: Users, 
            variant: "default" as const 
          },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <MetricCard
              title={card.title}
              value={card.value}
              change={card.change}
              changeType={card.changeType}
              icon={card.icon}
              variant={card.variant}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction Volume (Last 7 Days)</CardTitle>
                {dateRange && (
                  <p className="text-sm text-muted-foreground">
                    {dateRange.start} - {dateRange.end}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transactionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, 'Volume']}
                      labelFormatter={(label: string, payload: Array<{ payload?: { isToday?: boolean } }>) => {
                        const isToday = Array.isArray(payload) && payload[0]?.payload?.isToday;
                        return isToday ? `${label} (Today)` : label;
                      }}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No transaction data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent High-Risk Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAlerts.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {recentAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => {
                        if (alert.transactionId) {
                          router.push(`/fraud?transactionId=${alert.transactionId}`);
                        } else if (alert.userId) {
                          router.push(`/users/${alert.userId}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{alert.user}</p>
                          <p className="text-xs text-muted-foreground truncate">{alert.type}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="destructive" className="text-xs">
                              Risk: {alert.risk}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">{alert.amount}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                    </div>
                  ))}
                  {recentAlerts.length > 5 && (
                    <button
                      onClick={() => router.push("/aml")}
                      className="w-full mt-2 text-sm text-primary hover:underline flex items-center justify-center gap-1"
                    >
                      View all alerts
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No alerts available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction & Alerts Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Total Transactions</span>
                  <span className="text-lg font-bold">{metrics.totalTransactions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Flagged Transactions</span>
                  <span className="text-lg font-bold text-destructive">{metrics.flaggedTransactions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Fraud Rate</span>
                  <span className="text-lg font-bold">{metrics.fraudRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Total Alerts</span>
                  <span className="text-lg font-bold">{metrics.totalAlerts.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KYC Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>KYC Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Approved Verifications</span>
                  <span className="text-lg font-bold text-green-600">{metrics.kycVerifications.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Approval Rate</span>
                  <span className="text-lg font-bold">{metrics.kycApprovalRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Users Monitored</span>
                  <span className="text-lg font-bold">{metrics.usersMonitored.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">Active Cases</span>
                  <span className="text-lg font-bold text-orange-600">{metrics.activeCases.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
