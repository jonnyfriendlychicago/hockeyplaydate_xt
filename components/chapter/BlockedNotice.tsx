// components/chapter/BlockedNotice.tsx

import { Card, CardContent } from "@/components/ui/card";
import { CopyText } from '@/components/shared/copyText';
interface BlockedNoticeProps {
  nameString?: string;
}

const supportEmailAddy = 'support@hockeyplaydate.com' // easily changed variable in case we ever want to swap out the HPD email addy

export function BlockedNotice({ nameString }: BlockedNoticeProps) {
  return (
    <Card className="border-amber-400 bg-amber-50">
      <CardContent className="p-4 flex items-start gap-3">
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
              <span className="font-mono font-medium">{supportEmailAddy}</span>
              <CopyText text={supportEmailAddy} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}