// app/(root)/layout.tsx

import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { auth0 } from '@/lib/auth0'; // added to get the auth'ed user saved to db
import { syncUserFromAuth0 } from '@/lib/syncUser'; // added to get the auth'ed user saved to db
import { UserProfileNameGate } from '@/components/UserProfile/UserProfileNameGate';
import { DupeEmailAccountBanner } from '@/components/UserProfile/DupeEmailAccountBanner';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 0 - set current user variables 
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user; //  formerly: const auth0User = session?.user; ... and this was easily confused with actual entity authUser / auth_user; 
  if (process.env.RUN_TEST_CONSOLE_LOGS == 'true') console.log("layout>>authSessionUser.email: " + authSessionUser?.email); // for development/testing: log all fields being delivered by Auth0

  const userProfile = authSessionUser? await syncUserFromAuth0(authSessionUser) : null; // runs the sync every login, AND gets the user profile that results from the sync
  // 101: above ternary could also be written as traditional 'if' syntax: let userProfile = null; if (auth0User) {userProfile = await syncUserFromAuth0(auth0User);}
  const dupeEmailAuthUser = userProfile?.authUser?.duplicateOfId; // basically, if there's a value for dueplicateOfId, then dupeEmailAuthUser = true / truthy
  // const showDupeEmailAccountBanner = userProfile?.authUser?.duplicateOfId; 
  // 101: above is an nice explanatory variable, but the 'check' for userProfile and its child authUser object gets "lost" when you try to use the variable downstream.  So, this variable just causes problems.  
  const showNameOnboardingForm = !dupeEmailAuthUser && !!authSessionUser && (!userProfile?.givenName || !userProfile?.familyName); // determine if the users profile doesn't meet minimal biz goals; 
  // 101: The !! (double bang) above is a JavaScript trick to coerce any value into a boolean: The first ! negates the value (e.g. turns truthy → false, or falsy → true), and the second ! negates it again, flipping it back — but now it's guaranteed to be a boolean (true or false)

  const dupeEmailAuthUserNameString =
  userProfile?.givenName && userProfile?.familyName
    ? `${userProfile.givenName} ${userProfile.familyName}`
    : userProfile?.givenName
    ? userProfile.givenName
    : userProfile?.familyName


  const dupeEmailAuthUserAccountType =
  userProfile?.authUser?.auth0Id?.startsWith('auth0|')
    ? 'emailPassword'
    : userProfile?.authUser?.auth0Id?.startsWith('google')
    ? 'googleSocial'
    : 'unknown';

  

  // 1 - return baby
  return (
    <div className='flex h-screen flex-col'>
      <Header />

      {showNameOnboardingForm && (
        <UserProfileNameGate
          givenName={userProfile?.givenName}
          familyName={userProfile?.familyName}
          authUserEmail={authSessionUser?.email ?? 'friend'}
        />
      )}

      {/* {showDupeEmailAccountBanner && ( */} 
      {userProfile?.authUser?.duplicateOfId && ( // we are just using the 'check' for userProfile and its child authUser object here, b/c the showDupeEmailAccountBanner isn't workable, as explained upstream
        <DupeEmailAccountBanner 
          email={userProfile.authUser.email} 
          // email={userProfile.authUser!.email} // this '!' value in this line basically tells Ts: "I guarantee this "
          nameString = {dupeEmailAuthUserNameString ?? userProfile.authUser.email} 
          // nameString = {dupeEmailAuthUserNameString ?? userProfile.authUser!.email} 
          accountType = {dupeEmailAuthUserAccountType}
          />
      )}
      
      <main className='flex-1 wrapper'>{children}</main>
      <Footer/>
    </div>
  );
}
