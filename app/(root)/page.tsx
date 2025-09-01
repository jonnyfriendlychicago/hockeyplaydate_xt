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
  return ( 
    <main>
    <h1>Hello!</h1>
    <h2>We are going to completely overhaul this page to be the true corporate home page of hockeyplaydate.com</h2>
   </main>
    
  );
}
