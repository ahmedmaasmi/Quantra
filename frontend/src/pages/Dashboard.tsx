"use client";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Users, ArrowRight, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "@/lib/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState<Array<{ date: string; volume: number; alerts: number }>>([]);
  const [recentAlerts, setRecentAlerts] = useState<Array<{ id: string; type: string; user: string; amount: string; risk: number; timestamp: string; userId?: string; transactionId?: string }>>([]);
  const [metrics, setMetrics] = useState({
    kycVerifications: 0,
    activeCases: 0,
    fraudDetected: "$0K",
    usersMonitored: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");
        const data = await apiClient.getDashboardStats();
        console.log("Dashboard data received:", data);
        
        setTransactionData(data.transactionVolume || []);
        setRecentAlerts(data.recentAlerts || []);
        
        // Safely merge metrics with defaults
        const metricsData = data.metrics || {};
        setMetrics({
          kycVerifications: Number(metricsData.kycVerifications) || 0,
          activeCases: Number(metricsData.activeCases) || 0,
          fraudDetected: metricsData.fraudDetected || "$0K",
          usersMonitored: Number(metricsData.usersMonitored) || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to empty data on error
        setTransactionData([]);
        setRecentAlerts([]);
        setMetrics({
          kycVerifications: 0,
          activeCases: 0,
          fraudDetected: "$0K",
          usersMonitored: 0,
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
      <div>
        <h1 className="text-3xl font-bold mb-2">Risk Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring and fraud detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="KYC Verifications"
          value={Number(metrics.kycVerifications || 0).toLocaleString()}
          change="+12.5% vs last week"
          changeType="positive"
          icon={Shield}
        />
        <MetricCard
          title="Active Cases"
          value={Number(metrics.activeCases || 0).toString()}
          change="5 need attention"
          changeType="negative"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Fraud Detected"
          value={metrics.fraudDetected || "$0K"}
          change="-8.2% vs last week"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Users Monitored"
          value={Number(metrics.usersMonitored || 0).toLocaleString()}
          change="+234 this week"
          changeType="neutral"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="alerts" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-1))", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Fraud Alerts</CardTitle>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent alerts</p>
            ) : (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.user} • {alert.amount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={alert.risk > 85 ? "destructive" : "default"}
                        className="font-mono"
                      >
                        {alert.risk}% Risk
                      </Badge>
                      <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                      {alert.userId && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/investigate/${alert.userId}`;
                          }}
                        >
                          Investigate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
