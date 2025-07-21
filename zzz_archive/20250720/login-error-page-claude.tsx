// app/(root)/login-error/[presentableId]/page.tsx

import { Mail, HelpCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound, redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { Metadata } from "next"; 
import { ResendVerificationButton } from "@/components/resend-verification-button";
import { auth0 } from "@/lib/auth0";

export const metadata: Metadata = { title: "Email Verification" };

interface PageProps {
  params: { presentableId: string };
}

export default async function LoginErrorPage({ params }: PageProps) {
  const { presentableId } = params;

  // Redirect authenticated users
  const session = await auth0.getSession();
  if (session?.user) {
    redirect('/dashboard');
  }

  // Get the error record
  const record = await prisma.loginFailure.findUnique({
    where: { presentableId },
  });

  if (!record) return notFound();
  if (record.verifyEmailResent) redirect('/');

  // Check if record is expired
  const pageLifeSpanHours = 24;
  const pageExpiration = new Date(record.createdAt.getTime() + (pageLifeSpanHours * 60 * 60 * 1000));
  if (new Date() > pageExpiration) redirect('/');

  // Check lifetime resend limit
  const totalResends = await prisma.loginFailure.count({
    where: { 
      email: (record.email || "").toLowerCase(),
      verifyEmailResent: true 
    }
  });
  const hasReachedLimit = totalResends >= 2;

  const { errorCode, email } = record;

  // Main content renderer
  const renderContent = () => {
    if (errorCode === "unverified_email") {
      return (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Email Verification Required
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email display */}
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                We sent a verification email to:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="font-medium text-gray-900">{email}</p>
              </div>
            </div>

            {/* Action section - conditional content */}
            <div className="space-y-4">
              {hasReachedLimit ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Maximum emails sent</span>
                    </div>
                    <div className="text-sm text-amber-700 space-y-2">
                      <p>We've already sent three verification emails to this address.</p>
                      <p>Please check your inbox (including spam folder) and click any verification link.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Check your inbox and click the verification link, then try logging in again.
                    </p>
                  </div>
                  <ResendVerificationButton presentableId={presentableId} />
                </>
              )}
            </div>

            {/* Support link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Need help? 
                <a href="/support" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default error case
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Login Error
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Something went wrong during login. Please try again.
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              Error code: <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{errorCode}</code>
            </AlertDescription>
          </Alert>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Need help? 
              <a href="/support" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                Contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {renderContent()}
      </div>
    </main>
  );
}