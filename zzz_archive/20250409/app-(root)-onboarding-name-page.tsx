// app/(root)/onboarding/name/page.tsx
// Renders the form for user to input and submit givenName + familyName.
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type FormData = {
  givenName: string;
  familyName: string;
};

export default function OnboardingNamePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const res = await fetch('/api/user-profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/'); // redirect to homepage or dashboard
      } else {
        console.error('Error updating profile name');
      }
    } catch (err) {
      console.error('Unexpected error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto p-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">Finish setting up your profile</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="givenName">First Name</Label>
              <Input
                id="givenName"
                placeholder="Your first name"
                {...register('givenName', { required: true })}
              />
              {errors.givenName && (
                <p className="text-sm text-red-500 mt-1">First name is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="familyName">Last Name</Label>
              <Input
                id="familyName"
                placeholder="Your last name"
                {...register('familyName', { required: true })}
              />
              {errors.familyName && (
                <p className="text-sm text-red-500 mt-1">Last name is required</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
