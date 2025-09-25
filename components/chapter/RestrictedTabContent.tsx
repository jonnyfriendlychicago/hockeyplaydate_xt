// components/chapter/RestrictedTabContent.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";

interface RestrictedTabContentProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

export function RestrictedTabContent({ chapterId, userChapterMember }: RestrictedTabContentProps) {

    console.log(chapterId )
    console.log(userChapterMember )

    return (
        <p className="text-muted-foreground italic">[Restricted Tab - To Be Built]</p>
    );
}