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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wallet, AlertCircle, Clock, CheckCircle2, XCircle, ArrowDownToLine, Loader2 } from 'lucide-react';
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

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      method: 'bkash',
      accountNumber: '',
      amount: config?.minWithdraw || 0,
    },
  });

  // Watch amount to trigger re-validation when config loads
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
          toast({ 
            title: 'Request Submitted', 
            description: 'Your withdrawal request is pending approval.' 
          });
          form.reset({ method: data.method, accountNumber: '', amount: minWithdraw });
          queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: (err: any) => {
          toast({ 
            title: 'Request Failed', 
            description: err.message || 'Could not submit request.', 
            variant: 'destructive' 
          });
        }
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="text-primary" size={18} />;
      case 'rejected': return <XCircle className="text-destructive" size={18} />;
      default: return <Clock className="text-orange-500" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-primary bg-primary/10';
      case 'rejected': return 'text-destructive bg-destructive/10';
      default: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Withdraw</h1>
        <p className="text-sm text-muted-foreground mt-1">Cash out your earnings</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Balance Card */}
        <Card className="border shadow-sm bg-card overflow-hidden">
          <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
            <Wallet className="text-primary opacity-50" size={20} />
          </div>
          <CardContent className="p-6">
            <p className="text-4xl font-black text-foreground" data-testid="text-withdraw-balance">
              {formatCurrency(user?.balance || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ArrowDownToLine size={18} className="text-primary" />
              Request Payout
            </h2>

            {config && user && user.rejectedWithdrawCount > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex gap-3 items-start mb-6">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-orange-800 dark:text-orange-400">Notice</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5 leading-relaxed">
                    Due to previous rejected requests, your minimum withdrawal amount has increased. 
                    Ensure all your tasks and referrals are genuine.
                  </p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <Button
                          type="button"
                          variant={field.value === 'bkash' ? 'default' : 'outline'}
                          className={`w-full justify-start h-12 px-4 ${field.value === 'bkash' ? 'bg-[#E2136E] hover:bg-[#C1105C] text-white border-transparent' : ''}`}
                          onClick={() => field.onChange('bkash')}
                          data-testid="select-method-bkash"
                        >
                          <div className="w-6 h-6 rounded-full bg-white/20 mr-2 flex items-center justify-center font-bold text-xs">b</div>
                          bKash
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'nagad' ? 'default' : 'outline'}
                          className={`w-full justify-start h-12 px-4 ${field.value === 'nagad' ? 'bg-[#EC1C24] hover:bg-[#C9181F] text-white border-transparent' : ''}`}
                          onClick={() => field.onChange('nagad')}
                          data-testid="select-method-nagad"
                        >
                          <div className="w-6 h-6 rounded-full bg-white/20 mr-2 flex items-center justify-center font-bold text-xs">n</div>
                          Nagad
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="01XXXXXXXXX" 
                          type="tel"
                          maxLength={11}
                          className="h-12 bg-muted/50" 
                          data-testid="input-account-number"
                          {...field} 
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
                      <div className="flex justify-between items-end mb-1">
                        <FormLabel>Amount</FormLabel>
                        <span className="text-xs text-muted-foreground font-medium">
                          Min: {formatCurrency(minWithdraw)}
                        </span>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                          <Input 
                            type="number"
                            step="0.01"
                            className="h-12 pl-8 font-bold text-lg bg-muted/50" 
                            data-testid="input-amount"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 font-bold text-lg mt-2" 
                  disabled={requestMutation.isPending || !user || user.balance < minWithdraw}
                  data-testid="button-submit-withdrawal"
                >
                  {requestMutation.isPending ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : null}
                  Request {formatCurrency(amount || 0)}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* History */}
        <section>
          <h3 className="font-bold text-lg mb-3">Recent Transactions</h3>
          
          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <Card key={w.id} className="border shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${w.method === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#EC1C24]'}`}>
                          {w.method === 'bkash' ? 'b' : 'n'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground capitalize">{w.method}</p>
                          <p className="text-xs text-muted-foreground">{w.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatCurrency(w.amount)}</p>
                        <div className={`mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${getStatusColor(w.status)}`}>
                          {getStatusIcon(w.status)}
                          {w.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <span>{formatDate(w.requestedAt)} • {formatTime(w.requestedAt)}</span>
                      {w.note && w.status === 'rejected' && (
                        <span className="text-destructive font-medium truncate max-w-[150px]" title={w.note}>
                          Reason: {w.note}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border shadow-sm bg-card border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                No withdrawal history yet.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
