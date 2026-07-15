import { useState } from 'react';
import { 
  useGetMe, 
  useGetPublicConfig, 
  useListTasks, 
  useWatchAd, 
  useCompleteTask,
  getGetMeQueryKey,
  getListTasksQueryKey
} from '@workspace/api-client-react';
import { showRewardedAd } from '../lib/rewarded-ads';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle2, ExternalLink, Loader2, PlayCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../lib/utils';
import { TaskIcon, getTaskIconConfig } from '../lib/task-icons';

export default function Earn() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const [activeAd, setActiveAd] = useState<'monetag' | 'adsgram' | null>(null);
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const [visitingTask, setVisitingTask] = useState<number | null>(null);
  
  const watchAdMutation = useWatchAd();
  const completeTaskMutation = useCompleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleWatchAd = async (network: 'monetag' | 'adsgram') => {
    if (!config) return;
    setActiveAd(network);
    try {
      const zoneId = network === 'monetag' ? config.monetagZoneId : config.adsgramBlockId;
      await showRewardedAd(network, zoneId);
      
      watchAdMutation.mutate(
        { data: { network } },
        {
          onSuccess: (res) => {
            toast({ 
              title: 'Ad Completed!', 
              description: `You earned ${formatCurrency(res.adWatch.reward)}` 
            });
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          },
          onError: () => {
            toast({ 
              title: 'Error', 
              description: 'Something went wrong while crediting your reward.', 
              variant: 'destructive' 
            });
          }
        }
      );
    } catch (err: any) {
      toast({ 
        title: 'Ad failed', 
        description: err.message || 'Could not load ad.', 
        variant: 'destructive' 
      });
    } finally {
      setActiveAd(null);
    }
  };

  const handleClaimTask = (taskId: number) => {
    setCompletingTask(taskId);
    completeTaskMutation.mutate(
      { id: taskId },
      {
        onSuccess: (res) => {
          toast({ 
            title: 'Task Completed!', 
            description: `You earned ${formatCurrency(res.completion.reward)}` 
          });
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setVisitingTask(null);
        },
        onError: () => {
          toast({ 
            title: 'Error', 
            description: 'Could not complete task at this time.', 
            variant: 'destructive' 
          });
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
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Earn</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete tasks to earn real cash</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Watch Ads Section */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PlayCircle className="text-primary" size={20} />
              Video Ads
            </h2>
            <span className="text-sm font-medium bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">
              {formatCurrency(config?.adReward || 0)} / ad
            </span>
          </div>

          <Card className="border shadow-sm bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-muted-foreground">Daily Progress</p>
                <p className="text-sm font-bold">
                  {adsWatched} / {adLimit} watched
                </p>
              </div>
              <Progress value={adProgress} className="h-2.5 mb-5" />
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  disabled={adsLeft === 0 || activeAd !== null}
                  onClick={() => handleWatchAd('monetag')}
                  className="w-full font-bold relative overflow-hidden group"
                  variant="outline"
                  data-testid="button-ad-monetag"
                >
                  {activeAd === 'monetag' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Play className="fill-primary text-primary mr-2" size={16} />
                      Server 1
                    </>
                  )}
                </Button>
                
                <Button 
                  disabled={adsLeft === 0 || activeAd !== null}
                  onClick={() => handleWatchAd('adsgram')}
                  className="w-full font-bold relative overflow-hidden group"
                  variant="outline"
                  data-testid="button-ad-adsgram"
                >
                  {activeAd === 'adsgram' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Play className="fill-primary text-primary mr-2" size={16} />
                      Server 2
                    </>
                  )}
                </Button>
              </div>
              
              {adsLeft === 0 && (
                <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
                  You've reached your daily limit. Come back tomorrow!
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tasks Section */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={20} />
              Tasks
            </h2>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`border shadow-sm transition-colors ${task.completed ? 'bg-muted/50 opacity-75' : 'bg-card'}`}
                >
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-full ${getTaskIconConfig(task.type).bgClassName} flex items-center justify-center shrink-0`}>
                      <TaskIcon type={task.type} size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded">
                          +{formatCurrency(task.reward)}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {task.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col justify-center">
                      {task.completed ? (
                        <div className="flex items-center text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={16} className="mr-1.5" /> Done
                        </div>
                      ) : visitingTask === task.id ? (
                        <Button 
                          size="sm"
                          className="font-bold rounded-lg px-4"
                          onClick={() => handleClaimTask(task.id)}
                          disabled={completingTask === task.id}
                          data-testid={`button-claim-task-${task.id}`}
                        >
                          {completingTask === task.id ? <Loader2 className="animate-spin" size={16} /> : 'Claim'}
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="font-bold rounded-lg px-4"
                          onClick={() => {
                            if (task.link) window.open(task.link, '_blank');
                            setVisitingTask(task.id);
                          }}
                          data-testid={`button-do-task-${task.id}`}
                        >
                          Do it <ExternalLink size={14} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border shadow-sm bg-card border-dashed">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={48} className="text-muted-foreground/30 mb-3" />
                <p className="font-bold text-foreground mb-1">No tasks available</p>
                <p className="text-sm text-muted-foreground">Check back later for new earning opportunities.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
