// components/profile/EditProfileForm.tsx
// below all good, sorta... EXCEPT doesn't utilize full shadCN ui form component, and it's erroring b/c it includes an isolated <FormDescription> element that won't work alone. 
// file replaced with new version that fully embraces shadCN ui form component. 

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormDescription } from "@/components/ui/form" // prerequisite: run: npx shadcn@latest add form


type UserProfile = {
  altEmail: string | null;
  altNickname: string | null;
  phone: string | null;
  givenName: string | null;
  familyName: string | null;
};

type Props = {
  userProfile: UserProfile;
  slug: string; // Either slugVanity or slugDefault
};


export default function EditProfileForm({ userProfile, slug }: Props) {
  const router = useRouter();
  // Initialize form with default values from the passed-in userProfile
  const {
    register,
    // 101: register is a function returned by the useForm() hook from react-hook-form. It's used to connect input elements to the form's internal state, validation logic, and submission handler.
    // It’s doing a few things: registers the input field under in the form state, wires up the input to track its value, so the form knows what the user typed,
    // prepares validation rules (if any were passed), dds change and blur handlers under the hood, so your component doesn’t need to manually wire up onChange, onBlur, etc.
    // react-hook-form spares us from this code mess ***for each form field***: 
        // const [altNickname, setAltNickname] = useState('');

        //   <input
        //     value={altNickname}
        //     onChange={(e) => setAltNickname(e.target.value)}
        //   />
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfile>({
    defaultValues: {
      altEmail: userProfile.altEmail ?? '',
      altNickname: userProfile.altNickname ?? '',
      phone: userProfile.phone ?? '',
      givenName: userProfile.givenName ?? '',
      familyName: userProfile.familyName ?? '',
    },
  });

  const [loading, setLoading] = useState(false);

  // Called when form is submitted successfully
  const onSubmit = async (data: UserProfile) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile/updateProfile', {
      // const res = await fetch('/api/user-profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Redirect to the user's profile page using slug
        router.push(`/member/${slug}`);
        // 101: useRouter is Next.js preferred way to navigate within the app using client-side routing: 
        // does not reload the page, maintains app state (like layout, context providers, etc.).  To confirm: can’t be used in server components 
      } else {
        console.error('Update failed');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Family Display Name */}
      <div>
        <Label htmlFor="altNickname">Family Brand Name</Label>
        <Input
          id="altNickname"
          {...register('altNickname')}
          placeholder="e.g. The Smith-Jones Family, Miller Crew, Jonny Garcia Hockey Fam"
        />
        <FormDescription>
        e.g. The Smith-Jones Family, Miller Crew, Jonny Garcia Hockey Fam
              </FormDescription>
        {errors.altNickname && <p className="text-sm text-red-500 mt-1">This field is optional</p>}
      </div>

      {/* First Name */}
      <div>
        <Label htmlFor="givenName">First Name</Label>
        <Input
          id="givenName"
          {...register('givenName')}
          placeholder="Jon"
        />
        {errors.givenName && <p className="text-sm text-red-500 mt-1">First name is required</p>}
      </div>

      {/* Last Name */}
      <div>
        <Label htmlFor="familyName">Last Name</Label>
        <Input
          id="familyName"
          {...register('familyName')}
          placeholder="Friend"
        />
        {errors.familyName && <p className="text-sm text-red-500 mt-1">Last name is required</p>}
      </div>

      {/* Alt Email */}
      <div>
        <Label htmlFor="altEmail">Alternate Email</Label>
        <Input
          id="altEmail"
          {...register('altEmail')}
          placeholder="your.secondary@email.com"
        />
        {errors.altEmail && <p className="text-sm text-red-500 mt-1">Invalid email</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="(123) 456-7890"
        />
        {errors.phone && <p className="text-sm text-red-500 mt-1">Invalid phone number</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}



// replaced by above, uses React Router
// components/profile/EditProfileForm.tsx
// 'use client';

// import { useForm } from 'react-hook-form';
// import { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent } from '@/components/ui/card';

// type Props = {
//   userProfile: {
//     altEmail: string | null;
//     phone: string | null;
//     slugVanity: string | null;
//     givenName: string | null;
//     familyName: string | null;
//   };
// };

// type FormData = {
//   altEmail: string;
//   phone: string;
//   slugVanity: string;
//   givenName: string;
//   familyName: string;
// };

// export default function EditProfileForm({ userProfile }: Props) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     defaultValues: {
//       altEmail: userProfile.altEmail || '',
//       phone: userProfile.phone || '',
//       slugVanity: userProfile.slugVanity || '',
//       givenName: userProfile.givenName || '',
//       familyName: userProfile.familyName || '',
//     },
//   });

//   const [loading, setLoading] = useState(false);

//   const onSubmit = async (data: FormData) => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/user-profile/updateProfile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) {
//         console.error('Update failed');
//         // Optionally show user-facing error message
//       } else {
//         // Refresh or redirect after success
//         window.location.href = '/members';
//       }
//     } catch (err) {
//       console.error('Unexpected error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card>
//       <CardContent className="space-y-4 p-6">
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div>
//             <Label htmlFor="givenName">First Name</Label>
//             <Input id="givenName" {...register('givenName')} />
//             {errors.givenName && <p className="text-red-500 text-sm">Required</p>}
//           </div>

//           <div>
//             <Label htmlFor="familyName">Last Name</Label>
//             <Input id="familyName" {...register('familyName')} />
//             {errors.familyName && <p className="text-red-500 text-sm">Required</p>}
//           </div>

//           <div>
//             <Label htmlFor="slugVanity">Custom Profile URL</Label>
//             <Input id="slugVanity" {...register('slugVanity')} />
//           </div>

//           <div>
//             <Label htmlFor="altEmail">Alternate Email</Label>
//             <Input id="altEmail" {...register('altEmail')} />
//           </div>

//           <div>
//             <Label htmlFor="phone">Phone</Label>
//             <Input id="phone" {...register('phone')} />
//           </div>

//           <Button type="submit" className="w-full mt-4" disabled={loading}>
//             {loading ? 'Saving...' : 'Save Profile'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
