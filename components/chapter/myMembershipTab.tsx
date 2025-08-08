// components/Chapter/MyMembershipTab.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator'; // npx shadcn@latest add separator
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from '@/components/ui/dialog'; // npx shadcn@latest add dialog
import { useState } from 'react';

interface MyMembershipTabProps {
  joinDate: string;
  memberRole: 'MEMBER' | 'MANAGER';
  isActive: boolean;
}

export function MyMembershipTab({ joinDate, memberRole, isActive }: MyMembershipTabProps) {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Chapter Membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{isActive ? 'Active' : 'Inactive'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{memberRole === 'MANAGER' ? 'Manager' : 'Member'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Joined</p>
            <p className="font-medium">{joinDate}</p>
          </div>

          {memberRole !== 'MANAGER' && (
            <div>
              <Separator />
              <Button variant="secondary" className="mt-4">
                Request Organizer Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <h3 className="text-red-800 text-sm font-semibold mb-2">Danger Zone</h3>

        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">Leave This Chapter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Leaving this chapter will revoke your access to events and member features. You can rejoin later
              if your request is approved.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive">Confirm Leave</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
