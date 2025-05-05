// components/UserProfile/EditUserProfileForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSafeRedirect } from '@/lib/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileValSchema } from '@/lib/validation/userProfileValSchema';
import { UserProfileFormType } from '@/app/types/forms/userProfileFormType';
import InputMask from 'react-input-mask'; // npm install --save-dev @types/react-input-mask 
// Note: 'npm install react-input-mask' for above won't work: react-input-mask is written in JavaScript and doesn't ship its own TypeScript types by default.
// import { UseFormReturn } from 'react-hook-form';

type Props = {
  userProfile: UserProfileFormType;
  slug: string; // dynamic profile slug used in redirect
};

// export default function EditProfileForm({ userProfile, slug }: Props) {
export default function EditUserProfileForm({ userProfile }: Props) {
  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);

  
  const form = useForm<UserProfileFormType>({
    // resolver: zodResolver(userProfileValSchema, undefined, { raw: true }),
    resolver: zodResolver(userProfileValSchema),

    defaultValues: {
      // altNickname: userProfile.altNickname ?? '',
      // givenName: userProfile.givenName ?? '',
      // familyName: userProfile.familyName ?? '',
      // altEmail: userProfile.altEmail ?? '',
      // phone: userProfile.phone ?? '',
      // slugVanity: userProfile.slugVanity ?? '',
      // above replaced to enable nulling to work correctly
      altNickname: userProfile.altNickname ?? null,
      givenName: userProfile.givenName ?? '',
      familyName: userProfile.familyName ?? '',
      altEmail: userProfile.altEmail ?? null,
      phone: userProfile.phone ?? null,
      slugVanity: userProfile.slugVanity ?? null,
    },
  });

    const onSubmit = async (data: UserProfileFormType) => {
      setLoading(true);
      try {
        const payload = {
          ...data,
          // altNickname: data.altNickname?.trim() || null, // RED SQUIGGLE ON 'trim' in this line
          altNickname: typeof data.altNickname === 'string' ? data.altNickname.trim() || null : null,
          // altEmail: data.altEmail?.trim() || null, 
          altEmail: typeof data.altEmail === 'string' ? data.altEmail.trim() || null : null,
          // phone: data.phone?.trim() || null, 
          phone: typeof data.phone === 'string' ? data.phone.trim() || null : null,
          // slugVanity: data.slugVanity?.trim() || null, // convert empty or whitespace to null
          slugVanity: typeof data.slugVanity === 'string' ? data.slugVanity.trim() || null : null,
        };
        
        const res = await fetch('/api/user-profile/updateProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), 
        });
        
        if (res.ok) {
          const updatedProfile = await res.json();
          const sluggy = updatedProfile.slugVanity || updatedProfile.slugDefault;
          safeRedirect(`/member/${sluggy}`);
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
      <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}

        className="space-y-6"
        >
        {/* slugVanity */}
        <FormField
          control={form.control}
              name="slugVanity"
              render={({ field }) => (
                <FormItem>
              <FormLabel>Custom Profile URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="awesomehockeyparent1234"
                  {...field}
                  // value={field.value ?? ''} // this line resolves nulls to empty string, for zod-form cooperation
                  value={(field.value ?? '') as string} // This tells TypeScript: I know this will always end up a string in the UI.
                  disabled={loading}
                  />
              </FormControl>
              
              <FormDescription>
              {/* <p className="text-sm text-muted-foreground"> */}
                This is your profile URL: <br />
                <code>https://hockeyplaydate.com/member/yourcustomurl</code>. <br /> 
                This value must be unique among all HPD members. If left blank, your default URL will be used: <br /> 
                <code>https://hockeyplaydate.com/member/your-generated-id</code>
              {/* </p> */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
          />

        {/* altNickname: Family Brand Name */}
        <FormField
          control={form.control}
          name="altNickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Brand Name</FormLabel>
              <FormControl>
                <Input 
                placeholder="The Smith Family" 
                {...field} 
                // value={field.value ?? ''} // red squiggle on 'value' here
                value={(field.value ?? '') as string} // This tells TypeScript: I know this will always end up a string in the UI.
                disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

        {/* givenName */}
        <FormField
          control={form.control}
          name="givenName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Jon" 
                {...field} 
                disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

        {/* familyName */}
        <FormField
          control={form.control}
          name="familyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Friend" {...field} disabled={loading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

        {/* altEmail */}
        <FormField
          control={form.control}
          name="altEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alternate Email</FormLabel>
              <FormControl>
                <Input 
                placeholder="alternate@email.com" 
                {...field} 
                // value={field.value ?? ''} // this line resolves nulls to empty string, for zod-form cooperation
                value={(field.value ?? '') as string} // This tells TypeScript: I know this will always end up a string in the UI.
                disabled={loading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                {/* input mask that manages the field display */}
                <InputMask
                  mask="999.999.9999"
                  placeholder="123.456.7890"
                  maskChar=""
                  // value={field.value}
                  // value={field.value ?? ''} // this line resolves nulls to empty string, for zod-form cooperation
                  value={(field.value ?? '') as string} // This tells TypeScript: I know this will always end up a string in the UI.
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '');
                    field.onChange(onlyDigits);
                  }}
                  disabled={loading}
                  >
                  {(inputProps) => (
                    <Input {...inputProps} />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

        {/* Submit Button */}
        <Button 
          type="submit" 
          // className="w-full" 
          className={loading ? 'opacity-50 cursor-not-allowed' : ''}
          disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
