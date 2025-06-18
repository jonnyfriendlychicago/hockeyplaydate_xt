// lib/auth0.ts
// this file created per Auth0 documentation: https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0

// below is *clean* updated draft to catch authentication error, using CG dialogue, embracing nextjs cookies.  

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
// import { cookies } from "next/headers"; 

type OAuth2Error = {
  name?: string;
  code?: string;
  message?: string;
};
  
export const auth0 = new Auth0Client({
  async onCallback(error) {
    // 101: sections below use NextResponse, which requires full URL; redirect from 'next/navigation' (which we've used elsewhere) does not.  That's why below we begin building the URLs we'll redirect to.
    const baseUrl = process.env.APP_BASE_URL;
    if (!baseUrl) throw new Error("APP_BASE_URL is not defined");

    if (error) {
      if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("auth0.ts >> Auth0 login error:", error);


      // let errorCode = errorCause?.code || error.code || "unknown_error"; 
      // let email = "";
      // let userId = "";
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
          // email = errorCauseMsg.match(/email:([^|]+)/)?.[1] || "";
          // userId = errorCauseMsg.match(/user_id:(.+)$/)?.[1] || "";
          const emailMatch = errorCauseMsg.match(/email:([^|]+)/);
          // const userIdMatch = errorCauseMsg.match(/user_id:([^|]+)/); // next line allows for the fact that auth0 uses the pipe characters
          const userIdMatch = errorCauseMsg.match(/user_id:(.+)$/);
          emailParam = emailMatch?.[1] || "";
          userIdParam = userIdMatch?.[1] || "";
      } 

    else {
      errorCode = errorCause?.code || error.code || "unknown_error";
  }
        
      // // Set cookie for use on /login_error page (use JSON to encode)
      // const errorData = { errorCode, email, userId };
      // cookies().set("login_error_data", JSON.stringify({ errorData }), {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "lax",
      //   maxAge: 60, // 1 minute
      //   path: "/login_error", 
      // });

      const redirectUrl = new URL(`/login_error`, baseUrl);
      redirectUrl.searchParams.set("error", errorCode);

      if (emailParam) redirectUrl.searchParams.set("email", emailParam);
      if (userIdParam) redirectUrl.searchParams.set("user_id", userIdParam);

      return NextResponse.redirect(redirectUrl);
    }

    // below: if NO error.... 
    return NextResponse.redirect(new URL("/", baseUrl)); // this is place to indicate: redirect authenticated users to the /dashboard or other.  right now, / just sends auth'ed user to homepage
  },
});

// below is updated draft to catch authentication error, using CG dialogue, embracing nextjs cookies.  same as above, except below is a mess.

// import { Auth0Client } from "@auth0/nextjs-auth0/server";
// import { NextResponse } from "next/server";
// // import { getSession, updateSession } from "@auth0/nextjs-auth0"; // this is bogus, there's no authentication on error, so no session
// import { cookies } from "next/headers"; // new approach: use nextjs framework

// type OAuth2Error = {
//   name?: string;
//   code?: string;
//   message?: string;
// };
  
// export const auth0 = new Auth0Client({
//   async onCallback(error) {
//     // async onCallback(error, context, session) { // this is bogus, there's no authentication on error, so no session 
//     // 101: sections below use NextResponse, which requires full URL; redirect from 'next/navigation' (which we've used elsewhere) does not.  That's why below we begin building the URLs we'll redirect to.
//     const baseUrl = process.env.APP_BASE_URL;
//     if (!baseUrl) throw new Error("APP_BASE_URL is not defined");

//     if (error) {
//       if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.error("auth0.ts >> Auth0 login error:", error);

//       // let errorCode = "unknown_error";
//       // let emailParam = "";
//       // let userIdParam = "";
//       // let email = ""; // // this is bogus, there's no authentication on error, so no session
//       // let userId = ""; // 

//       const errorCause = error.cause as OAuth2Error | undefined;
//       const errorCauseMsg = errorCause?.message || "";

//       let errorCode = errorCause?.code || error.code || "unknown_error"; // new approach: use nextjs framework
//       let email = "";
//       let userId = "";

//       if (
//           errorCause?.code === "access_denied" &&
//           errorCauseMsg.startsWith("email_verified:false")
//       ) {
//           errorCode = "unverified_email";
//           // const emailMatch = errorCauseMsg.match(/email:([^|]+)/);
//           // // const userIdMatch = errorCauseMsg.match(/user_id:([^|]+)/); // next line allows for the fact that auth0 uses the pipe characters
//           // const userIdMatch = errorCauseMsg.match(/user_id:(.+)$/);
          
//           // emailParam = emailMatch?.[1] || "";
//           // userIdParam = userIdMatch?.[1] || "";
//           // email = emailMatch?.[1] || ""; // // this is bogus, there's no authentication on error, so no session
//           // userId = userIdMatch?.[1] || ""; // 

//           email = errorCauseMsg.match(/email:([^|]+)/)?.[1] || "";
//           userId = errorCauseMsg.match(/user_id:(.+)$/)?.[1] || "";


//             // Set cookie (use JSON to encode)
//           cookies().set("login_error_data", JSON.stringify({ errorCode, email, userId }), {
//             httpOnly: true,
//             secure: true,
//             sameSite: "lax",
//             maxAge: 60, // 1 minute
//             path: "/login_error"
//       });

//       } else {
//           errorCode = errorCause?.code || error.code || "unknown_error";
//       }

    

//       //  // Store values in session 
//       //  const updatedSession = { // this is bogus, there's no authentication on error, so no session
//       //   ...session,
//       //   errorData: {
//       //     errorCode,
//       //     email,
//       //     userId,
//       //   },
//       // };

//       // await updateSession(updatedSession); // this is bogus, there's no authentication on error, so no session

//       const redirectUrl = new URL(`/login_error`, baseUrl);
//       redirectUrl.searchParams.set("error", errorCode);
//       // if (emailParam) redirectUrl.searchParams.set("email", emailParam);
//       // if (userIdParam) redirectUrl.searchParams.set("user_id", userIdParam);

//       return NextResponse.redirect(redirectUrl);

//     }

//     // below: if NO error.... 
//     return NextResponse.redirect(new URL("/", baseUrl));
//   },
// });
  
  
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

  



