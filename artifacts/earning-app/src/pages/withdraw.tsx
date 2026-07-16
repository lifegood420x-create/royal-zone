import { useState } from 'react';
import { 
  useGetMe, 
  useGetPublicConfig, 
  useListWithdrawals, 
  useRequestWithdrawal,
  getListWithdrawalsQueryKey,
  getGetMeQueryKey,
  WithdrawalMethod
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Wallet, AlertCircle, Clock, CheckCircle2, XCircle, ArrowDownToLine, Loader2, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate, formatTime } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const withdrawSchema = z.object({
  method: z.enum(['bkash', 'nagad'] as const),
  accountNumber: z.string().min(11, 'Enter a valid 11-digit number').max(11, 'Enter a valid 11-digit number'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useListWithdrawals();
  const requestMutation = useRequestWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedReasons, setExpandedReasons] = useState<Set<number>>(new Set());

  const toggleReason = (id: number) => {
    setExpandedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      method: 'bkash',
      accountNumber: '',
      amount: config?.minWithdraw || 0,
    },
  });

  const amount = form.watch('amount');
  const minWithdraw = config?.minWithdraw || 0;

  const onSubmit = (data: WithdrawFormValues) => {
    if (!user) return;
    if (data.amount < minWithdraw) {
      form.setError('amount', { message: `Minimum withdrawal is ${formatCurrency(minWithdraw)}` });
      return;
    }
    if (data.amount > user.balance) {
      form.setError('amount', { message: `Insufficient balance. You have ${formatCurrency(user.balance)}` });
      return;
    }
    requestMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: 'Request Submitted', description: 'Your withdrawal request is pending approval.' });
          form.reset({ method: data.method, accountNumber: '', amount: minWithdraw });
          queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Request Failed', description: err.message || 'Could not submit request.', variant: 'destructive' });
        }
      }
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' };
      case 'rejected': return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
      default: return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F4FF' }}>
      {/* Gradient Hero */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-12"
        style={{ background: 'linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-white text-4xl font-black tracking-tight" data-testid="text-withdraw-balance">
              {formatCurrency(user?.balance || 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet size={22} color="white" />
          </div>
        </div>
        <p className="text-white/60 text-xs mt-3">Min. withdrawal: {formatCurrency(minWithdraw)}</p>
      </div>

      <div className="px-4 pb-6 -mt-4 space-y-5">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center gap-2 mb-5">
            <ArrowDownToLine size={18} style={{ color: '#6C21E8' }} />
            <h2 className="font-black text-foreground">Request Payout</h2>
          </div>

          {config && user && user.rejectedWithdrawCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3 items-start mb-5">
              <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-orange-800">নোটিশ</p>
                <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                  আগের রিজেক্টেড রিকোয়েস্টের কারণে আপনার সর্বনিম্ন উইথড্র পরিমাণ বাড়ানো হয়েছে।
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground text-sm">Payment Method</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      {(['bkash', 'nagad'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => field.onChange(m)}
                          className="h-12 px-4 rounded-xl flex items-center gap-2 font-bold text-sm border-2 transition-all active:scale-95"
                          style={field.value === m
                            ? { background: m === 'bkash' ? '#E2136E' : '#EC1C24', color: 'white', borderColor: 'transparent' }
                            : { background: '#F8F4FF', color: '#1A0533', borderColor: '#E8E0F0' }
                          }
                          data-testid={`select-method-${m}`}
                        >
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                            {m === 'bkash' ? 'b' : 'n'}
                          </div>
                          {m === 'bkash' ? 'bKash' : 'Nagad'}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Account Number */}
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground text-sm">Account Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="01XXXXXXXXX"
                        type="tel"
                        maxLength={11}
                        className="h-12 bg-muted/50 rounded-xl border-purple-100 focus:border-primary"
                        data-testid="input-account-number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-end mb-1">
                      <FormLabel className="font-bold text-foreground text-sm">Amount</FormLabel>
                      <span className="text-xs text-muted-foreground font-medium">Min: {formatCurrency(minWithdraw)}</span>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">৳</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-12 pl-9 font-black text-xl bg-muted/50 rounded-xl border-purple-100 focus:border-primary"
                          data-testid="input-amount"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                className="w-full h-12 rounded-xl font-black text-base text-white disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A, #FF7B4A)' }}
                disabled={requestMutation.isPending || !user || user.balance < minWithdraw}
                data-testid="button-submit-withdrawal"
              >
                {requestMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                Request {formatCurrency(amount || 0)}
              </button>
            </form>
          </Form>
        </div>

        {/* History */}
        <div>
          <h3 className="font-black text-foreground text-base mb-3 px-1">Recent Transactions</h3>

          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-white animate-pulse rounded-2xl border border-purple-100" />)}
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const s = getStatusStyle(w.status);
                return (
                  <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: w.method === 'bkash' ? '#E2136E' : '#EC1C24' }}
                        >
                          {w.method === 'bkash' ? 'b' : 'n'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground capitalize">{w.method}</p>
                          <p className="text-xs text-muted-foreground">{w.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-foreground">{formatCurrency(w.amount)}</p>
                        <div
                          className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg"
                          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                        >
                          {w.status === 'paid' && <CheckCircle2 size={10} />}
                          {w.status === 'rejected' && <XCircle size={10} />}
                          {w.status === 'pending' && <Clock size={10} />}
                          {w.status}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-purple-50 text-xs text-muted-foreground">
                      {formatDate(w.requestedAt)} · {formatTime(w.requestedAt)}
                    </div>
                    {w.note && w.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => toggleReason(w.id)}
                        className="w-full mt-2 text-left"
                        data-testid={`button-reason-${w.id}`}
                      >
                        <div className="flex items-start gap-1.5">
                          <p className={`text-destructive font-medium text-xs flex-1 ${expandedReasons.has(w.id) ? '' : 'truncate'}`}>
                            Reason: {w.note}
                          </p>
                          <ChevronDown size={14} className={`text-destructive shrink-0 mt-0.5 transition-transform ${expandedReasons.has(w.id) ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No withdrawal history yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
