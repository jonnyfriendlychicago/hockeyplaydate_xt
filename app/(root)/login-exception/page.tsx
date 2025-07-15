// app/(root)/login-exception/page.tsx
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginExceptionPage({ 
  searchParams 
}: { 
  searchParams: { code?: string } 
}) {
  const errorCode = searchParams.code || 'unknown';
  
  return (
    <main className="max-w-xl mx-auto mt-20 px-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Login Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Something went wrong during login. Please try again.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Error code: <code>{errorCode}</code>
          </p>
        </AlertDescription>
      </Alert>
    </main>
  );
}