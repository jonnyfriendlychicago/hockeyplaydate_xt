// components/UserProfile/EditUserProfileBackendTestForm.tsx
// this entire file purely for testing backend api; it is not intended for production use

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// import InputMask from 'react-input-mask';
import { useSafeRedirect } from '@/lib/navigation';
import { RawUserProfileInputType } from '@/app/types/forms/rawUserProfileInputType';


type Props = {
  initialValues: RawUserProfileInputType;
  defaultSluggy: string;
  authUserEmail: string;
};

export default function EditUserProfileBackendTestForm({ initialValues, defaultSluggy, authUserEmail }: Props) {
  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);
  const [errorOutput, setErrorOutput] = useState('');
  const [formValues, setFormValues] = 
//   useState({...initialValues,});
  useState<RawUserProfileInputType>(initialValues);

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorOutput('');

    try {
      const res = await fetch('/api/user-profile/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      const result = await res.json();

      if (res.ok) {
        const sluggy = result.slugVanity || result.slugDefault;
        safeRedirect(`/member/${sluggy}`);
      } else {
        setErrorOutput(JSON.stringify(result, null, 2));
      }
//     } catch (err: any) {
//       setErrorOutput(err.message || 'Unexpected error');
      
//     } finally {
//       setLoading(false);
//     }
//   };

        } catch (err) {
            if (err instanceof Error) {
            setErrorOutput(err.message);
            } else {
            setErrorOutput('Unexpected error');
            }
        } finally {
            setLoading(false);
        }
        };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Custom URL */}
      <div>
        <label className="block text-sm font-medium">Custom Profile URL</label>
        <div className="flex items-center rounded-md border px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-ring">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            https://hockeyplaydate.com/member/
          </span>
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
            placeholder="radhockeydad"
            value={formValues.slugVanity ?? ''}
            onChange={(e) => handleChange('slugVanity', e.target.value)}
            disabled={loading}
          />
          
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          By default, your profile is located at: <code className="break-all text-muted-foreground">https://hockeyplaydate.com/member/{defaultSluggy}</code> <br />
              You can create a custom profile address using the field above, which will make your profile address: <br />
              <code className="break-all text-muted-foreground">https://hockeyplaydate.com/member/what-you-enter-above</code> <br />
              You can change this custom profile value anytime; you can also delete it, which will reset your profile address to be the default.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Family Brand Name</label>
        <Input
          placeholder="The Smith Family, Jones Crew, etc."
          value={formValues.altNickname ?? ''}
          onChange={(e) => handleChange('altNickname', e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">First Name</label>
        <Input
          value={formValues.givenName ?? ''}
          onChange={(e) => handleChange('givenName', e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Last Name</label>
        <Input
          value={formValues.familyName ?? ''}
          onChange={(e) => handleChange('familyName', e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Alternate Email</label>
        <Input
          placeholder="alternate@email.com"
          value={formValues.altEmail ?? ''}
          onChange={(e) => handleChange('altEmail', e.target.value)}
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {authUserEmail} is your login email. This alternate email will be shown/shared instead, if provided.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Phone Number</label>
        {/* <InputMask
          mask="999.999.9999"
          placeholder="123.456.7890"
          maskChar=""
          value={formValues.phone ?? ''}
          onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
          disabled={loading}
        >
          {(inputProps) => <Input {...inputProps} />}
        </InputMask> */}

        <Input
        placeholder="1234567890 or any string"
        value={formValues.phone ?? ''}
        onChange={(e) => handleChange('phone', e.target.value)}
        disabled={loading}
        />
      </div>

      <Button type="submit" className={loading ? 'opacity-50 cursor-not-allowed' : ''} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>

      <Textarea
        value={errorOutput}
        readOnly
        rows={10}
        className="text-sm font-mono text-red-600"
        placeholder="Error output from backend will appear here..."
      />
    </form>
  );
}
