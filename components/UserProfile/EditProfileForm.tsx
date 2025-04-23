// components/profile/EditProfileForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSafeRedirect } from '@/lib/navigation';

// 101: In TypeScript, 'type' is a way to define a custom type alias — kind of like defining a blueprint or shape for your data.
// Rough translation: "A UserProfile object should always have those fields and their types."
// this helps react-hook-form understand what the shape of form data should be.
type UserProfileFormValues = {
  // altNickname: string | null; // this line is giving Typescript a fit
  altNickname: string ;
  givenName: string ;
  familyName: string ;
  altEmail: string ;
  phone: string ;
  slugVanity: string; 
};

type Props = {
  userProfile: UserProfileFormValues;
  slug: string; // dynamic profile slug used in redirect
};

// export default function EditProfileForm({ userProfile, slug }: Props) {
export default function EditProfileForm({ userProfile }: Props) {
  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);

  const form = useForm<UserProfileFormValues>({
    defaultValues: {
      altNickname: userProfile.altNickname ?? '',
      givenName: userProfile.givenName ?? '',
      familyName: userProfile.familyName ?? '',
      altEmail: userProfile.altEmail ?? '',
      phone: userProfile.phone ?? '',
      slugVanity: userProfile.slugVanity ?? '',
    },
  });

  const onSubmit = async (data: UserProfileFormValues) => {
    setLoading(true);
    try {
      
      // create new payload variable/object, with nulled vanity slug instead of spaces
      const payload = {
        ...data,
        slugVanity: data.slugVanity?.trim() || null, // convert empty or whitespace to null
      };

      const res = await fetch('/api/user-profile/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(data),
        body: JSON.stringify(payload), // this line replaces above line
      });

      if (res.ok) {
        // safeRedirect(`/member/${slug}`); // this simple redirect replaced by below
        const updatedProfile = await res.json();
        const sluggy = updatedProfile.slugVanity || updatedProfile.slugDefault;
        safeRedirect(`/member/${sluggy}`);
        // safeRedirect(`/member/${payload.slugVanity || slug}`); // this tried to ensure redirect will send usng to new slugVanity instead of default, but insufficient, replaced by above

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
                <Input placeholder="The Smith Family" {...field} disabled={loading} />
              </FormControl>
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
                <Input placeholder="Jon" {...field} disabled={loading} />
              </FormControl>
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
                <Input placeholder="alternate@email.com" {...field} disabled={loading}/>
              </FormControl>
            </FormItem>
          )}
        />

        {/* phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                placeholder="(123) 456-7890" 
                {...field} disabled={loading}/>
              </FormControl>
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
