// app/api/event/save/route.ts
// This function called by: components/Event/SaveEventBackendTestForm.tsx
// Handles both create and update operations based on presence of eventId
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { eventValSchema } from '@/lib/validation/eventValSchema';
import { ZodError } from 'zod';
import { createPresentableId } from '@/lib/idGenerators/createPresentableId';
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';

export async function POST(req: Request) {
  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull();
  // bounce if not authenticated
  if (!authenticatedUserProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // bounce if dupe user
  if (authenticatedUserProfile.authUser.duplicateOfId) {
    return NextResponse.json(
      { error: 'This duplicate user account cannot manage events.' },
      { status: 403 }
    );
  }

  // devNote: in order to create/manage an event, the user must also be a manager of the parent chapter.
  // We cannot check for that at this point in the file, b/c we yet don't have the parent chapter.
  // Thus, that step is further down. 

  // 1 - Parse request body and validate with Zod
  let parsed;
  let eventId;
  try {
    const body = await req.json();
    // Extract eventId and separate the rest (eventData0 for validation; unique to this route. 
    const { eventId: extractedEventId, ...eventData } = body;
    eventId = extractedEventId || null;
  
    // Validate the event data (without eventId)
    parsed = eventValSchema.parse(eventData);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 2 - backend validation
  // At present, we have no targeted backend validation, such as duplicate event names, etc.
  // This section reserved for such validation, should requirements arise

  // 3 - Check if this is an update operation, then validate essential update-event rules
  let existingEvent = null;
  if (eventId) {
    // valid eventId value?
    if (typeof eventId !== 'number') {
      return NextResponse.json({ error: 'Event ID must be a number' }, { status: 400 });
    }

    // event exists? 
    existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        chapter: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // chapter consistency? 
    if (parsed.chapterId !== existingEvent.chapterId) {
      return NextResponse.json(
        { error: 'Cannot move event to a different chapter' },
        { status: 400 }
      );
    }
  }

  // 4 - Validate user, part 2: requisite chapterMember permissions? 
  
  const userStatus = await getUserChapterStatus(parsed.chapterId, authenticatedUserProfile);

  if (!userStatus.mgrMember) {
    return NextResponse.json(
      { error: 'Only chapter managers can manage events' },
      { status: 403 }
    );
  }

  // 4 - Save the event (create or update)
  try {
    let savedEvent;

    if (existingEvent) {
      // UPDATE existing event
      savedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          title: parsed.title,
          description: parsed.description,
          placeId: parsed.placeId,
          venueName: parsed.venueName,
          address: parsed.address,
          lat: parsed.lat,
          lng: parsed.lng,
          bypassAddressValidation: parsed.bypassAddressValidation, 
          startsAt: parsed.startsAt,
          durationMin: parsed.durationMin,
          // Note: chapterId and presentableId are intentionally NOT updated
        },
        select: {
          id: true,
          presentableId: true,
          title: true,
          updatedAt: true,
          chapter: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
    } else {
      // CREATE new event
      const presentableId = await createPresentableId('event', 'presentableId', 10);

      savedEvent = await prisma.event.create({
        data: {
          presentableId,
          chapterId: parsed.chapterId,
          title: parsed.title,
          description: parsed.description,
          placeId: parsed.placeId,
          venueName: parsed.venueName,
          address: parsed.address,
          lat: parsed.lat,
          lng: parsed.lng,
          bypassAddressValidation: parsed.bypassAddressValidation, 
          startsAt: parsed.startsAt,
          durationMin: parsed.durationMin,
        },
        select: {
          id: true,
          presentableId: true,
          title: true,
          createdAt: true,
          chapter: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      event: savedEvent,
      isNew: !existingEvent,
    });

  } catch (error) {
    console.error('Failed to save event:', error);
    return NextResponse.json(
      { error: 'Failed to save event. Please try again.' },
      { status: 500 }
    );
  }
}