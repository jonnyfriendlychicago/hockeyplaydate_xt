// lib/constants/errorKeys.ts

/**
 * Centralized error keys for chapter membership actions
 * Used for sessionStorage persistence and ChapterErrorDisplay
 */
export const CHAPTER_ERROR_KEYS = {
  JOIN_CHAPTER: 'joinChapterError',
  CANCEL_JOIN_REQUEST: 'cancelJoinRequestError',
  LEAVE_CHAPTER: 'leaveChapterError',
  MEMBER_MANAGEMENT: 'memberManagementError',
} as const;

/**
 * Centralized error keys for RSVP actions
 * Used for sessionStorage persistence and error display
 */
export const RSVP_ERROR_KEYS = {
  UPDATE_MY_RSVP: 'updateMyRsvpError',
  UPDATE_MEMBER_RSVP: 'updateMemberRsvpError',
} as const;

// Type for error key values
export type ChapterErrorKey = typeof CHAPTER_ERROR_KEYS[keyof typeof CHAPTER_ERROR_KEYS];

// Type for RSVP error key values
export type RsvpErrorKey = typeof RSVP_ERROR_KEYS[keyof typeof RSVP_ERROR_KEYS];

// User-friendly action descriptions for each error key; the quoted material is what displays to the user, make it whatever you want
export const ERROR_ACTION_DESCRIPTIONS: Record<ChapterErrorKey, string> = {
  [CHAPTER_ERROR_KEYS.JOIN_CHAPTER]: 'join the chapter',
  [CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST]: 'cancel your join request',
  [CHAPTER_ERROR_KEYS.LEAVE_CHAPTER]: 'leave the chapter',
  [CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT]: 'update user membership status',
};

// User-friendly action descriptions for RSVP errors
export const RSVP_ERROR_ACTION_DESCRIPTIONS: Record<RsvpErrorKey, string> = {
  [RSVP_ERROR_KEYS.UPDATE_MY_RSVP]: 'update your RSVP',
  [RSVP_ERROR_KEYS.UPDATE_MEMBER_RSVP]: 'update member RSVP',
};