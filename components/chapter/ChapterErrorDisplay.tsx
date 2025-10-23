// components/chapter/ChapterErrorDisplay.tsx

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Map error keys to user-friendly descriptions
const errorDescriptions: Record<string, string> = {
  'memberManagementError': 'update user membership status',
  'joinChapterError': 'join the chapter',
  'leaveChapterError': 'leave the chapter',
  'cancelJoinRequestError': 'cancel your join request'  // Add this key if needed
};

export function ChapterErrorDisplay() {
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Check for memberManagementError on mount and when storage changes
//     const checkError = () => {
//       const memberError = sessionStorage.getItem('memberManagementError');
//       if (memberError) {
//         setError(memberError);
//         sessionStorage.removeItem('memberManagementError');
//       }
//     };

//     checkError();

    const [error, setError] = useState<{ message: string; action: string } | null>(null);

    useEffect(() => {
        const checkErrors = () => {
        // Check all error types
        for (const [key, action] of Object.entries(errorDescriptions)) {
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
    <div className="bg-red-50 border-2 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-4">
      {/* <div className="flex justify-between items-center"> */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium mb-1">Action Failed</p>
          <p className="text-sm">
            Our apologies, our system encountered a problem and your last action to 
            <span className="font-semibold"> {error.action} </span> 
            did not succeed. Please try again, and if you continue encountering this error, 
            please contact our team.
          </p>
          <p className="text-xs mt-2 text-red-600">
            Technical details: {error.message}
          </p>
        </div>
        
        {/* <p className="font-medium">{error}</p> */}
        
        <button 
          onClick={() => setError(null)}
        //   className="text-red-600 hover:text-red-800 ml-4"
          className="text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}