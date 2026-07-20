"use client";

import { use, useState, useEffect } from "react";
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
  orgId,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orgId: string;
  onAdd: (member: Member) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "org_admin">("member");
  const [state, setState] = useState<"idle" | "error" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setEmail("");
      setRole("member");
      setState("idle");
      setErrorMsg("");
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setState("error");
      setErrorMsg("Email is required.");
      return;
    }
    setState("loading");
    try {
      // POST /v2/orgs/{org_id}/members — AddMemberRequest { email, role }
      const res = await fetch(`/api/orgs/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (res.status === 409) {
        setState("error");
        setErrorMsg("This user is already a member of the organisation.");
        return;
      }
      if (res.status === 404) {
        setState("error");
        setErrorMsg("No user found with that email address.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Failed to add member.");
      }
      const member = await res.json();
      onAdd(member);
      setState("success");
      setTimeout(handleClose, 900);
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to add member.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Add an existing platform user to your organisation by email.
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
              disabled={isLoading || isSuccess}
              autoFocus
              className={cn(state === "error" && !email.trim() && "border-destructive")}
            />
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
  orgId,
  onRemove,
}: {
  member: Member | null;
  onOpenChange: (v: boolean) => void;
  orgId: string;
  onRemove: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!member) return;
    setLoading(true);
    try {
      // DELETE /v2/orgs/{org_id}/members/{member_id}
      const res = await fetch(`/api/orgs/${orgId}/members/${member.member_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      onRemove(member.member_id);
      onOpenChange(false);
    } catch {
      // TODO: show error toast
    } finally {
      setLoading(false);
    }
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

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // GET /v2/orgs/{org_id}/members — load members list
  useEffect(() => {
    fetch(`/api/orgs/${org_id}/members`)
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [org_id]);

  // GET /v2/orgs/{org_id}/members/me — get current user_id for (you) label
  useEffect(() => {
    fetch(`/api/orgs/${org_id}/members/me`)
      .then((r) => r.json())
      .then((me) => { if (me.kind === "member") setCurrentUserId(me.user_id); })
      .catch(() => { });
  }, [org_id]);

  async function handleSetRole(memberId: number, role: "member" | "org_admin") {
    setUpdatingId(memberId);
    try {
      // POST /v2/orgs/{org_id}/members/{member_id}/set_role — SetRoleRequest { role }
      const res = await fetch(`/api/orgs/${org_id}/members/${memberId}/set_role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => m.member_id === memberId ? updated : m));
    } catch {
      // TODO: show error toast
    } finally {
      setUpdatingId(null);
    }
  }

  const adminCount = members.filter((m) => m.role === "org_admin").length;
  const memberCount = members.filter((m) => m.role === "member").length;

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader size={15} className="animate-adxc-spin" />
        Loading…
      </div>
    );
  }

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
            const isCurrentUser = member.user_id === currentUserId;
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
            const isCurrentUser = member.user_id === currentUserId;
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
                <div className="flex items-center justify-end gap-2 w-36 shrink-0">
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
                  {updatingId === member.member_id && (
                    <Loader size={14} className="animate-adxc-spin text-muted-foreground shrink-0" />
                  )}
                  {!isCurrentUser && updatingId !== member.member_id ? (
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
                  ) : (
                    <div className="w-8 h-8 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        orgId={org_id}
        onAdd={(member) => setMembers((prev) => [...prev, member])}
      />
      <RemoveMemberDialog
        member={removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        orgId={org_id}
        onRemove={(id) => setMembers((prev) => prev.filter((m) => m.member_id !== id))}
      />
    </>
  );
}