import { useEffect, useState } from 'react';
import {
  useGetMe,
  useGetPublicConfig,
  useListWithdrawals,
  useRequestWithdrawal,
  useGetVerificationStatus,
  useSubmitVerification,
  getGetVerificationStatusQueryKey,
  getListWithdrawalsQueryKey,
  getGetMeQueryKey,
  WithdrawalMethod
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, AlertCircle, Clock, CheckCircle2, XCircle, ArrowDownToLine, Loader2, ChevronDown, ShieldCheck, ExternalLink, Copy } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate, formatTime } from '../lib/utils';
import { PageHeader } from '../components/page-header';
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
  const { data: vstatus } = useGetVerificationStatus();
  const submitVerification = useSubmitVerification();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedReasons, setExpandedReasons] = useState<Set<number>>(new Set());

  // Account-verification dialog state. `parkedWithdraw` holds the withdrawal
  // the user was attempting when the server demanded verification — it is
  // sent along with the payment proof so admin approval can place it.
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [parkedWithdraw, setParkedWithdraw] = useState<WithdrawFormValues | null>(null);
  const [vMethod, setVMethod] = useState<string>('bkash');
  const [vPayerNumber, setVPayerNumber] = useState('');
  const [vTrxId, setVTrxId] = useState('');

  const verificationPending = vstatus?.request?.status === 'pending';

  // Selectable "which method did you pay with" options: the legacy
  // bKash/Nagad numbers from settings plus every admin-added custom
  // method (Upay, Rocket, ...).
  const payOptions = [
    ...(vstatus?.bkashNumber ? [{ key: 'bkash', label: 'bKash', logo: null as string | null, color: '#E2136E' }] : []),
    ...(vstatus?.nagadNumber ? [{ key: 'nagad', label: 'Nagad', logo: null as string | null, color: '#EC1C24' }] : []),
    ...((vstatus?.methods ?? []).map((m) => ({ key: m.name, label: m.name, logo: m.logoUrl ?? null, color: '#2563EB' }))),
  ];

  useEffect(() => {
    if (verifyOpen && payOptions.length > 0 && !payOptions.some((o) => o.key === vMethod)) {
      setVMethod(payOptions[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyOpen, vstatus]);

  const logoFor = (m: 'bkash' | 'nagad') =>
    (m === 'bkash' ? config?.bkashLogoUrl : config?.nagadLogoUrl) || null;

  const copyNumber = async (num: string) => {
    try {
      await navigator.clipboard.writeText(num);
      toast({ title: 'কপি হয়েছে ✅', description: num });
    } catch {
      toast({ title: 'কপি করা যায়নি', description: 'নম্বরটি চেপে ধরে কপি করুন।', variant: 'destructive' });
    }
  };

  const MethodBadge = ({ m }: { m: 'bkash' | 'nagad' }) => {
    const logo = logoFor(m);
    return logo ? (
      <img src={logo} alt={m} className="w-6 h-6 rounded-full object-contain bg-white" />
    ) : (
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
        {m === 'bkash' ? 'b' : 'n'}
      </div>
    );
  };

  const handleSubmitVerification = () => {
    if (vPayerNumber.trim().length < 5 || vTrxId.trim().length < 4) {
      toast({ title: 'সবগুলো ঘর পূরণ করুন', description: 'যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি এবং TrxID দিন।', variant: 'destructive' });
      return;
    }
    submitVerification.mutate(
      {
        data: {
          method: vMethod,
          payerNumber: vPayerNumber.trim(),
          trxId: vTrxId.trim(),
          ...(parkedWithdraw
            ? {
                withdrawAmount: parkedWithdraw.amount,
                withdrawMethod: parkedWithdraw.method as WithdrawalMethod,
                withdrawAccountNumber: parkedWithdraw.accountNumber,
              }
            : {}),
        },
      },
      {
        onSuccess: () => {
          setVerifyOpen(false);
          setVPayerNumber('');
          setVTrxId('');
          toast({
            title: 'ভেরিফিকেশন জমা হয়েছে ✅',
            description: 'অ্যাডমিন যাচাই করে অনুমোদন দিলে আপনার উইথড্র রিকোয়েস্টও জমা হয়ে যাবে।',
          });
          queryClient.invalidateQueries({ queryKey: getGetVerificationStatusQueryKey() });
        },
        onError: (err: any) => {
          const msg = err?.data?.error || 'আবার চেষ্টা করুন।';
          toast({ title: 'জমা দেওয়া যায়নি', description: msg, variant: 'destructive' });
        },
      },
    );
  };

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
          const body = err?.data;
          if (body?.error === 'verification_required') {
            if (verificationPending) {
              toast({
                title: 'ভেরিফিকেশন যাচাই চলছে',
                description: 'আপনার আগের ভেরিফিকেশন রিকোয়েস্ট অ্যাডমিন যাচাই করছেন। অনুমোদন হলেই উইথড্র করতে পারবেন।',
              });
              return;
            }
            setParkedWithdraw(data);
            setVerifyOpen(true);
            return;
          }
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
    <div className="flex-1 flex flex-col overflow-y-auto page-canvas">
      <PageHeader
        title="Withdraw"
        subtitle={`Min. ${formatCurrency(minWithdraw)}`}
        trailing={
          <div className="w-11 h-11 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
        }
      />
      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl border shadow-sm p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">Available Balance</p>
          <p className="text-foreground text-4xl font-extrabold tracking-tight" data-testid="text-withdraw-balance">
            {formatCurrency(user?.balance || 0)}
          </p>
        </div>
      </div>

      <div className="px-4 pb-6 pt-5 space-y-5">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <ArrowDownToLine size={18} className="text-primary" />
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

          {user?.isVerified && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center mb-5">
              <ShieldCheck className="text-green-600 shrink-0" size={18} />
              <p className="text-xs font-bold text-green-800">আপনার অ্যাকাউন্ট ভেরিফাইড ✅</p>
            </div>
          )}

          {verificationPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 items-start mb-5" data-testid="banner-verification-pending">
              <Clock className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-blue-800">ভেরিফিকেশন যাচাই চলছে</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  আপনার পেমেন্ট অ্যাডমিন যাচাই করছেন। অনুমোদন হলে অ্যাকাউন্ট ভেরিফাইড হবে
                  এবং আপনার উইথড্র রিকোয়েস্ট নিজে থেকেই জমা হয়ে যাবে।
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
                            : { background: '#F4F7FA', color: '#1B2F42', borderColor: '#D9E2EA' }
                          }
                          data-testid={`select-method-${m}`}
                        >
                          <MethodBadge m={m} />
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
                        className="h-12 bg-muted/50 rounded-xl border-slate-200 focus:border-primary"
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
                          className="h-12 pl-9 font-black text-xl bg-muted/50 rounded-xl border-slate-200 focus:border-primary"
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
                className="w-full h-12 rounded-xl font-black text-base text-white disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2 bg-primary shadow-md shadow-primary/25"
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
              {[1, 2].map(i => <div key={i} className="h-20 bg-white animate-pulse rounded-2xl border border-slate-200" />)}
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const s = getStatusStyle(w.status);
                return (
                  <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {logoFor(w.method as 'bkash' | 'nagad') ? (
                          <img
                            src={logoFor(w.method as 'bkash' | 'nagad')!}
                            alt={w.method}
                            className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ background: w.method === 'bkash' ? '#E2136E' : '#EC1C24' }}
                          >
                            {w.method === 'bkash' ? 'b' : 'n'}
                          </div>
                        )}
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
                    <div className="pt-2 border-t border-slate-100 text-xs text-muted-foreground">
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
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No withdrawal history yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              অ্যাকাউন্ট ভেরিফিকেশন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                উইথড্র চালু করতে অ্যাকাউন্ট ভেরিফিকেশন বাধ্যতামূলক।
              </p>
              <p className="text-xs font-black text-slate-800">
                💳 ফি: {formatCurrency(vstatus?.fee || 0)} (শুধুমাত্র একবার)
              </p>
              <div className="text-xs text-slate-800 leading-relaxed space-y-0.5">
                <p>• উইথড্র চালু হবে।</p>
                <p>• অ্যাকাউন্ট Active হবে।</p>
                <p>• পুনরায় কোনো ফি লাগবে না।</p>
              </div>
            </div>

            {vstatus?.mode === 'auto' && vstatus?.autoUrl ? (
              <a
                href={vstatus.autoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 bg-primary"
                data-testid="button-auto-pay"
              >
                অনলাইনে পেমেন্ট করুন <ExternalLink size={15} />
              </a>
            ) : (
              <div className="space-y-1.5">
                {vstatus?.bkashNumber && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5 gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0" style={{ color: '#E2136E' }}>
                      {logoFor('bkash') ? (
                        <img src={logoFor('bkash')!} alt="bKash" className="w-7 h-7 rounded-lg object-contain bg-white shrink-0" />
                      ) : null}
                      bKash (Send Money)
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-sm select-all" data-testid="text-verify-bkash">{vstatus.bkashNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(vstatus.bkashNumber!)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform"
                        aria-label="Copy bKash number"
                        data-testid="button-copy-bkash"
                      >
                        <Copy size={14} className="text-primary" />
                      </button>
                    </span>
                  </div>
                )}
                {vstatus?.nagadNumber && (
                  <div className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5 gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0" style={{ color: '#EC1C24' }}>
                      {logoFor('nagad') ? (
                        <img src={logoFor('nagad')!} alt="Nagad" className="w-7 h-7 rounded-lg object-contain bg-white shrink-0" />
                      ) : null}
                      Nagad (Send Money)
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-sm select-all" data-testid="text-verify-nagad">{vstatus.nagadNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(vstatus.nagadNumber!)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform"
                        aria-label="Copy Nagad number"
                        data-testid="button-copy-nagad"
                      >
                        <Copy size={14} className="text-primary" />
                      </button>
                    </span>
                  </div>
                )}
                {(vstatus?.methods ?? []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5 gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0 text-primary">
                      {m.logoUrl ? (
                        <img src={m.logoUrl} alt={m.name} className="w-7 h-7 rounded-lg object-contain bg-white shrink-0" />
                      ) : null}
                      <span className="truncate">
                        {m.name} ({m.paymentType === 'send_money' ? 'Send Money' : 'Cash Out'})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-sm select-all" data-testid={`text-verify-method-${m.id}`}>{m.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(m.accountNumber)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform"
                        aria-label={`Copy ${m.name} number`}
                        data-testid={`button-copy-method-${m.id}`}
                      >
                        <Copy size={14} className="text-primary" />
                      </button>
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground pt-1">
                  নম্বরের পাশের বাটনে চাপ দিলে নম্বর কপি হয়ে যাবে — ফি পাঠিয়ে নিচের ফর্মটি পূরণ করুন।
                </p>
              </div>
            )}

            <div>
              <p className="font-bold text-foreground text-sm mb-1.5">কোন মাধ্যমে পাঠিয়েছেন?</p>
              <div className="grid grid-cols-2 gap-3">
                {(payOptions.length > 0
                  ? payOptions
                  : [
                      { key: 'bkash', label: 'bKash', logo: null, color: '#E2136E' },
                      { key: 'nagad', label: 'Nagad', logo: null, color: '#EC1C24' },
                    ]
                ).map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setVMethod(o.key)}
                    className="h-11 px-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border-2 transition-all active:scale-95"
                    style={vMethod === o.key
                      ? { background: o.color, color: 'white', borderColor: 'transparent' }
                      : { background: '#F4F7FA', color: '#1B2F42', borderColor: '#D9E2EA' }
                    }
                    data-testid={`select-verify-method-${o.key}`}
                  >
                    {(o.key === 'bkash' || o.key === 'nagad') ? (
                      <MethodBadge m={o.key as 'bkash' | 'nagad'} />
                    ) : o.logo ? (
                      <img src={o.logo} alt={o.label} className="w-6 h-6 rounded-full object-contain bg-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        {o.label.charAt(0)}
                      </div>
                    )}
                    <span className="truncate">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-bold text-foreground text-sm mb-1.5">যে নম্বর থেকে পাঠিয়েছেন</p>
              <Input
                placeholder="01XXXXXXXXX"
                type="tel"
                maxLength={11}
                value={vPayerNumber}
                onChange={(e) => setVPayerNumber(e.target.value)}
                className="h-11 bg-muted/50 rounded-xl border-slate-200"
                data-testid="input-verify-payer-number"
              />
            </div>

            <div>
              <p className="font-bold text-foreground text-sm mb-1.5">Transaction ID (TrxID)</p>
              <Input
                placeholder="যেমন: 9HK7A2B5CD"
                value={vTrxId}
                onChange={(e) => setVTrxId(e.target.value)}
                className="h-11 bg-muted/50 rounded-xl border-slate-200"
                data-testid="input-verify-trxid"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitVerification}
              disabled={submitVerification.isPending}
              className="w-full h-12 rounded-xl font-black text-base text-white disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2 bg-primary shadow-md shadow-primary/25"
              data-testid="button-submit-verification"
            >
              {submitVerification.isPending && <Loader2 className="animate-spin" size={18} />}
              ভেরিফিকেশন জমা দিন
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
