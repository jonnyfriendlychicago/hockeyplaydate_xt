// components/Chapters/CreateChapterButton.tsx
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CreateChapterButtonProps {
  isAdmin: boolean;
}

export function CreateChapterButton({ isAdmin }: CreateChapterButtonProps) {
  if (!isAdmin) return null;

  return (
    <Link href="/admin/create-chapter"> {/* Update this URL when you build the admin page */}
      <Button variant="outline" className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create New Chapter
      </Button>
    </Link>
  );
}