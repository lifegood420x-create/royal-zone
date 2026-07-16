import { useState } from 'react';
import { 
  useGetMe, 
  useGetPublicConfig, 
  useListTasks, 
  useWatchAd, 
  useClaimAd,
  useCompleteTask,
  getGetMeQueryKey,
  getListTasksQueryKey
} from '@workspace/api-client-react';
import { showRewardedAd } from '../lib/rewarded-ads';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle2, ExternalLink, Loader2, PlayCircle, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../lib/utils';
import { TaskIcon, getTaskIconConfig } from '../lib/task-icons';

export default function Earn() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const [activeAd, setActiveAd] = useState<'monetag' | 'adsgram' | null>(null);
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

  const handleWatchAd = async (network: 'monetag' | 'adsgram') => {
    if (!config) return;
    setActiveAd(network);
    try {
      const zoneId = network === 'monetag' ? config.monetagZoneId : config.adsgramBlockId;
      const durationSeconds = config.adDurationSeconds || 15;

      if (config.requireAdPostback) {
        const claim = await claimAdMutation.mutateAsync({ data: { network } });
        await Promise.all([showRewardedAd(network, zoneId, claim.claimId), runCountdown(durationSeconds)]);
        toast({
          title: 'Ad watched',
          description: 'Reward will be credited once the ad network confirms the view.',
        });
        setTimeout(() => queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }), 5000);
      } else {
        await Promise.all([showRewardedAd(network, zoneId), runCountdown(durationSeconds)]);
        watchAdMutation.mutate(
          { data: { network } },
          {
            onSuccess: (res) => {
              toast({ title: 'Ad Completed!', description: `You earned ${formatCurrency(res.adWatch.reward)}` });
              queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
            },
            onError: () => {
              toast({ title: 'Error', description: 'Something went wrong while crediting your reward.', variant: 'destructive' });
            }
          }
        );
      }
    } catch (err: any) {
      toast({ title: 'Ad failed', description: err.message || 'Could not load ad.', variant: 'destructive' });
    } finally {
      setActiveAd(null);
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
        onError: () => {
          toast({ title: 'Error', description: 'Could not complete task at this time.', variant: 'destructive' });
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
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F4FF' }}>
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(26,5,51,0.85)' }} data-testid="overlay-ad-countdown">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
              <Clock size={28} color="white" />
            </div>
            <p className="font-black text-foreground text-lg">Watching ad...</p>
            <p className="text-sm text-muted-foreground">
              Reward unlocks in <span className="font-black text-foreground text-lg" data-testid="text-ad-countdown">{countdown}s</span>
            </p>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  background: 'linear-gradient(90deg, #6C21E8, #E8347A)',
                  width: `${config?.adDurationSeconds ? ((config.adDurationSeconds - countdown) / config.adDurationSeconds) * 100 : 0}%`
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Please don't close this — leaving early forfeits the reward.</p>
          </div>
        </div>
      )}

      {/* Gradient header */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{ background: 'linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Daily Ads</p>
            <h1 className="text-white text-2xl font-black tracking-tight">Earn</h1>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs font-medium mb-0.5">Today's reward</p>
            <p className="text-white font-black text-xl">{formatCurrency(config?.adReward || 0)} <span className="text-white/60 text-sm font-medium">/ ad</span></p>
          </div>
        </div>

        {/* Progress pill */}
        <div className="mt-5 bg-white/15 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-white/80 text-sm font-semibold">Daily Progress</span>
            <span className="text-white font-black text-sm">{adsWatched} / {adLimit} watched</span>
          </div>
          <div className="bg-white/20 rounded-full h-2.5">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${adProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 pt-5 space-y-5">
        {/* Ad Buttons */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          {(config?.monetagEnabled || config?.adsgramEnabled) ? (
            <div className="grid grid-cols-2 gap-3">
              {config?.monetagEnabled && (
                <button
                  disabled={adsLeft === 0 || activeAd !== null}
                  onClick={() => handleWatchAd('monetag')}
                  className="rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm text-white disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6C21E8, #9B51E0)' }}
                  data-testid="button-ad-monetag"
                >
                  {activeAd === 'monetag' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <><Play size={15} fill="white" color="white" /> Server 1</>
                  )}
                </button>
              )}
              {config?.adsgramEnabled && (
                <button
                  disabled={adsLeft === 0 || activeAd !== null}
                  onClick={() => handleWatchAd('adsgram')}
                  className="rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm text-white disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #E8347A, #FF7B4A)' }}
                  data-testid="button-ad-adsgram"
                >
                  {activeAd === 'adsgram' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <><Play size={15} fill="white" color="white" /> Server 2</>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-3 font-medium" data-testid="text-ads-unavailable">
              Video ads are temporarily unavailable. Please check back later.
            </p>
          )}
          {adsLeft === 0 && (config?.monetagEnabled || config?.adsgramEnabled) && (
            <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
              🎉 You've reached your daily limit. Come back tomorrow!
            </p>
          )}
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CheckCircle2 size={18} style={{ color: '#6C21E8' }} />
            <h2 className="font-black text-foreground text-base">Tasks</h2>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-purple-100" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border border-purple-100 shadow-sm transition-opacity ${task.completed ? 'opacity-55' : 'opacity-100'}`}
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
                          className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                          style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}
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
                        <div className="flex items-center text-sm font-bold px-3 py-1.5 rounded-xl" style={{ color: '#6C21E8', background: '#EDE0FF' }}>
                          <CheckCircle2 size={15} className="mr-1.5" /> Done
                        </div>
                      ) : visitingTask === task.id ? (
                        <button
                          className="font-bold text-sm rounded-xl px-4 py-2 text-white active:scale-95 transition-transform disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}
                          onClick={() => handleClaimTask(task.id)}
                          disabled={completingTask === task.id}
                          data-testid={`button-claim-task-${task.id}`}
                        >
                          {completingTask === task.id ? <Loader2 className="animate-spin" size={16} /> : 'Claim'}
                        </button>
                      ) : (
                        <button
                          className="font-bold text-sm rounded-xl px-4 py-2 border border-purple-200 flex items-center gap-1.5 active:scale-95 transition-transform"
                          style={{ color: '#6C21E8', background: '#F8F4FF' }}
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
            <div className="bg-white rounded-2xl border border-purple-100 border-dashed p-8 flex flex-col items-center text-center shadow-sm">
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
