// components/profile/EditProfileForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  userProfile: {
    altEmail: string | null;
    phone: string | null;
    slugVanity: string | null;
    givenName: string | null;
    familyName: string | null;
  };
};

type FormData = {
  altEmail: string;
  phone: string;
  slugVanity: string;
  givenName: string;
  familyName: string;
};

export default function EditProfileForm({ userProfile }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      altEmail: userProfile.altEmail || '',
      phone: userProfile.phone || '',
      slugVanity: userProfile.slugVanity || '',
      givenName: userProfile.givenName || '',
      familyName: userProfile.familyName || '',
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-profile/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        console.error('Update failed');
        // Optionally show user-facing error message
      } else {
        // Refresh or redirect after success
        window.location.href = '/members';
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="givenName">First Name</Label>
            <Input id="givenName" {...register('givenName')} />
            {errors.givenName && <p className="text-red-500 text-sm">Required</p>}
          </div>

          <div>
            <Label htmlFor="familyName">Last Name</Label>
            <Input id="familyName" {...register('familyName')} />
            {errors.familyName && <p className="text-red-500 text-sm">Required</p>}
          </div>

          <div>
            <Label htmlFor="slugVanity">Custom Profile URL</Label>
            <Input id="slugVanity" {...register('slugVanity')} />
          </div>

          <div>
            <Label htmlFor="altEmail">Alternate Email</Label>
            <Input id="altEmail" {...register('altEmail')} />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
