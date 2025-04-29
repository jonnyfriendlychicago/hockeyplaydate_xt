// components/onboarding/ProfileNameForm.tsx
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
// import { useToast } from '@/components/ui/use-toast'; 
// import { useToast } from "@/hooks/use-toast" // // npx shadcn@latest add toast // ALSO: toast is more complex than many other simple shadCN components, read more: https://ui.shadcn.com/docs/components/toast


type FormData = {
  givenName: string;
  familyName: string;
};

type Props = {
  givenName: string | null | undefined;
  familyName: string | null | undefined;
};

export function ProfileNameForm({ givenName, familyName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      givenName: givenName ?? '',
      familyName: familyName ?? '',
    },
  });

  // const { toast } = useToast(); // put this inside your component function

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  // if (submitted) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-300 p-4 my-4 rounded-md max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">
        Let’s finish setting up your profile so others know who you are.
      </h2>

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
                  <Input placeholder="Your first name" {...field} disabled={loading}/>
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
                  <Input placeholder="Your last name" {...field} disabled={loading}/>
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
            {loading ? 'Saving...' : 'Save and Continue'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

