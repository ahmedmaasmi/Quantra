"use client";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, Users, ArrowRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const transactionData = [
  { date: "Mon", volume: 45000, alerts: 12 },
  { date: "Tue", volume: 52000, alerts: 8 },
  { date: "Wed", volume: 48000, alerts: 15 },
  { date: "Thu", volume: 61000, alerts: 6 },
  { date: "Fri", volume: 55000, alerts: 10 },
];

const recentAlerts = [
  { id: 1, type: "High Risk Transaction", user: "John Doe", amount: "$15,420", risk: 95, timestamp: "2 min ago" },
  { id: 2, type: "Suspicious Pattern", user: "Jane Smith", amount: "$8,320", risk: 78, timestamp: "15 min ago" },
  { id: 3, type: "Velocity Check Failed", user: "Mike Johnson", amount: "$22,100", risk: 82, timestamp: "1 hour ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Risk Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring and fraud detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="KYC Verifications"
          value="1,247"
          change="+12.5% vs last week"
          changeType="positive"
          icon={Shield}
        />
        <MetricCard
          title="Active Cases"
          value="23"
          change="5 need attention"
          changeType="negative"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Fraud Detected"
          value="$47.2K"
          change="-8.2% vs last week"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Users Monitored"
          value="8,432"
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
                  <Button size="sm">Investigate</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
