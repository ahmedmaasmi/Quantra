import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, AlertTriangle, FileText, Clock, CheckCircle2 } from "lucide-react";

const cases = [
  { id: "AML-2024-001", user: "John Doe", priority: "high", status: "open", amount: "$47,230", created: "2 days ago" },
  { id: "AML-2024-002", user: "Sarah Wilson", priority: "medium", status: "investigating", amount: "$23,100", created: "5 days ago" },
  { id: "AML-2024-003", user: "Mike Chen", priority: "low", status: "review", amount: "$12,450", created: "1 week ago" },
];

export default function AMLCases() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AML Case Management</h1>
          <p className="text-muted-foreground">Track and resolve compliance investigations</p>
        </div>
        <Button size="lg">
          <FolderOpen className="mr-2 h-5 w-5" />
          Create New Case
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer border-l-4 border-primary"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{caseItem.id}</span>
                    <Badge
                      variant={
                        caseItem.priority === "high"
                          ? "destructive"
                          : caseItem.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <p className="font-medium mb-1">{caseItem.user}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{caseItem.amount}</span>
                    <span>{caseItem.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Case Details: AML-2024-001</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Assign
                </Button>
                <Button size="sm" className="bg-success hover:bg-success/90">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Resolve Case
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6 mt-6">
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                    <div>
                      <p className="font-semibold mb-2">AI-Generated Summary</p>
                      <p className="text-sm text-muted-foreground">
                        Multiple high-value transactions detected from John Doe's account over 48-hour period.
                        Transactions originated from unusual geographic locations and involved new merchants.
                        Total flagged amount: $47,230. Pattern matches known layering behavior in AML scenarios.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Customer Name</label>
                    <p className="font-medium">John Doe</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Account Number</label>
                    <p className="font-medium font-mono">ACC-8847392</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Total Amount</label>
                    <p className="font-medium text-lg">$47,230.00</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Transaction Count</label>
                    <p className="font-medium">12 transactions</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Risk Level</label>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Assigned To</label>
                    <p className="font-medium">Sarah Chen</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Investigation Notes</label>
                  <Textarea
                    placeholder="Add notes about this case..."
                    className="min-h-[100px]"
                  />
                  <Button size="sm">Save Note</Button>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {[
                    { type: "Transaction Record", date: "Jan 15, 2025", size: "2.4 KB" },
                    { type: "KYC Document", date: "Jan 12, 2025", size: "1.8 MB" },
                    { type: "Communication Log", date: "Jan 14, 2025", size: "128 KB" },
                    { type: "Fraud Alert Report", date: "Jan 15, 2025", size: "456 KB" },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-muted-foreground">{doc.date} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-6">
                <div className="space-y-4">
                  {[
                    { event: "Case created", user: "System", time: "2 days ago" },
                    { event: "Assigned to Sarah Chen", user: "Admin", time: "2 days ago" },
                    { event: "Evidence collected", user: "Sarah Chen", time: "1 day ago" },
                    { event: "Note added", user: "Sarah Chen", time: "5 hours ago" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Clock className="h-4 w-4" />
                        </div>
                        {idx < 3 && <div className="w-px h-12 bg-border" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.user} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
