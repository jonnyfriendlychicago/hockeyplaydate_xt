// components/chapter/ChapterErrorDisplay.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ERROR_ACTION_DESCRIPTIONS } from '@/lib/constants/errorKeys';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Map error keys to user-friendly descriptions
// const errorDescriptions: Record<string, string> = {
//   'memberManagementError': 'update user membership status',
//   'joinChapterError': 'join the chapter',
//   'leaveChapterError': 'leave the chapter',
//   'cancelJoinRequestError': 'cancel your join request'  
// };

export function ChapterErrorDisplay() {

  const [error, setError] = useState<{ message: string; action: string } | null>(null);

  useEffect(() => {
    const checkErrors = () => {
    // Check all error types
    // for (const [key, action] of Object.entries(errorDescriptions)) {
    for (const [key, action] of Object.entries(ERROR_ACTION_DESCRIPTIONS)) {
        const errorMessage = sessionStorage.getItem(key);
        if (errorMessage) {
        setError({ message: errorMessage, action });
        sessionStorage.removeItem(key);
        return; // Show first error found
        }
    }
    };

    checkErrors();
  
    // Listen for storage events (when error is set from modal)
    // window.addEventListener('storage', checkError);
    window.addEventListener('storage', checkErrors);
    
    // Also check periodically in case storage event doesn't fire
    // const interval = setInterval(checkError, 500);
    const interval = setInterval(checkErrors, 500);
    
    return () => {
    //   window.removeEventListener('storage', checkError);
      window.removeEventListener('storage', checkErrors);
      clearInterval(interval);
    };
  }, []);

  if (!error) return null;

  return (

    // <div className="bg-red-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-4">
    //   <div className="flex justify-between items-start">
    //     <div>
    //       <p className="font-medium mb-1">Action Failed</p>
    //       <p className="text-sm">
    //         Our apologies, our system encountered a problem and your last action to 
    //         <span className="font-semibold"> {error.action} </span> 
    //         did not succeed. Please try again, and if you continue encountering this error, 
    //         please contact our team.
    //       </p>
    //       <p className="text-xs mt-2 text-red-600">
    //         Technical details: {error.message}
    //       </p>
    //     </div>
        
    //     <button 
    //       onClick={() => setError(null)}
    //       className="text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
    //     >
    //       <X className="w-5 h-5" />
    //     </button>

    //   </div>
    // </div>

    <Card className="border-red-400 bg-red-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-semibold text-red-900 text-sm">
                Action Failed
              </p>
              <p className="text-sm text-red-800 mt-1">
                Our apologies, our system encountered a problem and your last action to{' '}
                <span className="font-semibold">{error.action}</span> did not succeed. 
                Please try again, and if you continue encountering this error, please contact our team.
              </p>
            </div>

            {/* Technical Details - Collapsible/Subtle */}
            <details className="text-xs text-red-700">
              <summary className="cursor-pointer hover:text-red-900 font-medium">
                Technical details
              </summary>
              <p className="mt-1 font-mono bg-red-100 p-2 rounded border border-red-200">
                {error.message}
              </p>
            </details>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError(null)}
            className="flex-shrink-0 h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

  );
}