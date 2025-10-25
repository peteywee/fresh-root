import type { User, Shift } from "./types";
import { subDays, addDays } from "date-fns";
import placeholderImages from './placeholder-images.json';

const today = new Date();

export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@schedulequick.com",
    role: "admin",
    avatar: placeholderImages.placeholderImages[0].imageUrl,
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "2",
    name: "Manager Mike",
    email: "manager.mike@example.com",
    role: "manager",
    avatar: placeholderImages.placeholderImages[1].imageUrl,
    status: "Active",
    lastLogin: "30 minutes ago",
  },
  {
    id: "3",
    name: "Staff Sarah",
    email: "staff.sarah@example.com",
    role: "staff",
    avatar: placeholderImages.placeholderImages[2].imageUrl,
    status: "Active",
    lastLogin: "5 hours ago",
  },
  {
    id: "4",
    name: "Employee Emily",
    email: "employee.emily@example.com",
    role: "staff",
    avatar: placeholderImages.placeholderImages[3].imageUrl,
    status: "Active",
    lastLogin: "1 day ago",
  },
  {
    id: "5",
    name: "Worker Will",
    email: "worker.will@example.com",
    role: "staff",
    avatar: placeholderImages.placeholderImages[4].imageUrl,
    status: "Inactive",
    lastLogin: "3 days ago",
  },
  {
    id: '6',
    name: 'Technician Tom',
    email: 'tech.tom@example.com',
    role: 'staff',
    avatar: placeholderImages.placeholderImages[5].imageUrl,
    status: 'Active',
    lastLogin: '1 hour ago',
  }
];

export const MOCK_SHIFTS: Shift[] = [
  {
    id: "1",
    title: "Morning Shift",
    start: subDays(today, 2).setHours(9, 0, 0, 0),
    end: subDays(today, 2).setHours(17, 0, 0, 0),
    assignee: "Staff Sarah",
    notes: "Handle opening duties.",
    color: "#3b82f6", // blue
  },
  {
    id: "2",
    title: "Afternoon Shift",
    start: subDays(today, 1).setHours(14, 0, 0, 0),
    end: subDays(today, 1).setHours(22, 0, 0, 0),
    assignee: "Employee Emily",
    notes: "Focus on customer support.",
    color: "#16a34a", // green
  },
  {
    id: "3",
    title: "Full Day",
    start: today.setHours(9, 0, 0, 0),
    end: today.setHours(17, 0, 0, 0),
    assignee: "Manager Mike",
    notes: "Team meeting at 10 AM.",
    color: "#f97316", // orange
  },
  {
    id: "4",
    title: "Morning Shift",
    start: today.setHours(9, 0, 0, 0),
    end: today.setHours(13, 0, 0, 0),
    assignee: "Staff Sarah",
    notes: "Morning rush.",
    color: "#3b82f6", // blue
  },
  {
    id: "5",
    title: "Closing Shift",
    start: addDays(today, 1).setHours(16, 0, 0, 0),
    end: addDays(today, 1).setHours(23, 0, 0, 0),
    assignee: "Worker Will",
    notes: "Perform closing checklist.",
    color: "#9333ea", // purple
  },
  {
    id: "6",
    title: 'Weekend Opening',
    start: addDays(today, 3).setHours(8, 0, 0, 0),
    end: addDays(today, 3).setHours(12, 0, 0, 0),
    assignee: 'Technician Tom',
    notes: 'System maintenance check.',
    color: '#db2777', // pink
  },
];
