import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, UpdateUserData } from "@shared/schema";
import { Settings, Eye, EyeOff } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const response = await apiRequest("PUT", `/api/user/${user.id}`, userData);
      return response.json();
    },
    onSuccess: (data) => {
      updateUser(data);
      toast({
        title: "Settings Updated",
        description: "Your account settings have been updated successfully",
      });
      onClose();
      // Reset form
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password change if attempting to change
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password";
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters long";
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updateData: UpdateUserData = {
      fullName: formData.fullName,
      email: formData.email,
    };

    // Only include password fields if user is changing password
    if (formData.newPassword && formData.currentPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    updateUserMutation.mutate(updateData);
  };

  const handleClose = () => {
    if (!updateUserMutation.isPending) {
      onClose();
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-trading-secondary border-trading-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Account Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your account information and security settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              className="trading-input"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            {errors.fullName && (
              <p className="text-sm text-trading-danger">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              className="trading-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-sm text-trading-danger">{errors.email}</p>
            )}
          </div>

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Current Password <span className="text-sm text-gray-400">(only required to change password)</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                className="trading-input pr-10"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-trading-danger">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="trading-input pr-10"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-trading-danger">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="trading-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-trading-danger">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-trading-primary rounded-lg p-3 border border-trading-border">
            <h4 className="text-sm font-medium text-white mb-2">Account Information</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Username: {user.username}</p>
              <p>Referral Code: {user.referralCode}</p>
              <p>Account Type: {user.isAdmin ? 'Administrator' : 'Trader'}</p>
              <p>Member Since: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1 trading-button-primary"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-trading-border hover:bg-trading-primary"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
