// app/(root)/member/edit/page.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import EditProfileForm from '@/components/UserProfile/EditProfileForm';
import { redirect } from 'next/navigation';

export default async function EditProfilePage() {
  const session = await auth0.getSession();
  const user = session?.user;

  // Require login
  if (!user) {
    redirect('/auth/login');
  }

  // Find matching AuthUser
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: user.sub },
  });

  if (!dbUser) {
    redirect('/auth/login'); // or show error page
  }

  // Get the user's current profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
  });

  if (!userProfile) {
    redirect('/'); // No profile — fallback handling
  }

  // Pass profile data to form
  return (
    <section className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <EditProfileForm userProfile={userProfile} />
    </section>
  );
}
