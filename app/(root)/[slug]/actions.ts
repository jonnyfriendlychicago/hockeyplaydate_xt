// app/(root)/[slug]/actions.ts 
// devNotes: this file referenced by the forms on the JoinChapterButton component, as well as other chapter components.

'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus'

// 2025oct07: every one of these server action functions needs to be remodeled as a 'try/else' just like joinChapterAction below.  
// this might be a necessary update on other functions in this app.  review all.  

export async function joinChapterAction(formData: FormData) {
  const chapterSlug = formData.get('chapterSlug') as string

  try {

    // 0 - validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
        redirect('/api/auth/login')
    }

    // bounce if duplicate user
    if (authenticatedUserProfile.authUser.duplicateOfId) {
        redirect('/')
    }

    // 1 - validate chapter 
    // const chapterSlug = formData.get('chapterSlug') as string

    const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug }
    })

    if (!chapter) {
    throw new Error('Chapter not found')
    }

    // 2 - validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    const canJoin = userStatus.authVisitor || userStatus.removedMember
    if (!canJoin) {
      throw new Error('Invalid action for current membership status')
    }

    // 3 Set up time/count variables 
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

    // 4 - validate join attempt counts

          // if (newCount >3 ) {
          //   throw new Error('Too many join requests. Please try again in 24 hours.');
          // }

    // devNotes: 
    //  Server actions that throw errors (like code above) result in red/black/grey Next.js error screens shown to end users. yikes. 
    //  Instead, use error states instead of throwing errors; catch errors and return them gracefully to the UI, like below. 

    if (newCount > 3) { // change this to a number >3 if ever needed for testing/troubleshooting
        return { 
          success: false, 
          error: 'Too many join requests. Please try again in 24 hours.' 
        };
      }

    // 5 - Run the update/insert, including newWindowStart and newCount values derived above
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
    // return { success: true };
    redirect(`/${chapterSlug}`)
      
  } catch (error) {

    // console.error('Join chapter error:', error)
    // return { 
    //   success: false, 
    //   error: 'Something went wrong action TS. Please try again.' 
    // };

    // above replaced by below

    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;  // Re-throw redirects
    }
    console.error('Join chapter error:', error)
    return { 
      success: false, 
      error: 'Something went wrong. Please try again. TS action join' 
    };
  }

  // const chapterSlug = formData.get('chapterSlug') as string
  // redirect(`/${chapterSlug}`)

} // end joinChapterAction

export async function cancelJoinRequestAction(formData: FormData) {
  const chapterSlug = formData.get('chapterSlug') as string

  try {

    // Get authenticated user
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/api/auth/login')
    }

    // Redirect if duplicate user
    if (authenticatedUserProfile.authUser.duplicateOfId) {
      redirect('/')
    }

    // const chapterSlug = formData.get('chapterSlug') as string
    
    // Get chapter by slug
    const chapter = await prisma.chapter.findUnique({
      where: { slug: chapterSlug }
    })

    if (!chapter) {
      throw new Error('Chapter not found')
    }

    // Check user's current status with this chapter
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    // Security check: Only allow cancel if user is currently an applicant
    if (!userStatus.applicant) {
      throw new Error('Invalid action for current membership status')
    }

    // Update to REMOVED
    await prisma.chapterMember.update({
      where: { id: userStatus.membership!.id },
      data: {
        memberRole: 'REMOVED',
        updatedBy: authenticatedUserProfile.id
      }
    })

    revalidatePath(`/${chapterSlug}`)
    // return { success: true };
    redirect(`/${chapterSlug}`)
    
  } catch (error) {

    // console.error('Cancel join error:', error);
    // return { 
    //   success: false, 
    //   error: 'Unable to cancel request'
    // };

    // below replaces above

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

export async function updateMemberRoleAction(formData: FormData) {

  // 2025oct07: reminder for self: update program so we have a single designated owner for each chapter, who is the only person that can manage the managers.  
  // 0 - validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
  if (!authenticatedUserProfile) {
    redirect('/api/auth/login')
  }

  // bounce if duplicate user
  if (authenticatedUserProfile.authUser.duplicateOfId) {
    redirect('/')
  }

  // 1 - validate chapter exists
  const chapterSlug = formData.get('chapterSlug') as string
  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug }
  })
  
  if (!chapter) {
    throw new Error('Chapter not found')
  }
  
  // 2 - verify acting user is a chapter manager
  const actingUserStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)
  
  if (!actingUserStatus.mgrMember) {
    throw new Error('Only managers can update member roles')
  }
  
  // 3 - validate chapterMember exists
  const chapterMemberId = parseInt(formData.get('chapterMemberId') as string)
  const targetMember = await prisma.chapterMember.findUnique({
    where: { id: chapterMemberId }
  })

  if (!targetMember) {
    throw new Error('Member not found')
  }

  // 4 - prevent self-management
  // 2025oct01: 
  // probably best to leave this here; we will soon have a self management module, 
  // which could theoretically use this same action, but right now, thinking that it's best
  // to have a separate self-manager server action that is laser focused on rules related to self-management: 
  // one button on the gui, with one valid funtion: set yourself as 'removed', which errors only if you are the owner of the chapter

  if (targetMember.userProfileId === authenticatedUserProfile.id) {
    throw new Error('You cannot manage your own membership')
  }

  // 5 - validate newRole is valid
  const newRole = formData.get('newRole') as string

  const validRoles = ['MEMBER', 'MANAGER', 'BLOCKED', 'REMOVED']
  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role')
  }

  // 6 - validation passed: update the chapterMember record
  await prisma.chapterMember.update({
    where: { id: chapterMemberId },
    data: {
      memberRole: newRole as 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED',
      updatedBy: authenticatedUserProfile.id, 
      joinRequestWindowStart: null, 
      joinRequestCount: 0
    }
  })

  revalidatePath(`/${chapterSlug}`)
}

export async function leaveChapterAction(formData: FormData) {
  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
  if (!authenticatedUserProfile) {
    redirect('/api/auth/login')
  }

  // Bounce if duplicate user
  if (authenticatedUserProfile.authUser.duplicateOfId) {
    redirect('/')
  }

  // 1 - Load chapter
  const chapterSlug = formData.get('chapterSlug') as string
  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug }
  })

  if (!chapter) {
    throw new Error('Chapter not found')
  }

  // 2 - Get user's membership
  const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

  if (!userStatus.membership) {
    throw new Error('You are not a member of this chapter')
  }

  // 3 - Prevent sole manager from leaving
  if (userStatus.mgrMember) {
    const managerCount = await prisma.chapterMember.count({
      where: {
        chapterId: chapter.id,
        memberRole: 'MANAGER'
      }
    });

    if (managerCount === 1) {
      throw new Error('Cannot leave - you are the only manager. Promote another member first.')
    }
  }

  // 4 - Update to REMOVED
  await prisma.chapterMember.update({
    where: { id: userStatus.membership.id },
    data: {
      memberRole: 'REMOVED',
      updatedBy: authenticatedUserProfile.id
    }
  })

  revalidatePath(`/${chapterSlug}`)
}