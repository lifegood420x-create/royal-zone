import { useGetAdminDashboard, useClearFlaggedUser, useBanUser, getGetAdminDashboardQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Activity, CreditCard, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const clearFlagMutation = useClearFlaggedUser();
  const banUserMutation = useBanUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleClearFlag = (id: number) => {
    clearFlagMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: 'Flag cleared', description: 'User is no longer flagged.' });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not clear flag.', variant: 'destructive' });
        }
      }
    );
  };

  const handleBanUser = (id: number) => {
    banUserMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: 'User banned', description: 'User has been banned.' });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not ban user.', variant: 'destructive' });
        }
      }
    );
  };

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: dashboard.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Active 24h', value: dashboard.active24h, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Pending Payouts', value: dashboard.pendingRequestsCount, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Total Paid Out', value: formatCurrency(dashboard.totalPaidOut), icon: CreditCard, color: 'text-accent-foreground', bg: 'bg-accent' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of app performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="text-destructive" size={20} />
            Flagged Users ({dashboard.flaggedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dashboard.flaggedUsers.length > 0 ? (
            <div className="divide-y">
              {dashboard.flaggedUsers.map(user => (
                <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{user.firstName}</span>
                      {user.username && <span className="text-muted-foreground text-sm">@{user.username}</span>}
                      <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{user.telegramId}</span>
                    </div>
                    <p className="text-sm text-destructive font-medium mt-1">Reason: {user.reason}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>IP: {user.ip || 'Unknown'}</span>
                      <span>Balance: {formatCurrency(user.balance)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleClearFlag(user.id)}
                      disabled={clearFlagMutation.isPending}
                    >
                      <CheckCircle size={16} className="mr-1.5" /> Clear Flag
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleBanUser(user.id)}
                      disabled={banUserMutation.isPending}
                    >
                      <Ban size={16} className="mr-1.5" /> Ban User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle size={32} className="mx-auto text-green-500 mb-3 opacity-50" />
              <p>No flagged users at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
