// components/chapter/JoinChapterButton.tsx 

'use client';

// import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { joinChapterAction, cancelJoinRequestAction 
  // , type ActionState
} from '@/app/(root)/[slug]/actions';
// import { useEffect } from 'react';
// import { useFormState } from 'react-dom';
import { CHAPTER_ERROR_KEYS } from '@/lib/constants/errorKeys';
// import { setChapterError } from '@/lib/hooks/useChapterError';
import { useChapterMembershipAction } from '@/lib/hooks/useChapterMembershipAction';

// devNotes 2025oct20: spend significant time troubleshooting error messages not being received/displayed on front end page.  
// Various efforts made to resolve, including using useStateForm, which sounded like leading practice, and 
// works great for forms that show validation errors on the same page, but breaks with redirects (required in our current architecture) because the component unmounts.
// Only workable solution (for now?) seems to be this SessionStorage solution shown below.  Notably, to extent useStateForm could work, it's time is limited: 
// useFormState is being phased out; useActionState is the current recommended approach for React 19, etc. 

interface JoinChapterButtonProps {
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
}

export function JoinChapterButton({ 
  userChapterMember, 
  chapterSlug 
}: JoinChapterButtonProps) {
  
  // sessionStorage workaround to step re-rendering

  // Below removed: use updated sessionStorage instead
      // const [error, setError] = useState<string | null>(() => {
      //   if (typeof window !== 'undefined') {
      //     const saved = sessionStorage.getItem('joinChapterError');
      //     if (saved) {
      //       sessionStorage.removeItem('joinChapterError'); // Clear after reading
      //       return saved;
      //     }
      //   }
      //   return null;
      // });

      // const setErrorWithPersist = (value: string | null) => {
      //   setError(value);
      //   if (typeof window !== 'undefined') {
      //     if (value) {
      //       sessionStorage.setItem('joinChapterError', value);
      //     } else {
      //       sessionStorage.removeItem('joinChapterError');
      //     }
      //   }
      // };

  // NEW: Helper to persist errors for ChapterErrorDisplay
  // const setErrorWithPersist = (value: string | null, errorKey: string) => {
  //   if (typeof window !== 'undefined') {
  //     if (value) {
  //       sessionStorage.setItem(errorKey, value);
  //     } else {
  //       sessionStorage.removeItem(errorKey);
  //     }
  //   }
  // };
  // above: this entire setErrorWithPersist function has been replaced with the lib/hooks/useChapterError.ts file

  // declare who's allowed to initiate the join process. Handy shortcut on whether to display/not 
  const allowedToJoin = 
  userChapterMember.anonVisitor || 
  userChapterMember.authVisitor || 
  userChapterMember.removedMember || 
  userChapterMember.applicant; 

  // Hook for join chapter action
  const { 
      executeAction: executeJoinAction, 
      isSubmitting: isJoining 
    } = useChapterMembershipAction({
      errorKey: CHAPTER_ERROR_KEYS.JOIN_CHAPTER
    });

    // Hook for cancel join request action
    const { 
      executeAction: executeCancelAction, 
      isSubmitting: isCancelling 
    } = useChapterMembershipAction({
      errorKey: CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST
    });

  // Don't show button if not allowed to request membership
  if (!allowedToJoin) {
    return null;
  }

  // Anonymous visitors - redirect to login
  if (userChapterMember.anonVisitor) {
    return (
      // <Link href="/auth/login">
      <Link href={`/auth/login?returnTo=/${chapterSlug}`}>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Login/signup to Join Chapter
        </Button>
      </Link>
    );
  }

  // const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault(); // ADD THIS - prevent default form submission

  //   // Clear any previous errors
  //   // setErrorWithPersist(null); 
  //   // setErrorWithPersist(null, 'joinChapterError');
  //   // setErrorWithPersist(null, CHAPTER_ERROR_KEYS.JOIN_CHAPTER);

  //   const formData = new FormData(e.currentTarget); // Get formData from the form

  //   try {
  //     const result = await joinChapterAction(formData);
      
  //     if (result && !result.success) {
  //       // setErrorWithPersist(result.error || 'Something went wrong');
  //       // NEW: Persist to sessionStorage so ChapterErrorDisplay picks it up
  //       // setErrorWithPersist(result.error || 'Something went wrong', 'joinChapterError');
  //       // setErrorWithPersist(result.error || 'Something went wrong', CHAPTER_ERROR_KEYS.JOIN_CHAPTER);
  //       setChapterError(CHAPTER_ERROR_KEYS.JOIN_CHAPTER, result.error || 'Something went wrong');
  //     }
  //   } catch (error) {
  //     // console.log('Caught error:', error);
  //     if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
  //       console.log('Caught error:', error);
  //       // setErrorWithPersist('Something went wrong', 'joinChapterError');
  //       // setErrorWithPersist('Something went wrong', CHAPTER_ERROR_KEYS.JOIN_CHAPTER);
  //       setChapterError(CHAPTER_ERROR_KEYS.JOIN_CHAPTER, 'Something went wrong');
  //     }
  //   }
  // };

  // above replaced with these five lines
    const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // await executeJoinAction(joinChapterAction, { chapterSlug });
    // below forces errors for testing 
    await executeJoinAction(joinChapterAction, { chapterSlug: 'BAD-SLUG!!!' }); 
  };


  // const handleCancelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   // setErrorWithPersist(null);
  //   // Clear any previous errors
  //   // setErrorWithPersist(null, 'cancelJoinRequestError');
  //   // setErrorWithPersist(null, CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST);

  //   const formData = new FormData(e.currentTarget);

  //   try {
  //     const result = await cancelJoinRequestAction(formData);
      
  //     if (result && !result.success) {
  //       //  setErrorWithPersist(result.error || 'Something went wrong cancelling request'); 
  //        // NEW: Persist to sessionStorage
  //       // setErrorWithPersist(result.error || 'Something went wrong', 'cancelJoinRequestError');
  //       // setErrorWithPersist(result.error || 'Something went wrong', CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST);
  //       setChapterError(CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST, result.error || 'Something went wrong');
  //     }
  //   } catch (error) {
  //     // console.log(error)
  //     if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
  //       console.log(error);
  //       // setErrorWithPersist('Something went wrong', 'cancelJoinRequestError');
  //       // setErrorWithPersist('Something went wrong', CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST);
  //       setChapterError(CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST, 'Something went wrong');
  //     }
  //   }
  // };

  // all of above replaced with these next 5 lines
  const handleCancelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // await executeCancelAction(cancelJoinRequestAction, { chapterSlug });
    // below forces errors for testing 
    await executeCancelAction(cancelJoinRequestAction, { chapterSlug: 'bad-slug' });
  };

  // Authenticated visitors and removed members - show join button
  if (userChapterMember.authVisitor || userChapterMember.removedMember) {
    return (
      <div className="space-y-2">
        <form onSubmit={handleJoinSubmit}> 
          {/* The new hook pattern doesn't use hidden inputs at all - it passes data directly as an object. */}
          {/* <input type="hidden" name="chapterSlug" value={chapterSlug} /> */}
          
          {/* <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
            <PlusCircle className="w-4 h-4 mr-2" />
            Join Chapter
          </Button> */}

          {/* above button replaced with new button that incorporates loading useState */}
          <Button 
            type="submit" 
            disabled={isJoining}
            className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {isJoining ? 'Joining...' : 'Join Chapter'}
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

        {/* {error && (
        <p className="text-red-600 text-sm">{error}</p>
        )} */}

        <p className="text-orange-600 text-sm">
          Request pending approval from organizers
        </p>
        <form onSubmit={handleCancelSubmit}> 
          {/* The new hook pattern doesn't use hidden inputs at all - it passes data directly as an object. */}
          {/* <input type="hidden" name="chapterSlug" value={chapterSlug} />   */}

          {/* <Button type="submit" variant="outline" className="h-10 px-6 text-base">
            <X className="w-4 h-4 mr-2" />
            Cancel Request
          </Button> */}
          
          {/* above button replaced with new button that incorporates loading useState */}
          <Button 
            type="submit" 
            variant="outline" 
            disabled={isCancelling}
            className="h-10 px-6 text-base"
          >
            <X className="w-4 h-4 mr-2" />
            {isCancelling ? 'Cancelling...' : 'Cancel Request'}
          </Button>

        </form>
      </div>
    );
  }

  return null;
}