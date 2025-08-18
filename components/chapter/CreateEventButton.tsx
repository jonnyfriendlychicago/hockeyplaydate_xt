'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface CreateEventButtonProps {
  slug: string;
  mgrMember: boolean; 
}

export function CreateEventButton({ mgrMember, slug }: CreateEventButtonProps) {
    if (!mgrMember ) return null;

  return (
    <Link href={`/event/manage-backend-test?chapter=${slug}`}> 
      <Button className="bg-blue-700 hover:bg-blue-800 text-white h-10 px-6 text-base shadow-md">
        <PlusCircle className="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </Link>
  );
}
