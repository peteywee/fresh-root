"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Shift, User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/data";
import { format } from "date-fns";

interface ShiftEditorProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  shift: Shift | null;
  day: Date;
}

export function ShiftEditor({
  isOpen,
  setOpen,
  shift,
  day,
}: ShiftEditorProps) {
  const title = shift ? "Edit Shift" : "Add Shift";
  const description = shift
    ? `Editing shift on ${format(day, "MMMM d, yyyy")}.`
    : `Adding a new shift for ${format(day, "MMMM d, yyyy")}.`;

  const availableStaff = MOCK_USERS.filter(
    (user) => user.role === "staff" || user.role === "manager"
  );

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={shift?.title || "New Shift"}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Select defaultValue={shift?.assignee}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.name}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              defaultValue={
                shift ? format(new Date(shift.start), "HH:mm") : "09:00"
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              defaultValue={
                shift ? format(new Date(shift.end), "HH:mm") : "17:00"
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes for this shift..."
              defaultValue={shift?.notes || ""}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {shift && (
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                setOpen(false);
              }}
            >
              Delete Shift
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle save logic here
                setOpen(false);
              }}
            >
              Save Shift
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
