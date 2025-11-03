import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, XCircle, Clock, User, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function KYC() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground">Identity verification and document processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Upload ID Document</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Upload Selfie</p>
              <p className="text-sm text-muted-foreground">
                For liveness verification
              </p>
            </div>

            <Button className="w-full" size="lg">
              Start Verification
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <div>
                  <p className="font-semibold text-lg">Verification Complete</p>
                  <p className="text-sm text-muted-foreground">Match Score: 97% • Liveness: Verified</p>
                </div>
              </div>
              <Progress value={97} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="font-medium">Michael Anderson</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date of Birth</label>
                <p className="font-medium">March 15, 1985</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Document Number</label>
                <p className="font-medium font-mono">X12345678</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Expiry Date</label>
                <p className="font-medium">December 2028</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Nationality</label>
                <p className="font-medium">United States</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Document Type</label>
                <p className="font-medium">Driver's License</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" size="lg">
                Approve Verification
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                Request Additional Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Sarah Johnson", status: "approved", score: 98, time: "5 min ago" },
              { name: "David Lee", status: "pending", score: 85, time: "12 min ago" },
              { name: "Emily Chen", status: "approved", score: 96, time: "1 hour ago" },
              { name: "James Wilson", status: "rejected", score: 45, time: "2 hours ago" },
            ].map((verification, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{verification.name}</p>
                    <p className="text-sm text-muted-foreground">Match Score: {verification.score}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {verification.status === "approved" && (
                    <Badge className="bg-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                  {verification.status === "pending" && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {verification.status === "rejected" && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">{verification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
