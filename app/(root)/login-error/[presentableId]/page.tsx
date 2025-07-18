// app/(root)/login-error/[presentableId]/page.tsx

import { Mail, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDescription, AlertTitle } from "@/components/ui/alert"; // npx shadcn@latest add alert
import { notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { Metadata } from "next"; 
import { ResendVerificationButton } from "@/components/resend-verification-button";
import { auth0 } from "@/lib/auth0"; 
import { redirect } from "next/navigation";

export const metadata: Metadata = {title: "Login Error",}; // 101: this will add a prefix to tab/page title displayed on EU broswer

interface PageProps {
    params: { presentableId: string };
}

export default async function LoginErrorPage({ params }: PageProps) {
// 0 - destructure params
  const { presentableId } = params;

// 0.5 - redirect if authenticated (This prevents authenticated user from accidentally getting this page again, causing confusion and potentially initiating extraneous verify emails)
const session = await auth0.getSession();
if (session?.user) {
  redirect('/dashboard');
}

// 1 - get the error record from db
const record = await prisma.loginFailure.findUnique({
    where: { presentableId },
  });

// 2.1 - if somehow not found: 
if (!record) return notFound();
// 2.2 - if this login_error already used to resend the verification email, redirect away. 
if (record.verifyEmailResent) {
  redirect('/');
}

// 3 - establish essential vars extracted from the returned object
const { errorCode, email , auth0Id } = record; 

// 4 - set up variable content
const renderContent = () => {
    switch (errorCode) {
      case "unverified_email":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Email Verification Needed
              </CardTitle>
              <CardDescription className="text-base">
                You&apos;re almost done! We need to verify your email.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to:
                </p>
                {/* <p className="font-medium text-foreground bg-muted px-3 py-2 rounded-md"> */}
                <p className="font-medium text-foreground px-3 py-2 rounded-md">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox and click the verification link, <br/> then log in again.
                </p>
              </div>

              <div className="space-y-3">
                <ResendVerificationButton 
                  email={email || ""} 
                  auth0Id={auth0Id || ""} 
                  presentableId={presentableId}
                />
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Still having trouble? <a href="/support" className="text-primary hover:underline">Contact support</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          
          
          // <>
          // <AlertTitle>Email Verification Required</AlertTitle>
          // <AlertDescription className="mt-2 space-y-4">
          //   <p>
          //     Hi, {email}.  <br/>
          //     To complete your signup, please verify your email address.<br/>
          //     Check your inbox for a message from us and click the verification link inside, then log in again.<br/>
          //     Can&apos;t find the email? Click the button below to send a new one.
          //   </p>

          //   <div className="pt-2">
          //     <ResendVerificationButton 
          //       email={email || ""} 
          //       auth0Id={auth0Id || ""} 
          //     />
          //   </div>

          // </AlertDescription>  
          // </>

          
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
    // <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <main className="max-w-xl mx-auto mt-20 px-4">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </main>
    
    // <main className="max-w-xl mx-auto mt-20 px-4">
    //   <Alert variant="destructive">
    //     <AlertTriangle className="h-5 w-5" />
    //     {renderContent()}
    //   </Alert>
    // </main>
  );
}

