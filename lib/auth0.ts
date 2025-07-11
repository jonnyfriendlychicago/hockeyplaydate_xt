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
      try {
        const response = await fetch(`${baseUrl}/api/login-error`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorCode, email, auth0Id }),
        });

        // try 3.1, below possible source of continued errors, relaced by below
        // const data = await response.json();
        // if (!response.ok || !data.presentableId) {
        //   throw new Error("login-error API call failed");
        // }
        // try 3.1: begin new code
        if (!response.ok) {
          const text = await response.text(); // helpful for debugging
          throw new Error(`login-error API failed: ${response.status} - ${text}`);
        }
        
        const data = await response.json();
        
        if (!data.presentableId) {throw new Error("Missing presentableId in API response");}
        // try 3.1: end new code

        return NextResponse.redirect(
          new URL(`/login-error/${data.presentableId}`, baseUrl)
        );
      } catch (e) {
        console.error("Failed to save login error to DB:", e);
        // fallback to generic error page
        const fallbackUrl = new URL(`/login_error?code=${errorCode}`, baseUrl);
        return NextResponse.redirect(fallbackUrl);
      }
    }

    // case 2: No error (success!)
    return NextResponse.redirect(new URL("/", baseUrl)); // this is place to indicate: redirect authenticated users to the /dashboard or other.  right now, / just sends auth'ed user to homepage
  },
});

