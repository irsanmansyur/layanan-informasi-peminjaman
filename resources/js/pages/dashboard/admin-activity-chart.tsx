import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardActivityTrendPoint } from '@/types/dashboard';

const chartConfig = {
    count: {
        label: 'Jumlah log',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

type AdminActivityChartProps = {
    data: DashboardActivityTrendPoint[];
    totalLast7Days: number;
};

export function AdminActivityChart({ data, totalLast7Days }: AdminActivityChartProps) {
    const series = Array.isArray(data) ? data : [];
    const maxCount = Math.max(1, ...series.map((d) => d.count));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-muted-foreground" aria-hidden />
                    Aktivitas sistem
                </CardTitle>
                <CardDescription>
                    Jumlah activity log per hari (7 hari terakhir). Total periode:{' '}
                    <span className="font-medium text-foreground tabular-nums">
                        {totalLast7Days.toLocaleString()}
                    </span>
                    .
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
                {/*
                  Recharts ResponsiveContainer mengukur parent: wajib tinggi eksplisit,
                  jika tidak contentRect = 0 dan chart tidak digambar.
                */}
                <div className="h-[280px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                    <AreaChart accessibilityLayer data={series} margin={{ left: 4, right: 12, top: 8 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            width={36}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            domain={[0, maxCount]}
                            allowDecimals={false}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill="var(--color-count, var(--chart-1))"
                            fillOpacity={0.35}
                            stroke="var(--color-count, var(--chart-1))"
                            strokeWidth={2}
                        />
                    </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-1 text-sm text-muted-foreground">
                <p>
                    Data dari Spatie Activity Log. Sumbu X menunjukkan tanggal (hari/bulan); sumbu Y jumlah entri per
                    hari.
                </p>
            </CardFooter>
        </Card>
    );
}
