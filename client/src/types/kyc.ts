export interface KYCDocument {
  id: string;
  type: "id" | "selfie";
  fileName: string;
  mimeType: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCApplication {
  id: string;
  userId: string;
  fullName: string;
  status: "pending" | "approved" | "rejected";
  documents: KYCDocument[];
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}