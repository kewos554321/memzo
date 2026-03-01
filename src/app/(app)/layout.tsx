import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar />
      <MobileNav />
      <div className="flex flex-1 flex-col md:ml-60">
        {children}
      </div>
    </div>
  );
}
