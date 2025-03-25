import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {  UserIcon} from 'lucide-react';

const Homepage = () => {
  return ( 
    <div>
      <h1>Site Content - March it up</h1> 
      
      <Button asChild>
          <Link href='/api/auth/login'>
            <UserIcon/>AuthMeIn
            </Link>
        </Button>

        {/* <a href="/api/auth/login">Login</a> */}
      
      {/* <a href="/api/auth/login">Login</a> */}

    </div>
  
);
}
 
export default Homepage;