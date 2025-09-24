import { useState, useEffect } from "react";import { useState, useEffect } from "react";

import {import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

  Card,import { Button } from "@/components/ui/button";

  CardContent,import { Badge } from "@/components/ui/badge";

  CardDescription,import { ScrollArea } from "@/components/ui/scroll-area";

  CardHeader,import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

  CardTitle,import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

} from "@/components/ui/card";import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";import { CheckCircle, XCircle, Eye, AlertCircle, LockIcon, UnlockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";import { useToast } from "@/hooks/use-toast";

import { ScrollArea } from "@/components/ui/scroll-area";

import {interface KYCDocument {

  Table,  type: string;

  TableBody,  file?: string;

  TableCell,  number?: string;

  TableHead,}

  TableHeader,

  TableRow,interface KYCRequest {

} from "@/components/ui/table";  id: string;

import {  userId: string;

  Dialog,  userName?: string;

  DialogContent,  fullName: string;

  DialogHeader,  email?: string;

  DialogTitle,  status: "pending" | "approved" | "rejected" | "locked";

  DialogDescription,  documentType?: string;

  DialogFooter,  documentNumber?: string;

} from "@/components/ui/dialog";  documentFile?: string;

import { Textarea } from "@/components/ui/textarea";  selfieFile?: string;

import { CheckCircle, XCircle, Eye, LockIcon, UnlockIcon } from "lucide-react";  submittedAt: string;

import { useToast } from "@/hooks/use-toast";  processedAt?: string;

import { format } from "date-fns";  processedBy?: string;

  notes?: string;

interface KYCRequest {  lockedAt?: string;

  id: string;  lockedBy?: string;

  userId: string;  lockReason?: string;

  userName: string;}

  email?: string;

  status: "pending" | "approved" | "rejected" | "locked";interface KYCApplication {

  documentType: string;  id: string;

  documentNumber: string;  userId: string;

  documentFile?: string;  fullName: string;

  selfieFile?: string;  email?: string;

  submittedAt: string;  status: "pending" | "approved" | "rejected" | "locked";

  processedAt?: string;  documents: KYCDocument[];

  processedBy?: string;  idDetails: {

  notes?: string;    number: string;

  lockedAt?: string;    type: string;

  lockedBy?: string;    expiryDate: string;

  lockReason?: string;  };

}  lockedAt?: string;

  lockedBy?: string;

export function KYCManagement() {  lockReason?: string;

  const [requests, setRequests] = useState<KYCRequest[]>([]);  submittedAt: string;

  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);  processedAt?: string;

  const [showDialog, setShowDialog] = useState(false);  processedBy?: string;

  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'lock' | 'unlock' | null>(null);  notes?: string;

  const [actionNote, setActionNote] = useState("");}

  const { toast } = useToast();

