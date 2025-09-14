// components/chapter/JoinChapterButton.tsx // recall that exported React components must be PascalCase, or just won't work.  So, name file same for clarity.

'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { joinChapterAction, cancelJoinRequestAction } from '@/app/(root)/[slug]/actions';

interface JoinChapterButtonProps {
  userStatus: UserChapterStatus;
  // chapterId: number;
  chapterSlug: string;
}

export function JoinChapterButton({ userStatus, 
  // chapterId, 
  chapterSlug 
}: JoinChapterButtonProps) {
  // Don't show button for members, managers, or blocked users
  if (userStatus.genMember || userStatus.mgrMember || userStatus.blockedMember) {
    return null;
  }

  // Anonymous visitors - redirect to login
  if (userStatus.anonVisitor) {
    return (
      <Link href="/auth/login">
        <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Join Chapter
        </Button>
      </Link>
    );
  }

  // Authenticated visitors and removed members - show join button
  if (userStatus.authVisitor || userStatus.removedMember) {
    return (
      // <form action={`/api/chapters/${chapterSlug}/join`} method="POST">
      //   <input type="hidden" name="chapterSlug" value={chapterSlug} />
      // above replaced by below, embracing server action design over traditional REST api design
      <form action={joinChapterAction}>
        <input type="hidden" name="chapterSlug" value={chapterSlug} />
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Join Chapter
        </Button>
      </form>
    );
  }

  // Applicants - show cancel button with pending message
  if (userStatus.applicant) {
    return (
      <div className="text-center space-y-2">
        <p className="text-orange-600 text-sm">
          Request pending approval from organizers
        </p>
        {/* <form action={`/api/chapters/${chapterSlug}/cancel`} method="POST">
          <input type="hidden" name="chapterSlug" value={chapterSlug} /> */}
        {/* above replaced by below, embracing server action design over traditional REST api design   */}
        <form action={cancelJoinRequestAction}>
          <input type="hidden" name="chapterSlug" value={chapterSlug} />  
          <Button type="submit" variant="outline" className="h-10 px-6 text-base">
            <X className="w-4 h-4 mr-2" />
            Cancel Request
          </Button>
        </form>
      </div>
    );
  }

  return null;
}

// below was original placeholder; wholly replaced by above
// 'use client'; // future form logic will likely need it

// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { PlusCircle } from "lucide-react";

// interface JoinChapterButtonProps {
//   anonVisitor: boolean;
//   authVisitor: boolean;
// }

// export function JoinChapterButton({ anonVisitor, authVisitor }: JoinChapterButtonProps) {
//   if (!anonVisitor && !authVisitor) return null;

//   if (anonVisitor) {
//     return (
//       <Link href="/auth/login">
//         <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
//           <PlusCircle className="w-4 h-4 mr-2" />
//           Join Chapter
//         </Button>
//       </Link>
//     );
//   }
//   // future state: replace with form submission
//   return (
//     <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md" >
//       <PlusCircle className="w-4 h-4 mr-2" />
//       Join Chapter
//     </Button>
//   );
// }
