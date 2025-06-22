// components/UserProfile/DupeEmailAccountBanner.tsx

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DupeEmailAccountBanner({ email }: { email: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Duplicate Account Detected</AlertTitle>
      <AlertDescription>
      <strong>{email}</strong>
        <p>
        Ok, this is awkward, sorry in advance...  <br/> 
        You cannot use Hockey Playdate with your current login. Here is quick explanation and resolution path.  <br/> 
        
        <strong>Explanation:</strong> 
        </p>
        <p>
        There are two ways to join Hockey Playdate at the signup/login screen: <br/>

        Method 1: click continue with Google (sometimes called google social) or  <br/>
        Method 2: enter an email addy + your own devised password (sometimes called email based-login) <br/>

        Both methods work... and each method will create a seprate and distinct user account for Hockey Playdate. <br/>
        By default, Hockey Playdate has automatically marked this new login account as a duplicate account. </p>

        <p>
        At present time, there is no means for you to merge this account with your original account.  <br/>
        
        For security and other purposes, this duplicate account is effectively blocked from engaging with Hockey Playdate: 
        it cannot be added to groups, it cannot be invited to group events, it cannot view group members, etc. <br/>

        </p>

        <strong>Resolution Options:</strong> 
        <p>
        If you truly feel the need to abandon your original login account / method and use this new login method, please <a href="/support" className="underline text-sm mt-1 inline-block">contact our tech support team</a> right away. <br/>

        Otherwise, the simple resolution path is to simply logout now, and then log back in using your original login method. 

        Please note: this new duplicate login account will be automatically deleted in 7 days unless we hear from you first. 

        We sincerely apologize for any inconvenience this is causing you, and thank you for your patience and understanding. 

        </p>
        
      </AlertDescription>
    </Alert>
  );
}
