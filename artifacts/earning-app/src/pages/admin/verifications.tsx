import { useState } from 'react';
import {
  useListAdminVerifications,
  useApproveVerification,
  useRejectVerification,
  getListAdminVerificationsQueryKey,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ShieldCheck, Loader2, Clock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../lib/utils';

type Tab = 'pending' | 'approved' | 'rejected';

export default function AdminVerifications() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const { data: requests, isLoading } = useListAdminVerifications({ status: activeTab });
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [actingId, setActingId] = useState<number | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListAdminVerificationsQueryKey({ status: activeTab }) });

  const handleApprove = (id: number) => {
    setActingId(id);
    approveMutation.mutate(
      { id },
      {
        onSuccess: (res) => {
          toast({
            title: 'Approved ✅',
            description: res.withdrawalPlaced
              ? 'User verified and their withdrawal request has been placed.'
              : 'User verified. (No withdrawal was placed — insufficient balance or none attached.)',
          });
          invalidate();
        },
        onError: () => toast({ title: 'Error', description: 'Could not approve.', variant: 'destructive' }),
        onSettled: () => setActingId(null),
      },
    );
  };

  const handleReject = (id: number) => {
    setActingId(id);
    rejectMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: 'Rejected', description: 'The user can submit a new verification.' });
          invalidate();
        },
        onError: () => toast({ title: 'Error', description: 'Could not reject.', variant: 'destructive' }),
        onSettled: () => setActingId(null),
      },
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-primary" size={22} />
        <h1 className="text-xl font-bold">Account Verifications</h1>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize border transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-background text-muted-foreground border-border'
            }`}
            data-testid={`tab-verifications-${tab}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm">
                      {r.user.firstName}
                      {r.user.username && <span className="text-muted-foreground font-normal"> @{r.user.username}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fee: <span className="font-bold text-foreground">{formatCurrency(r.fee)}</span>
                      {' · '}
                      <span className="capitalize font-semibold" style={{ color: r.method === 'bkash' ? '#E2136E' : r.method === 'nagad' ? '#EC1C24' : 'hsl(var(--primary))' }}>{r.method}</span>
                    </p>
                    <p className="text-xs mt-1">
                      From: <span className="font-mono font-bold select-all">{r.payerNumber}</span>
                    </p>
                    <p className="text-xs">
                      TrxID: <span className="font-mono font-bold select-all">{r.trxId}</span>
                    </p>
                    {r.withdrawAmount != null && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        Parked withdrawal: <span className="font-bold text-foreground">{formatCurrency(r.withdrawAmount)}</span>
                        {r.withdrawAccountNumber && <> → {r.withdrawAccountNumber}</>}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(r.createdAt)} · {formatTime(r.createdAt)}
                    </p>
                  </div>

                  {activeTab === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(r.id)}
                        disabled={actingId === r.id}
                        data-testid={`button-approve-verification-${r.id}`}
                      >
                        {actingId === r.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        <span className="ml-1">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(r.id)}
                        disabled={actingId === r.id}
                        data-testid={`button-reject-verification-${r.id}`}
                      >
                        <XCircle size={14} />
                        <span className="ml-1">Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-10 text-center text-sm text-muted-foreground">
          No {activeTab} verification requests.
        </div>
      )}
    </div>
  );
}
