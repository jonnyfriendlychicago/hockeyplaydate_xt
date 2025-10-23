// app/(root)/about/page.tsx

import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';

export default async function About() {

    // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
    const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

    console.log(authenticatedUserProfile)

    return ( 
        <main>
          <h1>About Page (Placeholder)</h1>
          <p>
            This is a placeholder page for what eventually will be the all-about-hockey-playdate page. <br/>
            As of now, envisioned that this page will display same content to Non-authenticated users and authenticatd users.  <br/>
            This will be the history, purpose, mission, guiding principles, etc. of hockey playdate, along with corporate structure info, etc. <br/>
            Will presumably also contain contact form, etc. 
            </p>
        </main>
      );
    } 