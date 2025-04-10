// app/(root)/page.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0
import { auth0 } from "@/lib/auth0"; // from Auth0

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If no session... 
  if (!session) {
    return (
      <main>
       <h1>Hello!</h1>
       <h2>We are going to completely overhaul this page to be the true corporate home page of hockeyplaydate.com</h2>
      </main>
    );
  }

  // If session ... 
  // console.log(session.user) // for development/testing: log all fields being delivered by Auth0
  return ( 
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <h2>We are going to overhaul this page to be something of highest value for the logged in user. </h2>
      <p>Perhaps a dashboard of events past/future, my groups, my organizers. </p>
      <p>think: phone/email of organizer, so we can call/text asap when running late?</p>
      <h1>or, maybe logged in user is FIRST directed to dashboard page.  yes?  So he can always get back to corporate homepage, and display dashboard in global if logged in?</h1>
    </main>
  );
}
