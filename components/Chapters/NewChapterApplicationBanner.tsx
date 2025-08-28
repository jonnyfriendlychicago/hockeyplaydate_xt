// components/Chapters/NewChapterApplicationBanner.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const NewChapterApplicationBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-8 border-blue-200 bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Ready to organize a new Hockey Playdate chapter?
            </h3>
            {/* <p className="text-gray-600 text-sm">
              Start a chapter in your area and build local hockey connections.
            </p> */}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:ml-4 sm:flex-shrink-0 w-full sm:w-auto"
          >
            {isExpanded ? 'Show Less' : 'Learn More'}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-4 text-sm text-gray-700">
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cost:</h4>
                <p>
                  FREE. Keep reading!
                  </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your responsibilities:</h4>
                <p className="mb-3">As a chapter founder, you&apos;ll be the first manager of your chapter, which entails... <br/> </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>find and rent out a rink/space in your area</li>
                  <li>recruit friends/neighbors to join HPD/your chapter</li>
                  <li>manage chapter members</li>
                  <li>create/schedule the playdate events</li>
                  <li>facilitate on-site each playdate event</li>
                </ul>
                <p className="mt-3">To the extent you desire, you can also promote member(s) to be co-managers of the chapter, so you don&apos;t need to do it all.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What we provide:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All the tools/permissions needed for you to manage everything for your chapter on hockeyplaydate.com</li>
                  <li>Online payment processing for your attendees, as part of your members&apos; RSVP process</li>
                  <li>Prompt reimbursement of your rink rental expenses, drawn from your event&apos;s RSVP payments</li>
                  <li>Operational support, consultation and mentoring from our seasoned leadership</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ready to get started?</h4>
                <p>
                  Email us at{' '}
                  <a href="mailto:chapters@hockeyplaydate.com" className="text-blue-600 hover:text-blue-800 underline">
                    chapters@hockeyplaydate.com
                  </a>
                  {' '}and we&apos;ll discuss the details. We&apos;re excited to partner with you!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};




// orig first draft



// // components/Chapters/NewChapterApplicationBanner.tsx
// 'use client';

// import { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

// export const NewChapterApplicationBanner = () => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   return (
//     <Card className="mb-8 border-blue-200 bg-white">
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900 mb-1">
//               Ready to create a new Hockey Playdate chapter?
//             </h3>
//             {/* <p className="text-gray-600 text-sm">
//               Start a chapter in your area and build local hockey connections.
//             </p> */}
//           </div>
//           <Button 
//             variant="outline" 
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="ml-4 flex-shrink-0"
//           >
//             {isExpanded ? 'Show Less' : 'Learn More'}
//           </Button>
//         </div>
        
//         {isExpanded && (
//           <div className="mt-6 pt-4 border-t border-gray-100">
//             <div className="space-y-4 text-sm text-gray-700">
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">What does it mean to start a chapter?</h4>
//                 <p>As a chapter founder, youquotell organize local hockey events, build community among hockey families, and help grow the sport in your area. Itquotes free to start and we provide all the tools you need.</p>
//               </div>
              
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">What we provide:</h4>
//                 <ul className="list-disc list-inside space-y-1 ml-2">
//                   <li>Free platform and event management tools</li>
//                   <li>Marketing support and chapter promotion</li>
//                   <li>Community guidelines and best practices</li>
//                   <li>Ongoing support from our team</li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Ready to get started?</h4>
//                 <p>
//                   Email us at{' '}
//                   <a href="mailto:chapters@hockeyplaydate.com" className="text-blue-600 hover:text-blue-800 underline">
//                     chapters@hockeyplaydate.com
//                   </a>
//                   {' '}and wequotell discuss the details. Wequotere excited to partner with you!
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };