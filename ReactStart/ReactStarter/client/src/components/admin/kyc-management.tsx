import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCDocument {
  type: string;
  file?: File;
  number?: string;
}

interface KYCApplication {
  id: string;
  userId: string;
  fullName: string;
  status: "pending" | "approved" | "rejected";
  documents: KYCDocument[];
  idDetails: {
    number: string;
    type: string;
    expiryDate: string;
  };
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export function KYCManagement() {
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const { toast } = useToast();

  // Load applications from localStorage
  useEffect(() => {
    const loadApplications = () => {
      const apps: KYCApplication[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("kyc_application_")) {
          try {
            const app = JSON.parse(localStorage.getItem(key) || "null");
            if (app) {
              apps.push(app);
            }
          } catch (e) {
            console.error("Error parsing KYC application:", e);
          }
        }
      }
      setApplications(apps);
    };

    loadApplications();
    window.addEventListener("storage", loadApplications);
    return () => window.removeEventListener("storage", loadApplications);
  }, []);

  const handleApprove = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const updatedApp = {
      ...app,
      status: "approved" as const,
      processedAt: new Date().toISOString(),
      notes: "Application approved"
    };

    localStorage.setItem(`kyc_application_${app.userId}`, JSON.stringify(updatedApp));
    localStorage.setItem(`kyc_status_${app.userId}`, "approved");

    setApplications(prev =>
      prev.map(a => a.id === appId ? updatedApp : a)
    );

    toast({
      title: "Application Approved",
      description: "The KYC verification has been approved successfully.",
    });
  };

  const handleReject = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app || !rejectionNote) return;

    const updatedApp = {
      ...app,
      status: "rejected" as const,
      processedAt: new Date().toISOString(),
      notes: rejectionNote
    };

    localStorage.setItem(`kyc_application_${app.userId}`, JSON.stringify(updatedApp));
    localStorage.setItem(`kyc_status_${app.userId}`, "rejected");

    setApplications(prev =>
      prev.map(a => a.id === appId ? updatedApp : a)
    );

    setSelectedApp(null);
    setRejectionNote("");

    toast({
      title: "Application Rejected",
      description: "The KYC verification has been rejected.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-600">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KYC Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-trading-secondary border-trading-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending KYC</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {applications.filter(app => app.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-trading-secondary border-trading-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {applications.filter(app => app.status === "approved").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-trading-secondary border-trading-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {applications.filter(app => app.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Applications Table */}
      <Card className="bg-trading-secondary border-trading-border">
        <CardHeader>
          <CardTitle className="text-xl text-white">KYC Applications</CardTitle>
          <CardDescription className="text-gray-400">
            Review and verify user identity documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-trading-accent">User</TableHead>
                  <TableHead className="text-trading-accent">Document Type</TableHead>
                  <TableHead className="text-trading-accent">Submitted</TableHead>
                  <TableHead className="text-trading-accent">Status</TableHead>
                  <TableHead className="text-trading-accent text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="text-white">{app.fullName}</TableCell>
                    <TableCell className="text-gray-400 capitalize">
                      {app.idDetails.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-trading-border hover:bg-trading-primary"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(app.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => setSelectedApp({ ...app, showReject: true })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No KYC applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="bg-trading-secondary border-trading-border text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              KYC Application Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review the submitted information and documents
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Full Name</h4>
                  <p className="mt-1 text-white">{selectedApp.fullName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Document Type</h4>
                  <p className="mt-1 text-white capitalize">
                    {selectedApp.idDetails.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Document Number</h4>
                  <p className="mt-1 text-white">{selectedApp.idDetails.number}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Expiry Date</h4>
                  <p className="mt-1 text-white">
                    {new Date(selectedApp.idDetails.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {'showReject' in selectedApp && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">Rejection Reason</h4>
                  <Textarea
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="bg-trading-primary border-trading-border text-white min-h-[100px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedApp(null);
                        setRejectionNote("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={!rejectionNote}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}