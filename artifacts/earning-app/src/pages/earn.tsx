import React, { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListTasks, useCompleteTask, useWatchAd, useClaimAd } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaySquare, CheckCircle2, ChevronRight, Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function Earn() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'ads'>('ads');

  return (
    <div className="flex flex-col min-h-full pb-6">
      <header className="px-6 pt-10 pb-6 bg-card border-b border-border z-10 sticky top-0 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">Earn Rewards</h1>
        <p className="text-sm text-muted-foreground font-medium">Complete simple tasks to grow your balance.</p>
        
        {/* Custom Tab Switcher */}
        <div className="mt-6 flex bg-muted p-1 rounded-2xl border border-border/50">
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'ads' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Watch Ads
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'tasks' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tasks
          </button>
        </div>
      </header>

      <div className="px-6 pt-6">
        {activeTab === 'ads' && <AdsSection config={config} user={user} />}
        {activeTab === 'tasks' && <TasksSection tasks={tasks ?? []} isLoading={tasksLoading} />}
      </div>
    </div>
  );
}

function AdsSection({ config, user }: { config: any, user: any }) {
  const queryClient = useQueryClient();
  const watchAdMutation = useWatchAd();
  const claimAdMutation = useClaimAd();
  
  const [isWatching, setIsWatching] = useState(false);

  const handleWatchAd = async () => {
    if (isWatching) return;
    
    // Check limit
    if (user?.todayAdsWatched >= (config?.adDailyLimit || 10)) {
      toast.error('Daily limit reached. Come back tomorrow!');
      return;
    }

    try {
      setIsWatching(true);
      
      // Real flow would call monetag/adsgram API here. 
      // For this implementation, we simulate watching and call the endpoints.
      if (config?.requireAdPostback) {
        // Reserve slot
        await claimAdMutation.mutateAsync({ data: { network: 'monetag' } });
        // Simulate watch time
        toast.info(`Watching ad for ${config?.adDurationSeconds || 15}s...`);
        await new Promise(r => setTimeout(r, (config?.adDurationSeconds || 15) * 1000));
        toast.success('Ad watched! Reward will arrive shortly via server postback.');
      } else {
        // Direct credit
        toast.info(`Watching ad for ${config?.adDurationSeconds || 15}s...`);
        await new Promise(r => setTimeout(r, (config?.adDurationSeconds || 15) * 1000));
        await watchAdMutation.mutateAsync({ data: { network: 'monetag' } });
        
        toast.success(`Earned ৳${config?.adReward}!`, {
          icon: <Coins className="text-secondary" />
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to watch ad');
    } finally {
      setIsWatching(false);
    }
  };

  const remaining = Math.max(0, (config?.adDailyLimit || 10) - (user?.todayAdsWatched || 0));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <PlaySquare size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Watch & Earn</h2>
        <p className="text-muted-foreground text-sm mb-6">Earn ৳{config?.adReward || 0} for every short video ad you watch.</p>
        
        <button 
          onClick={handleWatchAd}
          disabled={isWatching || remaining === 0}
          className="w-full gradient-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-md active-scale disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 transition-all"
        >
          {isWatching ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Watching...
            </>
          ) : remaining === 0 ? (
            'Daily Limit Reached'
          ) : (
            <>
              <PlaySquare size={20} />
              Watch Ad Now
            </>
          )}
        </button>

        <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center text-sm font-medium">
          <span className="text-muted-foreground">Today's limit:</span>
          <span className={remaining > 0 ? "text-primary font-bold" : "text-destructive font-bold"}>
            {remaining} / {config?.adDailyLimit || 10} remaining
          </span>
        </div>
      </div>
    </div>
  );
}

function TasksSection({ tasks, isLoading }: { tasks: any[], isLoading: boolean }) {
  const completeTaskMutation = useCompleteTask();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
        <p className="text-muted-foreground text-sm mt-2">Check back later for more tasks.</p>
      </div>
    );
  }

  const handleComplete = async (task: any) => {
    if (task.completed) return;
    if (task.link) {
      // Simulate opening link then verifying
      window.open(task.link, '_blank');
      toast.info('Verifying task completion...');
      setTimeout(async () => {
        try {
          await completeTaskMutation.mutateAsync({ id: task.id });
          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
          queryClient.invalidateQueries({ queryKey: ['/api/me'] });
          toast.success(`Earned ৳${task.reward} from task!`);
        } catch (e: any) {
          toast.error(e.message || 'Failed to verify task.');
        }
      }, 3000);
    } else {
      try {
        await completeTaskMutation.mutateAsync({ id: task.id });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/me'] });
        toast.success(`Earned ৳${task.reward}!`);
      } catch (e: any) {
        toast.error(e.message || 'Failed to complete task.');
      }
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {tasks.map((task, index) => (
        <div 
          key={task.id} 
          className={`bg-card border ${task.completed ? 'border-border/50 opacity-60' : 'border-border shadow-sm'} rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up stagger-${(index % 5) + 1}`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-sm">{task.title}</h3>
              {task.completed && (
                <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Done
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
            )}
            <div className="inline-flex items-center bg-secondary/10 text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
              +৳{task.reward}
            </div>
          </div>

          <button
            onClick={() => handleComplete(task)}
            disabled={task.completed || completeTaskMutation.isPending}
            className={`shrink-0 py-2 px-5 rounded-xl font-bold text-sm transition-all active-scale ${
              task.completed 
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:shadow-md'
            }`}
          >
            {task.completed ? 'Completed' : 'Start Task'}
          </button>
        </div>
      ))}
    </div>
  );
}
