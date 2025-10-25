import { Button } from "@/components/ui/button";
import { TeamMembersTable } from "@/components/team-members-table";
import { Plus } from "lucide-react";
import { MOCK_USERS } from "@/lib/data";

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Team Members</h1>
          <p className="text-muted-foreground">
            Invite and manage your organization&apos;s members.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>
      <TeamMembersTable users={MOCK_USERS} />
    </div>
  );
}
