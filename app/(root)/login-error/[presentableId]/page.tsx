// app/(root)/login-error/[presentableId]/page.tsx

import { Mail, HelpCircle, AlertCircle , AlertTriangle } from "lucide-react";
import {Card,CardContent, CardHeader,CardTitle,} from "@/components/ui/card";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { ResendVerificationButton } from "@/components/resend-verification-button";
import { auth0 } from "@/lib/auth0";

// pre-export essentials
export const metadata: Metadata = {title: "Login Error",};

interface PageProps {
  params: { presentableId: string };
}

export default async function LoginErrorPage({ params }: PageProps) {
  // 0 - destructure params
  const { presentableId } = params;

  // 0.5 - redirect if authenticated (This prevents authenticated user from accidentally getting this page again, causing confusion and potentially initiating extraneous verify emails)
  const session = await auth0.getSession();
  if (session?.user) redirect("/dashboard");

  // 1 - get the error record from db
  const record = await prisma.loginFailure.findUnique({
    where: { presentableId },
  });

  // 2.1 - if somehow not found (e.g., goofy manipulation of the URL): 
  if (!record) return notFound();

  // 2.2 - if this login_error already used to resend the verification email, redirect away. 
  if (record.verifyEmailResent) redirect("/");

  // 2.3 - if record is expired (i.e. too old for use, per own biz rules), redirect 
  const pageLifeSpanHours = 24; // this can be adjusted; make sure this is the lifespan of the link as configured in auth0 mgmt console (email templates section)
  const pageExpiration = new Date(record.createdAt.getTime() + pageLifeSpanHours * 60 * 60 * 1000);
  if (new Date() > pageExpiration) redirect("/"); // 101: `new Date()` is "now" as humans call it

  // 2.4 - check if email has reached lifetime resend limit
  const totalResends = await prisma.loginFailure.count({
    where: {
      email: (record.email || "").toLowerCase(),
      verifyEmailResent: true,
    },
  });
  // 2.5 - set downstream var for limits
  const hasReachedLimit = totalResends >= 2;

  // 3 - establish essential vars (extracted from the returned object) 
  const { 
    errorCode, // error_code controls the renderContent; 101: could do a simple 'if', but embrace renderCotent functional design for now, b/c this might come up in future
    email //  presented to end user on page;
  } = record;

  // 4 - set up variable content
  const renderContent = () => {
    switch (errorCode) {
      case "unverified_email":
        return (
            <Card className="w-full px-4 py-2">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-14 h-14  rounded-full flex items-center justify-center">
                  <Mail className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-semibold">
                  Verify Your Email
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 mt-0">
                  <div className="text-center space-y-3">
                    <p className="font-medium text-lg truncate">{email}</p>
                    {!hasReachedLimit ? (
                      <>
                        <p className="text-base text-muted-foreground">
                          We sent a verification email to the above address. <br/>
                          Check your inbox (and spam folder) and click the link to verify your account, then log in again.</p>
                        <ResendVerificationButton presentableId={presentableId} />
                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base text-muted-foreground text-center">
                          <HelpCircle className="h-4 w-4" />
                          <span>Need help?</span>
                          <a href="/support" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">Contact support</a>
                        </div>
                      </>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-2 text-amber-800">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Maximum emails sent</span>
                          </div>
                          <div className="text-sm text-amber-700 space-y-2">
                            <p>We&apos;ve now sent three verification emails to this address.</p>
                            <p>Please check your inbox (including spam folder) and click any of the verification links, then log in again. </p>
                            <p>Can&apos;t find the emails? None of the links work? </p>
                            <p><a href="/support" className="text-amber-700 underline">Contact support</a> and we&apos;ll help.</p>
                          </div>
                        </div>
                      </div>
                    )
                    }
                  </div>
              </CardContent>
            </Card>
        ); 

      default:
        return (
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-14 h-14  rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Login Error
              </CardTitle>
            </CardHeader>
        
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600 mb-4">
                <p>Sorry about this. </p> 
                <p>Something went wrong during login. <br/>Please try again.</p>
              </div>

              <div className=" border border-red-500 rounded-lg p-4">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <span className="font-medium">Error Details</span>
                  </div>
                  <div className="text-sm text-red-500 space-y-2">
                    <p>Error code: {errorCode}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base text-muted-foreground text-center">
                <span>If this error persists, please</span>
                <a href="/support" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">contact support</a>
              </div>

            </CardContent>
          </Card>
        )
    }
  }

  // 5 - return it all
  return (
    <main className="max-w-4xl mx-auto mt-10 px-4">
      <div className="w-full max-w-lg mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}