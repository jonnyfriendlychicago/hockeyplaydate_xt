// lib/auth0.ts
// this file created per Auth0 documentation: https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0

// below is updated draft to catch authentication error, using CG dialogue, embracing storage of error data in db

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

type OAuth2Error = {
  name?: string;
  code?: string;
  message?: string;
};
  
export const auth0 = new Auth0Client({
  async onCallback(error) {
    // 101: sections below use NextResponse, which requires full URL; redirect from 'next/navigation' (which we've used elsewhere) does not.  That's why below we begin building the URLs we'll redirect to.
    // 0 - establish base url and blow up  whole app flow blow up if env variable not available. 
    const baseUrl = process.env.APP_BASE_URL;
    if (!baseUrl) throw new Error("APP_BASE_URL is not defined"); 
    // case 1: hit error
    if (error) {
      // 1 - log this thing so we see what's up
      if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("auth0.ts >> Auth0 login error:", error);
      // 2 - establish some vars so we are ready to rock
      const errorCause = error.cause as OAuth2Error | undefined;
      const errorCauseMsg = errorCause?.message || "";
      let errorCode =  errorCause?.code || error.code || "unknown_error"; 
      const email = errorCauseMsg.match(/email:([^|]+)/)?.[1] || "";
      const auth0Id = errorCauseMsg.match(/user_id:(.+)$/)?.[1] || "";
      // 3 - update the errorCode if conditions met
      if (
          errorCause?.code === "access_denied" &&
          errorCauseMsg.startsWith("email_verified:false")
      ) {
          errorCode = "unverified_email";
      }
      // 4 & 5 -  Save login failure to DB (using API route), then Redirect using the presentableId (safe for URL)

      // try 1: we were trying to access a lib file, but that broke next rules, so nevermind: 
      // const record = await saveLoginFailure({ errorCode, email, auth0Id });
      
      // try 2: below worked great in dev, but might be source of explosion errors in prod

      // const response = await fetch(`${baseUrl}/api/login-error`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errorCode, email, auth0Id }),
      // });
      // const data = await response.json();
      
      // const redirectUrl = new URL(`/login-error/${data.presentableId}`, baseUrl);
      // return NextResponse.redirect(redirectUrl);
      // } 

      // try 3: CG says try this to resolve production explosion
      //   try {
      //     const response = await fetch(`${baseUrl}/api/login-error`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ errorCode, email, auth0Id }),
      //     });

      //     // try 3.1, below possible source of continued errors, relaced by below
      //     // const data = await response.json();
      //     // if (!response.ok || !data.presentableId) {
      //     //   throw new Error("login-error API call failed");
      //     // }
      //     // try 3.1: begin new code
      //     if (!response.ok) {
      //       const text = await response.text(); // helpful for debugging
      //       throw new Error(`login-error API failed: ${response.status} - ${text}`);
      //     }
          
      //     const data = await response.json();
          
      //     if (!data.presentableId) {throw new Error("Missing presentableId in API response");}
      //     // try 3.1: end new code

      //     return NextResponse.redirect(
      //       new URL(`/login-error/${data.presentableId}`, baseUrl)
      //     );
      //   } catch (e) {
      //     console.error("Failed to save login error to DB:", e);
      //     // fallback to generic error page
      //     const fallbackUrl = new URL(`/login_error?code=${errorCode}`, baseUrl);
      //     return NextResponse.redirect(fallbackUrl);
      //   }
      // }

      // try 4: claude says do this instead: forget the api file, just do it all here, but now we see: 
      // Auth0 callback is running in a client-side/browser context, not server-side where Prisma can run... so this won't work at all.  need to go back to fetch and debug it.
      // notably, we now (weeks later) think above comment about "running in a client-side/browser context" is dead-wrong, but moving on... 

      // Direct database operation instead of API call
        //   try {
        //     const { prisma } = await import('@/lib/prisma');
        //     const { nanoidAlphaNumeric8char } = await import('@/lib/idGenerators/alphanumeric8char');
            
        //     // Generate unique presentableId
        //     let presentableId: string;
        //     while (true) {
        //       const candidate = nanoidAlphaNumeric8char();
        //       const existing = await prisma.loginFailure.findUnique({
        //         where: { presentableId: candidate },
        //       });
        //       if (!existing) {
        //         presentableId = candidate;
        //         break;
        //       }
        //     }

        //     const record = await prisma.loginFailure.create({
        //       data: {
        //         presentableId,
        //         errorCode,
        //         email,
        //         auth0Id,
        //       },
        //     });

        //     return NextResponse.redirect(
        //       new URL(`/login-error/${record.presentableId}`, baseUrl)
        //     );
        //   } catch (e) {
        //     console.error("Failed to save login error to DB:", e);
        //     const fallbackUrl = new URL(`/login_error?code=${errorCode}`, baseUrl);
        //     return NextResponse.redirect(fallbackUrl);
        //   }
        // }

        // try 5: going back to fetch per claude, but with better logging and hopefully a determinable resolution.
        // this works in dev, but not in prod

        // 2025jul14: adding internal url to try to make this fetch work
        // Use internal URL for API calls, external URL for redirects
        const internalApiUrl = process.env.INTERNAL_API_BASE_URL || process.env.APP_BASE_URL;

        try {
        // console.log("About to call login-error API with baseUrl:", baseUrl); // Debug log
        console.log("About to call login-error API with baseUrl:", internalApiUrl); // Debug log
        
        // const response = await fetch(`${baseUrl}/api/login-error`, {
          const response = await fetch(`${internalApiUrl}/api/login-error`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorCode, email, auth0Id }),
        });

        console.log("API response status:", response.status); // Debug log
        
        if (!response.ok) {
          const text = await response.text();
          console.error("API response error:", text); // Debug log
          throw new Error(`login-error API failed: ${response.status} - ${text}`);
        }
        
        const data = await response.json();
        console.log("API response data:", data); // Debug log
        
        if (!data.presentableId) {
          throw new Error("Missing presentableId in API response");
        }

        const redirectUrl = new URL(`/login-error/${data.presentableId}`, baseUrl);
        console.log("Redirecting to:", redirectUrl.toString()); // Debug log
        return NextResponse.redirect(redirectUrl);
        
      } catch (e) {
        console.error("Failed to save login error to DB:", e);
        // fallback to generic error page
        // const fallbackUrl = new URL(`/login_error?code=${errorCode}`, baseUrl);
        // below replaced above, used new folder/page, so not so confusing.
        const fallbackUrl = new URL(`/login-exception?code=${errorCode}`, baseUrl);
        return NextResponse.redirect(fallbackUrl);
      }

      // try 6: per claude: The Prisma error you got earlier was likely due to bundling issues - Next.js sometimes bundles Prisma incorrectly for certain contexts, not because it's running client-side. Let's try the direct Prisma approach again, but with proper imports to avoid bundling issues:
        // result = get excpetion page, nothing created, this is dead-on-arrival
      // try {
      //   // Use dynamic imports to avoid bundling issues
      //   const { PrismaClient } = await import('@prisma/client');
      //   const { nanoidAlphaNumeric8char } = await import('@/lib/idGenerators/alphanumeric8char');
        
      //   const prisma = new PrismaClient();
        
      //   // Your existing presentableId generation logic
      //   let presentableId: string;
      //   while (true) {
      //     const candidate = nanoidAlphaNumeric8char();
      //     const existing = await prisma.loginFailure.findUnique({
      //       where: { presentableId: candidate },
      //     });
      //     if (!existing) {
      //       presentableId = candidate;
      //       break;
      //     }
      //   }

      //   const record = await prisma.loginFailure.create({
      //     data: { presentableId, errorCode, email, auth0Id },
      //   });

      //   await prisma.$disconnect();

      //   return NextResponse.redirect(new URL(`/login-error/${record.presentableId}`, baseUrl));
      // } catch (e) {
      //   console.error("Failed to save login error to DB:", e);
      //   const fallbackUrl = new URL(`/login-exception?code=${errorCode}`, baseUrl);
      //   return NextResponse.redirect(fallbackUrl);
      // }

      // try 7: Instead of trying to make Prisma work in the Auth0 callback, let's create a Server Action that definitely runs server-side:
      // ... and this totally fails, terminal reads: 
      // Server action error: [Error: PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in ``).
      // If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report]
      // Failed to save login error to DB: [Error: Server action failed]
      // try {
      // const { saveLoginError } = await import('@/lib/actions/saveLoginError');
      // const result = await saveLoginError(errorCode, email, auth0Id);
      
      // if (result.success && result.presentableId) {
      //   return NextResponse.redirect(new URL(`/login-error/${result.presentableId}`, baseUrl));
      // } else {
      //   throw new Error('Server action failed');
      // }
      // } catch (e) {
      //   console.error("Failed to save login error to DB:", e);
      //   const fallbackUrl = new URL(`/login-exception?code=${errorCode}`, baseUrl);
      //   return NextResponse.redirect(fallbackUrl);
      // }




}
    
    // case 2: No error (success!)
    return NextResponse.redirect(new URL("/", baseUrl)); // this is place to indicate: redirect authenticated users to the /dashboard or other.  right now, / just sends auth'ed user to homepage
  },
});

