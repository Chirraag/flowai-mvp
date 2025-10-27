import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { FormError } from '@/components/ui/form-error';

export default function LoginForm() {
  const { login, logout, forcePasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Dialog State
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Force Password Reset Dialog State
  const [showForcePasswordResetDialog, setShowForcePasswordResetDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState<Record<string, string>>({});
  const [showChangePasswords, setShowChangePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Show force password reset dialog when login succeeds with force_password_reset
  useEffect(() => {
    if (forcePasswordReset) {
      setShowForcePasswordResetDialog(true);
    }
  }, [forcePasswordReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled in the AuthContext after successful login
      // But if force_password_reset is true, we'll show dialog instead
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  // Form validation for change password
  const validateChangePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!changePasswordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!changePasswordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      const passwordError = validatePassword(changePasswordData.newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      } else if (changePasswordData.currentPassword === changePasswordData.newPassword) {
        errors.newPassword = "New password must be different from current password";
      }
    }

    if (!changePasswordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setChangePasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleChangePasswordInputChange = (field: keyof typeof changePasswordData, value: string) => {
    setChangePasswordData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (changePasswordErrors[field]) {
      setChangePasswordErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!validateChangePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      });

      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been successfully changed. You will now be logged out.",
        });

        // Close dialog and reset form
        setShowForcePasswordResetDialog(false);
        setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setChangePasswordErrors({});

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

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim() || !isValidEmail(forgotPasswordEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);
    try {
      const response = await api.post("/auth/forgot-password", {
        email: forgotPasswordEmail.trim(),
      });

      if (response.success) {
        setResetEmailSent(true);
        toast({
          title: "Password Reset Sent",
          description: "A new password has been sent to your email address.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Reset dialog state when closed
  const handleDialogClose = (open: boolean) => {
    setShowForgotPasswordDialog(open);
    if (!open) {
      setForgotPasswordEmail('');
      setResetEmailSent(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src="/logo_flowai.png" 
              alt="Flow AI" 
              className="h-12 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your Flow AI account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
              onClick={() => setShowForgotPasswordDialog(true)}
            >
              Forgot your password?
            </button>
          </div>

        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a new password.
            </DialogDescription>
          </DialogHeader>

          {!resetEmailSent ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address *</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    disabled={isSendingReset}
                    className={forgotPasswordEmail && !isValidEmail(forgotPasswordEmail) ? "border-red-500" : ""}
                  />
                  {forgotPasswordEmail && !isValidEmail(forgotPasswordEmail) && (
                    <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPasswordDialog(false)}
                  disabled={isSendingReset}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  disabled={isSendingReset || !forgotPasswordEmail.trim() || !isValidEmail(forgotPasswordEmail)}
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send New Password"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Reset Sent
              </h3>
              <p className="text-gray-600 mb-4">
                A new password has been sent to your email address. Please check your inbox and use the new password to log in.
              </p>
              <Button onClick={() => setShowForgotPasswordDialog(false)}>
                Got it
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Force Password Reset Dialog */}
      <Dialog open={showForcePasswordResetDialog} onOpenChange={(open) => {
        if (!open) {
          // Allow closing the dialog - user can dismiss and continue
          setShowForcePasswordResetDialog(false);
          // Navigate to dashboard since they chose not to change password
          window.location.href = "/";
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
            <DialogDescription>
              For security reasons, we recommend changing your password. You can skip this for now and change it later from your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="force-current-password">Current Password *</Label>
              <div className="relative">
                <Input
                  id="force-current-password"
                  type={showChangePasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={changePasswordData.currentPassword}
                  onChange={(e) => handleChangePasswordInputChange("currentPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${changePasswordErrors.currentPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowChangePasswords(prev => ({ ...prev, current: !prev.current }))}
                  disabled={isChangingPassword}
                >
                  {showChangePasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {changePasswordErrors.currentPassword && (
                <FormError error={changePasswordErrors.currentPassword} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="force-new-password">New Password *</Label>
              <div className="relative">
                <Input
                  id="force-new-password"
                  type={showChangePasswords.new ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={changePasswordData.newPassword}
                  onChange={(e) => handleChangePasswordInputChange("newPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${changePasswordErrors.newPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowChangePasswords(prev => ({ ...prev, new: !prev.new }))}
                  disabled={isChangingPassword}
                >
                  {showChangePasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {changePasswordErrors.newPassword && (
                <FormError error={changePasswordErrors.newPassword} />
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="force-confirm-password">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="force-confirm-password"
                  type={showChangePasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => handleChangePasswordInputChange("confirmPassword", e.target.value)}
                  disabled={isChangingPassword}
                  className={`pr-10 ${changePasswordErrors.confirmPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowChangePasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  disabled={isChangingPassword}
                >
                  {showChangePasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {changePasswordErrors.confirmPassword && (
                <FormError error={changePasswordErrors.confirmPassword} />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowForcePasswordResetDialog(false);
                window.location.href = "/";
              }}
              disabled={isChangingPassword}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !changePasswordData.currentPassword.trim() ||
                !changePasswordData.newPassword.trim() ||
                !changePasswordData.confirmPassword.trim()
              }
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}