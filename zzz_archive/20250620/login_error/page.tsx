// // app/(root)/login_error/page.tsx

// import { AlertTriangle } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // npx shadcn@latest add alert
// import { Metadata } from "next";
// import { notFound } from "next/navigation";

// export const metadata: Metadata = {
//   title: "Email Verification Required",
// };

// interface Params {
//   searchParams: {
//     error?: string;
//     email?: string;
//     user_id?: string;
//   };
// }

// export default function LoginErrorPage({ searchParams }: Params) {
//   const { error, email, user_id } = searchParams;

//   if (!error) return notFound();

//   const safeEmail = decodeURIComponent(email ?? "");
//   const safeUserId = decodeURIComponent(user_id ?? "");

// if (error === "unverified_email") {
//     return (
//       <main className="max-w-xl mx-auto mt-20 px-4">
//         <Alert variant="destructive">
//           <AlertTriangle className="h-5 w-5" />
//           <AlertTitle>Email Verification Required</AlertTitle>
//           <AlertDescription className="mt-2 space-y-4">
//             <p>
//               Your account was created, but your email has not yet been verified. Please check your inbox for an email with verification link.
//             </p>
//             <p>
//               <strong>Email:</strong> {safeEmail || "Unknown"}<br />
//               <strong>User ID:</strong> {safeUserId || "Unknown"}
//             </p>
//             <p className="text-sm text-muted-foreground">
//             Can&apos;t find the email? This page will soon include a “Resend Verification Email” button.
//             </p>

//             {/* here actually create button, and have button have link/ref to cal the function */}

//           </AlertDescription>
//         </Alert>
//       </main>
//     );
//   }

//   return (
//     <main className="max-w-xl mx-auto mt-20 px-4">
//       <Alert variant="destructive">
//         <AlertTriangle className="h-5 w-5" />
//         <AlertTitle>Login Error</AlertTitle>
//         <AlertDescription className="mt-2 space-y-4">
//           <p>Something went wrong during login.</p>
//           <p className="text-sm text-muted-foreground">
//             Error code: <code>{error}</code>
//           </p>
//         </AlertDescription>
//       </Alert>
//     </main>
//   );
// }

// // export default function LoginErrorPage() {


//   // const cookieStore = cookies();
//   // const raw = cookieStore.get("login_error_data")?.value;

//   // if (!raw) return notFound();

//   // let errorCode = "unknown_error";
//   // let email = "";
//   // let userId = "";

//   // try {
//   //   const parsed = JSON.parse(raw);
//   //   errorCode = parsed.errorCode || "unknown_error";
//   //   email = parsed.email || "";
//   //   userId = parsed.userId || "";
//   // } catch (err) {
//   //   console.error("Invalid cookie data on /login_error:", err);
//   //   return notFound();
//   // }

//   // // Optionally clear the cookie immediately after reading
//   // cookieStore.set({
//   //   name: "login_error_data",
//   //   value: "",
//   //   maxAge: 0,
//   //   path: "/login_error",
//   // });

//   // here is function that the button calls the sdk, see email from A0

// //   const management = new ManagementClient({
// //     domain: AUTH0_DOMAIN,
// //     clientId: AUTH0_CLIENT_ID,
// //     clientSecret: AUTH0_CLIENT_SECRET,
// //   });

// //   // somehow... someway... need a way to make sure that the button logic can't be abused. look for npm solutions on rate limite, ip limit, etc. 

// // // below probably not ready to run, but build with it
// // try {
// //   // Call the verifyEmail method from the Auth0 SDK
// //   const job = await management.jobs.verifyEmail(params);
// //   console.log('Successfully created verification email job in Auth0.');
// //   return job.data;
// // } catch (error) {
// //   console.error('Auth0 API Error:', error.message);
// //   // Re-throw the error so the calling function (e.g., an API route)
// //   // can catch it and send an appropriate HTTP response.
// //   throw error;
// // }
// // }