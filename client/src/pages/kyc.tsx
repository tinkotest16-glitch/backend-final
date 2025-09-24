import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { KYCForm } from "@/components/kyc/kyc-form";

export default function KYCPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trading-primary flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout showHeader={true} showFooter={true}>
      <div className="min-h-screen bg-trading-primary text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-gray-400 mt-1">Complete your KYC verification to unlock full trading features</p>
          </div>
          
          <KYCForm />
        </div>
      </div>
    </Layout>
  );
}