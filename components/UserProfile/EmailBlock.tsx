// components/UserProfile/EmailBlock.tsx

'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // npx shadcn@latest add tooltip
import { CircleHelp } from 'lucide-react';

type Props = {
  altEmail: string | null;
  loginEmail: string;
  isOwner: boolean;
};

export function EmailBlock({ altEmail, loginEmail, isOwner }: Props) {
  const shouldShowTooltip = isOwner && altEmail && altEmail !== loginEmail;

  return (
    <div className="relative">
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        Email
        {shouldShowTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleHelp className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm leading-snug">  
              This is the email that you have selected to share with Hockey Playdate organizers and other members as your preferred email address.  
              Inquiries (as needed) will be sent to this email address. 
              It differs from the non-shared email you use to login to this site: {loginEmail}.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </p>
      {/* <p className="font-medium">{altEmail ?? loginEmail}</p> */}
      <p className="font-medium">{altEmail || loginEmail}</p>
    </div>
  );
}
