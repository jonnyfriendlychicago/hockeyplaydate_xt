// app/(root)/[slug]/actions.ts 
// devNotes: this file refereced by the forms on the JoinChapterButton component

'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus'

export async function joinChapterAction(formData: FormData) {
  
    // 0 - Validate user, part 1: authenticated not-dupe user? 
    const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
    if (!authenticatedUserProfile) {
        redirect('/api/auth/login')
    }

    // bounce if duplicate user
    if (authenticatedUserProfile.authUser.duplicateOfId) {
        redirect('/')
    }

    // 1 - load chapter 
    const chapterSlug = formData.get('chapterSlug') as string
  
    const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug }
    })

    if (!chapter) {
    throw new Error('Chapter not found')
    }

    // 2 - Validate user, part 2: requisite chapterMember permissions? 
    const userStatus = await getUserChapterStatus(chapter.id, authenticatedUserProfile)

    const canJoin = userStatus.authVisitor || userStatus.removedMember
    if (!canJoin) {
      throw new Error('Invalid action for current membership status')
    }

    // 3 - Run the update/insert
    if (userStatus.removedMember) {
    // Update existing REMOVED record to APPLICANT
    await prisma.chapterMember.update({
        where: { id: userStatus.membership!.id },
        data: {
        memberRole: 'APPLICANT',
        updatedBy: authenticatedUserProfile.id
        }
    })
    } else {
    // Create new record for authVisitor
    await prisma.chapterMember.create({
        data: {
        chapterId: chapter.id,
        userProfileId: authenticatedUserProfile.id,
        memberRole: 'APPLICANT',
        updatedBy: authenticatedUserProfile.id
        }
    })
    }

    revalidatePath(`/${chapterSlug}`)
}

// 2025sep14: NOT touching below until above is 100%


export async function cancelJoinRequestAction(formData: FormData) {
  // Get authenticated user
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()
  if (!authenticatedUserProfile) {
    redirect('/api/auth/login')
  }

  // Redirect if duplicate user
  if (authenticatedUserProfile.authUser.duplicateOfId) {
    redirect('/')
  }

  const chapterSlug = formData.get('chapterSlug') as string
  
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
}