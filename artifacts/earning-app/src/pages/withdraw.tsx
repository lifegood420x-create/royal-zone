import React, { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListWithdrawals, useRequestWithdrawal } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, Info, Clock, CheckCircle2, XCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const withdrawSchema = z.object({
  method: z.enum(['bkash', 'nagad']),
  accountNumber: z.string().min(11, 'Enter a valid 11-digit number').max(11, 'Enter a valid 11-digit number'),
  amount: z.coerce.number().min(1, 'Amount required')
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useListWithdrawals();
  const queryClient = useQueryClient();
  const withdrawMutation = useRequestWithdrawal();

  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const minWithdraw = config?.minWithdraw || 50;

  const form = useForm<WithdrawValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      method: 'bkash',
      accountNumber: '',
      amount: minWithdraw
    }
  });

  const onSubmit = async (data: WithdrawValues) => {
    if (!user) return;
    if (data.amount < minWithdraw) {
      form.setError('amount', { message: `Minimum withdrawal is ৳${minWithdraw}` });
      return;
    }
    if (data.amount > user.balance) {
      form.setError('amount', { message: 'Insufficient balance' });
      return;
    }

    try {
      await withdrawMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast.success('Withdrawal request submitted successfully!');
      form.reset({ ...data, amount: minWithdraw });
      setActiveTab('history');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-6">
      <header className="px-6 pt-10 pb-6 bg-card border-b border-border z-10 sticky top-0 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">Withdraw Funds</h1>
        <p className="text-sm text-muted-foreground font-medium">Transfer your balance securely to your wallet.</p>
        
        <div className="mt-6 flex bg-muted p-1 rounded-2xl border border-border/50">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'request' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History
          </button>
        </div>
      </header>

      <div className="px-6 pt-6">
        {activeTab === 'request' ? (
          <div className="space-y-6 animate-fade-up">
            {/* Balance Card */}
            <div className="gradient-primary gradient-card-shine text-primary-foreground rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-primary-foreground/80 font-medium text-sm mb-1">Available to Withdraw</p>
                  <span className="text-3xl font-extrabold tracking-tight font-mono">৳{user?.balance?.toFixed(2) || '0.00'}</span>
                </div>
                <Wallet size={32} className="opacity-50" />
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-card border border-border p-6 rounded-3xl shadow-sm">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-foreground font-bold">Select Method</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('bkash')}
                            className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all active-scale ${
                              field.value === 'bkash' 
                                ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E]' 
                                : 'border-border bg-card text-muted-foreground hover:border-[#E2136E]/30'
                            }`}
                          >
                            <span className="font-extrabold text-sm tracking-wide">bKash</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('nagad')}
                            className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all active-scale ${
                              field.value === 'nagad' 
                                ? 'border-[#F7931E] bg-[#F7931E]/5 text-[#F7931E]' 
                                : 'border-border bg-card text-muted-foreground hover:border-[#F7931E]/30'
                            }`}
                          >
                            <span className="font-extrabold text-sm tracking-wide">Nagad</span>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-bold">Account Number</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          placeholder="e.g. 01700000000"
                          className="flex h-14 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm font-mono font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-foreground font-bold m-0">Amount (৳)</FormLabel>
                        <span className="text-xs text-muted-foreground font-medium">Min: ৳{minWithdraw}</span>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                          <input
                            {...field}
                            type="number"
                            className="flex h-14 w-full rounded-2xl border border-input bg-background pl-8 pr-4 py-2 text-lg font-mono font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={withdrawMutation.isPending || !user || user.balance < minWithdraw}
                  className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-bold shadow-md hover:bg-opacity-90 active-scale disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 transition-all mt-4"
                >
                  Submit Request
                  <ArrowRight size={18} />
                </button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up">
            {withdrawalsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">No history yet</h3>
                <p className="text-muted-foreground text-sm mt-2">Your withdrawal records will appear here.</p>
              </div>
            ) : (
              withdrawals.map((w: any, index: number) => {
                const isPending = w.status === 'pending';
                const isPaid = w.status === 'paid';
                const isRejected = w.status === 'rejected';
                
                return (
                  <div 
                    key={w.id} 
                    className={`bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-all stagger-${(index % 5) + 1} ${isRejected ? 'cursor-pointer hover:border-destructive/30' : ''}`}
                    onClick={() => isRejected && setExpandedId(expandedId === w.id ? null : w.id)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isPaid ? 'bg-success/10 text-success' :
                          isPending ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {isPaid ? <CheckCircle2 size={24} /> :
                           isPending ? <Clock size={24} /> :
                           <XCircle size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide">{w.method}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{w.accountNumber}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(w.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-bold font-mono text-lg text-foreground">৳{w.amount}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mt-1 ${
                          isPaid ? 'bg-success/10 text-success' :
                          isPending ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {w.status}
                        </span>
                        {isRejected && (
                          <ChevronDown size={14} className={`text-muted-foreground mt-1 transition-transform ${expandedId === w.id ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </div>
                    {isRejected && expandedId === w.id && (
                      <div className="bg-destructive/5 px-4 py-3 border-t border-destructive/10 text-sm text-destructive-foreground animate-fade-in flex items-start gap-2">
                        <Info size={16} className="text-destructive shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block text-destructive mb-0.5">Rejection Reason:</strong>
                          <span className="text-destructive/90">{w.note || 'Account issue or policy violation.'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
