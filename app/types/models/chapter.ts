// app/types/models/chapter.ts

export interface ChapterWithData {
  id: number;
  name: string | null;
  description: string | null;
  slug: string;
  createdAt: Date;
  _count: {
    members: number;
    events: number;
  };
  members: Array<{
    id: number;
    memberRole: string;
    userProfile: {
      givenName: string | null;
      familyName: string | null;
    };
  }>;
  events: Array<{
    id: number;
    startsAt: Date | null;
  }>;
  userMembership?: {
    id: number;
    memberRole: string;
  } | null;
}