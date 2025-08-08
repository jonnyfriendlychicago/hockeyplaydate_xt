// components/chapter/JoinChapterButton.tsx // recall that exported React components must be PascalCase, or just won't work.  So, name file same for clarity.

'use client'; // future form logic will likely need it

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface JoinChapterButtonProps {
  anonVisitor: boolean;
  authVisitor: boolean;
}

export function JoinChapterButton({ anonVisitor, authVisitor }: JoinChapterButtonProps) {
  if (!anonVisitor && !authVisitor) return null;

  if (anonVisitor) {
    return (
      <Link href="/auth/login">
        <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" />
          Join Chapter
        </Button>
      </Link>
    );
  }
  // future state: replace with form submission
  return (
    <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md" >
      <PlusCircle className="w-4 h-4 mr-2" />
      Join Chapter
    </Button>
  );
}
