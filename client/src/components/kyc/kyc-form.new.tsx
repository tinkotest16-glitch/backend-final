import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface KYCFormProps {
  userId: string;
  userName?: string;
  userEmail?: string;
}

interface KYCStatus {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  lastUpdated: string;
}

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

export function KYCForm({ userId, userName, userEmail }: KYCFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // Load KYC status for this specific user
  useEffect(() => {
    if (!userId) return;

    try {
      // Get all KYC requests
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      // Find this user's most recent request
      const userRequest = allRequests
        .filter(req => req.userId === userId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

      if (userRequest) {
        setStatus(userRequest.status);
      } else {
        setStatus(null);
        // Clear any orphaned status
        localStorage.removeItem(`kyc_status_${userId}`);
      }
    } catch (error) {
      console.error('Error loading KYC status:', error);
      setStatus(null);
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert files to base64 for storage
      const idFileBase64 = idFile ? await fileToBase64(idFile) : null;
      const selfieBase64 = selfieFile ? await fileToBase64(selfieFile) : null;

      const kycRequest: KYCRequest = {
        id: crypto.randomUUID(),
        userId,
        userName: userName || 'Unknown User',
        email: userEmail,
        status: 'pending',
        documentType: idType,
        documentNumber: idNumber,
        documentFile: idFileBase64 || undefined,
        selfieFile: selfieBase64 || undefined,
        submittedAt: new Date().toISOString(),
      };

      // Get existing requests and add the new one
      const existingRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      existingRequests.push(kycRequest);
      
      // Save to localStorage
      localStorage.setItem('kyc_requests', JSON.stringify(existingRequests));
      
      setStatus('pending');
      toast({
        title: "KYC Submitted",
        description: "Your verification request has been submitted and is pending review.",
      });

      // Clear form
      setIdType("");
      setIdNumber("");
      setIdFile(null);
      setSelfieFile(null);
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to submit KYC request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (status === 'approved') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Status</CardTitle>
          <CardDescription>Your account has been verified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-green-50 text-green-700 rounded-md p-4">
            <div>
              <p className="font-semibold">Your KYC verification has been approved.</p>
              <p className="text-sm mt-1">You have full access to all platform features.</p>
              <p className="text-xs mt-2">User ID: {userId}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'rejected') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Status</CardTitle>
          <CardDescription>Your verification was not approved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-red-50 text-red-700 rounded-md p-4">
            <div>
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="font-semibold">Verification Rejected</p>
              </div>
              <p className="text-sm">Please submit a new application with the correct information.</p>
              <p className="text-xs mt-2">User ID: {userId}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => setStatus(null)} variant="default">
            Submit New Application
          </Button>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'pending') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Status</CardTitle>
          <CardDescription>Your verification is being reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-yellow-50 text-yellow-700 rounded-md p-4">
            <div>
              <p className="font-semibold">Your KYC verification is under review.</p>
              <p className="text-sm mt-1">We will notify you once the review is complete.</p>
              <p className="text-xs mt-2">User ID: {userId}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto relative">
      <div className="absolute top-4 right-4">
        <Button onClick={() => setLocation("/dashboard")} variant="outline" size="sm">
          Back to Dashboard
        </Button>
      </div>
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Please provide your identification details for account verification
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
            <p className="text-sm mb-2">Submitting as:</p>
            <p className="font-medium">{userName || 'Unknown User'}</p>
            <p className="text-xs mt-1">User ID: {userId}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="idType">ID Type</Label>
              <Select
                value={idType}
                onValueChange={setIdType}
                required
              >
                <SelectTrigger id="idType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID number"
                required
              />
            </div>

            <div>
              <Label htmlFor="idFile">ID Document (Optional)</Label>
              <Input
                id="idFile"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a clear photo or scan of your ID document
              </p>
            </div>

            <div>
              <Label htmlFor="selfie">Selfie with ID (Optional)</Label>
              <Input
                id="selfie"
                type="file"
                accept="image/*"
                onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a photo of yourself holding your ID
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !idType || !idNumber}>
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}