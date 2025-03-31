import { auth0 } from "@/lib/auth0"; // from Auth0

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If no session, show sign-up and login buttons
  if (!session) {
    return (
      <main>
       <h1>Please login/signup to get started!</h1>
      </main>
    );
  }

  console.log(session.user)
  // If session exists, show a welcome message 
  return ( 
    <main>
      <h1>Welcome, {session.user.name}!</h1>
    </main>
  );
}
