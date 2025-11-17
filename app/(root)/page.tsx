// app/(root)/page.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0

import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';

// devNotes: the key word 'default' below is required for Next.js page components, i.e. page.tsx
export default async function Home() {
  // // Fetch the user session
  // const session = await auth0.getSession();

  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
  const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  if (!authenticatedUserProfile) {
    return (
      <main>
       <h1>Hello!</h1>
       <h2>We are going to completely overhaul this page to be the true corporate home page of hockeyplaydate.com</h2>
      </main>
    );
  }

  return ( 
    <main>
    <h1>Hello!</h1>
    <h2>We are going to completely overhaul this page to be the true corporate home page of hockeyplaydate.com</h2>
   </main>
    
  );
}