export function KYCManagement() {

  // Load and refresh KYC requests  const [applications, setApplications] = useState<KYCApplication[]>([]);

  useEffect(() => {  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);

    loadRequests();  const [showDialog, setShowDialog] = useState(false);

    const interval = setInterval(loadRequests, 2000);  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'lock' | 'unlock' | null>(null);

    return () => clearInterval(interval);  const [actionNote, setActionNote] = useState("");

  }, []);  const { toast } = useToast();



  const loadRequests = () => {  const loadApplications = () => {

    try {    try {

      const savedRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];

      setRequests(savedRequests.sort((a, b) =>       

        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()      // Sort requests by submission date (newest first)

      ));      const sortedRequests = allRequests.sort((a, b) => 

    } catch (error) {        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()

      console.error('Error loading KYC requests:', error);      );

      toast({

        title: "Error",      const formattedRequests: KYCApplication[] = sortedRequests.map((req) => ({

        description: "Failed to load KYC requests",        id: req.id,

        variant: "destructive",        userId: req.userId,

      });        fullName: req.userName || req.fullName || 'Unknown User',

    }        email: req.email,

  };        status: req.status,

        documents: [

  const handleAction = (request: KYCRequest, mode: 'approve' | 'reject' | 'lock' | 'unlock') => {          {

    setSelectedRequest(request);            type: req.documentType || 'Unknown',

    setDialogMode(mode);            file: req.documentFile,

    setActionNote("");            number: req.documentNumber

    setShowDialog(true);          }

  };        ],

        idDetails: {

  const handleConfirmAction = async () => {          number: req.documentNumber || 'N/A',

    if (!selectedRequest || !dialogMode) return;          type: req.documentType || 'N/A',

          expiryDate: 'N/A'

    try {        },

      const timestamp = new Date().toISOString();        submittedAt: req.submittedAt,

      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];        processedAt: req.processedAt,

              processedBy: req.processedBy,

      // Find and update the specific request        notes: req.notes

      const updatedRequests = allRequests.map((req) => {      }));

        if (req.id === selectedRequest.id) {      

          const baseUpdate = {      setApplications(formattedRequests);

            ...req,      

            processedAt: timestamp,      // Trigger a localStorage event for other components to update

            processedBy: 'Admin',      window.dispatchEvent(new Event('storage'));

            notes: actionNote || undefined    } catch (error) {

          };      console.error('Error loading KYC applications:', error);

      setApplications([]);

          switch (dialogMode) {    }

            case 'approve':  };

              return {

                ...baseUpdate,  useEffect(() => {

                status: 'approved' as const,    loadApplications();

                lockedAt: undefined,    

                lockedBy: undefined,    // Listen for changes in localStorage

                lockReason: undefined    const handleStorageChange = (e: StorageEvent) => {

              };      if (e.key === 'kyc_requests') {

            case 'reject':        loadApplications();

              return {      }

                ...baseUpdate,    };

                status: 'rejected' as const,    

                lockedAt: undefined,    window.addEventListener('storage', handleStorageChange);

                lockedBy: undefined,    const interval = setInterval(loadApplications, 2000); // Refresh every 2 seconds

                lockReason: undefined    

              };    return () => {

            case 'lock':      window.removeEventListener('storage', handleStorageChange);

              return {      clearInterval(interval);

                ...baseUpdate,    };

                status: 'locked' as const,  }, []);

                lockedAt: timestamp,

                lockedBy: 'Admin',    const handleAction = (app: KYCApplication, mode: 'approve' | 'reject' | 'lock' | 'unlock') => {

                lockReason: actionNote    setSelectedApp(app);

              };    setDialogMode(mode);

            case 'unlock':    setActionNote("");

              return {    setShowDialog(true);

                ...baseUpdate,  };

                status: 'pending' as const,

                lockedAt: undefined,  const handleConfirmAction = async () => {

                lockedBy: undefined,    if (!selectedApp || !dialogMode) return;

                lockReason: undefined

              };    try {

            default:      const timestamp = new Date().toISOString();

              return req;      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];

          }      

        }      // Find and update the specific request

        return req;      const updatedRequests = allRequests.map((req) => {

      });        if (req.id === selectedApp.id) {

          const baseUpdate = {

      // Update localStorage            ...req,

      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));            processedAt: timestamp,

            processedBy: 'Admin',

      // Update UI            notes: actionNote || undefined

      setRequests(updatedRequests);          };

      setShowDialog(false);

      setSelectedRequest(null);          switch (dialogMode) {

      setActionNote("");            case 'approve':

      setDialogMode(null);              return { ...baseUpdate, status: 'approved' as const };

            case 'reject':

      // Show success message              return { ...baseUpdate, status: 'rejected' as const };

      toast({            case 'lock':

        title: `KYC ${dialogMode.charAt(0).toUpperCase() + dialogMode.slice(1)}ed`,              return {

        description: `Successfully ${dialogMode}ed KYC request for ${selectedRequest.userName}`,                ...baseUpdate,

      });                status: 'locked' as const,

                lockedAt: timestamp,

      // Trigger storage event for other components                lockedBy: 'Admin',

      window.dispatchEvent(new Event('storage'));                lockReason: actionNote

    } catch (error) {              };

      console.error(`Error ${dialogMode}ing KYC request:`, error);            case 'unlock':

      toast({              return {

        title: "Error",                ...baseUpdate,

        description: `Failed to ${dialogMode} KYC request`,                status: 'pending' as const,

        variant: "destructive",                lockedAt: undefined,

      });                lockedBy: undefined,

    }                lockReason: undefined

  };              };

            default:

  const getStatusBadge = (status: string) => {              return req;

    switch (status) {          }

      case 'approved':        }

        return <Badge variant="default" className="bg-green-500">Approved</Badge>;        return req;

      case 'rejected':      });

        return <Badge variant="destructive">Rejected</Badge>;

      case 'locked':      // Update localStorage

        return <Badge variant="default" className="bg-orange-500">Locked</Badge>;      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));

      default:

        return <Badge variant="secondary">Pending</Badge>;  const rejectApplication = (appId: string) => {

    }    const app = applications.find((a) => a.id === appId);

  };    if (!app) return;



  const getDialogTitle = () => {    try {

    switch (dialogMode) {      const timestamp = new Date().toISOString();

      case 'approve': return 'Approve KYC Request';

      case 'reject': return 'Reject KYC Request';      // Update in localStorage - single source of truth

      case 'lock': return 'Lock KYC Request';      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];

      case 'unlock': return 'Unlock KYC Request';      

      default: return '';      // Find and update the specific request

    }      const updatedRequests = allRequests.map((req) => {

  };        if (req.id === appId) {

          // Create a properly formatted request update

  const getDialogDescription = () => {          return {

    switch (dialogMode) {            ...req,

      case 'approve': return 'Are you sure you want to approve this KYC request?';            status: 'rejected' as const,

      case 'reject': return 'Please provide a reason for rejecting this request.';            processedAt: timestamp,

      case 'lock': return 'Please provide a reason for locking this KYC request.';            processedBy: 'Admin',

      case 'unlock': return 'Are you sure you want to unlock this KYC request?';            notes: rejectionNote

      default: return '';          };

    }        }

  };        return req;

      });

  return (      

    <Card className="w-full">      // Atomic update of requests

      <CardHeader>      localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));

        <CardTitle>KYC Management</CardTitle>

        <CardDescription>Review and process KYC verification requests</CardDescription>      // Update local state

      </CardHeader>      const updatedApp: KYCApplication = {

      <CardContent>        ...app,

        <ScrollArea className="h-[600px] w-full rounded-md border">        status: 'rejected',

          <Table>        processedAt: timestamp,

            <TableHeader>        processedBy: 'Admin',

              <TableRow>        notes: rejectionNote

                <TableHead>User</TableHead>      };

                <TableHead>ID Type</TableHead>

                <TableHead>Submitted</TableHead>      // Update UI

                <TableHead>Status</TableHead>      setApplications((prev) =>

                <TableHead className="text-right">Actions</TableHead>        prev.map((a) => a.id === appId ? updatedApp : a)

              </TableRow>      );

            </TableHeader>      setShowRejectionDialog(false);

            <TableBody>      setRejectionNote("");

              {requests.map((request) => (

                <TableRow key={request.id}>      toast({

                  <TableCell>        title: "KYC Rejected",

                    <div>        description: `KYC application for ${app.fullName} has been rejected.`,

                      <p className="font-medium">{request.userName}</p>      });

                      <p className="text-sm text-gray-500">{request.email}</p>    } catch (error) {

                      <p className="text-xs text-gray-400">ID: {request.userId}</p>      console.error('Error rejecting KYC:', error);

                    </div>      toast({

                  </TableCell>        title: "Error",

                  <TableCell>{request.documentType}</TableCell>        description: "Failed to reject KYC application.",

                  <TableCell>{format(new Date(request.submittedAt), 'PPp')}</TableCell>        variant: "destructive",

                  <TableCell>{getStatusBadge(request.status)}</TableCell>      });

                  <TableCell className="text-right">    }

                    <div className="flex justify-end gap-2">  };

                      {request.status === 'pending' && (

                        <>  return (

                          <Button    <Card>

                            onClick={() => handleAction(request, 'approve')}      <CardHeader>

                            variant="default"        <CardTitle>KYC Applications</CardTitle>

                            size="sm"        <CardDescription>Manage and review user verification requests</CardDescription>

                            className="bg-green-500 hover:bg-green-600"      </CardHeader>

                          >      <CardContent>

                            <CheckCircle className="h-4 w-4" />        <ScrollArea className="h-[600px]">

                          </Button>          <Table>

                          <Button            <TableHeader>

                            onClick={() => handleAction(request, 'reject')}              <TableRow>

                            variant="destructive"                <TableHead>Name</TableHead>

                            size="sm"                <TableHead>Email</TableHead>

                          >                <TableHead>Status</TableHead>

                            <XCircle className="h-4 w-4" />                <TableHead>Submitted</TableHead>

                          </Button>                <TableHead>Documents</TableHead>

                          <Button                <TableHead className="text-right">Actions</TableHead>

                            onClick={() => handleAction(request, 'lock')}              </TableRow>

                            variant="outline"            </TableHeader>

                            size="sm"            <TableBody>

                            className="border-orange-500 text-orange-500 hover:bg-orange-50"              {applications.map((app) => (

                          >                <TableRow key={app.id}>

                            <LockIcon className="h-4 w-4" />                  <TableCell className="font-medium">{app.fullName}</TableCell>

                          </Button>                  <TableCell>{app.email || 'N/A'}</TableCell>

                        </>                  <TableCell>

                      )}                    {app.status === 'pending' && (

                      {request.status === 'locked' && (                      <Badge variant="outline" className="bg-yellow-600/20 text-yellow-500 border-yellow-500">

                        <Button                        Pending

                          onClick={() => handleAction(request, 'unlock')}                      </Badge>

                          variant="outline"                    )}

                          size="sm"                    {app.status === 'approved' && (

                          className="border-green-500 text-green-500 hover:bg-green-50"                      <Badge variant="outline" className="bg-green-600/20 text-green-500 border-green-500">

                        >                        Approved

                          <UnlockIcon className="h-4 w-4" />                      </Badge>

                        </Button>                    )}

                      )}                    {app.status === 'rejected' && (

                      <Button                      <Badge variant="destructive">

                        variant="outline"                        Rejected

                        size="sm"                      </Badge>

                        onClick={() => setSelectedRequest(request)}                    )}

                      >                  </TableCell>

                        <Eye className="h-4 w-4" />                  <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>

                      </Button>                  <TableCell>

                    </div>                    {app.documents.map((doc, i) => (

                  </TableCell>                      <div key={i} className="text-sm text-gray-500">

                </TableRow>                        {doc.type}: {doc.file ? '✓' : '✗'}

              ))}                      </div>

              {requests.length === 0 && (                    ))}

                <TableRow>                  </TableCell>

                  <TableCell colSpan={5} className="text-center text-gray-500">                  <TableCell className="text-right">

                    No KYC requests found                    {app.status === 'pending' && (

                  </TableCell>                      <div className="flex justify-end space-x-2">

                </TableRow>                        <Button

              )}                          variant="outline"

            </TableBody>                          size="sm"

          </Table>                          onClick={() => setSelectedApp(app)}

        </ScrollArea>                          className="w-8 h-8 p-0"

                        >

        {/* Action Dialog */}                          <Eye className="h-4 w-4" />

        <Dialog open={showDialog} onOpenChange={setShowDialog}>                        </Button>

          <DialogContent>                        <Button

            <DialogHeader>                          variant="outline"

              <DialogTitle>{getDialogTitle()}</DialogTitle>                          size="sm"

              <DialogDescription>{getDialogDescription()}</DialogDescription>                          onClick={() => approveApplication(app.id)}

            </DialogHeader>                          className="w-8 h-8 p-0 text-green-500 border-green-500 hover:bg-green-50"

                        >

            <div className="space-y-4 py-4">                          <CheckCircle className="h-4 w-4" />

              {selectedRequest && (                        </Button>

                <div className="space-y-2">                        <Button

                  <p className="font-medium">{selectedRequest.userName}</p>                          variant="outline"

                  <p className="text-sm text-gray-500">                          size="sm"

                    Document Type: {selectedRequest.documentType}                          onClick={() => {

                  </p>                            setSelectedApp(app);

                  <p className="text-sm text-gray-500">                            setShowRejectionDialog(true);

                    Document Number: {selectedRequest.documentNumber}                          }}

                  </p>                          className="w-8 h-8 p-0 text-red-500 border-red-500 hover:bg-red-50"

                </div>                        >

              )}                          <XCircle className="h-4 w-4" />

                        </Button>

              {(dialogMode === 'reject' || dialogMode === 'lock') && (                      </div>

                <div className="space-y-2">                    )}

                  <label                  </TableCell>

                    htmlFor="note"                </TableRow>

                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"              ))}

                  >              {applications.length === 0 && (

                    {dialogMode === 'reject' ? 'Rejection Reason' : 'Lock Reason'}                <TableRow>

                  </label>                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">

                  <Textarea                    No KYC applications to review

                    id="note"                  </TableCell>

                    placeholder={`Enter ${dialogMode} reason...`}                </TableRow>

                    value={actionNote}              )}

                    onChange={(e) => setActionNote(e.target.value)}            </TableBody>

                  />          </Table>

                </div>        </ScrollArea>

              )}

            </div>        {/* Rejection Dialog */}

        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>

            <DialogFooter>          <DialogContent>

              <Button            <DialogHeader>

                type="button"              <DialogTitle>Reject KYC Application</DialogTitle>

                variant="outline"              <DialogDescription>

                onClick={() => setShowDialog(false)}                Please provide a reason for rejecting this application.

              >              </DialogDescription>

                Cancel            </DialogHeader>

              </Button>            <div className="space-y-4 py-4">

              <Button              <Textarea

                type="button"                placeholder="Enter rejection reason..."

                variant={dialogMode === 'reject' || dialogMode === 'lock' ? 'destructive' : 'default'}                value={rejectionNote}

                onClick={handleConfirmAction}                onChange={(e) => setRejectionNote(e.target.value)}

                disabled={(dialogMode === 'reject' || dialogMode === 'lock') && !actionNote.trim()}                rows={4}

              >              />

                Confirm {dialogMode?.charAt(0).toUpperCase() + dialogMode?.slice(1)}              <div className="flex justify-end space-x-2">

              </Button>                <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>

            </DialogFooter>                  Cancel

          </DialogContent>                </Button>

        </Dialog>                <Button

                  variant="destructive"

        {/* View Details Dialog */}                  onClick={() => selectedApp && rejectApplication(selectedApp.id)}

        <Dialog                   disabled={!rejectionNote.trim()}

          open={Boolean(selectedRequest) && !showDialog}                 >

          onOpenChange={() => setSelectedRequest(null)}                  Reject Application

        >                </Button>

          <DialogContent className="max-w-md">              </div>

            <DialogHeader>            </div>

              <DialogTitle>KYC Request Details</DialogTitle>          </DialogContent>

            </DialogHeader>        </Dialog>

            {selectedRequest && (

              <div className="space-y-4">        {/* View Application Dialog */}

                <div>        <Dialog open={Boolean(selectedApp) && !showRejectionDialog} onOpenChange={() => setSelectedApp(null)}>

                  <h3 className="font-medium">Personal Information</h3>          <DialogContent>

                  <div className="mt-2 space-y-2">            <DialogHeader>

                    <p><span className="text-gray-500">Name:</span> {selectedRequest.userName}</p>              <DialogTitle>KYC Application Details</DialogTitle>

                    <p><span className="text-gray-500">Email:</span> {selectedRequest.email || 'N/A'}</p>            </DialogHeader>

                    <p><span className="text-gray-500">Status:</span> {selectedRequest.status}</p>            {selectedApp && (

                    <p><span className="text-gray-500">Submitted:</span> {format(new Date(selectedRequest.submittedAt), 'PPp')}</p>              <div className="space-y-4">

                  </div>                <div>

                </div>                  <h3 className="font-medium">Personal Information</h3>

                <div>                  <div className="mt-2 space-y-2">

                  <h3 className="font-medium">Document Details</h3>                    <p><span className="text-gray-500">Name:</span> {selectedApp.fullName}</p>

                  <div className="mt-2 space-y-2">                    <p><span className="text-gray-500">Email:</span> {selectedApp.email || 'N/A'}</p>

                    <p><span className="text-gray-500">Type:</span> {selectedRequest.documentType}</p>                    <p><span className="text-gray-500">Status:</span> {selectedApp.status}</p>

                    <p><span className="text-gray-500">Number:</span> {selectedRequest.documentNumber}</p>                    <p><span className="text-gray-500">Submitted:</span> {new Date(selectedApp.submittedAt).toLocaleString()}</p>

                  </div>                  </div>

                </div>                </div>

                {selectedRequest.processedAt && (                <div>

                  <div>                  <h3 className="font-medium">ID Details</h3>

                    <h3 className="font-medium">Processing Details</h3>                  <div className="mt-2 space-y-2">

                    <div className="mt-2 space-y-2">                    <p><span className="text-gray-500">Type:</span> {selectedApp.idDetails.type}</p>

                      <p><span className="text-gray-500">Processed:</span> {format(new Date(selectedRequest.processedAt), 'PPp')}</p>                    <p><span className="text-gray-500">Number:</span> {selectedApp.idDetails.number}</p>

                      <p><span className="text-gray-500">By:</span> {selectedRequest.processedBy}</p>                  </div>

                    </div>                </div>

                  </div>                {selectedApp.notes && (

                )}                  <div>

                {selectedRequest.status === 'locked' && selectedRequest.lockReason && (                    <h3 className="font-medium">Notes</h3>

                  <div>                    <p className="mt-2 text-gray-600">{selectedApp.notes}</p>

                    <h3 className="font-medium">Lock Information</h3>                  </div>

                    <div className="mt-2 space-y-2">                )}

                      <p><span className="text-gray-500">Locked:</span> {selectedRequest.lockedAt && format(new Date(selectedRequest.lockedAt), 'PPp')}</p>              </div>

                      <p><span className="text-gray-500">Reason:</span> {selectedRequest.lockReason}</p>            )}

                    </div>          </DialogContent>

                  </div>        </Dialog>

                )}      </CardContent>

                {selectedRequest.notes && (    </Card>

                  <div>  );

                    <h3 className="font-medium">Notes</h3>}
                    <p className="mt-2 text-gray-600">{selectedRequest.notes}</p>
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