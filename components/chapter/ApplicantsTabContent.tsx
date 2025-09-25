// components/chapter/ApplicantsTabContent.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";

interface ApplicantsTabContentProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

export function ApplicantsTabContent({ chapterId, userChapterMember }: ApplicantsTabContentProps) {

    console.log(chapterId )
    console.log(userChapterMember )
    return (
        <p className="text-muted-foreground italic">[Applicants Tab - To Be Built]</p>
    );
}