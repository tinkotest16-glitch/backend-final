import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, AlertCircle, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCDocument {
  type: string;
  file?: string;
  number?: string;
}

interface KYCRequest {
  id: string;
  userId: string;
  userName?: string;
  fullName: string;
  email?: string;
  status: "pending" | "approved" | "rejected" | "locked";
  documentType?: string;
  documentNumber?: string;
  documentFile?: string;
  selfieFile?: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

interface KYCApplication {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  status: "pending" | "approved" | "rejected" | "locked";
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
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const { toast } = useToast();

  const loadApplications = () => {
    try {
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      const formattedRequests: KYCApplication[] = allRequests.map((req) => ({
        id: req.id,
        userId: req.userId,
        fullName: req.userName || req.fullName,
        email: req.email,
        status: req.status,
        documents: [
          {
            type: req.documentType || 'Unknown',
            file: req.documentFile,
            number: req.documentNumber
          }
        ],
        idDetails: {
          number: req.documentNumber || 'N/A',
          type: req.documentType || 'N/A',
          expiryDate: 'N/A'
        },
        submittedAt: req.submittedAt,
        processedAt: req.processedAt,
        processedBy: req.processedBy,
        notes: req.notes
      }));
      setApplications(formattedRequests);
    } catch (error) {
      console.error('Error loading KYC applications:', error);
      setApplications([]);
    }
  };

  useEffect(() => {
    loadApplications();
    const interval = setInterval(loadApplications, 2000);
    return () => clearInterval(interval);
  }, []);

  const approveApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    try {
      const timestamp = new Date().toISOString();
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      
      const updatedRequests = allRequests.map((req) => {
        if (req.id === appId) {
          return {
            ...req,
            status: 'approved',
            processedAt: timestamp,
            processedBy: 'Admin'
          };
        }
        return req;
      });
      
      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
      loadApplications();

      toast({
        title: "KYC Approved",
        description: `KYC application for ${app.fullName} has been approved.`
      });
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast({
        title: "Error",
        description: "Failed to approve KYC application.",
        variant: "destructive"
      });
    }
  };

  const rejectApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    try {
      const timestamp = new Date().toISOString();
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      
      const updatedRequests = allRequests.map((req) => {
        if (req.id === appId) {
          return {
            ...req,
            status: 'rejected',
            processedAt: timestamp,
            processedBy: 'Admin',
            notes: rejectionNote
          };
        }
        return req;
      });
      
      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
      loadApplications();
      setShowRejectionDialog(false);
      setRejectionNote("");

      toast({
        title: "KYC Rejected",
        description: `KYC application for ${app.fullName} has been rejected.`
      });
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to reject KYC application.",
        variant: "destructive"
      });
    }
  };

  const lockApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    try {
      const timestamp = new Date().toISOString();
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      
      const updatedRequests = allRequests.map((req) => {
        if (req.id === appId) {
          return {
            ...req,
            status: 'locked',
            processedAt: timestamp,
            processedBy: 'Admin'
          };
        }
        return req;
      });
      
      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
      loadApplications();

      toast({
        title: "KYC Locked",
        description: `KYC has been locked for ${app.fullName}.`
      });
    } catch (error) {
      console.error('Error locking KYC:', error);
      toast({
        title: "Error",
        description: "Failed to lock KYC.",
        variant: "destructive"
      });
    }
  };

  const unlockApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    try {
      const timestamp = new Date().toISOString();
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      
      const updatedRequests = allRequests.map((req) => {
        if (req.id === appId) {
          return {
            ...req,
            status: 'pending',
            processedAt: timestamp,
            processedBy: 'Admin'
          };
        }
        return req;
      });
      
      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
      loadApplications();

      toast({
        title: "KYC Unlocked",
        description: `KYC has been unlocked for ${app.fullName}.`
      });
    } catch (error) {
      console.error('Error unlocking KYC:', error);
      toast({
        title: "Error",
        description: "Failed to unlock KYC.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'locked':
        return <Badge variant="default" className="bg-orange-500">Locked</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Applications</CardTitle>
        <CardDescription>Manage and review user verification requests</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.fullName}</TableCell>
                  <TableCell>{app.email || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {app.documents.map((doc, i) => (
                      <div key={i} className="text-sm text-gray-500">
                        {doc.type}: {doc.file ? '✓' : '✗'}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveApplication(app.id)}
                            className="text-green-500 border-green-500 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectionDialog(true);
                            }}
                            className="text-red-500 border-red-500 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => lockApplication(app.id)}
                            className="text-orange-500 border-orange-500 hover:bg-orange-50"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {app.status === 'locked' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unlockApplication(app.id)}
                          className="text-green-500 border-green-500 hover:bg-green-50"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No KYC applications to review
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Rejection Dialog */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject KYC Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedApp && rejectApplication(selectedApp.id)}
                  disabled={!rejectionNote.trim()}
                >
                  Reject Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Application Dialog */}
        <Dialog 
          open={Boolean(selectedApp) && !showRejectionDialog} 
          onOpenChange={() => setSelectedApp(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>KYC Application Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="text-gray-500">Name:</span> {selectedApp.fullName}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedApp.email || 'N/A'}</p>
                    <p><span className="text-gray-500">Status:</span> {selectedApp.status}</p>
                    <p><span className="text-gray-500">Submitted:</span> {new Date(selectedApp.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedApp.notes && (
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="mt-2 text-gray-600">{selectedApp.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
