import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle2, ExternalLink, Loader2, PlayCircle, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../lib/utils';
import { TaskIcon, getTaskIconConfig } from '../lib/task-icons';
import { PageHeader } from '../components/page-header';


export default function Earn() {
  const { data: user, refetch: refetchUser } = useGetMe();
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
    <div className="flex-1 flex flex-col overflow-y-auto page-canvas">
      {/* Countdown overlay — only shown while the minimum watch timer is active.
           Intentionally NOT shown when countdown === 0 so the GigaPub
           ad overlay can remain visible and the user can dismiss it without
           our UI blocking the ad's close button. */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm" data-testid="overlay-ad-countdown">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary text-white">
              <Clock size={28} />
            </div>
            <p className="font-black text-foreground text-lg">এড দেখছেন...</p>
            <p className="text-sm text-muted-foreground">
              Reward পেতে আরো <span className="font-black text-foreground text-lg" data-testid="text-ad-countdown">{countdown}s</span>
            </p>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                className="h-full rounded-full transition-all bg-primary"
                style={{
                  width: `${config?.adDurationSeconds ? ((config.adDurationSeconds - countdown) / config.adDurationSeconds) * 100 : 0}%`
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">এখন বন্ধ করবেন না — আগে বন্ধ করলে reward পাবেন না।</p>
          </div>
        </div>
      )}

      <PageHeader
        title="Earn"
        subtitle="Complete tasks · Earn real cash"
        trailing={
          <div className="text-right bg-blue-50 rounded-2xl px-3 py-2 border border-blue-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Per ad</p>
            <p className="text-primary font-extrabold text-lg leading-tight">{formatCurrency(config?.adReward || 0)}</p>
          </div>
        }
      />

      <div className="px-4 pb-6 pt-5 space-y-5">
        {/* Ad Card — Progress + Buttons একসাথে */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Progress section */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-sm font-bold text-foreground">Daily Progress</span>
              <span className="font-extrabold text-sm text-primary">{adsWatched} / {adLimit} watched</span>
            </div>
            <div className="bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                className="h-full rounded-full transition-all bg-primary"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            {adsLeft === 0 && config?.monetagEnabled && (
              <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                🎉 You've reached your daily limit. Come back tomorrow!
              </p>
            )}
          </div>

          {/* Buttons section */}
          <div className="px-5 py-4">
            {config?.monetagEnabled ? (
              <button
                disabled={adsLeft === 0 || watchingAd}
                onClick={handleWatchAd}
                className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm text-white disabled:opacity-50 active:scale-95 transition-all bg-primary shadow-md shadow-primary/25"
                data-testid="button-ad-watch"
              >
                {watchingAd ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <><Play size={15} fill="white" color="white" /> Watch</>
                )}
              </button>
            ) : (
              <p className="text-sm text-center text-muted-foreground py-3 font-medium" data-testid="text-ads-unavailable">
                Video ads are temporarily unavailable. Please check back later.
              </p>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="font-black text-foreground text-base">Tasks</h2>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-opacity ${task.completed ? 'opacity-80' : 'opacity-100'}`}
                >
                  <div className="p-4 flex gap-4 items-center">
                    <div
                      className={`w-12 h-12 rounded-xl ${getTaskIconConfig(task.type).bgClassName} flex items-center justify-center shrink-0`}
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
                          className="text-xs font-bold px-2 py-0.5 rounded-lg text-white bg-emerald-500"
                        >
                          +{formatCurrency(task.reward)}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
                            className="font-bold text-sm rounded-xl px-4 py-2 border flex items-center gap-1.5 active:scale-95 transition-transform text-primary bg-blue-50"
                            onClick={() => window.open(task.link!, '_blank')}
                            data-testid={`button-visit-done-task-${task.id}`}
                          >
                            Join <ExternalLink size={13} />
                          </button>
                        ) : (
                          <div className="flex items-center text-sm font-bold px-3 py-1.5 rounded-xl text-emerald-700 bg-emerald-50">
                            <CheckCircle2 size={15} className="mr-1.5" /> Done
                          </div>
                        )
                      ) : visitingTask === task.id ? (
                        <button
                          className="font-bold text-sm rounded-xl px-4 py-2 text-white active:scale-95 transition-transform disabled:opacity-50 bg-primary"
                          onClick={() => handleClaimTask(task.id)}
                          disabled={completingTask === task.id}
                          data-testid={`button-claim-task-${task.id}`}
                        >
                          {completingTask === task.id ? <Loader2 className="animate-spin" size={16} /> : 'Claim'}
                        </button>
                      ) : (
                        <button
                            className="font-bold text-sm rounded-xl px-4 py-2 border flex items-center gap-1.5 active:scale-95 transition-transform text-primary bg-blue-50"
                          onClick={() => {
                            if (task.link) window.open(task.link, '_blank');
                            setVisitingTask(task.id);
                          }}
                          data-testid={`button-do-task-${task.id}`}
                        >
                          Join <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-8 flex flex-col items-center text-center shadow-sm">
              <CheckCircle2 size={40} className="text-muted-foreground/25 mb-3" />
              <p className="font-bold text-foreground mb-1">No tasks available</p>
              <p className="text-sm text-muted-foreground">Check back later for new earning opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
