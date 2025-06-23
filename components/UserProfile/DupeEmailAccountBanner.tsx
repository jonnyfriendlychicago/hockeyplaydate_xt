// components/UserProfile/DupeEmailAccountBanner.tsx

'use client';

import { CircleAlert } from 'lucide-react';

export function DupeEmailAccountBanner({
    email,
    nameString,
    accountType
  }: {
    email: string;
    nameString: string;
    accountType: string;
  }) 
  
{
  return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 my-6 rounded-lg border border-r-4 border-b-4 border-red-500 bg-red-50">

        <div className="flex items-center gap-2 mb-4">
            <CircleAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-500">Duplicate Account Detected</h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Hello, <strong>{nameString}</strong>! Ok, this is awkward — sorry in advance.
          </p>
          <p>
            You cannot use Hockey Playdate with your current login. Here is a quick explanation, plus options to resolve this situation. 
          </p>
          <div>
            <h3 className="font-semibold">Explanation:</h3>
            <p>
                There are two ways to join Hockey Playdate at the signup/login screen:
                </p>
              <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                <li>
                    Method 1: &ldquo;Continue with Google&ldquo; (refered to as  <em>googleSocial</em> )
                    </li>
                <li>
                    Method 2: Email + password (referred to as <em>emailPassword</em> )
                    </li>
              </ul>
            <p className="mt-2">
                Both methods work... <em>and each method will create a separate and distinct user account for Hockey Playdate.</em>
                </p>
            <br/>
            <p>
                Here is the problem: the account you&#39;re logged in with right now (account type: {accountType}) has the same email address - <strong>{email}</strong> - as another Hockey Playdate account, 
                which means this {accountType} account is a duplicate.
                </p>
            <br/>
            <p>
              For security and sanity reasons, Hockey Playdate blocks your duplicate account; this {accountType}-based account cannot be added to groups, it cannot view other members, it cannot engage with events, etc. 
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Resolution Options:</h3>
            <ul className="list-disc list-inside mt-1 ml-4 space-y-2">
              <li>
                <strong>Option 1: Disregard this new account</strong><br />
                Log out, then sign in using your original login method. Use that going forward, all good. Don&#39;t worry about this duplicate account: our system will automatically deactivate it in 7 days.
              </li>
              <li>
                <strong>Option 2: Use this account instead</strong><br />
                If you want to abandon your original account and use this {accountType} login going forward,
                <a href="/support" className="underline">contact our tech support team</a>. 
                We can deactivate your old account, and then you can use this new {accountType} account going forward.  
                Be advised that none of your old account data will transfer over: you will need to be re-added to groups, etc.  In short, you&#39;ll be starting over with Hockey Playdate. 
              </li>
            </ul>
            <br/>
            <p className="font-semibold text-red-500">
            {/* <strong> */}
                To confirm: unless our team hears from you sooner, this  new {accountType} account will be automatically deactivated in 7 days.
                {/* </strong>  */}
            </p>

          </div>

          <p>
            We sincerely apologize for any inconvenience and thank you for your patience and understanding.
          </p>
        {/* </AlertDescription> */}
        </div>
      {/* </Alert> */}
    </div>
  );
}



  // 2025jun22: below 'return'  is the initial sketch/text replaced by above update 
//   {

//   return (
//     <Alert variant="destructive" className="mb-4">
//       <AlertTitle>Duplicate Account Detected</AlertTitle>
//       <AlertDescription>
//         <p>
//         Hello, {nameString}.  Ok, this is awkward, sorry in advance...  <br/> 
//         You cannot use Hockey Playdate with your current login. Here is a quick explanation, plus options to resolve this.  <br/> 
        
//         <strong>Explanation:</strong> 
//         </p>
//         <p>
//         There are two ways to join Hockey Playdate at the signup/login screen: <br/>

//         Method 1: click continue with Google (referred to as googleSocial) or  <br/>
//         Method 2: enter an email addy + your own devised password (referred to emailPassword) <br/>

//         Both methods work... and each method will create a seperate and distinct user account for Hockey Playdate. <br/>
//         Here is the problem: the account you are logged in with right now (account type: {accountType}) has the same email address - {email} - as another account.  
//         Hockey Playdate has automatically marked the account you are logged in with now (account type: {accountType}) as a duplicate account. 
//         For security and sanity reasons, Hockey Playdate blocks your duplicate account; this {accountType}-based account cannot be added to groups, it cannot view group members, it cannot view group events, etc. <br/>
//         </p>
//         <p>
//         At present time, there is no means for you to merge this {accountType} account with your original account.  <br/>
    
//         </p>

//         <strong>Resolution Options:</strong> 
//         <p>
//         Option 1: Disregard this new account <br/>
//         Logout now, and then log back in using your original login method, and use that going forward, all good. <br/>

//         Option 2: Deactivate your original account, use new account instead <br/>
//         If you truly feel the need to abandon your original login account / method and use this new {accountType} login method, please <a href="/support" className="underline text-sm mt-1 inline-block">contact our tech support team</a> <br/>
//         We can deactivate your old account, and then you can use this new account going forward.  Be advised that none of your old account data will transfer over: you will need to be re-added to groups, you will not have access to old account events or other activity, etc. <br/>

//         Warning: unless action is taken by our support team (per instruction you send), this new {accountType} account will be deactivated in 7 days. <br/>

//         We sincerely apologize for any inconvenience, and thank you for your patience and understanding. 

//         </p>
        
//       </AlertDescription>
//     </Alert>
//   );
// }
