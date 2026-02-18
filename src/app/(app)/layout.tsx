import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-60">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
