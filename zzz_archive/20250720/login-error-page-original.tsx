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
if (record.verifyEmailResent) {redirect('/');}

// 2.3 - if record is expired (i.e. too old for use, per own biz rules), redirect 
const pageLifeSpanHours = 24; // this can be adjusted; make sure this is the lifespan of the link as configured in auth0 mgmt console (email templates section)
const pageExpiration = new Date(record.createdAt.getTime() + (pageLifeSpanHours * 60 * 60 * 1000));
const now = new Date();
if (now > pageExpiration) {redirect('/');}

// 2.4 - check if email has reached lifetime resend limit
const totalResends = await prisma.loginFailure.count({
  where: { 
    // email: record.email.toLowerCase(), // this will error: could be null, ts no likey
    email: (record.email || "").toLowerCase(),
    verifyEmailResent: true 
  }
});
const hasReachedLimit = totalResends >= 2;

// 3 - establish essential vars (extracted from the returned object) 
const { 
  errorCode, // error_code controls the renderContent;
  email , //  presented to end user on page;
} = record; 

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
              {/* <CardDescription className="text-base">
                You&apos;re almost done! We need to verify your email.
              </CardDescription> */}
               {!hasReachedLimit ? (
              <CardDescription className="text-base">
                 We sent a verification email to:
              </CardDescription>) : <></>}
            </CardHeader>

            
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                {/* <p className="text-sm text-muted-foreground">
                  We sent a verification link to:
                </p> */}
                {/* <p className="font-medium text-foreground bg-muted px-3 py-2 rounded-md"> */}
                <p className="font-medium text-foreground px-3  rounded-md">
                  {email}
                </p>
                {!hasReachedLimit ? (
                <p className="text-sm text-muted-foreground">
                  Check your inbox and click the verification link, <br/> then log in again.
                </p>): <></>}

              </div>

              <div className="space-y-3">
                {hasReachedLimit ? (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <span className="font-medium">
                        Our records indicate we have already sent three verification emails to the above address. <br/>
                        Please find any one of those emails and click the verification link, then log in again. <br/>
                        Cant find those emails?  None of the links work?  Need another email sent? <br/>
                        We can help! Just <a href="/support" className=" hover:underline">contact support.</a> 
                      </span>
                    </div>
                  </div>
                ) : (
                  <ResendVerificationButton presentableId={presentableId} />
                )}
                
                <div className="text-center">
                  {!hasReachedLimit ? (
                  // <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <p className=" text-muted-foreground flex items-center justify-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Still having trouble? <a href="/support" className="text-primary hover:underline">Contact support</a>
                  </p>) : (<></>)}
                </div>
              </div>
            </CardContent>
          </Card>
          
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
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </main>
  );
}

