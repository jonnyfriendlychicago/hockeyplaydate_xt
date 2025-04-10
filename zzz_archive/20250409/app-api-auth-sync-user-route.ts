// app/api/auth/sync-user/route.ts

// This route/file is not used in the main app flow anymore.
// It's only here as a manual utility or fallback (e.g., for testing or webhook usage).
// source: https://chatgpt.com/c/67e6aad2-24c4-8010-a2b2-28bf5abb178b
// 2025apr09: moved this file to archive

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
