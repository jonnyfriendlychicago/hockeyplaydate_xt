// components/UserProfile/EmailBlock.tsx
'use client';

// import * as React from 'react';
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
  // const [open, setOpen] = React.useState(false);
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



                // <Accordion type="single" collapsible className="w-full">
                //   <AccordionItem 
                //   value="email-info"
                //   className="border-none">
                //     {/* Custom accordion trigger without chevron */}
                //     <AccordionTrigger className="p-0 text-sm text-muted-foreground hover:text-primary [&>svg]:hidden">
                //       <div className="flex items-center gap-1">
                //         <Info className="w-4 h-4" />
                //         {/* <span className="underline">More about email...</span> */}
                //         <p>Show more ...</p>
                //       </div>
                //     </AccordionTrigger>
                //     <AccordionContent className="text-sm text-muted-foreground leading-snug mt-2">
                //     Above is the email that you have selected to share with Hockey Playdate organizers and other members as your preferred email address. <br/>
                //     Invitations, communications and inquiries (as needed) will be sent to this email address. <br/>
                //     It differs from the non-shared email you use to login to this site, which is visible only to HPD administrators:  <span className="font-medium">{loginEmail}</span> <br/>

                //     </AccordionContent>
                //   </AccordionItem>
                // </Accordion>

                      // <Popover>
                      //   <PopoverTrigger asChild>
                      //     <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary" />
                      //   </PopoverTrigger>
                      //   <PopoverContent className="max-w-xs text-sm leading-snug">  
                      //   This is the email that you have selected to share with Hockey Playdate organizers and other members as your preferred email address.  
                      //   Invitations, communications and inquiries (as needed) will be sent to this email address. 
                      //   It differs from the non-shared email you use to login to this site: {loginEmail}.
                      //   </PopoverContent>
                      // </Popover>
        
