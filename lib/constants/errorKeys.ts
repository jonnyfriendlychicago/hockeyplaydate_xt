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

// Type for error key values
export type ChapterErrorKey = typeof CHAPTER_ERROR_KEYS[keyof typeof CHAPTER_ERROR_KEYS];

// User-friendly action descriptions for each error key; the quoted material is what displays to the user, make it whatever you want
export const ERROR_ACTION_DESCRIPTIONS: Record<ChapterErrorKey, string> = {
  [CHAPTER_ERROR_KEYS.JOIN_CHAPTER]: 'join the chapter COLTRANE',
  [CHAPTER_ERROR_KEYS.CANCEL_JOIN_REQUEST]: 'cancel your join request COLTRANE',
  [CHAPTER_ERROR_KEYS.LEAVE_CHAPTER]: 'leave the chapter COLTRANE',
  [CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT]: 'update user membership status COLTRANE',
};