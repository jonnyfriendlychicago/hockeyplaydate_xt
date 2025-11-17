// app/(root)/event/[slug]/rsvpActions.ts
// devNotes: this file referenced by the forms on the rspv components on the event page.

'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus'
import { updateMyRsvpSchema } from '@/lib/validation/rsvpValSchema'
import { ActionResult, failure } from '@/lib/types/serverActionResults'
// import { RsvpStatus } from '@/lib/constants/rsvpEnums' 
import { RsvpStatus } from '@prisma/client';
// **************************
// 2025nov12: above enum is supposed to be deprecated; revisit this file and update so no longer being used. 
// **************************
import { updateMemberRsvpSchema } from '@/lib/validation/rsvpValSchema'

// **********************************
// updateMyRsvpAction
// **********************************

// devNote: this update action is actually an "upsert" function; titled 'update' b/c that's experience from EU perspective
export async function updateMyRsvpAction(formData: FormData): Promise<ActionResult> {
  try {
    // 0 - Validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/auth/login')
    }

    // 1 - Parse and validate-via-zod input; must occur before anything else
    const parseResult = updateMyRsvpSchema.safeParse({
      eventSlug: formData.get('eventSlug'),
      rsvpStatus: formData.get('rsvpStatus'),
      playersYouth: formData.get('playersYouth'),
      playersAdult: formData.get('playersAdult'),
      spectatorsAdult: formData.get('spectatorsAdult'),
      spectatorsYouth: formData.get('spectatorsYouth'),
    });

    if (!parseResult.success) {
      return failure('Rsvp error 01');
    }

    const { eventSlug, rsvpStatus, playersYouth, playersAdult, spectatorsAdult, spectatorsYouth } = parseResult.data;

    // 1.5 - ENFORCE: Zero out counts if status is not YES
    const finalCounts = rsvpStatus === RsvpStatus.YES ? {
      playersYouth,
      playersAdult,
      spectatorsAdult,
      spectatorsYouth
    } : {
      playersYouth: 0,
      playersAdult: 0,
      spectatorsAdult: 0,
      spectatorsYouth: 0
    };

    // 2 - Validate event exists
    const event = await prisma.event.findUnique({
      where: { presentableId: eventSlug },
      include: { chapter: true }
    })

    // note: event non-existence v. existence is NOT a public matter, so approp to have this be vague
    if (!event) {
      return failure('Rsvp error 02');
    }

    // 3 - Validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(event.chapter.id, authenticatedUserProfile)

    // Only MEMBER or MANAGER can RSVP
    const canRsvp = userStatus.genMember || userStatus.mgrMember

    if (!canRsvp) {
      return failure('Rsvp error 03');
    }

    // 4 - Check if RSVP record for this event + userProfile already exists
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: event.id,
        userProfileId: authenticatedUserProfile.id
      }
    });

    // 5 - Run the update/insert
    if (existingRsvp) {
      // Update existing RSVP
      await prisma.rsvp.update({
        where: { id: existingRsvp.id },
        data: {
          rsvpStatus,
          playersYouth: finalCounts.playersYouth,
          playersAdult: finalCounts.playersAdult,
          spectatorsAdult: finalCounts.spectatorsAdult,
          spectatorsYouth: finalCounts.spectatorsYouth,
          updatedBy: authenticatedUserProfile.id,
        }
      });
    } else {
      // Create new RSVP
      await prisma.rsvp.create({
        data: {
          eventId: event.id,
          userProfileId: authenticatedUserProfile.id,
          rsvpStatus,
          playersYouth: finalCounts.playersYouth,
          playersAdult: finalCounts.playersAdult,
          spectatorsAdult: finalCounts.spectatorsAdult,
          spectatorsYouth: finalCounts.spectatorsYouth,
          createdBy: authenticatedUserProfile.id,
          updatedBy: authenticatedUserProfile.id,
        }
      });
    }

    revalidatePath(`/event/${eventSlug}`)
    redirect(`/event/${eventSlug}`)
      
  } catch (error) {
    // Handle redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Log the actual error server-side for debugging
    console.error('Update RSVP error:', error);

    return failure('Unable to update RSVP. Please try again.');
  }
}

