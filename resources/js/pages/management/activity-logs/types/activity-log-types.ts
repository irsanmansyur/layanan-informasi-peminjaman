export type ActivityLogCauser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
};

export type ActivityLogValue = string | number | boolean | null | Record<string, unknown> | Array<unknown>;

export type ActivityLogChanges = Record<string, { from: ActivityLogValue; to: ActivityLogValue }>;

export type ActivityLogProperties = {
    attributes?: Record<string, ActivityLogValue>;
    old?: Record<string, ActivityLogValue>;
    changes?: ActivityLogChanges;
    type?: 'create' | 'update' | 'delete';
};

export type ActivityLog = {
    id: number;
    description: string;
    event: string;
    subject_type: string;
    subject_id: number;
    causer: ActivityLogCauser | null;
    properties: ActivityLogProperties;
    created_at: string;
    created_at_human: string;
};
