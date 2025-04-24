'use client';

// import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'; // npm install @heroicons/react // more info: https://github.com/tailwindlabs/heroicons

type Props = {
  text: string;
};

export function CopyText({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); // Reset icon after 1.5s
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
    onClick={handleCopy}
    type="button"
    aria-label="Copy to clipboard"
    className='ml-2 p-1 hover:text-primary text-muted-foreground transition-all duration-150'
    >
    {copied ? (
      <CheckIcon className="w-4 h-4" />
    ) : (
      <ClipboardIcon className="w-4 h-4" />
    )}
    </button>


  );
}
