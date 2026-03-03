"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, BookOpen, Layers, BookMarked, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/decks", icon: Layers, label: "Decks" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/vocabulary", icon: BookMarked, label: "Vocabulary" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_4px_12px_#0D948840] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px] text-white" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col justify-between border-r border-border bg-card px-4 py-7 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-[15px] transition-colors",
                    isActive
                      ? "bg-muted font-bold text-primary"
                      : "font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Avatar (→ /profile) + name/email + logout */}
        <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-3.5">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-80"
            aria-label="Go to profile"
          >
            <span className="font-heading text-[13px] font-bold text-white">{initials}</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] font-bold text-foreground truncate">{user?.name ?? "—"}</p>
            <p className="truncate font-body text-[11px] text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
