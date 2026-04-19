import { Activity, ArrowRight, KeyRound, Shield, Users } from 'lucide-react';
import activityLogs from '@/routes/activity-logs';
import permissions from '@/routes/permissions';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { DashboardAdminStats } from '@/types/dashboard';
import { AdminActivityChart } from './admin-activity-chart';
import { MarqueeSpeedControl } from './marquee-speed-control';
import { StatCard } from './stat-card';

type AdminOverviewProps = {
    stats: DashboardAdminStats;
};

export function AdminOverview({ stats }: AdminOverviewProps) {
    return (
        <div className="w-full min-w-0 max-w-full space-y-5">
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3 md:px-5 md:py-3.5">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Admin summary
                </h2>
                <p className="mt-1 max-w-3xl text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Live counts from the database. Click a card to open the
                    related module.
                </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    title="Users"
                    value={stats.users_count}
                    description="Total registered users"
                    href={users.index().url}
                    icon={Users}
                />
                <StatCard
                    title="Roles"
                    value={stats.roles_count}
                    description="Spatie Permission roles"
                    href={roles.index().url}
                    icon={Shield}
                />
                <StatCard
                    title="Permissions"
                    value={stats.permissions_count}
                    description="Spatie permissions"
                    href={permissions.index().url}
                    icon={KeyRound}
                />
                <StatCard
                    title="Activity (7 days)"
                    value={stats.activity_logs_last_7_days}
                    description="Recent log entries"
                    href={activityLogs.index().url}
                    icon={Activity}
                    footer={
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                            Open activity logs
                            <ArrowRight className="size-3" />
                        </span>
                    }
                />
            </div>

            <AdminActivityChart
                data={stats.activity_trend}
                totalLast7Days={stats.activity_logs_last_7_days}
            />

            <MarqueeSpeedControl currentSpeed={stats.marquee_speed} />
        </div>
    );
}
