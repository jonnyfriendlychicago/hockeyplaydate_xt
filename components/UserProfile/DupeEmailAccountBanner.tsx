// components/UserProfile/DupeEmailAccountBanner.tsx

'use client';

import { CopyText } from '@/components/shared/copyText';
import Image from 'next/image';

// simple function to toggle display of enhanced login name
function LoginMethodLabel({ type }: { type: string }) {
  if (type === 'Google') {
    return (
      <span className="inline-flex items-center gap-2">
        <Image
          priority={true}
          // src='/images/g-logo.png'
          src='/images/web_neutral_rd_na@3x.png'
          width={24}
          height={24}
          alt={`google G logo`}
          className="inline-block align-middle"
        />
        <span className="text-base">Continue with Google</span>
      </span>
    );
  }

  return <span className="text-base">Sign up with {type}</span>;
}


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
  // 0 - establish essential vars
  const textAccountType = accountType === 'googleSocial' ? 'Google' : 'email+password'; // this translates the functional parameter value into a styled string, for display to EU
  const textAccountTypeAlt = accountType === 'googleSocial' ? 'email+password' : 'Google'; // ditto above
  const supportEmailAddy = 'support@hockeyplaydate.com' // easily changed variable in case we ever want to swap out the HPD email addy
  // 1 - return it all
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-6 my-6 rounded-lg border-2 border-blue-200 bg-blue-50">
      
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-blue-700 ">Choose Your Login Method</h2>
      </div>

       <div className="space-y-5 text-base leading-relaxed text-gray-700">
        <p>
          Hello, <strong>{nameString}!</strong>
        </p>
        
        <p> 
          You&apos;ve successfully logged in using {textAccountType}. <em>Nice work!</em>  Just one small problem... 
        </p>

        <p>
          As you probably noticed during login/sign up, there are two ways to access Hockey Playdate:
        </p>

        <div className="text-center my-3 space-y-1 text-base font-medium">
          <div className="rounded-md bg-gray-100 px-4 py-2 text-gray-800 text-base"><LoginMethodLabel type={textAccountType} /></div>
          <div className="text-sm text-gray-500 italic">or</div>
          <div className="rounded-md bg-gray-100 px-4 py-2 text-gray-800 text-base"><LoginMethodLabel type={textAccountTypeAlt} /></div>
        </div>
        <p> 
          Either method works, but to keep things simple/secure, we allow only one login method <em>per email address.</em> 
        </p>

        <p className="text-gray-700">
          Your current {textAccountType} login uses the same email address as a previously created {textAccountTypeAlt} login: {email}. 
        </p>

        <div className="bg-white p-5 rounded-lg border border-blue-100 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Your Options</h3>

           {/* Option 1 */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-gray-800">
              Option 1: Use Your Original {textAccountTypeAlt} Login
            </h4>
            <p>
              Log out, then login again with your original {textAccountTypeAlt} login, then use that {textAccountTypeAlt} login going forward. That login already has your profile, groups, and history, etc.
            </p>
          </div>

          {/* Option 2 */}
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-gray-800">
              Option 2: Switch to {textAccountType} Login
            </h4>
            <p>
              Our tech support team can update your account so {textAccountType} is your login going forward.  All your Hockey Playdate info (profile, groups, history, etc.) will stay exactly the same. This action will deactivate your {textAccountTypeAlt} login.
            </p>
            <p>Ready to make the switch? Just email us at:</p>

            <div className="flex items-center justify-center gap-1 mx-auto  text-blue-800 px-3 py-1 rounded text-sm">
              <span className="font-mono">{supportEmailAddy}</span>
              <CopyText text={supportEmailAddy} />
            </div>

            <p>
              ... from your  <strong>{email}</strong> address, and clarify which login method you want to use: {textAccountType} or {textAccountTypeAlt}.  We&apos;ll verify with you, then make the switch and send you a confirmation email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}