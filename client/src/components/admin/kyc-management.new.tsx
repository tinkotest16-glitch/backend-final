import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  documentNumber: string;
  documentFile?: string;
  selfieFile?: string;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export function KYCManagement() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      setRequests(savedRequests.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading KYC requests:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC requests",
        variant: "destructive",
      });
    }
  };

  const handleReview = (request: KYCRequest, mode: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogMode(mode);
    setShowDialog(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest || !dialogMode) return;

    try {
      // Update the request in storage
      const updatedRequests = requests.map(req => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: dialogMode === 'approve' ? 'approved' : 'rejected',
            notes: reviewNotes,
            processedAt: new Date().toISOString(),
            processedBy: 'Admin', // Could be replaced with actual admin user
          };
        }
        return req;
      });

      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));

      toast({
        title: dialogMode === 'approve' ? "KYC Approved" : "KYC Rejected",
        description: `Successfully ${dialogMode}d KYC request for ${selectedRequest.userName}`,
      });

      setRequests(updatedRequests);
      setShowDialog(false);
      setSelectedRequest(null);
      setReviewNotes("");
      setDialogMode(null);
    } catch (error) {
      console.error('Error updating KYC request:', error);
      toast({
        title: "Error",
        description: `Failed to ${dialogMode} KYC request`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>KYC Management</CardTitle>
        <CardDescription>Review and process KYC verification requests</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>ID Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-sm text-gray-500">{request.email}</p>
                      <p className="text-xs text-gray-400">ID: {request.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.documentType}</TableCell>
                  <TableCell>
                    {format(new Date(request.submittedAt), 'PPp')}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleReview(request, 'approve')}
                          variant="default"
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(request, 'reject')}
                          variant="destructive"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <div className="text-sm text-gray-500">
                        Processed {request.processedAt && format(new Date(request.processedAt), 'PPp')}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No KYC requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'approve' ? 'Approve' : 'Reject'} KYC Request
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'approve'
                  ? 'Are you sure you want to approve this KYC request?'
                  : 'Are you sure you want to reject this KYC request?'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="space-y-2">
                  <p className="font-medium">{selectedRequest.userName}</p>
                  <p className="text-sm text-gray-500">
                    Document Type: {selectedRequest.documentType}
                  </p>
                  <p className="text-sm text-gray-500">
                    Document Number: {selectedRequest.documentNumber}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Review Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={dialogMode === 'approve' ? 'default' : 'destructive'}
                onClick={handleConfirmReview}
              >
                Confirm {dialogMode === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
