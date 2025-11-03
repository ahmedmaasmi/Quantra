import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Progress } from "@/components/ui/progress";

const historicalData = [
  { month: "Jul", income: 4500, expense: 3200 },
  { month: "Aug", income: 4800, expense: 3400 },
  { month: "Sep", income: 4600, expense: 3300 },
  { month: "Oct", income: 5200, expense: 3500 },
  { month: "Nov", income: 4900, expense: 3600 },
  { month: "Dec", income: 5100, expense: 3800 },
];

const forecastData = [
  { month: "Jan", forecast: 5300, lower: 4800, upper: 5800 },
  { month: "Feb", forecast: 5400, lower: 4900, upper: 5900 },
  { month: "Mar", forecast: 5600, lower: 5000, upper: 6200 },
  { month: "Apr", forecast: 5500, lower: 4900, upper: 6100 },
  { month: "May", forecast: 5800, lower: 5200, upper: 6400 },
  { month: "Jun", forecast: 6000, lower: 5400, upper: 6600 },
];

export default function CreditForecast() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Credit & Income Forecast</h1>
        <p className="text-muted-foreground">Predictive analytics for financial risk assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center h-32 w-32">
                <svg className="transform -rotate-90 h-32 w-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--success))"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56 * 0.28} ${2 * Math.PI * 56}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute">
                  <p className="text-3xl font-bold">28</p>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Badge className="w-full justify-center bg-success text-lg py-2">
                Low Risk
              </Badge>
              <p className="text-sm text-muted-foreground text-center">
                Stable income pattern with good payment history
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>6-Month Income Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="hsl(var(--background))"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historical Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                  dataKey="income"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-2))", r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-4))", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Factors & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Consistent Income</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Regular monthly income with minimal variance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Low Debt-to-Income Ratio</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current ratio: 32% (Healthy)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Rising Expenses</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +8% increase over last 3 months
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-3">Suggested Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Increase credit limit by 15%
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve for premium tier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Confidence Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model Accuracy</span>
                <span className="font-semibold">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Quality</span>
                <span className="font-semibold">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prediction Confidence</span>
                <span className="font-semibold">91%</span>
              </div>
              <Progress value={91} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
