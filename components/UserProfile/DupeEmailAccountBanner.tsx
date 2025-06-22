// components/UserProfile/DupeEmailAccountBanner.tsx

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// export function DupeEmailAccountBanner({ email }: { email: string }) {
export function DupeEmailAccountBanner({
    email,
    nameString,
    accountType
  }: {
    email: string;
    nameString: string;
    accountType: string;
  }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Duplicate Account Detected</AlertTitle>
      <AlertDescription>
        <p>
        Hello, {nameString}.  Ok, this is awkward, sorry in advance...  <br/> 
        You cannot use Hockey Playdate with your current login. Here is a quick explanation, plus options to resolve this.  <br/> 
        
        <strong>Explanation:</strong> 
        </p>
        <p>
        There are two ways to join Hockey Playdate at the signup/login screen: <br/>

        Method 1: click continue with Google (referred to as googleSocial) or  <br/>
        Method 2: enter an email addy + your own devised password (referred to emailPassword) <br/>

        Both methods work... and each method will create a seperate and distinct user account for Hockey Playdate. <br/>
        Here is the problem: the account you are logged in with right now (account type: {accountType}) has the same email address - {email} - as another account.  
        Hockey Playdate has automatically marked the account you are logged in with now (account type: {accountType}) as a duplicate account. 
        For security and sanity reasons, Hockey Playdate blocks your duplicate account; 
        this {accountType}-based account cannot be added to groups, it cannot view group members, it cannot view group events, etc. <br/>
        </p>
        <p>
        At present time, there is no means for you to merge this {accountType} account with your original account.  <br/>
    
        </p>

        <strong>Resolution Options:</strong> 
        <p>
        Option 1: Disregard this new account <br/>
        Logout now, and then log back in using your original login method, and use that going forward, all good. <br/>

        Option 2: Deactivate your original account, use new account instead <br/>
        If you truly feel the need to abandon your original login account / method and use this new {accountType} login method, please <a href="/support" className="underline text-sm mt-1 inline-block">contact our tech support team</a> <br/>
        We can deactivate your old account, and then you can use this new account going forward.  Be advised that none of your old account data will transfer over: 
        you will need to be re-added to groups, you will not have access to old account events or other activity, etc. <br/>

        Warning: unless action is taken by our support team (per instruction you send), this new {accountType} account will be deactivated in 7 days. <br/>

        We sincerely apologize for any inconvenience, and thank you for your patience and understanding. 

        </p>
        
      </AlertDescription>
    </Alert>
  );
}
