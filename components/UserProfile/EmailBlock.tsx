// components/UserProfile/EmailBlock.tsx

'use client';
import { useState } from 'react';
import {Collapsible,CollapsibleContent,CollapsibleTrigger,} from '@/components/ui/collapsible'; // npx shadcn@latest add collapsible
import { Info } from 'lucide-react';
import { CopyText } from '@/components/shared/copyText';

type Props = {
  altEmail: string | null;
  loginEmail: string;
  isOwner: boolean;
};

export function EmailBlock({ altEmail, loginEmail, isOwner }: Props) {
  const shouldShowAExpander = isOwner && altEmail && altEmail !== loginEmail;
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <p className="text-sm text-muted-foreground flex items-center gap-1">Email</p>
        <div className="flex items-center gap-1">
          <p className="font-medium">{altEmail || loginEmail}</p>
          <CopyText text={altEmail || loginEmail} />
        </div>


        {shouldShowAExpander && (
          <Collapsible open={open} onOpenChange={setOpen} className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-1 hover:text-primary focus:outline-none"
                aria-expanded={open}
              >
                <Info className="w-4 h-4" />
                {open ? 'Collapse...' : 'More info...'}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2 leading-snug">
          Above is the email that you have selected to share with Hockey Playdate organizers and other members as your preferred email address. <br/>
          Invitations, communications and inquiries (as needed) will be sent to this email address. <br/>
          It differs from the non-shared email you use to login to this site, which is visible only to HPD administrators:  <span className="font-medium">{loginEmail}</span> <br/>
          </CollapsibleContent>
        </Collapsible>
      )}
      </div>
      );
    }
