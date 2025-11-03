"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, XCircle, Clock, User, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";

export default function KYC() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [verificationScore, setVerificationScore] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const selfieFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        setLoading(true);
        const usersData = await apiClient.getUsers();
        setUsers(usersData);
        if (usersData.length > 0 && !selectedUser) {
          setSelectedUser(usersData.find((u: any) => u.kycStatus === 'pending') || usersData[0]);
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingUsers = users.filter((u: any) => u.kycStatus === 'pending');
  const approvedUsers = users.filter((u: any) => u.kycStatus === 'approved');
  const rejectedUsers = users.filter((u: any) => u.kycStatus === 'rejected');

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
            <input
              ref={idFileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIdFile(file);
                  toast({
                    title: "ID Document uploaded",
                    description: file.name,
                  });
                }
              }}
            />
            <input
              ref={selfieFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelfieFile(file);
                  toast({
                    title: "Selfie uploaded",
                    description: file.name,
                  });
                }
              }}
            />
            <div
              onClick={() => idFileInputRef.current?.click()}
              className={`border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer ${
                idFile ? "border-primary bg-primary/5" : ""
              }`}
            >
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">
                {idFile ? idFile.name : "Upload ID Document"}
              </p>
              <p className="text-sm text-muted-foreground">
                {idFile ? "Click to change" : "Drag & drop or click to upload"}
              </p>
            </div>

            <div
              onClick={() => selfieFileInputRef.current?.click()}
              className={`border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer ${
                selfieFile ? "border-primary bg-primary/5" : ""
              }`}
            >
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">
                {selfieFile ? selfieFile.name : "Upload Selfie"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selfieFile ? "Click to change" : "For liveness verification"}
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={async () => {
                if (!selectedUser) {
                  toast({
                    title: "No user selected",
                    description: "Please select a user first",
                    variant: "destructive",
                  });
                  return;
                }
                if (!idFile || !selfieFile) {
                  toast({
                    title: "Files missing",
                    description: "Please upload both ID and selfie",
                    variant: "destructive",
                  });
                  return;
                }

                setIsVerifying(true);
                try {
                  const formData = new FormData();
                  formData.append("documentImage", idFile);
                  formData.append("faceImage", selfieFile);
                  formData.append("documentType", "id");
                  formData.append("documentNumber", "DOC123456");
                  formData.append("verified", "true");

                  const result = await apiClient.uploadKYC(selectedUser.id, formData);
                  setVerificationScore(result.kycResult?.score || 0);
                  
                  // Refresh users
                  const usersData = await apiClient.getUsers();
                  setUsers(usersData);
                  
                  toast({
                    title: "Verification complete",
                    description: `Score: ${result.kycResult?.score || 0}%`,
                  });
                } catch (error: any) {
                  toast({
                    title: "Verification failed",
                    description: error.message,
                    variant: "destructive",
                  });
                } finally {
                  setIsVerifying(false);
                }
              }}
              disabled={isVerifying || !idFile || !selfieFile}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Start Verification"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`border rounded-lg p-6 ${
              approvedUsers.length > 0 ? 'bg-success/10 border-success/20' :
              pendingUsers.length > 0 ? 'bg-warning/10 border-warning/20' :
              'bg-secondary/10 border-secondary/20'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {approvedUsers.length > 0 ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-semibold text-lg">Verification Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {approvedUsers.length} approved • {pendingUsers.length} pending
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 text-warning" />
                    <div>
                      <p className="font-semibold text-lg">Pending Verification</p>
                      <p className="text-sm text-muted-foreground">
                        {pendingUsers.length} users awaiting verification
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Progress value={(approvedUsers.length / users.length) * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Total Users</label>
                <p className="font-medium">{users.length}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Approved</label>
                <p className="font-medium">{approvedUsers.length}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Pending</label>
                <p className="font-medium">{pendingUsers.length}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Rejected</label>
                <p className="font-medium">{rejectedUsers.length}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Approval Rate</label>
                <p className="font-medium">
                  {users.length > 0 ? ((approvedUsers.length / users.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">KYC Status</label>
                <Badge className={
                  approvedUsers.length > 0 ? 'bg-success' : 'bg-warning'
                }>
                  {approvedUsers.length > 0 ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={async () => {
                  if (!selectedUser) {
                    toast({
                      title: "No user selected",
                      description: "Please select a user first",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    await apiClient.updateKYCStatus(selectedUser.id, "approved");
                    toast({
                      title: "User approved",
                      description: `${selectedUser.name} has been approved`,
                    });
                    const usersData = await apiClient.getUsers();
                    setUsers(usersData);
                    setSelectedUser(usersData.find((u: any) => u.id === selectedUser.id));
                  } catch (error: any) {
                    toast({
                      title: "Approval failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Approve Verification
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                onClick={async () => {
                  if (!selectedUser) {
                    toast({
                      title: "No user selected",
                      description: "Please select a user first",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    await apiClient.updateKYCStatus(selectedUser.id, "pending");
                    toast({
                      title: "Info requested",
                      description: `${selectedUser.name} needs to provide additional information`,
                    });
                    const usersData = await apiClient.getUsers();
                    setUsers(usersData);
                    setSelectedUser(usersData.find((u: any) => u.id === selectedUser.id));
                  } catch (error: any) {
                    toast({
                      title: "Request failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
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
              {users.slice(0, 10).map((user: any) => {
                const timeAgo = (() => {
                  const now = new Date();
                  const created = new Date(user.createdAt);
                  const diffMs = now.getTime() - created.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins} min ago`;
                  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  return created.toLocaleDateString();
                })();
                
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? "bg-primary/10 border-2 border-primary" : "bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {user.kycStatus === "approved" && (
                        <Badge className="bg-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {user.kycStatus === "pending" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {user.kycStatus === "rejected" && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">{timeAgo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
