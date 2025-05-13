// app/types/forms/rawUserProfileInputType.ts
// this entire file purely for testing backend api; it is not intended for production use

export type RawUserProfileInputType = {
    givenName: string;
    familyName: string;
    altNickname: string | null;
    altEmail: string | null;
    phone: string | null;
    slugVanity: string | null;
  };
  