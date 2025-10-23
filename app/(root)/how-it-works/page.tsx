// app/(root)/how-it-works/page.tsx

import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';

export default async function HowItWorks() {

  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
  const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  console.log(authenticatedUserProfile)

  return ( 
      <main>
        <h1>How It Works (Placeholder)</h1>
        <p>
          This is a placeholder page for what eventually will be the how-to page. <br/>
        </p>
      </main>
    );
} 