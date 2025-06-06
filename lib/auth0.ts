// lib/auth0.ts
// this file created per Auth0 documentation: https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0


// 2025may29: below is original from Auth0 documentation: https://auth0.com/docs/quickstart/webapp/nextjs/interactive; 
            // import { Auth0Client } from "@auth0/nextjs-auth0/server";
            // // import { NextResponse } from "next/server";            
            // export const auth0 = new Auth0Client();

// below is initial draft to catch authentication error, using this resource: https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md#hooks

            // import { Auth0Client } from "@auth0/nextjs-auth0/server";
            // import { NextResponse } from "next/server";
            // export const auth0 = new Auth0Client({
            //     // async onCallback(error, context, session) {
            //         async onCallback(error, context, ) {
            //       // redirect the user to a custom error page
            //       if (error) {
            //         console.log(error) // note: this error object can be decoded, so if error.message = this, go to *this* page, and if = *that*, go to *that* page
            //         return NextResponse.redirect(
            //         //   new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
            //           new URL(`/login_error?error=${error.message}`, process.env.APP_BASE_URL)
            //           // Jonny! go create this login_error page, so it can show useful helpful stuff. 
            //           // oh, and update above to send error.cause to get that code
            //         )
            //       }
            
            //       // complete the redirect to the provided returnTo URL
            //       return NextResponse.redirect(
            //         new URL(context.returnTo || "/", process.env.APP_BASE_URL)
            //       )
            //     },
            //   })

  // below is updated draft to catch authentication error, using CG dialogue

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

  type OAuth2Error = {
    name?: string;
    code?: string;
    message?: string;
  };
  
export const auth0 = new Auth0Client({

async onCallback(error) {

    const baseUrl = process.env.APP_BASE_URL;
    if (!baseUrl) throw new Error("APP_BASE_URL is not defined");

    if (error) {
    console.error("Auth0 login error:", error);

    let errorCode = "unknown_error";
    let emailParam = "";
    let userIdParam = "";

    const errorCause = error.cause as OAuth2Error | undefined;
    const errorCauseMsg = errorCause?.message || "";

    if (
        errorCause?.code === "access_denied" &&
        errorCauseMsg.startsWith("email_verified:false")
    ) {
        errorCode = "unverified_email";
        const emailMatch = errorCauseMsg.match(/email:([^|]+)/);
        // const userIdMatch = errorCauseMsg.match(/user_id:([^|]+)/); // next line allows for the fact that auth0 uses the pipe characters
        const userIdMatch = errorCauseMsg.match(/user_id:(.+)$/);
        
        emailParam = emailMatch?.[1] || "";
        userIdParam = userIdMatch?.[1] || "";

    } else {
        errorCode = errorCause?.code || error.code || "unknown_error";
    }

    const redirectUrl = new URL(`/login_error`, baseUrl);
    redirectUrl.searchParams.set("error", errorCode);
    if (emailParam) redirectUrl.searchParams.set("email", emailParam);
    if (userIdParam) redirectUrl.searchParams.set("user_id", userIdParam);

    return NextResponse.redirect(redirectUrl);

    // // 101: below uses NextResponse, which requires full URL; redirect from 'next/navigation' (which we've used elsewhere) does not.  That's why below is
    // return NextResponse.redirect(
    //     // new URL(`/login_error?error=${encodeURIComponent(errorCode)}`, baseUrl) // this line replaced by below, which includes essential user values
    //     new URL(
    //       `/login_error?error=${encodeURIComponent(errorCode)}&email=${encodeURIComponent(emailParam)}&user_id=${encodeURIComponent(userIdParam)}`,
    //       baseUrl
    //     )
    // );
    
    }

    // below: if NO error.... 
    return NextResponse.redirect(
    // context.returnTo || "/"
    new URL("/", baseUrl)
    );
},
});
  
  



