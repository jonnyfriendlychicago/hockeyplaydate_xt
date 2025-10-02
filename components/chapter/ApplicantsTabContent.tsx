// components/chapter/ApplicantsTabContent.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { prisma } from "@/lib/prisma";
import { ApplicantsTabClient } from "./ApplicantsTabClient";

interface ApplicantsTabContentProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

async function getChapterApplicants(chapterId: number) {
  return await prisma.chapterMember.findMany({
    where: {
      chapterId: chapterId,
      memberRole: 'APPLICANT'
    },
    include: {
      userProfile: {
        select: {
          id: true,
          givenName: true,
          familyName: true,
          slugDefault: true,
          slugVanity: true,
          authUser: {
            select: {
              picture: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function ApplicantsTabContent({ chapterId, userChapterMember }: ApplicantsTabContentProps) {
  const applicants = await getChapterApplicants(chapterId);

  // Get chapter slug
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { slug: true }
  });

  return (
    <ApplicantsTabClient 
      applicants={applicants}
      userChapterMember={userChapterMember}
      chapterSlug={chapter?.slug || ''}
    />
  );
}

// below was claude draft 1.0

// import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
// import { ChapterMemberCard } from "./ChapterMemberCard";
// import { prisma } from "@/lib/prisma";

// interface ApplicantsTabContentProps {
//   chapterId: number;
//   userChapterMember: UserChapterStatus;
// }

// async function getChapterApplicants(chapterId: number) {
//   return await prisma.chapterMember.findMany({
//     where: {
//       chapterId: chapterId,
//       memberRole: 'APPLICANT'
//     },
//     include: {
//       userProfile: {
//         include: {
//           authUser: {
//             select: {
//               picture: true
//             }
//           }
//         }
//       }
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });
// }

// export async function ApplicantsTabContent({ chapterId, userChapterMember }: ApplicantsTabContentProps) {
//   const applicants = await getChapterApplicants(chapterId);

// //   const handleEdit = (member: any) => {
// //     // TODO: Open management modal
// //     console.log('Edit member:', member);
// //   };

//   const handleEdit = (member: ChapterMember) => {
//   // TODO: Open management modal
//   console.log('Edit member:', member);
//     };

//   if (applicants.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-muted-foreground">No pending applications</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-semibold">Pending Applications ({applicants.length})</h3>
//       <div className="space-y-2">
//         {applicants.map((applicant) => (
//           <ChapterMemberCard
//             key={applicant.id}
//             member={applicant}
//             showEditButton={userChapterMember.mgrMember}
//             onEdit={handleEdit}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// below is original placeholder content

// import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";

// interface ApplicantsTabContentProps {
//   chapterId: number;
//   userChapterMember: UserChapterStatus;
// }

// export function ApplicantsTabContent({ chapterId, userChapterMember }: ApplicantsTabContentProps) {

//     console.log(chapterId )
//     console.log(userChapterMember )
//     return (
//         <p className="text-muted-foreground italic">[Applicants Tab - To Be Built]</p>
//     );


// }