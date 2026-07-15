import { useGetAdminDashboard, useListPendingPayouts } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  CreditCard, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetAdminDashboard();
  const { data: pendingPayouts, isLoading: isLoadingPayouts } = useListPendingPayouts();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operator Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time status of the AS Earning platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={dashboard?.totalUsers}
          icon={Users}
          loading={isLoadingDashboard}
          trend="+12%"
        />
        <StatCard
          title="Active (24h)"
          value={dashboard?.active24h}
          icon={Activity}
          loading={isLoadingDashboard}
          trend="+5%"
        />
        <StatCard
          title="Total Paid Out"
          value={dashboard?.totalPaidOut ? `৳${dashboard.totalPaidOut}` : undefined}
          icon={CreditCard}
          loading={isLoadingDashboard}
        />
        <StatCard
          title="Pending Requests"
          value={dashboard?.pendingRequestsCount}
          icon={Clock}
          loading={isLoadingDashboard}
          alert={dashboard?.pendingRequestsCount ? dashboard.pendingRequestsCount > 0 : false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Actions: Pending Payouts */}
        <Card className="border-accent/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock size={16} className="text-warning-foreground" />
              </div>
              <CardTitle className="text-base font-semibold">Needs Review</CardTitle>
            </div>
            {pendingPayouts && pendingPayouts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-warning/20 text-warning-foreground text-xs font-bold">
                {pendingPayouts.length}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {isLoadingPayouts ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !pendingPayouts || pendingPayouts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
                  <CreditCard size={20} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs">No pending payouts to review.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingPayouts.slice(0, 5).map(payout => (
                  <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-foreground">৳{payout.amount} via {payout.method.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="font-mono">{payout.accountNumber}</span>
                        <span>•</span>
                        <span>{payout.user.firstName}</span>
                      </div>
                    </div>
                    <Link href="/payouts" className="text-primary hover:text-primary/80 transition-colors">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))}
                {pendingPayouts.length > 5 && (
                  <Link href="/payouts" className="block w-full p-3 text-center text-sm font-medium text-primary hover:bg-accent/50 transition-colors">
                    View all {pendingPayouts.length} pending
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fraud Watch: Flagged Users */}
        <Card className="border-accent/50 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <CardTitle className="text-base font-semibold">Fraud Watch</CardTitle>
            </div>
            {dashboard?.flaggedUsers && dashboard.flaggedUsers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                {dashboard.flaggedUsers.length} Flagged
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {isLoadingDashboard ? (
              <div className="p-4 space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !dashboard?.flaggedUsers || dashboard.flaggedUsers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
                  <Users size={20} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">Looking good</p>
                <p className="text-xs">No users are currently flagged for suspicious activity.</p>
              </div>
            ) : (
              <div className="divide-y">
                {dashboard.flaggedUsers.map(user => (
                  <div key={user.id} className="p-4 flex items-start justify-between hover:bg-accent/30 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        {user.firstName}
                        <span className="text-xs text-muted-foreground font-mono">ID: {user.telegramId}</span>
                      </div>
                      <div className="text-xs text-destructive mt-1 font-medium bg-destructive/10 px-2 py-0.5 rounded inline-block">
                        {user.reason}
                      </div>
                    </div>
                    <Link href={`/users?search=${user.telegramId}`} className="text-primary hover:text-primary/80 transition-colors shrink-0">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  trend,
  alert 
}: { 
  title: string; 
  value?: string | number; 
  icon: any; 
  loading?: boolean;
  trend?: string;
  alert?: boolean;
}) {
  return (
    <Card className={`border-accent/50 shadow-sm relative overflow-hidden ${alert ? 'bg-warning/5 border-warning/20' : ''}`}>
      {alert && (
        <div className="absolute top-0 right-0 w-2 h-full bg-warning" />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`p-2 rounded-lg ${alert ? 'bg-warning/20 text-warning-foreground' : 'bg-primary/10 text-primary'}`}>
            <Icon size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {value !== undefined ? value : '—'}
            </span>
          )}
          {trend && !loading && (
            <span className="text-xs font-medium text-success flex items-center">
              <TrendingUp size={12} className="mr-0.5" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}