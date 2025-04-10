// components/onboarding/ProfileNameForm.tsx
'use client';

import { useState} from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type FormData = {
  givenName: string;
  familyName: string;
};

export function ProfileNameForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error('Error updating profile name');
      }
    } catch (err) {
      console.error('Unexpected error', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return null; // form disappears after successful save

  return (
    <div className="bg-yellow-50 border border-yellow-300 p-4 my-4 rounded-md max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Let’s finish setting up your profile so others know who you are.</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="givenName">First Name</Label>
          <Input id="givenName" placeholder="Your first name" {...register('givenName', { required: true })} />
          {errors.givenName && <p className="text-sm text-red-500 mt-1">First name is required</p>}
        </div>

        <div>
          <Label htmlFor="familyName">Last Name</Label>
          <Input id="familyName" placeholder="Your last name" {...register('familyName', { required: true })} />
          {errors.familyName && <p className="text-sm text-red-500 mt-1">Last name is required</p>}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </form>
    </div>
  );
}