// Placeholder for updateMemberRsvpAction (Phase 4)

// **********************************
// updateMemberRsvpAction
// **********************************

export async function updateMemberRsvpAction(formData: FormData): Promise<ActionResult> {
  try {
    // 0 - Validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/auth/login')
    }

    // 1 - Parse and validate-via-zod input; must occur before anything else
    const parseResult = updateMemberRsvpSchema.safeParse({
      eventSlug: formData.get('eventSlug'),
      targetUserProfileId: formData.get('targetUserProfileId'),
      rsvpStatus: formData.get('rsvpStatus'),
      playersYouth: formData.get('playersYouth'),
      playersAdult: formData.get('playersAdult'),
      spectatorsAdult: formData.get('spectatorsAdult'),
      spectatorsYouth: formData.get('spectatorsYouth'),
    });

    if (!parseResult.success) {
      return failure('Rsvp error 01');
    }

    const { eventSlug, targetUserProfileId, rsvpStatus, playersYouth, playersAdult, spectatorsAdult, spectatorsYouth } = parseResult.data;

    // 1.5 - ENFORCE: Zero out counts if status is not YES
    const finalCounts = rsvpStatus === RsvpStatus.YES ? {
      playersYouth,
      playersAdult,
      spectatorsAdult,
      spectatorsYouth
    } : {
      playersYouth: 0,
      playersAdult: 0,
      spectatorsAdult: 0,
      spectatorsYouth: 0
    };

    // 2 - Validate event exists
    const event = await prisma.event.findUnique({
      where: { presentableId: eventSlug },
      include: { chapter: true }
    })

    if (!event) {
      return failure('Rsvp error 02');
    }

    // 3 - Validate requester has MANAGER permissions
    const requesterStatus = await getUserChapterStatus(event.chapter.id, authenticatedUserProfile)

    if (!requesterStatus.mgrMember) {
      return failure('Rsvp error 04');
    }

    // 4 - Validate target user exists and is MEMBER or MANAGER of this chapter
    const targetUserProfile = await prisma.userProfile.findUnique({
      where: { id: targetUserProfileId },
      select: { id: true, userId: true }
    });

    if (!targetUserProfile) {
      return failure('Rsvp error 05');
    }

    const targetStatus = await getUserChapterStatus(event.chapter.id, targetUserProfile);

    const canEditTargetRsvp = targetStatus.genMember || targetStatus.mgrMember;

    if (!canEditTargetRsvp) {
      return failure('Rsvp error 05');
    }

    // 5 - Check if RSVP record for this event + target user already exists
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: event.id,
        userProfileId: targetUserProfileId
      }
    });

    // 6 - Run the update/insert
    if (existingRsvp) {
      // Update existing RSVP
      await prisma.rsvp.update({
        where: { id: existingRsvp.id },
        data: {
          rsvpStatus,
          playersYouth: finalCounts.playersYouth,
          playersAdult: finalCounts.playersAdult,
          spectatorsAdult: finalCounts.spectatorsAdult,
          spectatorsYouth: finalCounts.spectatorsYouth,
          updatedBy: authenticatedUserProfile.id,
        }
      });
    } else {
      // Create new RSVP
      await prisma.rsvp.create({
        data: {
          eventId: event.id,
          userProfileId: targetUserProfileId,
          rsvpStatus,
          playersYouth: finalCounts.playersYouth,
          playersAdult: finalCounts.playersAdult,
          spectatorsAdult: finalCounts.spectatorsAdult,
          spectatorsYouth: finalCounts.spectatorsYouth,
          createdBy: authenticatedUserProfile.id,
          updatedBy: authenticatedUserProfile.id,
        }
      });
    }

    revalidatePath(`/event/${eventSlug}`)
    redirect(`/event/${eventSlug}`)
      
  } catch (error) {
    // Handle redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Log the actual error server-side for debugging
    console.error('Update member RSVP error:', error);

    return failure('Unable to update RSVP. Please try again.');
  }
}