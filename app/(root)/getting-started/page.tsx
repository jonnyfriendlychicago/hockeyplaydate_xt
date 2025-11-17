// app/(root)/getting-started/page.tsx

import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';

// devNotes: the key word 'default' below is required for Next.js page components, i.e. page.tsx
export default async function GettingStarted() {

  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
    const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

    console.log(authenticatedUserProfile)

    return ( 
        <main>
          <h1>Getting Started Page (Placeholder)</h1>
          <p>
            This is a placeholder page for what eventually will be the production getting-started / intro page. <br/>
            As of now, envisioned that this page will display same content to Non-authenticated users and authenticatd users.  <br/>
            This page will explain the organization of the site/program, i.e. <br/>
            how everything starts with a group: 
            what is a group and who organizes it, and how to find a group and apply for group membership to get started.  can be a member of multiple groups, no prob<br/>
            how groups contain members, and how each user can only see other members who are members of the same group<br/>
            how groups sponsor playdates/events, and how each user can only see playdates/events that are sponsored by a group that the user is a member of<br/>
            Again, it all gets started by finding and applying to a playdate group. <br/>
            </p>
        </main>
      );
    } 