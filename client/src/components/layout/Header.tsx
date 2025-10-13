import { useAuth } from "@/context/AuthContext";
import { Menu, LogOut, Key, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const isMobile = useIsMobile();

  // Change Password Dialog State
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Get page title from location
  const getPageTitle = () => {
    const pathParts = location.split("/");
    const page = pathParts[pathParts.length - 1];

    if (page === "launchpad") {
      return "Launchpad";
    }

    // AI Agents pages - show "AI Agents" for all agent pages
    if (location.includes("ai-agents/")) {
      return "AI Agents";
    }

    if (location.includes("analytics")) {
      return "Analytics";
    }

    // Default fallback
    if (page === "" || location === "/") {
      return "Dashboard";
    }

    return "Flow AI";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      } else if (formData.currentPassword === formData.newPassword) {
        errors.newPassword = "New password must be different from current password";
      }
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been successfully changed. You will now be logged out.",
        });

        // Close dialog and reset form
        setShowChangePasswordDialog(false);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setFormErrors({});

        // Auto logout after successful password change
        setTimeout(async () => {
          await logout();
        }, 2000); // Brief delay to show success message
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      const errorMessage = error.message || "Failed to change password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    setShowChangePasswordDialog(open);
    if (!open) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFormErrors({});
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex w-full items-center gap-3 px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {isMobile && (
            <button
              type="button"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role} • {user?.org_name}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setShowChangePasswordDialog(true)}
              >
                <Key className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password *</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${formErrors.currentPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  disabled={isChangingPassword}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {formErrors.currentPassword && (
                <FormError error={formErrors.currentPassword} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password *</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${formErrors.newPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  disabled={isChangingPassword}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {formErrors.newPassword && (
                <FormError error={formErrors.newPassword} />
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  disabled={isChangingPassword}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {formErrors.confirmPassword && (
                <FormError error={formErrors.confirmPassword} />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowChangePasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !formData.currentPassword.trim() ||
                !formData.newPassword.trim() ||
                !formData.confirmPassword.trim()
              }
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
