// This route/file is not used in the main app flow anymore.
// It's only here as a manual utility or fallback (e.g., for testing or webhook usage).

import { auth0 } from "@/lib/auth0"; 
import { syncUserFromAuth0 } from '@/lib/syncUser';

export async function GET() {
    const session = await auth0.getSession();
    const auth0User = session?.user;

  if (!auth0User || !auth0User.email) {
    return new Response('Unauthorized: No user or email', { status: 401 });
  }

  await syncUserFromAuth0(auth0User);

  return Response.json({ message: 'User synced' });
}
