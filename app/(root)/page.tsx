
// from Auth0
import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
// import './globals.css'; // JRF: commOut this line, b/c I think this already coming from projRoot/layout.tsx

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If no session, show sign-up and login buttons
  if (!session) {
    return (
      <main>

        <a href="/auth/login?screen_hint=signup">
          {/* <button>Sign up</button> */}
          <Button>Sign up</Button>

        </a>


        <a href="/auth/login">
          {/* <button>Log in</button> */}
          <Button>Log in</Button>

        </a>
      
      
      </main>
    );
  }

  // If session exists, show a welcome message and logout button
  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <p>
        <a href="/auth/logout">
          <button>Log out</button>
        </a>
      </p>
    </main>
  );
}

// orig:

// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import {  UserIcon} from 'lucide-react';

// const Homepage = () => {
//   return ( 
//     <div>
//       <h1>Site Content - March it up</h1> 
      
//       <Button asChild>
//           <Link href='/api/auth/login'>
//             <UserIcon/>AuthMeIn
//             </Link>
//         </Button>

//         {/* <a href="/api/auth/login">Login</a> */}
      
//       {/* <a href="/api/auth/login">Login</a> */}

//     </div>
  
// );
// }
 
// export default Homepage;
