import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from "uuid";

const kycFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  documentType: z.string().min(1, { message: "Please select a document type." }),
  documentNumber: z.string().min(1, { message: "Document number is required." }),
  documentFile: z.string().optional(),
  selfieFile: z.string().optional(),
});

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

export function KYCForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [existingKYC, setExistingKYC] = useState<KYCRequest | null>(null);

  const form = useForm<z.infer<typeof kycFormSchema>>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: "",
      documentType: "",
      documentNumber: "",
      documentFile: "",
      selfieFile: "",
    },
  });

  // Load existing KYC request for the current user
  useEffect(() => {
    if (!user?.id) return;
    
    try {
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      const userKYC = allRequests.find(req => req.userId === user.id);
      if (userKYC) {
        setExistingKYC(userKYC);
      }
    } catch (error) {
      console.error('Error loading KYC request:', error);
    }
  }, [user?.id]);

  const onSubmit = async (values: z.infer<typeof kycFormSchema>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit KYC.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRequest: KYCRequest = {
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        fullName: values.fullName,
        email: user.email,
        status: "pending",
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        documentFile: values.documentFile,
        selfieFile: values.selfieFile,
        submittedAt: new Date().toISOString(),
      };

      // Load existing requests and add/update the current user's request
      const allRequests = JSON.parse(localStorage.getItem('kyc_requests') || '[]') as KYCRequest[];
      const existingIndex = allRequests.findIndex(req => req.userId === user.id);
      
      if (existingIndex >= 0) {
        allRequests[existingIndex] = newRequest;
      } else {
        allRequests.push(newRequest);
      }

      localStorage.setItem('kyc_requests', JSON.stringify(allRequests));
      setExistingKYC(newRequest);

      toast({
        title: "KYC Submitted",
        description: "Your KYC application is under review.",
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Error",
        description: "Failed to submit KYC application.",
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
      case 'locked':
        return <Badge variant="default" className="bg-orange-500">Locked</Badge>;
      default:
        return <Badge variant="secondary">Under Review</Badge>;
    }
  };

  // If there's a locked KYC request, show locked message
  if (existingKYC?.status === "locked") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Your account verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              {getStatusBadge("locked")}
            </div>
            <p className="text-sm text-muted-foreground">
              Your KYC verification is currently locked. Please contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an existing KYC request, show the status
  if (existingKYC) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Your account verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              {getStatusBadge(existingKYC.status)}
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {existingKYC.fullName}</p>
              <p><span className="font-medium">Document Type:</span> {existingKYC.documentType}</p>
              <p><span className="font-medium">Submitted:</span> {new Date(existingKYC.submittedAt).toLocaleString()}</p>
            </div>
            {existingKYC.notes && (
              <div className="mt-4">
                <p className="font-medium">Notes:</p>
                <p className="text-sm text-muted-foreground">{existingKYC.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show the KYC form if no existing request
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>Submit your verification documents</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Document</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*,.pdf" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // For demo, we'll just store the file name
                        field.onChange(file.name);
                      }
                    }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="selfieFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Selfie</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // For demo, we'll just store the file name
                        field.onChange(file.name);
                      }
                    }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <div className="flex items-center space-x-2">
                <Button type="submit">Submit Verification</Button>
                <Button type="button" variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Back to Dashboard
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
