// ─── Shared mock data ─────────────────────────────────────────────────────────
// Single source of truth for all /admin pages during development.
// TODO: replace with real API calls once backend is ready.
//
// GET  /v2/superadmin/organizations              → OrgListResponse
// GET  /v2/superadmin/organizations/stats        → AggregateStatsResponse
// POST /v2/superadmin/organizations              → OrgResponse (provision)
// GET  /v2/orgs/{org_id}/workspaces              → WorkspaceListResponse
// GET  /v2/orgs/{org_id}/activity                → ActivityFeedResponse

// ─── Orgs ─────────────────────────────────────────────────────────────────────

export type OrgStatus = "healthy" | "low_balance" | "cap_reached" | "inactive";

export interface Org {
    id: string;
    name: string;
    slug: string;
    plan: string;
    balance: number;
    spend_this_month: number;
    spend_cap: number;
    spend_last_month: number;
    active_users: number;
    total_users: number;
    queries_this_month: number;
    last_activity: string | null;
    status: OrgStatus;
    created_at: string;
}

export const MOCK_ORGS: Org[] = [
    {
        id: "org_dept_001",
        name: "Nike EMEA",
        slug: "nike-emea",
        plan: "Agency",
        balance: 1240.0,
        spend_this_month: 380.5,
        spend_cap: 2000.0,
        spend_last_month: 420.0,
        active_users: 5,
        total_users: 8,
        queries_this_month: 42,
        last_activity: "Today",
        status: "healthy",
        created_at: "Jan 2025",
    },
    {
        id: "org_dept_002",
        name: "Heineken Global",
        slug: "heineken-global",
        plan: "Agency",
        balance: 38.2,
        spend_this_month: 961.8,
        spend_cap: 1000.0,
        spend_last_month: 870.0,
        active_users: 3,
        total_users: 6,
        queries_this_month: 91,
        last_activity: "Today",
        status: "low_balance",
        created_at: "Feb 2025",
    },
    {
        id: "org_dept_003",
        name: "Spotify Brand",
        slug: "spotify-brand",
        plan: "Agency",
        balance: 0,
        spend_this_month: 500.0,
        spend_cap: 500.0,
        spend_last_month: 310.0,
        active_users: 2,
        total_users: 4,
        queries_this_month: 38,
        last_activity: "Yesterday",
        status: "cap_reached",
        created_at: "Mar 2025",
    },
    {
        id: "org_dept_004",
        name: "DEPT",
        slug: "dept",
        plan: "Agency",
        balance: 372.5,
        spend_this_month: 127.5,
        spend_cap: 500.0,
        spend_last_month: 203.8,
        active_users: 7,
        total_users: 12,
        queries_this_month: 23,
        last_activity: "Today",
        status: "healthy",
        created_at: "Mar 2025",
    },
    {
        id: "org_dept_005",
        name: "Adidas Digital",
        slug: "adidas-digital",
        plan: "Agency",
        balance: 800.0,
        spend_this_month: 0,
        spend_cap: 1500.0,
        spend_last_month: 0,
        active_users: 0,
        total_users: 3,
        queries_this_month: 0,
        last_activity: null,
        status: "inactive",
        created_at: "May 2026",
    },
    {
        id: "org_dept_006",
        name: "Samsung Europe",
        slug: "samsung-europe",
        plan: "Agency",
        balance: 2100.0,
        spend_this_month: 654.0,
        spend_cap: 3000.0,
        spend_last_month: 590.0,
        active_users: 4,
        total_users: 5,
        queries_this_month: 67,
        last_activity: "Today",
        status: "healthy",
        created_at: "Nov 2024",
    },
];

export const MOCK_AGGREGATE = {
    total_orgs: MOCK_ORGS.length,
    total_spend_this_month: MOCK_ORGS.reduce((s, o) => s + o.spend_this_month, 0),
    total_spend_last_month: MOCK_ORGS.reduce((s, o) => s + o.spend_last_month, 0),
    total_queries_this_month: MOCK_ORGS.reduce((s, o) => s + o.queries_this_month, 0),
    orgs_needing_attention: MOCK_ORGS.filter((o) => o.status !== "healthy").length,
};

// ─── Workspaces (used by overview) ────────────────────────────────────────────

export interface WorkspaceMember {
    id: string;
    name: string;
    avatarUrl: string | null;
}

export type WorkspaceStatus = "active" | "near_cap" | "paused";

export interface Workspace {
    id: string;
    name: string;
    client: string;
    status: WorkspaceStatus;
    budgetCap: number;
    budgetUsed: number;
    memberCount: number;
    queryCountThisMonth: number;
    members: WorkspaceMember[];
    isNew?: boolean;
}

