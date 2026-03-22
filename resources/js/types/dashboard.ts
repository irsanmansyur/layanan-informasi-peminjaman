export type DashboardActivityTrendPoint = {
    date: string;
    label: string;
    count: number;
};

export type DashboardAdminStats = {
    users_count: number;
    roles_count: number;
    permissions_count: number;
    activity_logs_last_7_days: number;
    activity_trend: DashboardActivityTrendPoint[];
};

export type DashboardPageProps = {
    is_admin: boolean;
    greeting_name: string;
    roles: string[];
    admin?: DashboardAdminStats;
};
