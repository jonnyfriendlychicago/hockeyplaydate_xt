// lib/auth0.ts
// this file was originally created per Auth0 documentation: https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0

// devNotes: (updated 2025aug08)
// auth0 authentication is handled by combination of the following essential files/configs:
// set-up on auth0.com >> tenant >> various fields/configs 
// npm i @auth0/nextjs-auth0: make sure this has been run at least once for the life of the project
// .env.local file (contains localized esssential auth0 variables)
// components/shared/header/menu.tsx (which contains sign-in button gui that points to url for auth0 universal login)
// components/shared/header/menuClient.tsx (same as above, but specially for mobile)
// middleware.ts (local auth0 config stuff: used to enforce authentication on specific routes)
// lib/auth0.ts (this file)
// app/api/auth0-callback/route.ts
// app/api/login-error/route.ts (called by above two files, if auth0 gives error response or auth0 gives custom email-not-verified redirect)
// app/(root)/login-error/[presentableId]/page.tsx (page user redirected to, if error response )
// app/(root)/login-exception/page.tsx (page user redirected to, if exception encountered )
// app/(root)/page.tsx (home page, which we redirect to if successful authentication; this could be a different page, btw)
// app/(root)/layout.tsx (generaly layout file for the application, which does really important stuff: 
// (1) invokes the syncUserFromAuth0 function, which creates/syncs authUser & userProfile records
// (2) displays (or not) omnipresent banners such as the dupe account banner and the nameProfile banner
// lib/syncUser.ts (contains the syncUserFromAuth0 function, referenced above)

// 2025jul: file extensively updated into below, which catches authentication errors, stores to db, and redirects end user to an explanation page. 
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
    // Step 0 - establish env-specific urls, and blow up the whole app flow if env variable not available. 
    const baseUrl = process.env.APP_BASE_URL;
    // 2025jul14: adding internal url below to try to make this fetch work; use internal URL for API calls, external URL for redirects
    const internalApiUrl = process.env.INTERNAL_API_BASE_URL || process.env.APP_BASE_URL;
    if (!baseUrl) throw new Error("APP_BASE_URL is not defined"); 
    if (!internalApiUrl) throw new Error("INTERNAL_API_BASE_URL is not defined"); 
    // case 1: hit error
    if (error) {
      // 1 - log this thing so we see what's up (in dev environment, obviously)
      if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("auth0.ts >> Auth0 login error:", error);
      // 2 - establish essentials variables for function
      const errorCause = error.cause as OAuth2Error | undefined;
      const errorCauseMsg = errorCause?.message || "";
      let errorCode =  errorCause?.code || error.code || "unknown_error"; 
      const email = errorCauseMsg.match(/email:([^|]+)/)?.[1] || "";
      const auth0Id = errorCauseMsg.match(/user_id:(.+)$/)?.[1] || "";
      // 3 - update the errorCode if conditions met; this is necessary b/c the unverified email status isn't explicitly included in auth0's incoming errorCode
      if (
          errorCause?.code === "access_denied" &&
          errorCauseMsg.startsWith("email_verified:false")
      ) {
          errorCode = "unverified_email";
      }
      // 4 & 5 -  Save login failure to DB (using API route), then Redirect using the presentableId (safe for URL)

      // 2025jul16: fyi, herein *were* 6 approaches to doing this step which failed; those have been deleted. What remains below is the one approach that worked. 
      
      try {
        if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.log("About to call login-error API with baseUrl:", internalApiUrl); // Debug log
        const response = await fetch(`${internalApiUrl}/api/login-error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorCode, email, auth0Id }),
        });

        if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.log("API response status:", response.status); // Debug log
      
        if (!response.ok) {
          const text = await response.text();
          if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("API response error:", text); // Debug log
          throw new Error(`login-error API failed: ${response.status} - ${text}`);
        }
      
        const data = await response.json();
        if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.log("API response data:", data); // Debug log
      
        if (!data.presentableId) {
          throw new Error("Missing presentableId in API response");
        }

        const redirectUrl = new URL(`/login-error/${data.presentableId}`, baseUrl);
        if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.log("Redirecting to:", redirectUrl.toString()); // Debug log
        return NextResponse.redirect(redirectUrl);
      
      } catch (e) {
        if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("Failed to save login error to DB:", e);
        // fallback to generic error page that we are calling "exception" as opposed to error
        const fallbackUrl = new URL(`/login-exception?code=${errorCode}`, baseUrl);
        return NextResponse.redirect(fallbackUrl);
      }
    }
    
    // case 2: No error (success!)
    return NextResponse.redirect(new URL("/", baseUrl)); // this is place to indicate: redirect authenticated users to the /dashboard or other.  right now, / just sends auth'ed user to homepage
  },
});

