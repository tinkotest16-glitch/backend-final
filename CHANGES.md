# Changes to implement:

1. In kyc-management.tsx:

```typescript
// Add to imports
import { Lock, Unlock } from "lucide-react";

// Add state for lock dialog
const [showLockDialog, setShowLockDialog] = useState(false);
const [lockNote, setLockNote] = useState("");

// Add lock/unlock functions
const lockApplication = (appId: string) => {
  const app = applications.find((a) => a.id === appId);
  if (!app) return;

  try {
    const timestamp = new Date().toISOString();
    const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]');
    
    const updatedRequests = allRequests.map((req) => {
      if (req.id === appId) {
        return {
          ...req,
          status: 'locked',
          processedAt: timestamp,
          processedBy: 'Admin',
          notes: lockNote,
          lockedAt: timestamp,
          lockedBy: 'Admin',
          lockReason: lockNote
        };
      }
      return req;
    });
    
    localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
    setShowLockDialog(false);
    setLockNote("");
    
    toast({
      title: "KYC Locked",
      description: `KYC application has been locked.`,
    });
    
    // Refresh applications
    loadApplications();
  } catch (error) {
    console.error('Error locking KYC:', error);
    toast({
      title: "Error",
      description: "Failed to lock KYC application.",
      variant: "destructive",
    });
  }
};

const unlockApplication = (appId: string) => {
  const app = applications.find((a) => a.id === appId);
  if (!app) return;

  try {
    const timestamp = new Date().toISOString();
    const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]');
    
    const updatedRequests = allRequests.map((req) => {
      if (req.id === appId) {
        const { lockedAt, lockedBy, lockReason, ...rest } = req;
        return {
          ...rest,
          status: 'pending',
          processedAt: timestamp,
          processedBy: 'Admin',
          notes: 'KYC unlocked by admin'
        };
      }
      return req;
    });
    
    localStorage.setItem('kyc_requests', JSON.stringify(updatedRequests));
    
    toast({
      title: "KYC Unlocked",
      description: `KYC application has been unlocked.`,
    });
    
    // Refresh applications
    loadApplications();
  } catch (error) {
    console.error('Error unlocking KYC:', error);
    toast({
      title: "Error",
      description: "Failed to unlock KYC application.",
      variant: "destructive",
    });
  }
};

// Add lock/unlock buttons in the action buttons section:
{app.status === 'pending' && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setSelectedApp(app);
      setShowLockDialog(true);
    }}
    className="w-8 h-8 p-0 text-orange-500 border-orange-500 hover:bg-orange-50"
  >
    <Lock className="h-4 w-4" />
  </Button>
)}
{app.status === 'locked' && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => unlockApplication(app.id)}
    className="w-8 h-8 p-0 text-green-500 border-green-500 hover:bg-green-50"
  >
    <Unlock className="h-4 w-4" />
  </Button>
)}

// Add lock dialog:
<Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Lock KYC Application</DialogTitle>
      <DialogDescription>
        Please provide a reason for locking this application.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <Textarea
        placeholder="Enter lock reason..."
        value={lockNote}
        onChange={(e) => setLockNote(e.target.value)}
        rows={4}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setShowLockDialog(false)}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => selectedApp && lockApplication(selectedApp.id)}
          disabled={!lockNote.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Lock Application
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

2. In types:
```typescript
interface KYCRequest {
  // ... existing fields ...
  status: "pending" | "approved" | "rejected" | "locked";
  lockReason?: string;
  lockedAt?: string;
  lockedBy?: string;
}
```

3. Update getStatusBadge:
```typescript
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
```

Would you like me to implement these changes?