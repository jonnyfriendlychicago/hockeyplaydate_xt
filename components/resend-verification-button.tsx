// components/resend-verification-button.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle } from "lucide-react";

interface ResendVerificationButtonProps {
  email: string;
  auth0Id: string;
}

export function ResendVerificationButton({ email, auth0Id }: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleResend = async () => {
    if (!email || !auth0Id) {
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
        body: JSON.stringify({ email, auth0Id }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Verification email sent! Check your inbox.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Resend Verification Email
          </>
        )}
      </Button>
      
      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}