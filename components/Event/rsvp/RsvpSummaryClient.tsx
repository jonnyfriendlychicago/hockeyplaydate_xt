// components/Event/rsvp/RsvpSummaryClient.tsx

'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

interface CountBreakdown {
  yes: number;
  maybe: number;
  total: number;
}

interface RsvpSummaryClientProps {
  players: {
    youth: CountBreakdown;
    adult: CountBreakdown;
  };
  spectators: {
    adult: CountBreakdown;
    youth: CountBreakdown;
  };
  totalHumans: CountBreakdown;
}

function CountDisplay({ label, breakdown }: { label: string; breakdown: CountBreakdown }) {
  const hasMaybe = breakdown.maybe > 0;
  
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{breakdown.total}</p>
      {hasMaybe ? (
        <p className="text-xs text-muted-foreground">
          ({breakdown.yes} yes • {breakdown.maybe} maybe)
        </p>
      ) : breakdown.total > 0 ? (
        <p className="text-xs text-muted-foreground">attending</p>
      ) : null}
    </div>
  );
}

export function RsvpSummaryClient({ players, spectators, totalHumans }: RsvpSummaryClientProps) {
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
        
        {/* Players Section */}
        <div className="grid grid-cols-2 gap-6">
          <CountDisplay label="Youth Players" breakdown={players.youth} />
          <CountDisplay label="Adult Players" breakdown={players.adult} />
        </div>

        {/* Toggle Spectators */}
        <button
          onClick={() => setShowSpectators(!showSpectators)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {showSpectators ? (
            <>
              Hide spectators <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show spectators <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Spectators Section (Collapsible) */}
        {showSpectators && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <CountDisplay label="Adult Spectators" breakdown={spectators.adult} />
              <CountDisplay label="Youth Spectators" breakdown={spectators.youth} />
            </div>

            {/* Total Humans */}
            <div className="pt-4 border-t">
              <CountDisplay label="Total Humans" breakdown={totalHumans} />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}