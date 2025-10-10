// components/chapter/JoinChapterButton.tsx 

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { joinChapterAction, cancelJoinRequestAction } from '@/app/(root)/[slug]/actions';

interface JoinChapterButtonProps {
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
}

export function JoinChapterButton({ userChapterMember, chapterSlug }: JoinChapterButtonProps) {

  const [error, setError] = useState<string | null>(null);
  
  // declare who's allowed to initiate the join process. Handy shortcut on whether to display/not 
  const allowedToJoin = 
  userChapterMember.anonVisitor || 
  userChapterMember.authVisitor || 
  userChapterMember.removedMember || 
  userChapterMember.applicant; 


  // Don't show button if not allowed to request membership
  if (!allowedToJoin) {
    return null;
  }

  // Anonymous visitors - redirect to login
  if (userChapterMember.anonVisitor) {
    return (
      <Link href="/auth/login">
        <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Join Chapter
        </Button>
      </Link>
    );
  }

  // const handleJoinSubmit = async (formData: FormData) => {
  //   setError(null);
  //   const result = await joinChapterAction(formData);

  //   if (!result) {
  //   setError('Unable to process request. Please try again.');
  //   return;
  // }
  
  //   if (!result.success) {
  //     setError(result.error || 'Something went wrong JTC');
  //   }
  // };

  // above replaced by below

  const handleJoinSubmit = async (formData: FormData) => {
    setError(null);
    try {
      const result = await joinChapterAction(formData);
      
      // If we get here, it means the action returned an error (didn't redirect)
      if (result && !result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.log(error)
      // Redirect throws - this is expected, let it happen
      // Only catch real errors
    }
  };

  const handleCancelSubmit = async (formData: FormData) => {
    setError(null);
    const result = await cancelJoinRequestAction(formData);
    
    if (!result) {
      setError('Unable to process request. Please try again.');
      return;
    }
    
    if (!result.success) {
      setError(result.error || 'Something went wrong cancelling request');
    }
  };

  // Authenticated visitors and removed members - show join button
  if (userChapterMember.authVisitor || userChapterMember.removedMember) {
    return (
      <div className="space-y-2">
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <form action={handleJoinSubmit}>
          <input type="hidden" name="chapterSlug" value={chapterSlug} />
          <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
            <PlusCircle className="w-4 h-4 mr-2" />
            Join Chapter
          </Button>
        </form>
      </div>

    );
  }

  // Applicants - show cancel button with pending message
  // devNote: todo: clean up gui / message display.  clunky presently. 
  if (userChapterMember.applicant) {
    return (
      <div className="text-center space-y-2">
        {error && (
        <p className="text-red-600 text-sm">{error}</p>
        )}
        <p className="text-orange-600 text-sm">
          Request pending approval from organizers
        </p>
        <form action={handleCancelSubmit}>
        {/* <form action={cancelJoinRequestAction}> */}
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