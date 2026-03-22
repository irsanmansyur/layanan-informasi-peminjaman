import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MemberOverviewProps = {
    greetingName: string;
    roles: string[];
};

export function MemberOverview({ greetingName, roles }: MemberOverviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Halo, {greetingName}</CardTitle>
                <CardDescription>
                    Anda masuk sebagai anggota. Gunakan menu samping untuk mengakses halaman yang diizinkan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Role Anda:</p>
                <div className="flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <Badge key={role} variant="secondary">
                                {role}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-sm text-muted-foreground">Tidak ada role yang terpasang.</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
