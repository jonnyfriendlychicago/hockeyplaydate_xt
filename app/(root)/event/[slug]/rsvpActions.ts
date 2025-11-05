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
// import { RsvpStatus } from '@/lib/constants/rsvpEnums' // no use case for inclusion presently

// **********************************
// updateMyRsvpAction
// **********************************

// devNote: this update action is actually and upsert function
export async function updateMyRsvpAction(formData: FormData): Promise<ActionResult> {
  try {
    // 0 - Validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
      redirect('/auth/login')
    }

    // 1 - Parse and validate input FIRST, before any other operations
    const parseResult = updateMyRsvpSchema.safeParse({
      eventSlug: formData.get('eventSlug'),
      rsvpStatus: formData.get('rsvpStatus'),
      playersYouth: formData.get('playersYouth'),
      playersAdult: formData.get('playersAdult'),
      spectatorsAdult: formData.get('spectatorsAdult'),
      spectatorsYouth: formData.get('spectatorsYouth'),
    });

    if (!parseResult.success) {
      return failure('Invalid request data');
    }

    const { eventSlug, rsvpStatus, playersYouth, playersAdult, spectatorsAdult, spectatorsYouth } = parseResult.data;

    // 2 - Validate event exists
    const event = await prisma.event.findUnique({
      where: { presentableId: eventSlug },
      include: { chapter: true }
    })

    // note: event non-existence v. existence is NOT a public matter, so approp to have this be vague
    if (!event) {
      return failure('Unable to process request');
    }

    // 3 - Validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(event.chapter.id, authenticatedUserProfile)

    // Only MEMBER or MANAGER can RSVP
    const canRsvp = userStatus.genMember || userStatus.mgrMember

    if (!canRsvp) {
      return failure('Unable to process request');
    }

    // 4 - Check if RSVP record for this event + userProfile already exists
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: event.id,
        userProfileId: authenticatedUserProfile.id
      }
    });

    // 5 - Create or update RSVP record
    if (existingRsvp) {
      // Update existing RSVP
      await prisma.rsvp.update({
        where: { id: existingRsvp.id },
        data: {
          rsvpStatus,
          playersYouth,
          playersAdult,
          spectatorsAdult,
          spectatorsYouth,
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
          playersYouth,
          playersAdult,
          spectatorsAdult,
          spectatorsYouth,
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