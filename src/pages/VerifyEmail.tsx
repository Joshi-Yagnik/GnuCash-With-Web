import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, RefreshCw, LogOut } from "lucide-react";

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const { user, logout, sendVerificationEmail, reloadUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendVerificationEmail();
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      await reloadUser();
      if (user?.emailVerified) {
        toast({
          title: "Email verified!",
          description: "Welcome to Finance Dashboard",
        });
        navigate("/");
      } else {
        toast({
          title: "Email not verified yet",
          description: "Please check your inbox and click the verification link",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to check verification status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="mb-2">Please check your inbox and click the verification link to continue.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>

            <Button
              onClick={handleCheckVerification}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              I've Verified My Email
            </Button>

            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Resend Verification Email
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
