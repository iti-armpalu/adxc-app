"use client";

import { use, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  ShieldMinus,
  Loader,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Member = {
  member_id: number;
  user_id: string;
  username: string;
  role: "member" | "org_admin";
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Mock data
// TODO: replace with GET /v2/orgs/{org_id}/members
// ---------------------------------------------------------------------------

const MOCK_MEMBERS: Member[] = [
  { member_id: 1, user_id: "usr_01", username: "sarah.chen",     role: "org_admin", created_at: "2024-10-14T09:00:00Z", updated_at: "2024-10-14T09:00:00Z" },
  { member_id: 2, user_id: "usr_02", username: "james.whitfield", role: "member",    created_at: "2024-11-01T10:00:00Z", updated_at: "2024-11-01T10:00:00Z" },
  { member_id: 3, user_id: "usr_03", username: "priya.nair",      role: "member",    created_at: "2025-01-15T09:00:00Z", updated_at: "2025-01-15T09:00:00Z" },
  { member_id: 4, user_id: "usr_04", username: "tom.eriksen",     role: "member",    created_at: "2025-02-10T09:00:00Z", updated_at: "2025-02-10T09:00:00Z" },
];

// Current user — TODO: replace with auth session
const CURRENT_USER_ID = "usr_01";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Add Member Dialog
// ---------------------------------------------------------------------------

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (member: Member) => void;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole]     = useState<"member" | "org_admin">("member");
  const [state, setState]   = useState<"idle" | "error" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setUserId("");
      setRole("member");
      setState("idle");
      setErrorMsg("");
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) {
      setState("error");
      setErrorMsg("User ID is required.");
      return;
    }
    setState("loading");
    // TODO: POST /v2/orgs/{org_id}/members
    // body: AddMemberRequest { user_id: string, role: "member" | "org_admin" }
    // returns: OrgMemberResponse
    await new Promise((r) => setTimeout(r, 800));
    onAdd({
      member_id: Math.floor(Math.random() * 9000) + 1000,
      user_id: userId,
      username: userId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setState("success");
    setTimeout(handleClose, 900);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Add an existing platform user to your organisation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-1">
          {state === "error" && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle size={15} />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              placeholder="e.g. usr_01hx4k2m9n"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setState("idle"); }}
              disabled={isLoading || isSuccess}
              autoFocus
              className={cn(state === "error" && !userId.trim() && "border-destructive")}
            />
            <p className="text-xs text-muted-foreground">
              Ask your platform admin for the user's ID.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "member" | "org_admin")}
              disabled={isLoading || isSuccess}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="member">Member — can query and view own answers</SelectItem>
                <SelectItem value="org_admin">Org admin — can manage members and API keys</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isSuccess} className="gap-2 min-w-[120px]">
              {isLoading
                ? <><Loader size={14} className="animate-adxc-spin" /> Adding…</>
                : isSuccess
                  ? <><Check size={14} /> Added</>
                  : "Add member"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Remove member dialog
// ---------------------------------------------------------------------------

function RemoveMemberDialog({
  member,
  onOpenChange,
  onRemove,
}: {
  member: Member | null;
  onOpenChange: (v: boolean) => void;
  onRemove: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!member) return;
    setLoading(true);
    // TODO: DELETE /v2/orgs/{org_id}/members/{member_id}
    await new Promise((r) => setTimeout(r, 700));
    onRemove(member.member_id);
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription>
            Remove{" "}
            <span className="font-semibold text-foreground">{member?.username}</span>{" "}
            from your organisation. They will lose access immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={loading}>
            {loading ? "Removing…" : "Remove member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgMembersPage({
  params: paramsPromise,
}: {
  params: Promise<{ org_id: string }>;
}) {
  const { org_id } = use(paramsPromise);

  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleSetRole(memberId: number, role: "member" | "org_admin") {
    setUpdatingId(memberId);
    // TODO: POST /v2/orgs/{org_id}/members/{member_id}/set_role
    // body: SetRoleRequest { role: "member" | "org_admin" }
    await new Promise((r) => setTimeout(r, 600));
    setMembers((prev) =>
      prev.map((m) => m.member_id === memberId ? { ...m, role } : m)
    );
    setUpdatingId(null);
  }

  const adminCount  = members.filter((m) => m.role === "org_admin").length;
  const memberCount = members.filter((m) => m.role === "member").length;

  return (
    <>
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-foreground font-medium">{members.length} members</span>
              {" — "}
              {adminCount} admin{adminCount !== 1 ? "s" : ""},{" "}
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <Plus size={15} strokeWidth={2} />
            Add member
          </Button>
        </div>

        {/* ── Members list ───────────────────────────────────────────────── */}
        {/* ── Mobile: card list ────────────────────────────────────────── */}
        <div className="md:hidden flex flex-col gap-3">
          {members.map((member) => {
            const isCurrentUser = member.user_id === CURRENT_USER_ID;
            return (
              <div
                key={member.member_id}
                className="bg-card border p-4 flex items-center gap-3"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {initials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{member.username}</p>
                    {isCurrentUser && <span className="text-xs text-muted-foreground shrink-0">(you)</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Added {formatDate(member.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-normal",
                      member.role === "org_admin"
                        ? "text-primary border-primary/30 bg-primary/5"
                        : "text-muted-foreground"
                    )}
                  >
                    {member.role === "org_admin" ? "Org admin" : "Member"}
                  </Badge>
                  {!isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 bg-card text-card-foreground">
                        {updatingId === member.member_id ? (
                          <DropdownMenuItem disabled>
                            <Loader size={14} className="animate-adxc-spin mr-2" />
                            Updating…
                          </DropdownMenuItem>
                        ) : member.role === "member" ? (
                          <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "org_admin")}>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Make org admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "member")}>
                            <ShieldMinus className="w-4 h-4 mr-2" />
                            Remove admin role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove from org
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop: list ─────────────────────────────────────────────── */}
        <div className="hidden md:block border overflow-hidden bg-card">
          {members.map((member, i) => {
            const isCurrentUser = member.user_id === CURRENT_USER_ID;
            return (
              <div
                key={member.member_id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 group",
                  i < members.length - 1 && "border-b border-border"
                )}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {initials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{member.username}</p>
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(member.created_at)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-normal shrink-0",
                    member.role === "org_admin"
                      ? "text-primary border-primary/30 bg-primary/5"
                      : "text-muted-foreground"
                  )}
                >
                  {member.role === "org_admin" ? "Org admin" : "Member"}
                </Badge>
                {updatingId === member.member_id && (
                  <Loader size={14} className="animate-adxc-spin text-muted-foreground shrink-0" />
                )}
                {!isCurrentUser && updatingId !== member.member_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-card text-card-foreground">
                      {member.role === "member" ? (
                        <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "org_admin")}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Make org admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleSetRole(member.member_id, "member")}>
                          <ShieldMinus className="w-4 h-4 mr-2" />
                          Remove admin role
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setRemoveTarget(member)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove from org
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(member) => setMembers((prev) => [...prev, member])}
      />
      <RemoveMemberDialog
        member={removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        onRemove={(id) => setMembers((prev) => prev.filter((m) => m.member_id !== id))}
      />
    </>
  );
}