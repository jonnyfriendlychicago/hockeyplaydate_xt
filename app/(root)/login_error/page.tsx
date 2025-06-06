// app/(root)/login_error.page.tsx

// app/(root)/login_error/page.tsx
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: { error?: string };
};

export default function LoginErrorPage({ searchParams }: Props) {
  const error = searchParams.error || "unknown_error";

  const errorMessage = {
    unverified_email:
      "Your email address has not been verified. Please check your inbox and click the verification link.",
    access_denied:
      "Access was denied. Please contact support or try logging in again.",
    login_required:
      "You need to log in again to continue.",
    unknown_error:
      "An unknown error occurred. Please try again or contact support.",
  };

  const displayMessage = errorMessage[error as keyof typeof errorMessage] || errorMessage.unknown_error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
      <p className="mb-6 max-w-md text-muted-foreground">{displayMessage}</p>
      <div className="flex gap-4">
        <Link href="/api/auth/login">
          <Button variant="default">Try Logging In Again</Button>
        </Link>
        <Link href="mailto:support@hockeyplaydate.com?subject=Login Help">
          <Button variant="secondary">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}
