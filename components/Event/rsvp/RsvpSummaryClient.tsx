// components/Event/rsvp/RsvpSummaryClient.tsx

'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChevronDown, ChevronUp , Info } from "lucide-react";

interface RsvpSummaryClientProps {
  youthPlayers: number;
  adultPlayers: number;
  adultSpectators: number;
  youthSpectators: number;
  maybeCount: number;
}

function CountDisplay({ label, count }: { label: string; count: number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{count}</p>
    </div>
  );
}

export function RsvpSummaryClient({ 
  youthPlayers, 
  adultPlayers, 
  adultSpectators, 
  youthSpectators,
  maybeCount 
}: RsvpSummaryClientProps) {
  const [showSpectators, setShowSpectators] = useState(false);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          RSVP Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Players Section - YES counts only */}
        <div className="grid grid-cols-2 gap-6">
          <CountDisplay label="Youth Players" count={youthPlayers} />
          <CountDisplay label="Adult Players" count={adultPlayers} />
        </div>

        {/* Toggle Spectators */}
        <button
          onClick={() => setShowSpectators(!showSpectators)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {showSpectators ? (
            <>
              Hide Spectators <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Spectators Count <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Spectators Section (Collapsible) - YES counts only */}
        {showSpectators && (
          <div className="space-y-6 pt-4 ">
            <div className="grid grid-cols-2 gap-6">
              <CountDisplay label="Adult Spectators" count={adultSpectators} />
              <CountDisplay label="Youth Spectators" count={youthSpectators} />
            </div>
          </div>
        )}

        {/* Maybe Notice - only show if maybes exist */}
        {maybeCount > 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {maybeCount} {maybeCount === 1 ? 'family has' : 'families have'} responded &quot;maybe&quot;
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
