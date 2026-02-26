"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, Layers, BookMarked, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/vocabulary", icon: BookMarked, label: "Vocabulary" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col justify-between border-r border-border bg-card px-4 py-7 md:flex">
      {/* Top: Brand + Nav */}
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_4px_12px_#0D948840]">
            <Layers className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-heading text-[22px] font-bold text-foreground">Memzo</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-[15px] transition-colors",
                  isActive
                    ? "bg-muted font-bold text-primary"
                    : "font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: User info */}
      <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-3.5">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary">
          <span className="font-heading text-[13px] font-bold text-white">KW</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[13px] font-bold text-foreground">Kewos</p>
          <p className="truncate font-body text-[11px] text-muted-foreground">kewos@example.com</p>
        </div>
      </div>
    </aside>
  );
}
