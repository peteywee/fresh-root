// [P3][APP][CODE] App group layout with sidebar
// Tags: P3, APP, CODE, LAYOUT
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen gap-0">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full px-4 py-6 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
