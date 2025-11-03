"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, AlertTriangle, FileText, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";

export default function AMLCases() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const casesData = await apiClient.getCases();
        setCases(casesData);
        if (casesData.length > 0) {
          const caseDetails = await apiClient.getCase(casesData[0].id);
          setSelectedCase(caseDetails);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AML Case Management</h1>
          <p className="text-muted-foreground">Track and resolve compliance investigations</p>
        </div>
        <Button 
          size="lg"
          onClick={async () => {
            try {
              // Get a flagged transaction
              const transactions = await apiClient.getTransactions(undefined, 50);
              const flaggedTx = transactions.find((tx: any) => tx.isFlagged);
              
              if (!flaggedTx) {
                alert("No flagged transactions found");
                return;
              }
              
              // Get or create alert first
              const alerts = await apiClient.getAlerts(flaggedTx.userId);
              let alert = alerts.find((a: any) => a.transactionId === flaggedTx.id);
              
              if (!alert) {
                // Create alert first
                alert = await apiClient.createAlert({
                  userId: flaggedTx.userId,
                  transactionId: flaggedTx.id,
                  type: 'fraud',
                  message: `High-risk transaction detected: $${flaggedTx.amount} from ${flaggedTx.merchant || 'Unknown'}`,
                  severity: (flaggedTx.fraudScore || 0) > 80 ? 'high' : 'medium',
                  status: 'open'
                });
              }
              
              // Create case with the alert ID
              const newCase = await apiClient.createCase({
                userId: flaggedTx.userId,
                alertId: alert.id,
                summary: `AML Case created for transaction ${flaggedTx.id}. Amount: $${flaggedTx.amount}, Fraud Score: ${flaggedTx.fraudScore || 0}%`,
              });
              
              // Refresh cases
              const casesData = await apiClient.getCases();
              setCases(casesData);
              if (casesData.length > 0) {
                const caseDetails = await apiClient.getCase(newCase.id);
                setSelectedCase(caseDetails);
              }
              
              alert("AML Case created successfully");
            } catch (error: any) {
              alert("Error creating AML case: " + error.message);
            }
          }}
        >
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
            {cases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No cases found</p>
            ) : (
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => {
                      apiClient.getCase(caseItem.id).then(setSelectedCase);
                    }}
                    className={`p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer border-l-4 ${
                      selectedCase?.id === caseItem.id ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{caseItem.id}</span>
                      <Badge
                        variant={
                          caseItem.status === "open" || caseItem.status === "assigned"
                            ? "destructive"
                            : caseItem.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {caseItem.status}
                      </Badge>
                    </div>
                    <p className="font-medium mb-1">{caseItem.user?.name || 'Unknown User'}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{caseItem.summary?.substring(0, 50) || 'No summary'}</span>
                      <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Case Details: {selectedCase?.id || 'No case selected'}
              </CardTitle>
              {selectedCase && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-success hover:bg-success/90"
                    onClick={async () => {
                      if (selectedCase) {
                        await apiClient.updateCase(selectedCase.id, { status: 'resolved' });
                        const updated = await apiClient.getCase(selectedCase.id);
                        setSelectedCase(updated);
                        const casesData = await apiClient.getCases();
                        setCases(casesData);
                      }
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Resolve Case
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (selectedCase) {
                        await apiClient.updateCase(selectedCase.id, { status: 'closed', notes: 'Marked as false positive' });
                        const updated = await apiClient.getCase(selectedCase.id);
                        setSelectedCase(updated);
                        const casesData = await apiClient.getCases();
                        setCases(casesData);
                      }
                    }}
                  >
                    Mark as False Positive
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedCase ? (
              <p className="text-center text-muted-foreground py-8">Select a case to view details</p>
            ) : (
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
                        {selectedCase.summary || 'No summary available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Customer Name</label>
                    <p className="font-medium">{selectedCase.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Case ID</label>
                    <p className="font-medium font-mono">{selectedCase.id}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Status</label>
                    <Badge variant={
                      selectedCase.status === "open" ? "destructive" :
                      selectedCase.status === "resolved" ? "default" : "secondary"
                    }>
                      {selectedCase.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Created</label>
                    <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Alert Type</label>
                    <Badge variant={selectedCase.alert?.severity === 'high' ? 'destructive' : 'default'}>
                      {selectedCase.alert?.type || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Assigned To</label>
                    <p className="font-medium">{selectedCase.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Investigation Notes</label>
                  <Textarea
                    placeholder="Add notes about this case..."
                    className="min-h-[100px]"
                    value={selectedCase.notes || ''}
                    onChange={(e) => {
                      setSelectedCase({ ...selectedCase, notes: e.target.value });
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={async () => {
                      if (selectedCase) {
                        await apiClient.updateCase(selectedCase.id, { notes: selectedCase.notes });
                        toast({ title: "Note saved", description: "Investigation notes updated" });
                      }
                    }}
                  >
                    Save Note
                  </Button>
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
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
