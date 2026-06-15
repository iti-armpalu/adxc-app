"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronsUpDown,
  Check,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Zap,
  LogOut,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShellVariant } from "@/components/shell-variant-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = {
  label: string;
  href: string;
  icon?: React.ElementType;
  badge?: string | number;
  sub?: boolean;
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

export type OrgMembership = {
  org_id: number;
  org_name: string;
  member_id: number;
  role: "member" | "org_admin";
};

export type SidebarUser = {
  username: string;
  role: "platform_admin" | "org_admin" | "member";
};

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with GET /v2/orgs → MembershipListResponse
// ---------------------------------------------------------------------------

export const MOCK_MEMBERSHIPS: OrgMembership[] = [
  { org_id: 1, org_name: "Unilever Global Insights", member_id: 1, role: "org_admin" },
  { org_id: 8, org_name: "LVMH Brand Intelligence", member_id: 6, role: "member" },
  { org_id: 5, org_name: "Diageo Audience Labs", member_id: 3, role: "member" },
];

// TODO: replace with auth session user
export const MOCK_USER: SidebarUser = {
  username: "sarah.chen",
  role: "org_admin",
};

// ---------------------------------------------------------------------------
// Role label
// ---------------------------------------------------------------------------

function roleLabel(role: SidebarUser["role"]) {
  if (role === "platform_admin") return "Platform admin";
  if (role === "org_admin") return "Org admin";
  return "Member";
}

// ---------------------------------------------------------------------------
// Org switcher
// ---------------------------------------------------------------------------

