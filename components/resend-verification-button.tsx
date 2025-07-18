// components/resend-verification-button.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, RefreshCw } from "lucide-react";

interface ResendVerificationButtonProps {
  // email: string;
  // auth0Id: string;
  presentableId: string;
}

export function ResendVerificationButton({ 
  // email, 
  // auth0Id , 
  presentableId}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleResend = async () => {
    // check if essential vars available
    if (
      // !email || 
      // !auth0Id ||
      !presentableId) {
      setStatus('error');
      setErrorMessage('Missing user information');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          // email, 
          // auth0Id, 
          presentableId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Email sent successfully!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Check your inbox for the new verification email.
        </p>
      </div>
      
      // <div className="flex items-center gap-2 text-green-600">
      //   <CheckCircle className="h-4 w-4" />
      //   <span className="text-sm">Verification email sent! Check your inbox.</span>
      // </div>
    );
  }

  return (
    // <div className="space-y-2">
    <div className="space-y-3">
      <Button
        onClick={handleResend}
        disabled={isLoading}
        // variant="outline"
        // size="sm"
        size="lg"
        // className="w-full sm:w-auto"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending email...
          </>
        ) : (
          <>
            {/* <Mail className="h-4 w-4 mr-2" /> */}
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend Verification Email
          </>
        )}
      </Button>
      
      {status === 'error' && (
        // <p className="text-sm text-red-600">{errorMessage}</p>
         <div className="text-center">
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}