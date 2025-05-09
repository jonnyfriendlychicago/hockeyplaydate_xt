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
import { normalizeNullable } from '@/lib/helpers/normalize';

type Props = {
  // userProfile: UserProfileFormType;
  initialValues: UserProfileFormType;
  // slug: string; // dynamic profile slug used in redirect
  defaultSluggy: string
  authUserEmail: string
};

// export default function EditProfileForm({ userProfile, slug }: Props) {
export default function EditUserProfileForm({ initialValues , defaultSluggy, authUserEmail  }: Props) {
  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);

  // define the 'form' that is used in the actual return section of this code
  const form = useForm<UserProfileFormType>({
    // resolver: zodResolver(userProfileValSchema, undefined, { raw: true }),
    resolver: zodResolver(userProfileValSchema),

    // defaultValues: {
    //   altNickname: initialValues.altNickname ?? null,
    //   givenName: initialValues.givenName ?? '',
    //   familyName: initialValues.familyName ?? '',
    //   altEmail: initialValues.altEmail ?? null,
    //   phone: initialValues.phone ?? null,
    //   slugVanity: initialValues.slugVanity ?? null,
    // },
    // above default values no longer needed, b/c the incoming prop object already normalized for consumption by form
    // above can be deleted when we feel like it. 2025may07
    defaultValues: initialValues,
  });

    const onSubmit = async (data: UserProfileFormType) => {
      setLoading(true);
      try {
        const payload = {
          ...data,
          // altNickname: data.altNickname?.trim() || null, // RED SQUIGGLE ON 'trim' in this line
          // altNickname: typeof data.altNickname === 'string' ? data.altNickname.trim() || null : null,
          // altEmail: typeof data.altEmail === 'string' ? data.altEmail.trim() || null : null,
          // phone: typeof data.phone === 'string' ? data.phone.trim() || null : null,
          // slugVanity: typeof data.slugVanity === 'string' ? data.slugVanity.trim() || null : null,
          // above replaced by below, which uses helper file
          altNickname: normalizeNullable(data.altNickname),
          altEmail: normalizeNullable(data.altEmail),
          phone: normalizeNullable(data.phone),
          slugVanity: normalizeNullable(data.slugVanity),
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

              {/* <FormControl>
                <Input
                  placeholder="awesomehockeyparent1234"
                  {...field}
                  value={(field.value ?? '') as string} 
                  disabled={loading}
                  />
              </FormControl> */}

              <FormControl>
                <div className="flex items-center rounded-md border px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    https://hockeyplaydate.com/member/
                  </span>
                  <Input
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                    placeholder="radhockeydad"
                    {...field}
                    value={(field.value ?? '') as string}
                    disabled={loading}
                  />
                </div>
              </FormControl>

              
              <FormDescription>
              {/* <p className="text-sm text-muted-foreground"> */}
              By default, your profile is located at: <code className="break-all text-muted-foreground">https://hockeyplaydate.com/member/{defaultSluggy}</code> <br />
              You can create a custom profile address using the field above, which will make your profile address: <br />
              <code className="break-all text-muted-foreground">https://hockeyplaydate.com/member/what-you-enter-above</code> <br />
              You can change this custom profile value anytime; you can also delete it, which will reset your profile address to be the default.
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
                placeholder="The Smith Family, Jones Crew, Miller Hockey Squad, etc." 
                {...field} 
                value={(field.value ?? '') as string} 
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
                <Input 
                // placeholder="" 
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
                <Input 
                // placeholder="Friend" 
                {...field} 
                disabled={loading}/>
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
                value={(field.value ?? '') as string} 
                disabled={loading}/>
              </FormControl>
              <FormDescription>
              {/* <p className="text-sm text-muted-foreground"> */}

              {authUserEmail} is the email you use to login to this site, which cannot be changed.   <br/>
              If you prefer, provide an alternate email address above, and that email (not your login email) will be:  <br/>
              (1) shared with Hockey Playdate organizers and other members as your preferred email address (if you elect) <br/>
              (2) used for invitations, inquiries, and other communications.  <br/>
              You can change this value anytime; you can also delete it, which means your login email ({authUserEmail}) will be used/shared instead.

              
          {/* <span className="font-medium">{loginEmail}</span> <br/> */}
              </FormDescription>
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
                  value={(field.value ?? '') as string} 
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
          className={loading ? 'opacity-50 cursor-not-allowed' : ''}
          disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
