// components/chapter/BlockedNotice.tsx

import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyText } from '@/components/shared/copyText';

interface BlockedNoticeProps {
  nameString?: string;
}

const supportEmailAddy = 'support@hockeyplaydate.com' // easily changed variable in case we ever want to swap out the HPD email addy

export function BlockedNotice({ nameString }: BlockedNoticeProps) {
  return (
    <Card className="border-red-500 bg-red-50 text-red-600">
      <CardContent className="p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-1 text-red-500" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">
            {nameString ? `Hello, ${nameString}. ` : ""}
            Your access to this chapter has been restricted.
          </p>
          <p className="text-sm">
            If you believe this was a mistake or have questions, please contact us:
            <span> {supportEmailAddy}</span>
            <CopyText text={supportEmailAddy} />
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
