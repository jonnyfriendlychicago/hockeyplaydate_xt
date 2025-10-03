// app/(root)/[slug]/actions.ts 
// devNotes: this file referenced by the forms on the JoinChapterButton component

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

export async function updateMemberRoleAction(formData: FormData) {
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

  // below is extraneous: already checked for value new role above; 
  // 6 - Business rule: cannot change back to APPLICANT
  // if (newRole === 'APPLICANT') {
  //   throw new Error('Cannot change member back to applicant status')
  // }

  // 6 - validation passed: update the chapterMember record
  await prisma.chapterMember.update({
    where: { id: chapterMemberId },
    data: {
      memberRole: newRole as 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED',
      updatedBy: authenticatedUserProfile.id
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