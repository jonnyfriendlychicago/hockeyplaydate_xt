// app/[root]/new-chapter/page.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Users, Calendar, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

// devNotes: the key word 'default' below is required for Next.js page components, i.e. page.tsx
export default function NewChapterPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Start Your Own Hockey Playdate Chapter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {/* Bring hockey enthusiasts together in your area. Create a community, 
              organize events, and grow the sport you love. */}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Cost Section */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cost</h2>
            </div>
            <p className="text-gray-700 text-lg font-medium">
              FREE. Keep reading!
            </p>
          </CardContent>
        </Card>

        {/* Your Responsibilities */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Your Responsibilities</h2>
            </div>
            <p className="text-gray-700 mb-4">
              As a chapter founder, you&apos;ll be the first manager of your chapter, which entails...
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                <span>Find and rent out a rink/space in your area</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                <span>Recruit friends/neighbors to join HPD/your chapter</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                <span>Manage chapter members</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                <span>Create/schedule the playdate events</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                <span>Facilitate on-site each playdate event</span>
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              To the extent you desire, you can also promote member(s) to be co-managers of 
              the chapter, so you don&apos;t need to do it all.
            </p>
          </CardContent>
        </Card>

        {/* What We Provide */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">What We Provide</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                <span>All the tools/permissions needed for you to manage everything for your chapter on hockeyplaydate.com</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Online payment processing for your attendees, as part of your members&apos; RSVP process</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Prompt reimbursement of your rink rental expenses, drawn from your event&apos;s RSVP payments</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Operational support, consultation and mentoring from our seasoned leadership</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Get Started Section */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Ready to Get Started?</h2>
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Email us at{' '}
                <a 
                  href="mailto:chapters@hockeyplaydate.com" 
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  chapters@hockeyplaydate.com
                </a>
                {' '}and we&apos;ll discuss the details. We&apos;re excited to partner with you!
              </p>
              <div className="pt-4">
                <a href="mailto:chapters@hockeyplaydate.com">
                  <Button size="lg" className="inline-flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Us About Your Chapter
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Chapters */}
        <div className="text-center pt-4">
          <Link href="/chapters" className="text-blue-600 hover:text-blue-800 underline text-sm">
            ← Back to Chapters
          </Link>
        </div>

      </div>
    </div>
  );
}