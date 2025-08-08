// components/chapter/BlockedNotice.tsx

import { Card, CardContent } from "@/components/ui/card";
import { CopyText } from '@/components/shared/copyText';
// import { AlertCircle } from "lucide-react";
interface BlockedNoticeProps {
  nameString?: string;
}

const supportEmailAddy = 'support@hockeyplaydate.com' // easily changed variable in case we ever want to swap out the HPD email addy

// below is overhaul, built with help from Claude
export function BlockedNotice({ nameString }: BlockedNoticeProps) {
  return (
    <Card className="border-amber-400 bg-amber-50">
      <CardContent className="p-4 flex items-start gap-3">
        {/* <AlertCircle className="w-5 h-5 mt-1 text-amber-600" /> */}
        <div className="space-y-3">
          <div>
            <p className="font-medium text-amber-900 text-sm">
              {nameString ? `Greetings, ${nameString}. ` : ""}
              Your access to this chapter has been removed.
            </p>
            
          </div>
          <div className="text-sm text-amber-800">
            <p className="mb-2">If you believe this was a mistake or have questions, please contact us:</p>
            <div className="flex items-center gap-1">
              {/* <span>Contact our support team at</span> */}
              <span className="font-mono font-medium">{supportEmailAddy}</span>
              <CopyText text={supportEmailAddy} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// below is prior to 2025aug08

// export function BlockedNotice({ nameString }: BlockedNoticeProps) {
//   return (
//     <Card className="border-red-500 bg-red-50 text-red-600">
//       <CardContent className="p-4 flex items-start gap-3">
//         <AlertCircle className="w-5 h-5 mt-1 text-red-500" />
//         <div className="space-y-1">
//           <p className="font-semibold text-sm">
//             {nameString ? `Hello, ${nameString}. ` : ""}
//             Your access to this chapter has been restricted.
//           </p>
//           <p className="text-sm">
//             If you believe this was a mistake or have questions, please contact us:
//             <span> {supportEmailAddy}</span>
//             <CopyText text={supportEmailAddy} />
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