export const MOCK_WORKSPACES: Workspace[] = [
    {
        id: "ws_1",
        name: "Adidas Q3 Brief",
        client: "Adidas",
        status: "active",
        budgetCap: 5000,
        budgetUsed: 3100,
        memberCount: 4,
        queryCountThisMonth: 12,
        members: [
            { id: "u1", name: "Sarah Chen", avatarUrl: null },
            { id: "u2", name: "Tom Briggs", avatarUrl: null },
            { id: "u3", name: "Priya Nair", avatarUrl: null },
        ],
    },
    {
        id: "ws_2",
        name: "Nike Always On",
        client: "Nike",
        status: "near_cap",
        budgetCap: 5000,
        budgetUsed: 4450,
        memberCount: 2,
        queryCountThisMonth: 31,
        members: [
            { id: "u4", name: "James Liu", avatarUrl: null },
            { id: "u5", name: "Anya Patel", avatarUrl: null },
        ],
    },
    {
        id: "ws_3",
        name: "Samsung Brand Health",
        client: "Samsung",
        status: "active",
        budgetCap: 8000,
        budgetUsed: 2400,
        memberCount: 3,
        queryCountThisMonth: 7,
        members: [
            { id: "u6", name: "Mei Zhang", avatarUrl: null },
            { id: "u7", name: "Kofi Mensah", avatarUrl: null },
        ],
    },
    {
        id: "ws_4",
        name: "Heineken Social",
        client: "Heineken",
        status: "paused",
        budgetCap: 3000,
        budgetUsed: 1200,
        memberCount: 2,
        queryCountThisMonth: 0,
        members: [
            { id: "u8", name: "Eva Fischer", avatarUrl: null },
        ],
    },
];

// ─── Activity feed (used by overview) ─────────────────────────────────────────

export interface ActivityEvent {
    id: string;
    userId: string;
    userName: string;
    workspaceName: string;
    queryPreview: string;
    cost: number;
    createdAt: string;
}

export const MOCK_ACTIVITY: ActivityEvent[] = [
    {
        id: "ev_1",
        userId: "u1",
        userName: "Sarah Chen",
        workspaceName: "Adidas Q3 Brief",
        queryPreview: "Consumer sentiment on sustainability in sportswear across EU markets",
        cost: 4.2,
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
        id: "ev_2",
        userId: "u4",
        userName: "James Liu",
        workspaceName: "Nike Always On",
        queryPreview: "Brand recall and purchase intent for Nike React Infinity among 18–34s",
        cost: 8.6,
        createdAt: new Date(Date.now() - 38 * 60000).toISOString(),
    },
    {
        id: "ev_3",
        userId: "u5",
        userName: "Anya Patel",
        workspaceName: "Nike Always On",
        queryPreview: "Share of voice vs Adidas and New Balance in running category",
        cost: 6.1,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: "ev_4",
        userId: "u6",
        userName: "Mei Zhang",
        workspaceName: "Samsung Brand Health",
        queryPreview: "Net promoter score trends for Samsung Galaxy S series vs iPhone 15",
        cost: 5.4,
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
        id: "ev_5",
        userId: "u2",
        userName: "Tom Briggs",
        workspaceName: "Adidas Q3 Brief",
        queryPreview: "Retail footfall patterns and conversion intent in sports apparel",
        cost: 3.8,
        createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
        id: "ev_6",
        userId: "u3",
        userName: "Priya Nair",
        workspaceName: "Adidas Q3 Brief",
        queryPreview: "Youth culture attitudes toward brand collaborations and limited drops",
        cost: 7.2,
        createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    },
];

// ─── Overview org stats ────────────────────────────────────────────────────────

export const MOCK_ORG_STATS = {
    name: "DEPT",
    memberCount: 12,
    workspaceCount: MOCK_WORKSPACES.length,
    creditBalance: 24850.0,
    reservedCredits: 10000.0,
    monthlySpend: 3240.0,
    lastMonthSpend: 2892.0,
    dailyBurnRate: 260.0,
    projectedDaysRemaining: 94,
};

export const MOCK_SPARKLINE = [
    { value: 180 },
    { value: 220 },
    { value: 195 },
    { value: 310 },
    { value: 260 },
    { value: 290 },
    { value: 240 },
    { value: 275 },
];

// ─── Action items (used by overview) ─────────────────────────────────────────

export type ActionItemType = "budget_request" | "unassigned_users" | "near_cap";

export interface ActionItem {
    id: string;
    type: ActionItemType;
    workspaceName?: string;
    requestedBy?: string;
    amount?: number;
    count?: number;
    budgetUsed?: number;
    budgetCap?: number;
    createdAt?: string;
}

export const MOCK_ACTION_ITEMS: ActionItem[] = [
    {
        id: "ai_1",
        type: "budget_request",
        workspaceName: "Adidas Q3 Brief",
        requestedBy: "Sarah Chen",
        amount: 2000,
        createdAt: "2025-06-01T09:14:00Z",
    },
    {
        id: "ai_2",
        type: "unassigned_users",
        count: 3,
    },
    {
        id: "ai_3",
        type: "near_cap",
        workspaceName: "Nike Always On",
        budgetUsed: 4450,
        budgetCap: 5000,
    },
];