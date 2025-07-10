// components/UserProfile/EditUserProfileNameForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileNameValSchema } from '@/lib/validation/userProfileNameValSchema';
import { UserProfileNameFormType } from '@/app/types/forms/userProfileNameFormType';
import Link from 'next/link';
// import { useToast } from '@/components/ui/use-toast'; 
// import { useToast } from "@/hooks/use-toast" // // npx shadcn@latest add toast // ALSO: toast is more complex than many other simple shadCN components, read more: https://ui.shadcn.com/docs/components/toast

// type FormData = {
//   givenName: string;
//   familyName: string;
// };

type Props = {
  givenName: string | null | undefined;
  familyName: string | null | undefined;
  authUserEmail: string;
};

export function EditUserProfileNameForm({ givenName, familyName, authUserEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // const [submitted, setSubmitted] = useState(false);

  const form = useForm<UserProfileNameFormType>({
    resolver: zodResolver(userProfileNameValSchema),
    defaultValues: {
      givenName: givenName ?? '',
      familyName: familyName ?? '',
    },
  });

  // const { toast } = useToast(); // put this inside your component function

  const onSubmit = async (data: UserProfileNameFormType) => {
  // const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Defensive re-parse to ensure trimming and validation are enforced
      const payload = userProfileNameValSchema.parse(data);

      const res = await fetch('/api/user-profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(data),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // toast({
        //   title: 'Profile updated',
        //   description: 'Your name has been saved successfully.',
        // });
        // setSubmitted(true);
        router.refresh(); // Force page to reload from server and reevaluate profile completeness

      } else {
        console.error('Error updating profile name');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-4xl mx-auto bg-blue-50 border border-r-4 border-b-4 border-blue-500  p-6 my-6 rounded-lg">

      <h2 className="text-lg font-semibold mb-2">Welcome to Hockey Playdate, {authUserEmail}!</h2>
      <p className="mb-2 text-sm text-muted-foreground">
        Please provide your name below to continue. You can also go a step further and <Link href="/member/edit" className="underline text-blue-600 hover:text-blue-800">complete your full profile</Link>.
      </p>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="givenName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input 
                  placeholder="Your first name" 
                  {...field} 
                  value={(field.value ?? '') as string}
                  disabled={loading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input 
                  placeholder="Your last name" 
                  {...field} 
                  value={(field.value ?? '') as string}
                  disabled={loading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className={loading ? 'opacity-50 cursor-not-allowed' : ''}
            disabled={loading}
            > 
            {loading ? 'Saving...' : 'Save and Close'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

