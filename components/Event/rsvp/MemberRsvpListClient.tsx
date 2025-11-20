// components/Event/rsvp/MemberRsvpListClient.tsx

'use client';

import { useState } from 'react';
import { MemberWithRsvp } from '@/lib/types/memberRsvp';
import { RsvpStatus } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { MemberRsvpCard } from './MemberRsvpCard';
import { RsvpModal } from './RsvpModal';

interface MemberRsvpListClientProps {
  members: MemberWithRsvp[];
  eventSlug: string;
  // currentUserProfileId: number | null;
  isManager: boolean;
}

export function MemberRsvpListClient({
  members,
  eventSlug,
  // currentUserProfileId,
  isManager,
}: MemberRsvpListClientProps) {

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal state
  const [selectedMember, setSelectedMember] = useState<MemberWithRsvp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // =====================================================
  // FILTERING LOGIC
  // =====================================================

  // Filter members by name (only used in "All" tab)
  const getFilteredMembers = () => {
    if (!searchQuery) return members;
    
    return members.filter(member => {
      const fullName = `${member.userProfile.givenName || ''} ${member.userProfile.familyName || ''}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  };

  // Get members by status
  const getGoingMembers = () => members.filter(m => m.rsvp?.rsvpStatus === RsvpStatus.YES);
  const getOutMembers = () => members.filter(m => m.rsvp?.rsvpStatus === RsvpStatus.NO);
  const getMaybeMembers = () => members.filter(m => m.rsvp?.rsvpStatus === RsvpStatus.MAYBE);
  const getNoReplyMembers = () => members.filter(m => !m.rsvp || m.rsvp.rsvpStatus === null);

  // Determine which list to display based on active tab
  const getDisplayMembers = () => {
    switch (activeTab) {
      case 'all':
        return getFilteredMembers(); // Respects search
      case 'going':
        return getGoingMembers();
      case 'out':
        return getOutMembers();
      case 'maybe':
        return getMaybeMembers();
      case 'noReply':
        return getNoReplyMembers();
      default:
        return members;
    }
  };

  const displayMembers = getDisplayMembers();

  // =====================================================
  // COUNT CALCULATIONS
  // =====================================================

  const allCount = members.length;
  const goingCount = getGoingMembers().length;
  const outCount = getOutMembers().length;
  const maybeCount = getMaybeMembers().length;
  const noReplyCount = getNoReplyMembers().length;

  // =====================================================
  // MODAL HANDLERS
  // =====================================================

  const handleEdit = (member: MemberWithRsvp) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // =====================================================
  // CARD RENDERING HELPER
  // =====================================================

  const renderMemberCards = (membersList: MemberWithRsvp[]) => {
    if (membersList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery ? `No members found matching "${searchQuery}"` : 'No members in this category'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {membersList.map((member) => {
          // const isOwnCard = currentUserProfileId === member.userProfileId;
          const isOwnCard = member.isCurrentUser; 
          const showEditButton = isManager && !isOwnCard;

          return (
            <MemberRsvpCard
              // key={member.id}
              key={member.presentableId}
              member={member}
              isOwnCard={isOwnCard}
              showEditButton={showEditButton}
              onEdit={handleEdit}
            />
          );
        })}
      </div>
    );
  };

  // =====================================================
  // DESKTOP: TABS
  // =====================================================

  const desktopView = (
    <div className="hidden md:block">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        
        <TabsList className="flex flex-wrap gap-2 justify-start">
          <TabsTrigger value="all">All ({allCount})</TabsTrigger>
          <TabsTrigger value="going">Going ({goingCount})</TabsTrigger>
          <TabsTrigger value="out">Out ({outCount})</TabsTrigger>
          <TabsTrigger value="maybe">Maybe ({maybeCount})</TabsTrigger>
          <TabsTrigger value="noReply">No Reply ({noReplyCount})</TabsTrigger>
        </TabsList>

        {/* ALL TAB - with search */}
        <TabsContent value="all" className="space-y-4">
          {/* Search Filter */}
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search members by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {displayMembers.length} of {allCount} members
              </p>
            )}
          </div>

          {renderMemberCards(displayMembers)}
        </TabsContent>

        {/* GOING TAB */}
        <TabsContent value="going">
          {renderMemberCards(displayMembers)}
        </TabsContent>

        {/* OUT TAB */}
        <TabsContent value="out">
          {renderMemberCards(displayMembers)}
        </TabsContent>

        {/* MAYBE TAB */}
        <TabsContent value="maybe">
          {renderMemberCards(displayMembers)}
        </TabsContent>

        {/* NO REPLY TAB */}
        <TabsContent value="noReply">
          {renderMemberCards(displayMembers)}
        </TabsContent>

      </Tabs>
    </div>
  );

  // =====================================================
  // MOBILE: ACCORDION
  // =====================================================

  const mobileView = (
    <div className="block md:hidden">
      <Accordion type="single" collapsible defaultValue="all">
        
        {/* ALL SECTION - with search */}
        <AccordionItem value="all">
          <AccordionTrigger>All ({allCount})</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Search Filter */}
            <div>
              <Input
                type="text"
                placeholder="Search members by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {getFilteredMembers().length} of {allCount} members
                </p>
              )}
            </div>

            {renderMemberCards(getFilteredMembers())}
          </AccordionContent>
        </AccordionItem>

        {/* GOING SECTION */}
        <AccordionItem value="going">
          <AccordionTrigger>Going ({goingCount})</AccordionTrigger>
          <AccordionContent>
            {renderMemberCards(getGoingMembers())}
          </AccordionContent>
        </AccordionItem>

        {/* OUT SECTION */}
        <AccordionItem value="out">
          <AccordionTrigger>Out ({outCount})</AccordionTrigger>
          <AccordionContent>
            {renderMemberCards(getOutMembers())}
          </AccordionContent>
        </AccordionItem>

        {/* MAYBE SECTION */}
        <AccordionItem value="maybe">
          <AccordionTrigger>Maybe ({maybeCount})</AccordionTrigger>
          <AccordionContent>
            {renderMemberCards(getMaybeMembers())}
          </AccordionContent>
        </AccordionItem>

        {/* NO REPLY SECTION */}
        <AccordionItem value="noReply">
          <AccordionTrigger>No Reply ({noReplyCount})</AccordionTrigger>
          <AccordionContent>
            {renderMemberCards(getNoReplyMembers())}
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Member RSVPs</h3>

      {/* Desktop Tabs */}
      {desktopView}

      {/* Mobile Accordion */}
      {mobileView}

      {/* RSVP Modal */}
      <RsvpModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        eventSlug={eventSlug}
        currentRsvp={selectedMember?.rsvp ? {
          rsvpStatus: selectedMember.rsvp.rsvpStatus,
          playersYouth: selectedMember.rsvp.playersYouth,
          playersAdult: selectedMember.rsvp.playersAdult,
          spectatorsAdult: selectedMember.rsvp.spectatorsAdult,
          spectatorsYouth: selectedMember.rsvp.spectatorsYouth,
        } : null}
        isManagerMode={true}
        targetUserName={selectedMember ? `${selectedMember.userProfile.givenName || ''} ${selectedMember.userProfile.familyName || ''}`.trim() : undefined}
        // targetUserProfileId={selectedMember?.userProfileId}
        targetUserSlug={selectedMember?.userProfile.slugDefault} 
      />
    </div>
  );
}