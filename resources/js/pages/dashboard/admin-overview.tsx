import { ArrowRight } from 'lucide-react';
import activityLogs from '@/routes/activity-logs';
import permissions from '@/routes/permissions';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { DashboardAdminStats } from '@/types/dashboard';
import { AdminActivityChart } from './admin-activity-chart';
import { StatCard } from './stat-card';

type AdminOverviewProps = {
    stats: DashboardAdminStats;
};

export function AdminOverview({ stats }: AdminOverviewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Ringkasan admin</h2>
                <p className="text-sm text-muted-foreground">
                    Angka real-time dari database. Klik kartu untuk membuka modul terkait.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Pengguna"
                    value={stats.users_count}
                    description="Total user terdaftar"
                    href={users.index().url}
                />
                <StatCard
                    title="Role"
                    value={stats.roles_count}
                    description="Role Spatie"
                    href={roles.index().url}
                />
                <StatCard
                    title="Permission"
                    value={stats.permissions_count}
                    description="Permission Spatie"
                    href={permissions.index().url}
                />
                <StatCard
                    title="Activity (7 hari)"
                    value={stats.activity_logs_last_7_days}
                    description="Log aktivitas terbaru"
                    href={activityLogs.index().url}
                    footer={
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                            Buka activity logs
                            <ArrowRight className="size-3" />
                        </span>
                    }
                />
            </div>

            <AdminActivityChart data={stats.activity_trend} totalLast7Days={stats.activity_logs_last_7_days} />
        </div>
    );
}
