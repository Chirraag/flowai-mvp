import { useState } from 'react';
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

export default function LoginForm() {
  const { login } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation is handled in the AuthContext after successful login
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
    </div>
  );
}