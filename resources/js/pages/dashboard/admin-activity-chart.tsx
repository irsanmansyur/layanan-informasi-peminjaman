import { TrendingUp } from 'lucide-react';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardActivityTrendPoint } from '@/types/dashboard';

const chartConfig = {
    count: {
        label: 'Log count',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

type AdminActivityChartProps = {
    data: DashboardActivityTrendPoint[];
    totalLast7Days: number;
};

export function AdminActivityChart({
    data,
    totalLast7Days,
}: AdminActivityChartProps) {
    const chartId = useId();
    const series = Array.isArray(data) ? data : [];
    const maxCount = Math.max(1, ...series.map((d) => d.count));

    return (
        <Card className="w-full min-w-0 max-w-full rounded-xl border border-border/80 bg-card py-4 shadow-sm">
            <CardHeader className="gap-2 space-y-0 px-4 pb-2">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                        <TrendingUp className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base font-semibold tracking-tight">
                            System activity
                        </CardTitle>
                        <CardDescription className="text-pretty text-xs leading-relaxed sm:text-sm">
                            Activity log entries per day (last 7 days). Period
                            total:{' '}
                            <span className="font-medium text-foreground tabular-nums">
                                {totalLast7Days.toLocaleString('en-US')}
                            </span>
                            .
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="min-w-0 px-4 pb-2">
                {/*
                  Recharts ResponsiveContainer measures the parent: height must be explicit
                  or contentRect is zero and the chart does not render.
                */}
                <div className="h-[220px] w-full min-w-0 overflow-hidden rounded-lg border border-border/60 bg-muted/35 p-2 sm:h-[300px] sm:p-3">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-full w-full min-w-0"
                    >
                        <AreaChart
                            accessibilityLayer
                            data={series}
                            margin={{ left: 6, right: 12, top: 14, bottom: 6 }}
                        >
                            <defs>
                                <linearGradient id={`${chartId}-activity-fill`} x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="var(--color-count, var(--chart-1))"
                                        stopOpacity={0.42}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--color-count, var(--chart-1))"
                                        stopOpacity={0.08}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="2 4"
                                className="stroke-border/60"
                            />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={20}
                                tickFormatter={(value) => value}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            />
                            <YAxis
                                width={34}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                domain={[0, maxCount]}
                                allowDecimals={false}
                                tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent indicator="line" />
                                }
                            />
                            <Area
                                dataKey="count"
                                type="monotone"
                                fill={`url(#${chartId}-activity-fill)`}
                                stroke="var(--color-count, var(--chart-1))"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-0 border-t border-border/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                <p className="text-pretty">
                    Spatie Activity Log. X: date; Y: entries per day.
                </p>
            </CardFooter>
        </Card>
    );
}
