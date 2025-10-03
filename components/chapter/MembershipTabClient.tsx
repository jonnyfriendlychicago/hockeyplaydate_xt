// components/chapter/MembershipTabClient.tsx

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMaskedRole } from "@/lib/types/chapterMember";
import { format } from "date-fns";
import { LeaveChapterModal } from "./LeaveChapterModal";

interface MembershipTabClientProps {
  membership: {
    id: number;
    memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
    joinedAt: Date;
  };
  isSoleManager: boolean;
  chapterSlug: string;
  chapterName: string;
}

export function MembershipTabClient({ membership, isSoleManager, chapterSlug, chapterName }: MembershipTabClientProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Membership Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Membership</CardTitle>
          <CardDescription>Information about your chapter membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <div className="mt-1">
              <Badge variant="secondary">{getMaskedRole(membership.memberRole)}</Badge>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Joined:</span>
            <p className="mt-1">{format(membership.joinedAt, 'MMMM d, yyyy')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          {isSoleManager ? (
            <div>
              <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                Leave Chapter
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Cannot leave - you are the only manager. Promote another member to manager first.
              </p>
            </div>
          ) : (
            <div>
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsLeaveModalOpen(true)}
              >
                Leave Chapter
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                You can rejoin by applying again later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveChapterModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        chapterSlug={chapterSlug}
        chapterName={chapterName}
      />
    </div>
  );
}

// below is how it looked before modal introduction

// 'use client';

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { getMaskedRole } from "@/lib/types/chapterMember";
// import { format } from "date-fns";
// import { leaveChapterAction } from "@/app/(root)/[slug]/actions";

// interface MembershipTabClientProps {
//   membership: {
//     id: number;
//     memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
//     joinedAt: Date;
//   };
//   isSoleManager: boolean;
//   chapterSlug: string;
// }

// export function MembershipTabClient({ membership, isSoleManager, chapterSlug }: MembershipTabClientProps) {
//   return (
//     <div className="space-y-6">
//       {/* Membership Details */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Membership</CardTitle>
//           <CardDescription>Information about your chapter membership</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div>
//             <span className="text-sm font-medium text-muted-foreground">Role:</span>
//             <div className="mt-1">
//               <Badge variant="secondary">{getMaskedRole(membership.memberRole)}</Badge>
//             </div>
//           </div>
//           <div>
//             <span className="text-sm font-medium text-muted-foreground">Joined:</span>
//             <p className="mt-1">{format(membership.joinedAt, 'MMMM d, yyyy')}</p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Danger Zone */}
//       <Card className="border-red-200">
//         <CardHeader>
//           <CardTitle className="text-red-800">Danger Zone</CardTitle>
//           <CardDescription></CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isSoleManager ? (
//             <div>
//               <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
//                 Leave Chapter
//               </Button>
//               <p className="text-sm text-muted-foreground mt-2">
//                 Cannot leave - you are the only manager. Promote another member to manager first.
//               </p>
//             </div>
//           ) : (
//             <div>
//               <form action={leaveChapterAction}>
//                 <input type="hidden" name="chapterSlug" value={chapterSlug} />
//                 <Button 
//                   type="submit"
//                   variant="destructive"
//                   className="bg-red-600 hover:bg-red-700"
//                 >
//                   Leave Chapter
//                 </Button>
//               </form>
//               <p className="text-sm text-muted-foreground mt-2">
//                 You can rejoin by applying again later.
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }