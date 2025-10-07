// components/Chapters/NewChapterApplicationBanner.tsx

"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NewChapterApplicationBanner() {
  const [showMobileBanner, setShowMobileBanner] = useState(false);

  return (
    <>
      {/* Desktop: Full banner as usual */}
      <div className="hidden md:block mb-8">
        <Card className="border-blue-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Ready to organize a new Hockey Playdate chapter?
                </h3>
              </div>
              <Link href="/new-chapter">
                <Button 
                  variant="outline" 
                  className="sm:ml-4 sm:flex-shrink-0 w-full sm:w-auto inline-flex items-center gap-2"
                >
                  Learn More
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Progressive disclosure */}
      <div className="block md:hidden mb-6">
        {!showMobileBanner ? (
          // Compact trigger - minimal space usage
          <div className="text-center py-2">
            <button 
              onClick={() => setShowMobileBanner(true)}
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              Ready to start a new chapter?
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Expanded content with link to full page
          <Card className="border-blue-200 bg-white">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-gray-900 flex-1">
                  Ready to start a new chapter?
                </h3>
                <button 
                  onClick={() => setShowMobileBanner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <Link href="/new-chapter">
                <Button size="sm" className="w-full inline-flex items-center gap-2">
                  Learn More & Apply
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}