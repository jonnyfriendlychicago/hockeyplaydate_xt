// lib/helpers/getUserDisplayName.ts

import type { UserProfile } from "@prisma/client";

export function getUserDisplayName(profile: Partial<Pick<UserProfile, "givenName" | "familyName">> | null): string {
  if (!profile) return "";

  const { givenName, familyName } = profile;

  if (givenName && familyName) return `${givenName} ${familyName}`;
  if (givenName) return givenName;
  if (familyName) return familyName;

  return "";
}

// old code from original page:
// authenticatedUserProfile?.givenName && authenticatedUserProfile?.familyName
//   ? `${authenticatedUserProfile.givenName} ${authenticatedUserProfile.familyName}`
//   : authenticatedUserProfile?.givenName
//   ? authenticatedUserProfile.givenName
//   : authenticatedUserProfile?.familyName
