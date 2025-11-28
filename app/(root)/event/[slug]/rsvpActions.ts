// app/(root)/event/[slug]/rsvpActions.ts
// devNotes: this file referenced by the forms on the rspv components on the event page.

'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { RsvpStatus } from '@prisma/client';
import { ActionResult, failure } from '@/lib/types/serverActionResults'
import { createPresentableId } from '@/lib/idGenerators/createPresentableId';
import { updateMyRsvpSchema } from '@/lib/validation/rsvpValSchema'
import { updateMemberRsvpSchema } from '@/lib/validation/rsvpValSchema'
// import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'
// import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus'
import { getUserChapterMembership } from '@/lib/helpers/getUserChapterMembership'

// **********************************
// updateMyRsvpAction
// **********************************

// devNote: this update action is actually an "upsert" function; titled 'update' b/c that's experience from EU perspective
export async function updateMyRsvpAction(formData: FormData): Promise<ActionResult> {
  try {
    // 0 - Validate user, part 1: authenticated not-dupe user? 
    // const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    // if (!authenticatedUserProfile) {
    //   redirect('/auth/login')
    // }
    // above deprecated by implementation of getUserChapterMembership

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
          // const userStatus = await getUserChapterStatus(event.chapter.id, authenticatedUserProfile)

          // // Only MEMBER or MANAGER can RSVP
          // const canRsvp = userStatus.genMember || userStatus.mgrMember

          // if (!canRsvp) {
          //   return failure('Rsvp error 03');
          // }

    // above replaced by below, implementation of getUserChapterMembership
    const userChapterMember = await getUserChapterMembership(event.chapter.slug);

    // Must be authenticated
    if (userChapterMember.isAnonymous) {
      redirect('/auth/login');
    }

    // Only MEMBER or MANAGER can RSVP
    if (!userChapterMember.hasAccess) {
      return failure('Rsvp error 03');
    }

    // 4 - Get user profile for database operations
    const authenticatedUserProfile = await prisma.userProfile.findUnique({
      where: { slugDefault: userChapterMember.authenticatedUserSlug! },
      select: { id: true }
    });

    if (!authenticatedUserProfile) {
      return failure('Rsvp error 04');
    }

    // 5 - Check if RSVP record for this event + userProfile already exists
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: event.id,
        userProfileId: authenticatedUserProfile.id
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
      const rsvpPresentableId = await createPresentableId('rsvp', 'presentableId', 10);

      await prisma.rsvp.create({
        data: {
          presentableId: rsvpPresentableId, 
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

// **********************************
// updateMemberRsvpAction
// **********************************

export async function updateMemberRsvpAction(formData: FormData): Promise<ActionResult> {
  try {
    // 0 - Validate user, part 1: authenticated not-dupe user? 
        // const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
        // if (!authenticatedUserProfile) {
        //   redirect('/auth/login')
        // }
    // above deprecated by implementation of getUserChapterMembership

    // 1 - Parse and validate-via-zod input; must occur before anything else
    const parseResult = updateMemberRsvpSchema.safeParse({
      eventSlug: formData.get('eventSlug'),
      targetUserSlug: formData.get('targetUserSlug'),  
      rsvpStatus: formData.get('rsvpStatus'),
      playersYouth: formData.get('playersYouth'),
      playersAdult: formData.get('playersAdult'),
      spectatorsAdult: formData.get('spectatorsAdult'),
      spectatorsYouth: formData.get('spectatorsYouth'),
    });

    if (!parseResult.success) {
      return failure('Rsvp error 01');
    }

    const { eventSlug, targetUserSlug, rsvpStatus, playersYouth, playersAdult, spectatorsAdult, spectatorsYouth } = parseResult.data;

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
              // const requesterStatus = await getUserChapterStatus(event.chapter.id, authenticatedUserProfile)

              // if (!requesterStatus.mgrMember) {
              //   return failure('Rsvp error 04');
              // }

              // const requesterChapterMember = await getUserChapterMembership(event.chapter.slug);

              // if (requesterChapterMember.isAnonymous) {
              //   redirect('/auth/login');
              // }

              // if (!requesterChapterMember.isManager) {
              //   return failure('Rsvp error 03');
              // }

              // above deprecated by implementation of getUserChapterMembership
    const requesterChapterMember = await getUserChapterMembership(event.chapter.slug);

    if (requesterChapterMember.isAnonymous) {
      redirect('/auth/login');
    }

    if (!requesterChapterMember.isManager) {
      return failure('Rsvp error 03');
    }

    // 4 - Get requester's profile for database operations (updatedBy/createdBy)
    const requesterProfile = await prisma.userProfile.findUnique({
      where: { slugDefault: requesterChapterMember.authenticatedUserSlug! },
      select: { id: true }
    });

    if (!requesterProfile) {
      return failure('Rsvp error 04');
    }

    // 5 - Validate target user exists and is MEMBER or MANAGER of this chapter
    const targetUserProfile = await prisma.userProfile.findUnique({
      where: { slugDefault: targetUserSlug },
      // select: { id: true, userId: true }
      select: { id: true,  }
    });

    if (!targetUserProfile) {
      return failure('Rsvp error 05');
    }

          // const targetStatus = await getUserChapterStatus(event.chapter.id, targetUserProfile);
          // const canEditTargetRsvp = targetStatus.genMember || targetStatus.mgrMember;

          // if (!canEditTargetRsvp) {
          //   return failure('Rsvp error 05');
          // }

    // above deprecated by implementation of getUserChapterMembership

    const targetMembership = await prisma.chapterMember.findFirst({
      where: {
        userProfileId: targetUserProfile.id,
        chapterId: event.chapter.id,
        memberRole: { in: ['MEMBER', 'MANAGER'] }
      }
    });

    if (!targetMembership) {
      return failure('Rsvp error 06');
    }

    // 6 - Check if RSVP record for this event + target user already exists
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: event.id,
        userProfileId: targetUserProfile.id 
      }
    });

    // 7 - Run the update/insert
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
          // updatedBy: authenticatedUserProfile.id,
          updatedBy: requesterProfile.id,
        }
      });
    } else {
      // Create new RSVP
      const rsvpPresentableId = await createPresentableId('rsvp', 'presentableId', 10);

      await prisma.rsvp.create({
        data: {
          presentableId: rsvpPresentableId, 
          eventId: event.id,
          userProfileId: targetUserProfile.id,
          rsvpStatus,
          playersYouth: finalCounts.playersYouth,
          playersAdult: finalCounts.playersAdult,
          spectatorsAdult: finalCounts.spectatorsAdult,
          spectatorsYouth: finalCounts.spectatorsYouth,
          // createdBy: authenticatedUserProfile.id,
          // updatedBy: authenticatedUserProfile.id,
          createdBy: requesterProfile.id,
          updatedBy: requesterProfile.id,
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