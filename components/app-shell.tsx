"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavRail } from "@/components/nav-rail";
import {
  Sidebar,
  buildAdminNav,
  buildMemberNav,
  MOCK_MEMBERSHIPS,
  type SidebarUser,
} from "@/components/sidebar";
import { useShellVariant } from "@/components/shell-variant-provider";

export type AppShellVariant = "admin" | "member";

export function AppShell({
  variant: variantProp,
  role: roleProp,
  orgId,
  children,
}: {
  variant?: AppShellVariant;
  role?: "member" | "org_admin";
  orgId?: string;
  children: React.ReactNode;
}) {
  const { variant: devVariant } = useShellVariant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState<string>("…");
  const pathname = usePathname();

  // Fetch real username on mount
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
      })
      .catch(() => setUsername("unknown"));
  }, []);

  const shellVariant: AppShellVariant =
    devVariant === "admin" ? "admin" : "member";

  const role: "member" | "org_admin" =
    devVariant === "org_admin" ? "org_admin" : "member";

  const orgIdFromPath = pathname.match(/^\/organisations\/([^/]+)/)?.[1];
  const resolvedOrgId = orgIdFromPath ?? orgId ?? "1";

  const groups =
    shellVariant === "admin"
      ? buildAdminNav()
      : resolvedOrgId
        ? buildMemberNav(pathname, resolvedOrgId, role)
        : null;

  const orgSwitcher =
    shellVariant === "member" && resolvedOrgId
      ? {
        currentOrgId: resolvedOrgId,
        memberships: MOCK_MEMBERSHIPS,
      }
      : undefined;

  const adminOrgs = shellVariant === "admin" ? MOCK_MEMBERSHIPS : undefined;

  const displayRole: SidebarUser["role"] =
    devVariant === "admin"
      ? "platform_admin"
      : devVariant === "org_admin"
        ? "org_admin"
        : "member";

  const sidebarUser: SidebarUser = {
    username, // ← real username from API
    role: displayRole,
  };

  const isPlatformAdmin = true; // TODO: replace with real role from API

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <NavRail
        variant={shellVariant}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
      />

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {groups && (
        <div
          className={`
            md:hidden fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] flex flex-col
            transform transition-transform duration-200 ease-in-out
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Sidebar
            groups={groups}
            orgSwitcher={orgSwitcher}
            adminOrgs={adminOrgs}
            showAdminConsole={shellVariant === "member" && isPlatformAdmin}
            user={sidebarUser}
          />
        </div>
      )}

      {groups && (
        <div className="hidden md:block">
          <Sidebar
            groups={groups}
            orgSwitcher={orgSwitcher}
            adminOrgs={adminOrgs}
            showAdminConsole={shellVariant === "member" && isPlatformAdmin}
            user={sidebarUser}
          />
        </div>
      )}

      <main className="flex-1 min-w-0 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}