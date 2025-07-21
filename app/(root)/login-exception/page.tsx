// app/(root)/login-exception/page.tsx

import { AlertTriangle } from "lucide-react";
import {Card,CardContent, CardHeader,CardTitle,} from "@/components/ui/card";

export default function LoginExceptionPage({ 
  searchParams 
}: { 
  searchParams: { code?: string } 
}) {
  const errorCode = searchParams.code || 'unknown';
  
  return (
    <main className="max-w-4xl mx-auto mt-10 px-4">
      <div className="w-full max-w-lg mx-auto">
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Login Error
              </CardTitle>
            </CardHeader>
        
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600 mb-4">
                <p>Sorry about this. </p> 
                <p>Something went wrong during login. <br/>Please try again?</p>
              </div>

              <div className=" border border-red-500 rounded-lg p-4">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <span className="font-medium">Error Details</span>
                  </div>
                  <div className="text-sm text-red-500 space-y-2">
                    <p>Error type: Exception</p>
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
      </div>
    </main>


  );
}