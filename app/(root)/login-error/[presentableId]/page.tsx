// app/(root)/login-error/[presentableId]/page.tsx

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // npx shadcn@latest add alert
import { notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';
// import { Metadata } from "next"; // ??

// export const metadata: Metadata = {
//   title: "Email Verification Required",
// };

// interface Params {
//   searchParams: {
//     error?: string;
//     email?: string;
//     user_id?: string;
//   };
// }

interface PageProps {
    params: { presentableId: string };
}

// export default function LoginErrorPage({ searchParams }: Params) {
export default async function LoginErrorPage({ params }: PageProps) {
//   const { error, email, user_id } = searchParams;
const { presentableId } = params;

const record = await prisma.loginFailure.findUnique({
    where: { presentableId },
  });

//   if (!error) return notFound();
if (!record) return notFound();

//   const safeEmail = decodeURIComponent(email ?? "");
//   const safeUserId = decodeURIComponent(user_id ?? "");
const { errorCode, email } = record; // lets get auth0Id from here too

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
              <strong>User ID:</strong> {email || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? This page will soon include a “Resend Verification Email” button.
            </p>

            {/* here actually create button, and have button have link/ref to cal the function */}

          </AlertDescription>
          
            {/* <AlertTitle>Email Verification Required</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                Your account was created, but your email hasn’t been verified.
                Please check your inbox for a message with a verification link.
              </p>
              <p>
                <strong>Email:</strong> {email || "Unknown"}
              </p>
              <p className="text-sm text-muted-foreground">
                Can’t find the email? This page will soon include a “Resend
                Verification Email” button.
              </p>
            </AlertDescription> */}
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

  return (
    <main className="max-w-xl mx-auto mt-20 px-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        {renderContent()}
      </Alert>
    </main>
  );
}








// if (error === "unverified_email") {
//     return (
//       <main className="max-w-xl mx-auto mt-20 px-4">
//         <Alert variant="destructive">
//           <AlertTriangle className="h-5 w-5" />
//           <AlertTitle>Email Verification Required</AlertTitle>
//           <AlertDescription className="mt-2 space-y-4">
//             <p>
//               Your account was created, but your email has not yet been verified. Please check your inbox for an email with verification link.
//             </p>
//             <p>
//               <strong>Email:</strong> {safeEmail || "Unknown"}<br />
//               <strong>User ID:</strong> {safeUserId || "Unknown"}
//             </p>
//             <p className="text-sm text-muted-foreground">
//             Can&apos;t find the email? This page will soon include a “Resend Verification Email” button.
//             </p>

//             {/* here actually create button, and have button have link/ref to cal the function */}

//           </AlertDescription>
//         </Alert>
//       </main>
//     );
//   }

//   return (
//     <main className="max-w-xl mx-auto mt-20 px-4">
//       <Alert variant="destructive">
//         <AlertTriangle className="h-5 w-5" />
//         <AlertTitle>Login Error</AlertTitle>
//         <AlertDescription className="mt-2 space-y-4">
//           <p>Something went wrong during login.</p>
//           <p className="text-sm text-muted-foreground">
//             Error code: <code>{error}</code>
//           </p>
//         </AlertDescription>
//       </Alert>
//     </main>
//   );
// }
