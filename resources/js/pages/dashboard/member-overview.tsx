import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type MemberOverviewProps = {
    greetingName: string;
    roles: string[];
};

export function MemberOverview({ greetingName, roles }: MemberOverviewProps) {
    return (
        <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-sm">
            <div className="bg-linear-to-br from-primary/6 via-card to-chart-2/8 px-4 py-5 sm:px-5 sm:py-6">
                <CardHeader className="space-y-0 p-0">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                            <Sparkles className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                                Hello, {greetingName}
                            </CardTitle>
                            <CardDescription className="text-pretty text-sm leading-snug">
                                You are signed in as a member. Use the sidebar to
                                open pages you have access to.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="mt-5 space-y-3 border-t border-border/50 p-0 pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Your roles
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                            roles.map((role) => (
                                <Badge
                                    key={role}
                                    variant="secondary"
                                    className="rounded-md border border-border/50 px-2.5 py-0.5 text-[11px] font-medium"
                                >
                                    {role}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                No roles are assigned to your account.
                            </span>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