function OrgSwitcher({
  currentOrgId,
  memberships,
}: {
  currentOrgId: string;
  memberships: OrgMembership[];
}) {
  const router = useRouter();
  const { setVariant } = useShellVariant();
  const current = memberships.find((m) => String(m.org_id) === currentOrgId);

  function initials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function handleSwitch(orgId: number) {
    setVariant("org_admin");
    router.push(`/organisations/${orgId}`);
  }

  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Avatar className="w-6 h-6 shrink-0">
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials(current.org_name)}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground truncate">
            {current.org_name}
          </span>
          <ChevronsUpDown size={13} className="text-sidebar-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-card text-card-foreground" sideOffset={4}>
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.org_id}
            onClick={() => handleSwitch(m.org_id)}
            className="flex items-center gap-2.5 py-2"
          >
            <Avatar className="w-5 h-5 shrink-0">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {initials(m.org_name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm">{m.org_name}</span>
            {String(m.org_id) === currentOrgId && (
              <Check size={13} className="text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Sidebar link
// ---------------------------------------------------------------------------

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;

  const active =
    pathname === item.href ||
    (!item.sub &&
      item.href !== "/admin" &&
      !item.href.match(/^\/organisations\/[^/]+$/) &&
      pathname.startsWith(item.href + "/"));

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between rounded-lg text-sm transition-colors",
        item.sub ? "py-1 pl-7 pr-3" : "py-1.5 px-3",
        active
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
      )}
    >
      <span className="flex items-center gap-2.5">
        {Icon && !item.sub && (
          <Icon
            size={15}
            strokeWidth={active ? 2.5 : 2}
            className={active ? "text-primary" : "text-muted-foreground"}
          />
        )}
        {item.sub && (
          <span className={cn(
            "w-1 h-1 rounded-full shrink-0",
            active ? "bg-primary" : "bg-border-3"
          )} />
        )}
        {item.label}
      </span>
      {item.badge !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Footer user section
// ---------------------------------------------------------------------------

function SidebarFooter({ user }: { user: SidebarUser }) {
  const router = useRouter();
  const { setVariant } = useShellVariant();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setVariant("admin");
    router.push("/login");
  }

  function initials(username: string) {
    return username.slice(0, 2).toUpperCase();
  }

  return (
    <div className="p-3 border-t border-sidebar-border">
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg group">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
            {initials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {user.username}
          </p>
          <p className="text-xs text-sidebar-muted">
            {roleLabel(user.role)}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-muted hover:text-foreground"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My organisations button — admin sidebar only
// ---------------------------------------------------------------------------

function MyOrgsButton({ memberships }: { memberships: OrgMembership[] }) {
  const router = useRouter();
  const { setVariant } = useShellVariant();
  const hasMemberships = memberships.length > 0;

  function handleClick() {
    if (!hasMemberships) return;
    setVariant("org_admin");
    // TODO: persist last visited org_id
    router.push(`/organisations/${memberships[0].org_id}`);
  }

  return (
    <div className="p-2 border-b border-sidebar-border shrink-0">
      <button
        onClick={handleClick}
        disabled={!hasMemberships}
        title={!hasMemberships
          ? "You're not a member of any organisation yet. Add yourself from an org's detail page."
          : undefined
        }
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
          hasMemberships
            ? "text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
            : "text-sidebar-muted cursor-not-allowed opacity-50"
        )}
      >
        <Building2 size={13} />
        My organisations
        {hasMemberships && (
          <ChevronRight size={12} className="ml-auto text-sidebar-muted" />
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Back to admin console button — member sidebar only
// ---------------------------------------------------------------------------

function BackToAdminButton() {
  const router = useRouter();
  const { setVariant } = useShellVariant();

  function handleClick() {
    setVariant("admin");
    router.push("/admin");
  }

  return (
    <div className="p-2 border-b border-sidebar-border shrink-0">
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
        )}
      >
        <LayoutDashboard size={13} />
        Admin console
        <ChevronRight size={12} className="ml-auto text-sidebar-muted" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export function Sidebar({
  groups,
  orgSwitcher,
  adminOrgs,
  showAdminConsole,
  user,
}: {
  groups: NavGroup[];
  orgSwitcher?: { currentOrgId: string; memberships: OrgMembership[] };
  adminOrgs?: OrgMembership[];
  showAdminConsole?: boolean;
  user?: SidebarUser;
}) {
  return (
    <div className="flex flex-col w-52 h-full bg-sidebar border-r border-sidebar-border shrink-0 md:h-screen md:sticky md:top-0">

      {showAdminConsole && <BackToAdminButton />}

      {adminOrgs !== undefined && (
        <MyOrgsButton memberships={adminOrgs} />
      )}

      {orgSwitcher && (
        <div className="p-2 border-b border-sidebar-border shrink-0">
          <OrgSwitcher
            currentOrgId={orgSwitcher.currentOrgId}
            memberships={orgSwitcher.memberships}
          />
        </div>
      )}

      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto pt-3">
        {groups.map((group, i) => (
          <div key={i} className={cn("flex flex-col gap-0.5", i > 0 && "mt-3")}>
            {group.title && (
              <p className="text-caption text-sidebar-muted px-3 mb-1">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarLink key={item.href} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {user && <SidebarFooter user={user} />}

    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin nav
// ---------------------------------------------------------------------------

export function buildAdminNav(): NavGroup[] {
  return [
    {
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Organisations", href: "/admin/organisations", icon: Building2 },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Queries", href: "/admin/queries", icon: FileText },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Member nav
// ---------------------------------------------------------------------------

export function buildMemberNav(
  pathname: string,
  orgId: string,
  role: "member" | "org_admin" = "member"
): NavGroup[] {
  const base = `/organisations/${orgId}`;

  return [
    {
      items: [
        { label: "Overview", href: base, icon: LayoutDashboard },
        { label: "Query", href: `${base}/query`, icon: Zap },
        { label: "Queries", href: `${base}/queries`, icon: FileText },
      ],
    },
    ...(role === "org_admin"
      ? [
        {
          title: "Settings",
          items: [
            { label: "Members", href: `${base}/settings/members`, icon: Users },
            { label: "API Keys", href: `${base}/settings/api-keys`, icon: KeyRound },
          ],
        },
      ]
      : []),
  ];
}