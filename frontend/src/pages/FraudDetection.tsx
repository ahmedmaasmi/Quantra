import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, TrendingUp, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const explainabilityFactors = [
  { feature: "Transaction Amount", contribution: 35, direction: "risk" },
  { feature: "Time of Day (3:42 AM)", contribution: 28, direction: "risk" },
  { feature: "New Merchant", contribution: 22, direction: "risk" },
  { feature: "Device Fingerprint", contribution: 10, direction: "safe" },
  { feature: "Location Match", contribution: 5, direction: "safe" },
];

export default function FraudDetection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fraud Detection</h1>
        <p className="text-muted-foreground">AI-powered transaction monitoring with explainability</p>
      </div>

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
                <p className="font-mono font-medium">TXN-2024-89432</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-lg">$15,420.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Merchant</p>
                <p className="font-medium">Electronics Global Store</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                <p className="font-medium">Jan 15, 2025 3:42 AM</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Fraud Probability</h3>
                <Badge variant="destructive" className="text-lg font-mono">92%</Badge>
              </div>
              <Progress value={92} className="h-3" />
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
              <Button className="flex-1 bg-destructive hover:bg-destructive/90" size="lg">
                Create AML Case
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
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
                  <span className="text-2xl font-bold text-primary">JD</span>
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-muted-foreground">Customer since 2022</p>
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
                    <Progress value={75} className="h-2 flex-1" />
                    <span className="text-sm font-medium">75/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Volume</p>
                  <p className="font-semibold mt-1">$8,240</p>
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
                <p className="font-medium mt-1">Moscow, Russia</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User's Typical Location</p>
                <p className="font-medium mt-1">New York, USA</p>
              </div>
              <Badge variant="destructive" className="w-full justify-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Location Mismatch
              </Badge>
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
