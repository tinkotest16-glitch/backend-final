import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { KYCApplication } from "@/types/kyc";

interface KYCContextType {
  kycStatus: "none" | "pending" | "approved" | "rejected";
  application: KYCApplication | null;
  submitApplication: (files: { id: File; selfie: File }, fullName: string) => void;
  approveApplication: (applicationId: string, notes?: string) => void;
  rejectApplication: (applicationId: string, notes: string) => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export function KYCProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [application, setApplication] = useState<KYCApplication | null>(null);

  // Load KYC status from localStorage (in a real app, this would be from your backend)
  useEffect(() => {
    if (user?.id) {
      const savedStatus = localStorage.getItem(`kyc_status_${user.id}`);
      if (savedStatus) {
        setKycStatus(savedStatus as typeof kycStatus);
      }
    }
  }, [user]);

  const submitApplication = (files: { id: File; selfie: File }, fullName: string) => {
    if (!user) return;

    const newApplication: KYCApplication = {
      id: crypto.randomUUID(),
      userId: user.id,
      fullName,
      status: "pending",
      documents: [
        {
          id: crypto.randomUUID(),
          type: "id",
          fileName: files.id.name,
          mimeType: files.id.type,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "selfie",
          fileName: files.selfie.name,
          mimeType: files.selfie.type,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      submittedAt: new Date().toISOString(),
    };

    // In a real app, you'd upload this to your backend
    // For now, we'll store it in localStorage
    localStorage.setItem(`kyc_application_${user.id}`, JSON.stringify(newApplication));
    localStorage.setItem(`kyc_status_${user.id}`, "pending");
    setKycStatus("pending");
    setApplication(newApplication);
  };

  const approveApplication = (applicationId: string, notes?: string) => {
    if (!application || application.id !== applicationId) return;

    const updatedApplication = {
      ...application,
      status: "approved" as const,
      processedAt: new Date().toISOString(),
      processedBy: user?.id,
      notes,
      documents: application.documents.map(doc => ({
        ...doc,
        status: "approved" as const,
      })),
    };

    localStorage.setItem(`kyc_application_${application.userId}`, JSON.stringify(updatedApplication));
    localStorage.setItem(`kyc_status_${application.userId}`, "approved");
    setApplication(updatedApplication);
  };

  const rejectApplication = (applicationId: string, notes: string) => {
    if (!application || application.id !== applicationId) return;

    const updatedApplication = {
      ...application,
      status: "rejected" as const,
      processedAt: new Date().toISOString(),
      processedBy: user?.id,
      notes,
      documents: application.documents.map(doc => ({
        ...doc,
        status: "rejected" as const,
      })),
    };

    localStorage.setItem(`kyc_application_${application.userId}`, JSON.stringify(updatedApplication));
    localStorage.setItem(`kyc_status_${application.userId}`, "rejected");
    setApplication(updatedApplication);
  };

  return (
    <KYCContext.Provider value={{
      kycStatus,
      application,
      submitApplication,
      approveApplication,
      rejectApplication,
    }}>
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error("useKYC must be used within a KYCProvider");
  }
  return context;
}