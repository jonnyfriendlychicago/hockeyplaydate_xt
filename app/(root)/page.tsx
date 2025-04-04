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
       <h1>Please login/signup to get started!</h1>
      </main>
    );
  }

  // If session ... 
  console.log(session.user) // for development/testing: log all fields being delivered by Auth0
  return ( 
    <main>
      <h1>Welcome, {session.user.name}!</h1>
    </main>
  );
}
