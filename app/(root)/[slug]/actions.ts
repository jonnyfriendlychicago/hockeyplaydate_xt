// app/(root)/[slug]/actions.ts 
// devNotes: this file referenced by the forms on the JoinChapterButton component, as well as other chapter components.

'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus'
import { chapterSlugSchema, updateMemberRoleSchema
} from '@/lib/validation/chapterMembershipValSchema';

// **********************************
// joinChapterAction
// **********************************
// export type ActionState = {
//   success: boolean;
//   error?: string;
// };

export async function joinChapterAction(formData: FormData) {
  // const chapterSlug = formData.get('chapterSlug') as string
  // above replaced by the parseResult section below

// above replaced by below to embarce useStateForm
// export async function joinChapterAction(
//   prevState: ActionState,
//   formData: FormData
// ): Promise<ActionState> {
  try {

    // Right at the start of the try block:
    // console.log('[Action] joinChapterAction called');

    // 0 - validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
        redirect('/api/auth/login')
    }

    // 1 - Parse and validate input FIRST, before any other operations
    const parseResult = chapterSlugSchema.safeParse({
      chapterSlug: formData.get('chapterSlug')
    });

    if (!parseResult.success) {
      console.log('[Action] Validation failed, returning error');
      return {
        success: false,
        error: 'Invalid request data'
      };
      // return {
      //   success: false,
      //   error: 'Invalid request data'
      // } as ActionState;  // ADD this type assertion

      // const errorState: ActionState = {
      //   success: false,
      //   error: 'Invalid request data'
      // };
      // console.log('[Action] Returning:', errorState);  // Add this to debug
      // return errorState;
    }

    const { chapterSlug } = parseResult.data;

    // 2 - validate chapter 
    // const chapterSlug = formData.get('chapterSlug') as string

    const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug }
    })

    if (!chapter) {
    throw new Error('Chapter not found')
    }

    // 3 - validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    const canJoin = userStatus.authVisitor || userStatus.removedMember
    if (!canJoin) {
      throw new Error('Invalid action for current membership status')
    }

    // 4 - Set up time/count variables 
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const existingWindowStart = userStatus.membership?.joinRequestWindowStart;
    const existingCount = userStatus.membership?.joinRequestCount || 0;

    const newWindowStart = (!existingWindowStart || existingWindowStart < twentyFourHoursAgo) 
      ? now  // if no existing value, or existing is too long ago, reset as now.
      : existingWindowStart; // else, leave as-was windowStart value alone.

    const newCount = (!existingWindowStart || existingWindowStart < twentyFourHoursAgo) 
    ? 1 // if no existing window start value, or existing is too long ago, reset the count as 1, i.e., first join request
    : existingCount + 1; // else, up-count the value by 1.  yes, this might mean that 'newCount' is greater than our max allowed attempts; this is validated in next step

    // 5 - validate join attempt counts

          // if (newCount >3 ) {
          //   throw new Error('Too many join requests. Please try again in 24 hours.');
          // }

    // devNotes: 
    //  Server actions that throw errors (like code above) result in red/black/grey Next.js error screens shown to end users. yikes. 
    //  Instead, use error states instead of throwing errors; catch errors and return them gracefully to the UI, like below. 

    if (newCount > 100) { // change this to a number >3 if ever needed for testing/troubleshooting
        return { 
          success: false, 
          error: 'Too many join requests. Please try again in 24 hours.' 
        };
      }

    // 6 - Run the update/insert, including newWindowStart and newCount values derived above
    if (userStatus.removedMember && userStatus.membership) {
      await prisma.chapterMember.update({
        where: { id: userStatus.membership.id },
        data: {
          memberRole: 'APPLICANT',
          joinRequestWindowStart: newWindowStart,
          joinRequestCount: newCount, 
          updatedBy: authenticatedUserProfile.id,
        }
      });
    } else {
      // Create new record for first-time joiner
      await prisma.chapterMember.create({
        data: {
          chapterId: chapter.id,
          userProfileId: authenticatedUserProfile.id,
          memberRole: 'APPLICANT',
          joinRequestWindowStart: newWindowStart,
          joinRequestCount: newCount, 
          updatedBy: authenticatedUserProfile.id,
        }
      });
    }

    revalidatePath(`/${chapterSlug}`)
    redirect(`/${chapterSlug}`)
      
  } catch (error) {

    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;  // Re-throw redirects
    }
    console.error('Join chapter error:', error)
    return { 
      success: false, 
      error: 'Unable to join chapter. Please try again.'
    };
  }

} // end joinChapterAction

// **********************************
// cancelJoinRequestAction
// **********************************

export async function cancelJoinRequestAction(formData: FormData) {
  // const chapterSlug = formData.get('chapterSlug') as string
  // above replaced by the parseResult section below

// export async function cancelJoinRequestAction(
//   prevState: ActionState,
//   formData: FormData
// ): Promise<ActionState> {
  try {
    // 0 - validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/api/auth/login')
    }

    // 1 - Parse and validate input FIRST, before any other operations
    const parseResult = chapterSlugSchema.safeParse({
      chapterSlug: formData.get('chapterSlug')
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: 'Invalid request data'
      };
    }

    const { chapterSlug } = parseResult.data;
    
    // 2 - validate chapter 
    const chapter = await prisma.chapter.findUnique({
      where: { slug: chapterSlug }
    })

    if (!chapter) {
      // throw new Error('Chapter not found')
      // Don't leak information about chapter existence
      return {
        success: false,
        error: 'Unable to process request'
      };
    }

    // 3 - validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    if (!userStatus.applicant) {
      // throw new Error('Invalid action for current membership status')
      // Don't leak membership status details
      return {
        success: false,
        error: 'Unable to process request'
      };
    }

    // 4 - Run the update/insert, including newWindowStart and newCount values derived above
    await prisma.chapterMember.update({
      where: { id: userStatus.membership!.id },
      data: {
        memberRole: 'REMOVED',
        updatedBy: authenticatedUserProfile.id
      }
    })

    revalidatePath(`/${chapterSlug}`)
    redirect(`/${chapterSlug}`)
    
  } catch (error) {

    // Handle redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Cancel join error:', error);
    return { 
      success: false, 
      error: 'Unable to cancel request'
    };
  }

} // end cancelJoinRequestAction

