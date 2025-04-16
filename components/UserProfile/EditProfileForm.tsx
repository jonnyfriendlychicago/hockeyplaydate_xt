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
};

type Props = {
  userProfile: UserProfileFormValues;
  slug: string; // dynamic profile slug used in redirect
};

export default function EditProfileForm({ userProfile, slug }: Props) {
  const safeRedirect = useSafeRedirect();

  const [loading, setLoading] = useState(false);

  const form = useForm<UserProfileFormValues>({
    defaultValues: {
      altNickname: userProfile.altNickname ?? '',
      givenName: userProfile.givenName ?? '',
      familyName: userProfile.familyName ?? '',
      altEmail: userProfile.altEmail ?? '',
      phone: userProfile.phone ?? '',
    },
  });

  const onSubmit = async (data: UserProfileFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        safeRedirect(`/member/${slug}`);
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
        {/* altNickname: Family Brand Name */}
        <FormField
          control={form.control}
          name="altNickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="The Smith Family" {...field} />
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
                <Input placeholder="Jon" {...field} />
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
                <Input placeholder="Friend" {...field} />
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
                <Input placeholder="alternate@email.com" {...field} />
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
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
