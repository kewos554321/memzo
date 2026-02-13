"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/ai", icon: Sparkles, label: "AI" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav in deck study mode (full-screen)
  if (/\/decks\/[^/]+\/study/.test(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-3 border-border bg-card/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
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
                "flex flex-col items-center gap-0.5 rounded-2xl px-5 py-2 transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
