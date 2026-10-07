import { useState } from 'react';
import {
  useGetMe,
  useGetPublicConfig,
  useListTasks,
  useWatchAd,
  useClaimAd,
  useCompleteTask,
  getGetMeQueryKey,
  getListTasksQueryKey,
} from '@workspace/api-client-react';
import { showRewardedAd } from '../lib/rewarded-ads';
import { useToast } from '@/hooks/use-toast';
import { CircleCheck, ExternalLink, Loader2, Play, ListTodo, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../lib/utils';
import { TaskIcon } from '../lib/task-icons';


export default function Earn() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const [watchingAd, setWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const [visitingTask, setVisitingTask] = useState<number | null>(null);

  const watchAdMutation = useWatchAd();
  const claimAdMutation = useClaimAd();
  const completeTaskMutation = useCompleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const runCountdown = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      const start = Date.now();
      setCountdown(seconds);
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((seconds * 1000 - (Date.now() - start)) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  // The API's AdNetwork enum still says "monetag" — kept as the record label
  // to avoid an API/schema change; the ad actually shown is GigaPub.
  const AD_NETWORK_LABEL = 'monetag' as const;

  const handleWatchAd = async () => {
    if (!config) return;
    setWatchingAd(true);
    try {
      const durationSeconds = config.adDurationSeconds || 15;

      if (config.requireAdPostback) {
        await claimAdMutation.mutateAsync({ data: { network: AD_NETWORK_LABEL } });
        await Promise.all([showRewardedAd(), runCountdown(durationSeconds)]);
        toast({
          title: 'Ad watched',
          description: 'Reward will be credited once the ad network confirms the view.',
        });
        setTimeout(() => queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }), 5000);
      } else {
        await Promise.all([showRewardedAd(), runCountdown(durationSeconds)]);
        watchAdMutation.mutate(
          { data: { network: AD_NETWORK_LABEL } },
          {
            onSuccess: (res) => {
              toast({ title: 'Ad Completed!', description: `You earned ${formatCurrency(res.adWatch.reward)}` });
              queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
            },
            onError: (err: any) => {
              const body = err?.data as any;
              const msg = body?.error || err?.message || 'Something went wrong while crediting your reward.';
              toast({ title: 'Error', description: msg, variant: 'destructive' });
            }
          }
        );
      }
    } catch (err: any) {
      const body = err?.data as any;
      const msg = body?.error || err?.message || 'Could not load ad.';
      toast({ title: 'Ad failed', description: msg, variant: 'destructive' });
    } finally {
      setWatchingAd(false);
      setCountdown(null);
    }
  };

  const handleClaimTask = (taskId: number) => {
    setCompletingTask(taskId);
    completeTaskMutation.mutate(
      { id: taskId },
      {
        onSuccess: (res) => {
          toast({ title: 'Task Completed!', description: `You earned ${formatCurrency(res.completion.reward)}` });
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setVisitingTask(null);
        },
        onError: (err: any) => {
          const body = err?.data;
          if (body?.error === 'channel_not_joined') {
            toast({ title: 'জয়েন করুন', description: 'প্রথমে চ্যানেলে জয়েন করুন, তারপর Claim করুন।', variant: 'destructive' });
            setVisitingTask(null); // reset so they can re-open the link
          } else {
            toast({ title: 'Error', description: 'Could not complete task at this time.', variant: 'destructive' });
          }
        },
        onSettled: () => setCompletingTask(null)
      }
    );
  };

  const adLimit = config?.adDailyLimit || 0;
  const adsWatched = user?.todayAdsWatched || 0;
  const adsLeft = Math.max(0, adLimit - adsWatched);
  const adProgress = adLimit > 0 ? (adsWatched / adLimit) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Countdown overlay — only shown while the minimum watch timer is active.
           Intentionally NOT shown when countdown === 0 so the GigaPub
           ad overlay can remain visible and the user can dismiss it without
           our UI blocking the ad's close button. */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: 'var(--overlay)', backdropFilter: 'blur(10px)' }} data-testid="overlay-ad-countdown">
          <div className="glass-strong rounded-[32px] p-8 max-w-xs w-full flex flex-col items-center text-center gap-4 animate-scale-in">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0%, oklch(0.68 0.22 300) 35%, oklch(0.8 0.13 196) 60%, transparent 75%)',
                }}
              />
              <div className="absolute inset-[6px] rounded-full glass-strong flex items-center justify-center">
                <span className="num text-2xl font-bold text-gradient" data-testid="text-ad-countdown">{countdown}</span>
              </div>
            </div>
            <p className="font-bold text-foreground text-lg">এড দেখা হচ্ছে…</p>
            <div className="w-full glass-inset rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  background: 'var(--grad-brand)',
                  width: `${config?.adDurationSeconds ? ((config.adDurationSeconds - countdown) / config.adDurationSeconds) * 100 : 0}%`
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">এখন বন্ধ করবেন না — আগে বন্ধ করলে reward পাবেন না।</p>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="px-4 pt-5 flex items-end justify-between animate-fade-up">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-gradient mb-1">EARN ZONE</p>
          <h1 className="text-2xl font-bold text-foreground">আয় করুন</h1>
        </div>
        <div className="glass rounded-2xl px-3.5 py-2 flex items-center gap-2">
          <Zap size={13} style={{ color: 'var(--warning-foreground)' }} />
          <span className="num text-sm font-bold text-foreground">{formatCurrency(config?.adReward || 0)}</span>
          <span className="text-[10px] font-semibold text-muted-foreground">/ অ্যাড</span>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5 flex-1">
        {/* ── Ad reactor card ──────────────────────────────────────── */}
        <section
          className="relative rounded-[28px] p-[1.2px] animate-fade-up stagger-1"
          style={{ background: 'linear-gradient(135deg, oklch(0.68 0.22 300 / 70%), oklch(0.8 0.13 196 / 60%))' }}
        >
          <div className="relative rounded-[27px] px-5 py-5 overflow-hidden" style={{ background: 'oklch(0.17 0.035 286 / 92%)' }}>
            <div className="absolute -top-14 -left-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.66 0.22 305 / 30%) 0%, transparent 65%)' }} />
            <div className="flex items-center gap-5">
              {/* Ring gauge */}
              <div className="relative w-[104px] h-[104px] shrink-0">
                <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90">
                  <circle cx="52" cy="52" r="45" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="9" />
                  <circle
                    cx="52"
                    cy="52"
                    r="45"
                    fill="none"
                    stroke="url(#adRing)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${(adProgress / 100) * 282.7} 282.7`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="adRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.68 0.22 300)" />
                      <stop offset="100%" stopColor="oklch(0.8 0.13 196)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="num text-xl font-bold text-foreground leading-none">{adsWatched}<span className="text-muted-foreground text-sm font-semibold">/{adLimit}</span></span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">আজ</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">ডেইলি অ্যাড</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {config?.monetagEnabled
                    ? adsLeft > 0
                      ? <>আজ আরো <span className="font-bold text-gradient-cyan num">{adsLeft}</span>টি অ্যাড দেখতে পারবেন</>
                      : '🎉 আজকের লিমিট শেষ — কাল আবার আসুন!'
                    : 'ভিডিও অ্যাড এখন উপলব্ধ নেই'}
                </p>
                {config?.monetagEnabled ? (
                  <button
                    disabled={adsLeft === 0 || watchingAd}
                    onClick={handleWatchAd}
                    className={`mt-3 rounded-2xl h-11 px-6 flex items-center justify-center gap-2 font-bold text-sm active-scale disabled:opacity-40 disabled:pointer-events-none ${adsLeft > 0 ? 'animate-pulse-glow' : ''}`}
                    style={{ background: 'var(--grad-brand)', color: 'var(--primary-foreground)' }}
                    data-testid="button-ad-watch"
                  >
                    {watchingAd ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <><Play size={15} fill="currentColor" /> দেখুন</>
                    )}
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground mt-3" data-testid="text-ads-unavailable">
                    পরে আবার চেষ্টা করুন।
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tasks ────────────────────────────────────────────────── */}
        <section className="animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <ListTodo size={16} style={{ color: 'var(--accent-foreground)' }} />
              <h2 className="font-bold text-foreground text-base">টাস্কসমূহ</h2>
            </div>
            {tasks && (
              <span className="glass-inset rounded-full px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {tasks.filter(t => t.completed).length}/{tasks.length} সম্পন্ন
              </span>
            )}
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[84px] glass animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`glass rounded-3xl p-4 flex gap-3.5 items-center transition-opacity ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ background: 'oklch(0.24 0.045 288 / 80%)' }}
                  >
                    <TaskIcon type={task.type} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate text-sm">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="num text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: 'var(--grad-brand)', color: 'var(--primary-foreground)' }}
                      >
                        +{formatCurrency(task.reward)}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground glass-inset px-1.5 py-0.5 rounded-md">
                        {task.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center">
                    {task.completed ? (
                      // The reward is one-time (the server rejects repeat
                      // claims), but the link stays usable forever so users
                      // can revisit the channel/page from the task card.
                      task.link ? (
                        <button
                          className="font-bold text-xs rounded-xl px-3.5 py-2 glass-inset flex items-center gap-1.5 active-scale text-foreground"
                          onClick={() => window.open(task.link!, '_blank')}
                          data-testid={`button-visit-done-task-${task.id}`}
                        >
                          Join <ExternalLink size={12} />
                        </button>
                      ) : (
                        <div className="flex items-center text-xs font-bold px-3 py-1.5 rounded-xl" style={{ color: 'var(--success)', background: 'oklch(0.8 0.17 155 / 12%)', border: '1px solid oklch(0.8 0.17 155 / 25%)' }}>
                          <CircleCheck size={14} className="mr-1.5" /> Done
                        </div>
                      )
                    ) : visitingTask === task.id ? (
                      <button
                        className="font-bold text-sm rounded-xl px-4 py-2 active-scale disabled:opacity-50 animate-pulse-glow"
                        style={{ background: 'var(--grad-brand)', color: 'var(--primary-foreground)' }}
                        onClick={() => handleClaimTask(task.id)}
                        disabled={completingTask === task.id}
                        data-testid={`button-claim-task-${task.id}`}
                      >
                        {completingTask === task.id ? <Loader2 className="animate-spin" size={16} /> : 'Claim'}
                      </button>
                    ) : (
                      <button
                        className="font-bold text-xs rounded-xl px-3.5 py-2 glass-inset flex items-center gap-1.5 active-scale text-foreground"
                        onClick={() => {
                          if (task.link) window.open(task.link, '_blank');
                          setVisitingTask(task.id);
                        }}
                        data-testid={`button-do-task-${task.id}`}
                      >
                        Join <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl border-dashed p-8 flex flex-col items-center text-center">
              <CircleCheck size={40} className="text-muted-foreground/25 mb-3" />
              <p className="font-bold text-foreground mb-1">কোনো টাস্ক নেই</p>
              <p className="text-sm text-muted-foreground">নতুন আয়ের সুযোগের জন্য পরে আবার দেখুন।</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