// **********************************
// leaveChapterAction
// **********************************

export async function leaveChapterAction(formData: FormData) {
  try {
  
    // 0 - validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/api/auth/login')
    }

    // 1 - Parse and validate input FIRST, before any other operations
    const parseResult = chapterSlugSchema.safeParse({
      chapterSlug: formData.get('chapterSlug')
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: 'Invalid request data'
      };
    }

    const { chapterSlug } = parseResult.data;

    // 2 - validate chapter 
    const chapter = await prisma.chapter.findUnique({
      where: { slug: chapterSlug }
    })

    if (!chapter) {
      throw new Error('Chapter not found')
    }

    // 3 - validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    if (!userStatus.membership) {
      throw new Error('You are not a member of this chapter')
    }

    // 4 - Prevent sole manager from leaving
    if (userStatus.mgrMember) {
      const managerCount = await prisma.chapterMember.count({
        where: {
          chapterId: chapter.id,
          memberRole: 'MANAGER'
        }
      });

      // if (managerCount === 1) {
      //   throw new Error('Cannot leave - you are the only manager. Promote another member first.')
      // }
      if (managerCount === 1) {
        // Return error instead of throwing
        return {
          success: false,
          error: 'Cannot leave - you are the only manager. Promote another member first.'
        }
      }
    }

    // 5 - Update to REMOVED
    await prisma.chapterMember.update({
      where: { id: userStatus.membership.id },
      data: {
        memberRole: 'REMOVED',
        updatedBy: authenticatedUserProfile.id
      }
    })

    revalidatePath(`/${chapterSlug}`)
    redirect(`/${chapterSlug}`)

  } catch (error) {
    // Handle redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Leave chapter error:', error);
    return { 
      success: false, 
      error: 'Unable to leave chapter. Please try again.'
    };
  }

} // end leaveChapterAction

// **********************************
// updateMemberRoleAction
// **********************************

export async function updateMemberRoleAction(formData: FormData) {

  // 2025oct07: reminder for self: update program so we have a single designated owner for each chapter, who is the only person that can manage the managers.  
  
  try {
    // 0 - validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/api/auth/login')
    }

    // 1 - Parse and validate ALL inputs
    const parseResult = updateMemberRoleSchema.safeParse({
      chapterSlug: formData.get('chapterSlug'),
      chapterMemberId: formData.get('chapterMemberId'),
      newRole: formData.get('newRole')
    });

    if (!parseResult.success) {
      return {
        success: false,
        error: 'Invalid request data'
      };
    }

    const { chapterSlug, chapterMemberId, newRole } = parseResult.data; // Note: chapterMemberId is now a number thanks to .transform(Number) in schema

    // 2 - validate chapter 
    // const chapterSlug = formData.get('chapterSlug') as string
    const chapter = await prisma.chapter.findUnique({
      where: { slug: chapterSlug }
    })
    
    if (!chapter) {
      throw new Error('Chapter not found')
    }
    
    // 3 - validate user, part 2: requisite chapterMember permissions? 
    const actingUserStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)
    
    if (!actingUserStatus.mgrMember) {
      throw new Error('Only managers can update member roles')
    }
    
    // 4 - validate chapterMember exists
    // const chapterMemberId = parseInt(formData.get('chapterMemberId') as string)
    const targetMember = await prisma.chapterMember.findUnique({
      where: { id: chapterMemberId }
    })

    if (!targetMember) {
      throw new Error('Member not found')
    }

    // 5 - prevent self-management
    
    // 2025oct01: 
    // for sanity, only action we want managers taking on themselves is leaving group (if chapterMembership data pattern for the chapter allows that)
    // don't allow members to set themselves to blocked, removed, or back to member.  Makes better sense for that to be handled by other person, i.e. owner.  
    // allowing managers to affect themselves seems to be very error prone.  

    if (targetMember.userProfileId === authenticatedUserProfile.id) {
      // throw new Error('You cannot manage your own membership')
      return {
              success: false,
              error: 'You cannot manage your own membership'
            }
    }

    // x - validate newRole is valid
    // const newRole = formData.get('newRole') as string

    // const validRoles = ['MEMBER', 'MANAGER', 'BLOCKED', 'REMOVED']
    // if (!validRoles.includes(newRole)) {
    //   throw new Error('Invalid role')
    // }

    // 6 - validation passed: update the chapterMember record
    await prisma.chapterMember.update({
      where: { id: chapterMemberId },
      data: {
        memberRole: newRole , // as 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED',
        updatedBy: authenticatedUserProfile.id, 
        joinRequestWindowStart: null, 
        joinRequestCount: 0
      }
    })

    revalidatePath(`/${chapterSlug}`)
    redirect(`/${chapterSlug}`)

  } catch (error) {
  // Handle redirect errors
  if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
    throw error;
  }
  
  console.error('Update member role error:', error);
  return { 
    success: false, 
    error: 'Unable to update member role. Please try again.'
  };
}
}

