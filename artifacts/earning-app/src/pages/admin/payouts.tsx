import { useState } from 'react';
import { 
  useListPendingPayouts, 
  useApprovePayout, 
  useRejectPayout,
  useUpdatePayoutAccountNumber,
  getListPendingPayoutsQueryKey,
  AdminWithdrawal
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Search, CreditCard, Loader2, Pencil, Star, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Input } from '@/components/ui/input';

type Tab = 'first' | 'next';

export default function AdminPayouts() {
  const { data: payouts, isLoading } = useListPendingPayouts();
  const approveMutation = useApprovePayout();
  const rejectMutation = useRejectPayout();
  const updateNumberMutation = useUpdatePayoutAccountNumber();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('first');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [editingNumberId, setEditingNumberId] = useState<number | null>(null);
  const [editedNumber, setEditedNumber] = useState('');

  const handleApprove = (id: number) => {
    approveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: 'Approved', description: 'Payout marked as paid.' });
          queryClient.invalidateQueries({ queryKey: getListPendingPayoutsQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not approve payout.', variant: 'destructive' });
        }
      }
    );
  };

  const handleSaveNumber = (id: number) => {
    const trimmed = editedNumber.trim();
    if (!trimmed) {
      toast({ title: 'Error', description: 'Account number cannot be empty.', variant: 'destructive' });
      return;
    }
    updateNumberMutation.mutate(
      { id, data: { accountNumber: trimmed } },
      {
        onSuccess: () => {
          toast({ title: 'Updated', description: 'Account number corrected.' });
          setEditingNumberId(null);
          setEditedNumber('');
          queryClient.invalidateQueries({ queryKey: getListPendingPayoutsQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not update account number.', variant: 'destructive' });
        }
      }
    );
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate(
      { id, data: { note: rejectNote || null } },
      {
        onSuccess: () => {
          toast({ title: 'Rejected', description: 'Payout rejected and balance refunded.' });
          setRejectingId(null);
          setRejectNote('');
          queryClient.invalidateQueries({ queryKey: getListPendingPayoutsQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not reject payout.', variant: 'destructive' });
        }
      }
    );
  };

  const allPayouts = payouts || [];
  const firstPayouts = allPayouts.filter(p => p.isFirstWithdrawal);
  const nextPayouts  = allPayouts.filter(p => !p.isFirstWithdrawal);

  const activeList = (activeTab === 'first' ? firstPayouts : nextPayouts).filter(p =>
    p.accountNumber.includes(searchTerm) ||
    p.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user.username && p.user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderPayout = (payout: AdminWithdrawal) => (
    <div key={payout.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-3/4">
        {/* User Info */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">User</p>
          <div className="flex items-center gap-2">
            <span className="font-bold">{payout.user.firstName}</span>
            {payout.user.username && <span className="text-muted-foreground text-sm">@{payout.user.username}</span>}
          </div>
          <span className="text-xs text-muted-foreground font-mono">{payout.user.telegramId}</span>
        </div>

        {/* Request Info */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Amount</p>
          <p className="font-bold text-foreground text-lg">{formatCurrency(payout.amount)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(payout.requestedAt)}</p>
        </div>

        {/* Payment Details */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Payment Method</p>
          {editingNumberId === payout.id ? (
            <div className="space-y-2">
              <Input
                className="h-8 text-xs font-mono"
                value={editedNumber}
                onChange={e => setEditedNumber(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs h-8" onClick={() => handleSaveNumber(payout.id)} disabled={updateNumberMutation.isPending}>
                  {updateNumberMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setEditingNumberId(null); setEditedNumber(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${payout.method === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#EC1C24]'}`}>
                  {payout.method === 'bkash' ? 'b' : 'n'}
                </div>
                <span className="font-mono text-sm font-bold">{payout.accountNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase mt-1">{payout.method}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-[200px]">
        {rejectingId === payout.id ? (
          <div className="space-y-2">
            <Input
              placeholder="Reason for rejection (optional)"
              size={1}
              className="h-8 text-xs"
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" className="flex-1 text-xs h-8" onClick={() => handleReject(payout.id)} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Reject'}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => { setRejectingId(null); setRejectNote(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90" onClick={() => handleApprove(payout.id)} disabled={approveMutation.isPending}>
              <CheckCircle size={16} className="mr-1.5" /> Approve
            </Button>
            <Button variant="outline" className="font-bold px-3" onClick={() => { setEditingNumberId(payout.id); setEditedNumber(payout.accountNumber); }}>
              <Pencil size={16} className="mr-1.5" /> নাম্বার
            </Button>
            <Button variant="destructive" className="flex-1 font-bold" onClick={() => setRejectingId(payout.id)}>
              <XCircle size={16} className="mr-1.5" /> Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Payouts</h1>
          <p className="text-muted-foreground mt-1">Review and process withdrawal requests</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search account or name..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-muted rounded-xl p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('first')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'first'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star size={15} />
          First Withdrawal
          {firstPayouts.length > 0 && (
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'first' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
              {firstPayouts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('next')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'next'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <RefreshCw size={15} />
          Next Withdrawals
          {nextPayouts.length > 0 && (
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'next' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
              {nextPayouts.length}
            </span>
          )}
        </button>
      </div>

      {/* Payout List */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : activeList.length > 0 ? (
            <div className="divide-y">
              {activeList.map(renderPayout)}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <CreditCard size={48} className="text-muted-foreground/30 mb-4" />
              <p className="font-bold text-lg text-foreground">
                {activeTab === 'first' ? 'No first-time withdrawals' : 'No next withdrawals'}
              </p>
              <p className="text-sm">
                {activeTab === 'first'
                  ? 'No new users are waiting for their first payout.'
                  : 'No returning users are waiting for a payout.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
