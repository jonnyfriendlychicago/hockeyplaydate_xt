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
  const altAccountType = accountType === 'googleSocial' ? 'emailPassword' : 'googleSocial';
  
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-6 my-6 rounded-lg border-2 border-blue-200 bg-blue-50">
      
      <div className="flex items-center gap-2 mb-4">
        <CircleAlert className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-blue-700">Choose Your Login Method</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700">
          Hi <strong>{nameString}</strong>! 
        </p>
        
        <p className="text-gray-700">
          We noticed you have two ways to access Hockey Playdate with <strong>{email}</strong> - you can sign in with Google or with your email and password.
        </p>

        <div className="bg-white p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">Pick your preferred method:</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Keep using {altAccountType === 'googleSocial' ? 'Google' : 'email/password'} <span className="text-green-600 text-sm">(recommended)</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Log out and sign back in with "{altAccountType === 'googleSocial' ? 'Continue with Google' : 'your email and password'}" - you'll have access to all your existing groups and events.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  Switch to {accountType === 'googleSocial' ? 'Google' : 'email/password'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  We can set this up as your main account instead. <a href="/support" className="text-blue-600 underline hover:text-blue-800">Contact support</a> and we'll make the switch for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded">
          For now, we've temporarily limited this account until you choose. This just helps prevent any confusion with your data.
        </p>
      </div>
    </div>
  );
}