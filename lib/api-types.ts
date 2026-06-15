export type UserMeResponse = {
    id: string;
    username: string;
};

// New V2 endpoint — GET /v2/users/me
export type UserV2MeResponse = {
    name: string;
    email: string;
};

export type SourceAttribution = {
    source_id: string;
    display_name: string;
    scope: Record<string, unknown>;
    row_count: number | null;
};

export type MembershipResponse = {
    org_id: string; // note: UUID string in V2
    org_name: string;
    member_id: number;
    role: "member" | "org_admin";
};

export type MembershipListResponse = {
    memberships: MembershipResponse[];
};

export type AdminUserResponse = {
    id: string;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type UserListResponse = {
    users: AdminUserResponse[];
};

export type OrgMemberResponse = {
    member_id: number;
    user_id: string;
    username: string;
    email: string;
    role: "member" | "org_admin";
    created_at: string;
    updated_at: string;
};

export type OrgMemberListResponse = {
    members: OrgMemberResponse[];
};

export type AdminOrgResponse = {
    id: string;
    name: string;
    balance: string;
    daily_member_spend_cap: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type OrgListResponse = {
    orgs: AdminOrgResponse[];
};

export type OrgBalanceResponse = {
    org_id: string;
    balance: string;
    currency: string;
};

export type AnswerListItemResponse = {
    uuid: string;
    question: string;
    price: string;
    paid: boolean;
    created_at: string;
    paid_at: string | null;
    owner_kind: "member" | "org_automation";
    owner_member_id: number | null;
    owner_api_key_id: number | null;
    sources: SourceAttribution[];
};

export type AnswerListResponse = {
    answers: AnswerListItemResponse[];
};

export type AnswerPreviewResponse = {
    uuid: string;
    abstract: string;
    price: string;
    paid: boolean;
    question: string;
    answer: string | null;
    sources: SourceAttribution[];
};

export type AnswerApproveResponse = {
    uuid: string;
    paid: boolean;
    charged_now: boolean;
    answer: string;
    sources: SourceAttribution[];
};

export type ApiKeyRecordResponse = {
    id: number;
    org_id: string;
    name: string;
    key_prefix: string;
    created_at: string;
    deleted_at: string | null;
};

export type ApiKeyListResponse = {
    keys: ApiKeyRecordResponse[];
};

export type CreateApiKeyResponse = ApiKeyRecordResponse & {
    raw_token: string;
};

export type QueryResponse = {
    message: string | null;
    no_data: boolean;
    paywalled: boolean;
    uuid: string | null;
    abstract: string | null;
    price: string | null;
    links: Record<string, { href: string; method: string; rel: string | null }> | null;
    sources: SourceAttribution[];
};

export type QueryBody = {
    question: string | null;
};

// Updated — now uses email instead of user_id
export type AddMemberRequest = {
    email: string;
    role: "member" | "org_admin";
};

// Updated — now requires email
export type CreateUserRequest = {
    username: string;
    email: string;
    password: string;
};

export type TopupRequest = {
    amount: number;
    currency: string;
};

export type SetRoleRequest = {
    role: "member" | "org_admin";
};