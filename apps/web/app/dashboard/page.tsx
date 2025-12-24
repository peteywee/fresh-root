// Server page wrapper to force dynamic rendering
export const dynamic = "force-dynamic";

import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return <DashboardClient />;
}
