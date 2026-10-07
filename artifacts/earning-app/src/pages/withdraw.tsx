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
import { Wallet, AlertCircle, Clock, CircleCheck, CircleX, Loader2, ChevronDown, ShieldCheck, ExternalLink, Copy, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../components/page-header';
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
    ...(vstatus?.bkashNumber ? [{ key: 'bkash', label: 'bKash', logo: null as string | null, color: 'var(--payment-bkash)' }] : []),
    ...(vstatus?.nagadNumber ? [{ key: 'nagad', label: 'Nagad', logo: null as string | null, color: 'var(--payment-nagad)' }] : []),
    ...((vstatus?.methods ?? []).map((m) => ({ key: m.name, label: m.name, logo: m.logoUrl ?? null, color: 'var(--primary)' }))),
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
      <img src={logo} alt={m} className="w-6 h-6 rounded-full object-contain bg-white/90" />
    ) : (
      <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs">
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

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'var(--success)', bg: 'oklch(0.8 0.17 155 / 13%)', border: 'oklch(0.8 0.17 155 / 30%)', Icon: CircleCheck };
      case 'rejected':
        return { color: 'oklch(0.75 0.17 24)', bg: 'oklch(0.63 0.21 24 / 13%)', border: 'oklch(0.63 0.21 24 / 32%)', Icon: CircleX };
      default:
        return { color: 'var(--warning-foreground)', bg: 'oklch(0.84 0.14 88 / 12%)', border: 'oklch(0.84 0.14 88 / 30%)', Icon: Clock };
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader title="উইথড্র" subtitle="bKash / Nagad-এ টাকা তুলুন" backTo="/settings" testId="button-back-withdraw" />

      {/* ── Balance strip ─────────────────────────────────────────────── */}
      <header
        className="mx-4 mt-5 rounded-[28px] p-[1.2px] animate-fade-up"
        style={{ background: 'linear-gradient(135deg, oklch(0.8 0.13 196 / 60%), oklch(0.68 0.22 300 / 60%))' }}
      >
        <div className="relative rounded-[27px] px-5 py-4 flex items-center justify-between overflow-hidden" style={{ background: 'oklch(0.17 0.035 286 / 92%)' }}>
          <div className="absolute -top-10 -left-8 w-36 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.8 0.13 196 / 22%) 0%, transparent 65%)' }} />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">উপলব্ধ ব্যালেন্স</p>
            <p className="num text-3xl font-bold text-gradient-cyan mt-0.5" data-testid="text-withdraw-balance">
              {formatCurrency(user?.balance || 0)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">সর্বনিম্ন উইথড্র: <span className="num font-bold text-foreground">{formatCurrency(minWithdraw)}</span></p>
          </div>
          <div className="relative w-14 h-14 rounded-[20px] cyan-btn flex items-center justify-center shrink-0 animate-float">
            <Wallet size={24} />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* ── Notices ─────────────────────────────────────────────────── */}
        {config && user && user.rejectedWithdrawCount > 0 && (
          <div className="glass rounded-2xl p-3.5 flex gap-3 items-start" style={{ borderLeft: '3px solid var(--warning)' }}>
            <AlertCircle className="shrink-0 mt-0.5" size={17} style={{ color: 'var(--warning-foreground)' }} />
            <div>
              <p className="text-[13px] font-bold" style={{ color: 'var(--warning-foreground)' }}>নোটিশ</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                আগের রিজেক্টেড রিকোয়েস্টের কারণে আপনার সর্বনিম্ন উইথড্র পরিমাণ বাড়ানো হয়েছে।
              </p>
            </div>
          </div>
        )}

        {user?.isVerified && (
          <div className="glass rounded-2xl p-3.5 flex gap-2.5 items-center" style={{ borderLeft: '3px solid var(--success)' }}>
            <ShieldCheck className="shrink-0" size={17} style={{ color: 'var(--success)' }} />
            <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>আপনার অ্যাকাউন্ট ভেরিফাইড ✅</p>
          </div>
        )}

        {verificationPending && (
          <div className="glass rounded-2xl p-3.5 flex gap-3 items-start" style={{ borderLeft: '3px solid var(--primary)' }} data-testid="banner-verification-pending">
            <Clock className="shrink-0 mt-0.5" size={17} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-[13px] font-bold" style={{ color: 'var(--primary)' }}>ভেরিফিকেশন যাচাই চলছে</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                আপনার পেমেন্ট অ্যাডমিন যাচাই করছেন। অনুমোদন হলে অ্যাকাউন্ট ভেরিফাইড হবে
                এবং আপনার উইথড্র রিকোয়েস্ট নিজে থেকেই জমা হয়ে যাবে।
              </p>
            </div>
          </div>
        )}

        {/* ── Request form ────────────────────────────────────────────── */}
        <section className="glass rounded-3xl p-5 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-5">
            <ArrowUpRight size={18} style={{ color: 'var(--accent-foreground)' }} />
            <h2 className="font-bold text-foreground">পেআউট রিকোয়েস্ট</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground text-sm">পেমেন্ট মেথড</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      {(['bkash', 'nagad'] as const).map((m) => {
                        const selected = field.value === m;
                        const brand = m === 'bkash' ? 'var(--payment-bkash)' : 'var(--payment-nagad)';
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => field.onChange(m)}
                            className="h-12 px-4 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all active-scale"
                            style={selected
                              ? { background: 'oklch(1 0 0 / 4%)', color: 'var(--foreground)', border: `1.5px solid ${brand}`, boxShadow: `0 0 18px -6px ${brand}` }
                              : { background: 'oklch(1 0 0 / 3%)', color: 'var(--muted-foreground)', border: '1.5px solid oklch(1 0 0 / 10%)' }
                            }
                            data-testid={`select-method-${m}`}
                          >
                            <MethodBadge m={m} />
                            {m === 'bkash' ? 'bKash' : 'Nagad'}
                          </button>
                        );
                      })}
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
                    <FormLabel className="font-bold text-foreground text-sm">অ্যাকাউন্ট নম্বর</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="01XXXXXXXXX"
                        type="tel"
                        maxLength={11}
                        className="h-12 rounded-2xl glass-inset border-white/10 focus-visible:ring-primary num"
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
                      <FormLabel className="font-bold text-foreground text-sm">পরিমাণ</FormLabel>
                      <span className="text-xs text-muted-foreground font-medium">সর্বনিম্ন: {formatCurrency(minWithdraw)}</span>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">৳</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-12 pl-9 font-bold text-xl rounded-2xl glass-inset border-white/10 focus-visible:ring-primary num"
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
                className="w-full h-12 rounded-2xl font-bold text-base hero-btn disabled:opacity-50 active-scale flex items-center justify-center gap-2"
                disabled={requestMutation.isPending || !user || user.balance < minWithdraw}
                data-testid="button-submit-withdrawal"
              >
                {requestMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                {formatCurrency(amount || 0)} রিকোয়েস্ট করুন
              </button>
            </form>
          </Form>
        </section>

        {/* ── History ─────────────────────────────────────────────────── */}
        <section className="animate-fade-up stagger-2">
          <h3 className="font-bold text-foreground text-base mb-3 px-1">সাম্প্রতিক লেনদেন</h3>

          {withdrawalsLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map(i => <div key={i} className="h-20 glass animate-pulse rounded-3xl" />)}
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-2.5">
              {withdrawals.map((w) => {
                const s = getStatusChip(w.status);
                const methodColor = w.method === 'bkash' ? 'var(--payment-bkash)' : 'var(--payment-nagad)';
                return (
                  <div key={w.id} className="glass rounded-3xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {logoFor(w.method as 'bkash' | 'nagad') ? (
                          <img
                            src={logoFor(w.method as 'bkash' | 'nagad')!}
                            alt={w.method}
                            className="w-10 h-10 rounded-2xl object-contain bg-white/90 border border-white/15 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ background: methodColor, boxShadow: `0 0 16px -6px ${methodColor}` }}
                          >
                            {w.method === 'bkash' ? 'b' : 'n'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-foreground capitalize">{w.method}</p>
                          <p className="text-xs text-muted-foreground num">{w.accountNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="num font-bold text-foreground">{formatCurrency(w.amount)}</p>
                        <div
                          className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                        >
                          <s.Icon size={10} />
                          {w.status}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-xs text-muted-foreground" style={{ borderTop: '1px dashed oklch(1 0 0 / 8%)' }}>
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
                          <p className={`font-medium text-xs flex-1 ${expandedReasons.has(w.id) ? '' : 'truncate'}`} style={{ color: 'oklch(0.75 0.17 24)' }}>
                            Reason: {w.note}
                          </p>
                          <ChevronDown size={14} className={`shrink-0 mt-0.5 transition-transform ${expandedReasons.has(w.id) ? 'rotate-180' : ''}`} style={{ color: 'oklch(0.75 0.17 24)' }} />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-3xl border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">এখনও কোনো উইথড্র হিস্টোরি নেই।</p>
            </div>
          )}
        </section>
      </div>

      {/* Account Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-md rounded-[28px] glass-strong" style={{ background: 'oklch(0.2 0.04 286 / 95%)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
              অ্যাকাউন্ট ভেরিফিকেশন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="glass-inset rounded-2xl p-3.5 space-y-1" style={{ borderLeft: '3px solid var(--primary)' }}>
              <p className="text-xs font-bold text-foreground leading-relaxed">
                উইথড্র চালু করতে অ্যাকাউন্ট ভেরিফিকেশন বাধ্যতামূলক।
              </p>
              <p className="text-xs font-bold text-foreground">
                💳 ফি: {formatCurrency(vstatus?.fee || 0)} (শুধুমাত্র একবার)
              </p>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-0.5">
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
                className="w-full h-12 rounded-2xl font-bold text-sm hero-btn flex items-center justify-center gap-2"
                data-testid="button-auto-pay"
              >
                অনলাইনে পেমেন্ট করুন <ExternalLink size={15} />
              </a>
            ) : (
              <div className="space-y-1.5">
                {vstatus?.bkashNumber && (
                  <div className="flex items-center justify-between rounded-2xl px-3 py-2.5 gap-2" style={{ background: 'color-mix(in oklab, var(--payment-bkash) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--payment-bkash) 30%, transparent)' }}>
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0" style={{ color: 'oklch(0.78 0.16 356)' }}>
                      {logoFor('bkash') ? (
                        <img src={logoFor('bkash')!} alt="bKash" className="w-7 h-7 rounded-lg object-contain bg-white/90 shrink-0" />
                      ) : null}
                      bKash (Send Money)
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="num font-bold text-sm select-all" data-testid="text-verify-bkash">{vstatus.bkashNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(vstatus.bkashNumber!)}
                        className="w-8 h-8 rounded-lg glass-inset flex items-center justify-center active-scale"
                        aria-label="Copy bKash number"
                        data-testid="button-copy-bkash"
                      >
                        <Copy size={13} style={{ color: 'var(--primary)' }} />
                      </button>
                    </span>
                  </div>
                )}
                {vstatus?.nagadNumber && (
                  <div className="flex items-center justify-between rounded-2xl px-3 py-2.5 gap-2" style={{ background: 'color-mix(in oklab, var(--payment-nagad) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--payment-nagad) 30%, transparent)' }}>
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0" style={{ color: 'oklch(0.75 0.17 27)' }}>
                      {logoFor('nagad') ? (
                        <img src={logoFor('nagad')!} alt="Nagad" className="w-7 h-7 rounded-lg object-contain bg-white/90 shrink-0" />
                      ) : null}
                      Nagad (Send Money)
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="num font-bold text-sm select-all" data-testid="text-verify-nagad">{vstatus.nagadNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(vstatus.nagadNumber!)}
                        className="w-8 h-8 rounded-lg glass-inset flex items-center justify-center active-scale"
                        aria-label="Copy Nagad number"
                        data-testid="button-copy-nagad"
                      >
                        <Copy size={13} style={{ color: 'var(--primary)' }} />
                      </button>
                    </span>
                  </div>
                )}
                {(vstatus?.methods ?? []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-2xl px-3 py-2.5 gap-2 glass-inset" style={{ borderColor: 'oklch(0.66 0.18 295 / 30%)' }}>
                    <span className="flex items-center gap-2 text-sm font-bold min-w-0" style={{ color: 'var(--primary)' }}>
                      {m.logoUrl ? (
                        <img src={m.logoUrl} alt={m.name} className="w-7 h-7 rounded-lg object-contain bg-white/90 shrink-0" />
                      ) : null}
                      <span className="truncate">
                        {m.name} ({m.paymentType === 'send_money' ? 'Send Money' : 'Cash Out'})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="num font-bold text-sm select-all" data-testid={`text-verify-method-${m.id}`}>{m.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyNumber(m.accountNumber)}
                        className="w-8 h-8 rounded-lg glass-inset flex items-center justify-center active-scale"
                        aria-label={`Copy ${m.name} number`}
                        data-testid={`button-copy-method-${m.id}`}
                      >
                        <Copy size={13} style={{ color: 'var(--primary)' }} />
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
                      { key: 'bkash', label: 'bKash', logo: null, color: 'var(--payment-bkash)' },
                      { key: 'nagad', label: 'Nagad', logo: null, color: 'var(--payment-nagad)' },
                    ]
                ).map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setVMethod(o.key)}
                    className="h-11 px-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all active-scale"
                    style={vMethod === o.key
                      ? { background: 'oklch(1 0 0 / 4%)', color: 'var(--foreground)', border: `1.5px solid ${o.color}`, boxShadow: `0 0 16px -6px ${o.color}` }
                      : { background: 'oklch(1 0 0 / 3%)', color: 'var(--muted-foreground)', border: '1.5px solid oklch(1 0 0 / 10%)' }
                    }
                    data-testid={`select-verify-method-${o.key}`}
                  >
                    {(o.key === 'bkash' || o.key === 'nagad') ? (
                      <MethodBadge m={o.key as 'bkash' | 'nagad'} />
                    ) : o.logo ? (
                      <img src={o.logo} alt={o.label} className="w-6 h-6 rounded-full object-contain bg-white/90" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
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
                className="h-11 rounded-2xl glass-inset border-white/10 focus-visible:ring-primary num"
                data-testid="input-verify-payer-number"
              />
            </div>

            <div>
              <p className="font-bold text-foreground text-sm mb-1.5">Transaction ID (TrxID)</p>
              <Input
                placeholder="যেমন: 9HK7A2B5CD"
                value={vTrxId}
                onChange={(e) => setVTrxId(e.target.value)}
                className="h-11 rounded-2xl glass-inset border-white/10 focus-visible:ring-primary"
                data-testid="input-verify-trxid"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitVerification}
              disabled={submitVerification.isPending}
              className="w-full h-12 rounded-2xl font-bold text-base hero-btn disabled:opacity-50 active-scale flex items-center justify-center gap-2"
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
