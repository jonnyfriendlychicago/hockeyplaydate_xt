// components/chapter/JoinChapterButton.tsx 

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { joinChapterAction, cancelJoinRequestAction 
  // , type ActionState
} from '@/app/(root)/[slug]/actions';
// import { useEffect } from 'react';
// import { useFormState } from 'react-dom';

// devNotes 2025oct20: 
// Below using useStateForm. This works for now, but it's a target for future maintenance. 
// - useFormState is being phased out
// - useActionState is the current recommended approach
// - They work almost identically - just a name change and minor API improvements
// useActionState requires React 19 (currently in RC)
// this app currently uses React 18 and Next.js 14,some must embrace use useFormState. 
// When we upgrade to React 19,  simply change:
// import { useActionState } from 'react';  // Instead of useFormState from 'react-dom'
// The API is nearly identical, so the migration will be trivial when the time comes.

interface JoinChapterButtonProps {
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
}

export function JoinChapterButton({ 
  userChapterMember, 
  chapterSlug 
}: JoinChapterButtonProps) {

  // const [error, setError] = useState<string | null>(null);
  // console.log('Component rendering, current error state:', error); // ADD THIS\
  
  // sessionStorage workaround to step re-redendering
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('joinChapterError');
      if (saved) {
        sessionStorage.removeItem('joinChapterError'); // Clear after reading
        return saved;
      }
    }
    return null;
  });

  const setErrorWithPersist = (value: string | null) => {
    setError(value);
    if (typeof window !== 'undefined') {
      if (value) {
        sessionStorage.setItem('joinChapterError', value);
      } else {
        sessionStorage.removeItem('joinChapterError');
      }
    }
  };

    // Add this to detect unmounting
  // useEffect(() => {
  //   console.log('JoinChapterButton mounted');
  //   return () => {
  //     console.log('JoinChapterButton unmounting!');
  //   };
  // }, []);
  
  // Also log prop changes
  // useEffect(() => {
  //   // console.log('Props changed - userChapterMember:', userChapterMember);
  // }, [userChapterMember]);
  
  // below is all new for useFormState
  // Initial state - no error
  // const initialState: ActionState = { success: true };
  // const initialState: ActionState = { success: true, error: undefined };
  
  // useFormState for join action
  // const [joinState, joinFormAction] = useFormState(
  //   joinChapterAction, 
  //   initialState
  // );
  
  // console.log('JoinState:', joinState); // ADD THIS

  // useFormState for cancel action  
  // const [cancelState, cancelFormAction] = useFormState(
  //   cancelJoinRequestAction,
  //   initialState
  // );

  // console.log('CancelState:', cancelState); // ADD THIS

  // Determine which state to show based on which form we're showing
  // const currentError = userChapterMember.applicant ? cancelState.error : joinState.error;

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
          Login/signup to Join Chapter
        </Button>
      </Link>
    );
  }

  // Both handleJoinSubmit and handleCancelSubmit are completely gone. All that logic is now handled by the framework through useFormState
  const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // const handleJoinSubmit = async (formData: FormData) => {
    e.preventDefault(); // ADD THIS - prevent default form submission
    // console.log('Form submitted - setting error to null'); // ADD THIS

    setErrorWithPersist(null); // Changed

    // setError(null);

    const formData = new FormData(e.currentTarget); // Get formData from the form

    try {
      // console.log('Calling joinChapterAction...'); // ADD THIS
      const result = await joinChapterAction(formData);
      
      // If we get here, it means the action returned an error (didn't redirect)
      // console.log('Action result:', result); // ADD THIS
      if (result && !result.success) {
        // console.log('Setting error:', result.error); // ADD THIS
        // setError(result.error || 'Something went wrong');
        setErrorWithPersist(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.log('Caught error:', error);
      // Redirect throws - this is expected, let it happen
      // Only catch real errors
    }
  };

  // const handleCancelSubmit = async (formData: FormData) => {
  const handleCancelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // setError(null);
    setErrorWithPersist(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await cancelJoinRequestAction(formData);
      
      // If we get here, it means the action returned an error (didn't redirect)
      if (result && !result.success) {
        // setError(result.error || 'Something went wrong cancelling request');
         setErrorWithPersist(result.error || 'Something went wrong cancelling request'); 
      }
    } catch (error) {
      console.log(error)
      // Redirect throws - this is expected, let it happen
      // Only catch real errors
    }
  };

  // Authenticated visitors and removed members - show join button
  if (userChapterMember.authVisitor || userChapterMember.removedMember) {
    return (
      <div className="space-y-2">
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {/* {joinState.error && (
          <p className="text-red-600 text-sm">{joinState.error}</p>
        )} */}

        {/* <form action={handleJoinSubmit}> */}
        <form onSubmit={handleJoinSubmit}> 
        {/* <form action={joinFormAction}> */}
          <input type="hidden" name="chapterSlug" value={chapterSlug} />
          {/* below: temporary bogus values for backend testing */}
          {/* <input type="hidden" name="chapterSlug" value="BAD-SLUG!!!" />  */}
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

        {/* {error && (
          <p className="text-red-600 text-sm" data-test-error={error}>
            {error}
          </p>
        )} */}

        {/* {cancelState.error && (
          <p className="text-red-600 text-sm">{cancelState.error}</p>
        )} */}

        <p className="text-orange-600 text-sm">
          Request pending approval from organizers
        </p>
        {/* <form action={handleCancelSubmit}> */}
        {/* <form action={cancelJoinRequestAction}> */}
        <form onSubmit={handleCancelSubmit}> 
        {/* <form action={cancelFormAction}> */}
          <input type="hidden" name="chapterSlug" value={chapterSlug} />  
          {/* below: temporary bogus values for backend testing */}
          {/* <input type="hidden" name="chapterSlug" value="BAD-SLUG!!!" />  */}
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