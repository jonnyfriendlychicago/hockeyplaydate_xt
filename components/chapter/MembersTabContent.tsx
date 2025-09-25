// components/chapter/MembersTabContent.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";

interface MembersTabContentProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

export function MembersTabContent({ chapterId, userChapterMember }: MembersTabContentProps) {
    
    console.log(chapterId )
    console.log(userChapterMember )
    
    return (
        <p className="text-muted-foreground italic">[Members Tab - To Be Built]</p>
    );
}