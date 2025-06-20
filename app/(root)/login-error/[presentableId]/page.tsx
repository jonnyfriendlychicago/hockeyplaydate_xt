// app/(root)/login-error/[presentableId]/page.tsx

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // npx shadcn@latest add alert
import { notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { Metadata } from "next"; 

export const metadata: Metadata = {title: "Login Error",}; // 101: this will add a prefix to tab/page title displayed on EU broswer

interface PageProps {
    params: { presentableId: string };
}

export default async function LoginErrorPage({ params }: PageProps) {
const { presentableId } = params;
// 1 - get the error record from db
const record = await prisma.loginFailure.findUnique({
    where: { presentableId },
  });
// 2 - if somehow not found: 
if (!record) return notFound();
// 3 - establish essential vars extracted from the returned object
const { errorCode, email , auth0Id } = record; 
// 4 - set up variable content
const renderContent = () => {
    switch (errorCode) {
      case "unverified_email":
        return (
          <>
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>
              Your account was created, but your email has not yet been verified. Please check your inbox for an email with verification link.
            </p>
            <p>
              <strong>Email:</strong> {email || "Unknown"}<br />
              <strong>User ID:</strong> {auth0Id || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? This page will soon include a “Resend Verification Email” button.
            </p>

            {/* here actually create button, and have button have link/ref to cal the function */}

          </AlertDescription>  
          </>
        );

      default:
        return (
          <>
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                Something went wrong during login. Please try again, and if it
                happens again, contact support.
              </p>
              <p className="text-sm text-muted-foreground">
                Error code: <code>{errorCode}</code>
              </p>
            </AlertDescription>
          </>
        );
    }
  };
  // 5 - return it all
  return (
    <main className="max-w-xl mx-auto mt-20 px-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        {renderContent()}
      </Alert>
    </main>
  );
}

