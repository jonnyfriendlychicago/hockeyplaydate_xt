// app/(root)/login_error.page.tsx

// 2025jun06: below new draft, uses params from URL.
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // npx shadcn@latest add alert
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Email Verification Required",
};

interface Params {
  searchParams: {
    error?: string;
    email?: string;
    user_id?: string;
  };
}

export default function LoginErrorPage({ searchParams }: Params) {
  const { error, email, user_id } = searchParams;

  if (!error) return notFound();

  const safeEmail = decodeURIComponent(email ?? "");
  const safeUserId = decodeURIComponent(user_id ?? "");

  if (error === "unverified_email") {
    return (
      <main className="max-w-xl mx-auto mt-20 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>
              Your account was created, but your email has not yet been verified. Please check your inbox for an email with verification link.
            </p>
            <p>
              <strong>Email:</strong> {safeEmail || "Unknown"}<br />
              <strong>User ID:</strong> {safeUserId || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? This page will soon include a “Resend Verification Email” button.
            </p>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto mt-20 px-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Login Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>Something went wrong during login.</p>
          <p className="text-sm text-muted-foreground">
            Error code: <code>{error}</code>
          </p>
        </AlertDescription>
      </Alert>
    </main>
  );
}


// below was first draft, removed 2025ju06
// import { Button } from "@/components/ui/button";
// import { AlertTriangle } from "lucide-react";
// import Link from "next/link";

// type Props = {
//   searchParams: { error?: string };
// };

// export default function LoginErrorPage({ searchParams }: Props) {
//   const error = searchParams.error || "unknown_error";

//   const errorMessage = {
//     unverified_email:
//       "Your email address has not been verified. Please check your inbox and click the verification link.",
//     access_denied:
//       "Access was denied. Please contact support or try logging in again.",
//     login_required:
//       "You need to log in again to continue.",
//     unknown_error:
//       "An unknown error occurred. Please try again or contact support.",
//   };

//   const displayMessage = errorMessage[error as keyof typeof errorMessage] || errorMessage.unknown_error;

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
//       <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
//       <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
//       <p className="mb-6 max-w-md text-muted-foreground">{displayMessage}</p>
//       <div className="flex gap-4">
//         <Link href="/api/auth/login">
//           <Button variant="default">Try Logging In Again</Button>
//         </Link>
//         <Link href="mailto:support@hockeyplaydate.com?subject=Login Help">
//           <Button variant="secondary">Contact Support</Button>
//         </Link>
//       </div>
//     </div>
//   );
// }
