"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav in full-screen modes
  if (
    /\/decks\/[^/]+\/study/.test(pathname) ||
    /\/decks\/[^/]+\/study-method/.test(pathname)
  )
    return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 rounded-[16px] border-t border-border bg-card md:hidden"
      style={{paddingBottom: 'env(safe-area-inset-bottom, 0px)'}}
    >
      <div className="mx-auto flex h-20 max-w-lg items-center justify-between px-2.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-20 flex-col items-center justify-center gap-1 rounded-[16px] py-2.5 transition-colors",
                isActive ? "bg-muted" : ""
              )}
            >
              <item.icon
                className={cn(
                  "h-[22px] w-[22px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "font-body text-[11px]",
                  isActive
                    ? "font-bold text-primary"
                    : "font-semibold text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
