import { useState } from 'react';
import { 
  useListAdminTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask 
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Youtube, 
  Facebook, 
  MessageCircle, 
  Gift, 
  Star,
  ExternalLink,
  ListTodo
} from 'lucide-react';
import type { Task, TaskType } from '@workspace/api-client-react';

const TASK_ICONS: Record<TaskType, any> = {
  youtube: Youtube,
  facebook: Facebook,
  telegram: MessageCircle,
  join_bonus: Gift,
  bonus: Star,
  other: ListTodo
};

export default function AdminTasks() {
  const { data: tasks, isLoading, refetch } = useListAdminTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  const handleSave = () => {
    if (!currentTask.title || !currentTask.reward || !currentTask.type) {
      toast({ title: "Incomplete Form", description: "Title, reward, and type are required.", variant: "destructive" });
      return;
    }

    const payload = {
      title: currentTask.title,
      description: currentTask.description || undefined,
      reward: Number(currentTask.reward),
      type: currentTask.type as TaskType,
      link: currentTask.link || undefined,
      isActive: currentTask.isActive !== false
    };

    if (dialogMode === 'create') {
      createTask.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Task Created", description: "New task is now live." });
          setDialogMode(null);
          refetch();
        }
      });
    } else if (dialogMode === 'edit' && currentTask.id) {
      updateTask.mutate({ id: currentTask.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Task Updated", description: "Changes saved successfully." });
          setDialogMode(null);
          refetch();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this task? Users will no longer be able to complete it.")) {
      deleteTask.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Task Deleted", description: "The task has been removed." });
          refetch();
        }
      });
    }
  };

  const openCreate = () => {
    setCurrentTask({ type: 'youtube', isActive: true, reward: 0 });
    setDialogMode('create');
  };

  const openEdit = (task: Task) => {
    setCurrentTask(task);
    setDialogMode('edit');
  };

  const toggleActive = (task: Task) => {
    updateTask.mutate({ id: task.id, data: { isActive: !task.isActive } }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure rewarding activities for users.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0 shadow-sm">
          <Plus size={16} /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/50 border-none" />)
        ) : !tasks || tasks.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-accent rounded-xl bg-card">
            <ListTodo size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No tasks defined</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">Create your first task to give users a way to earn rewards.</p>
            <Button onClick={openCreate} variant="secondary">Create Task</Button>
          </div>
        ) : (
          tasks.map(task => {
            const Icon = TASK_ICONS[task.type as TaskType] || ListTodo;
            return (
              <Card key={task.id} className={`flex flex-col border-accent/50 shadow-sm transition-all duration-200 ${task.isActive ? 'hover:border-primary/40' : 'opacity-75 grayscale-[0.3]'}`}>
                <CardHeader className="pb-3 border-b border-accent/30 bg-accent/10 flex flex-row items-start justify-between space-y-0">
                  <div className="flex gap-3 items-center max-w-[70%]">
                    <div className={`p-2 rounded-md ${task.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="truncate">
                      <CardTitle className="text-base truncate" title={task.title}>{task.title}</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-wider font-semibold mt-0.5">{task.type.replace('_', ' ')}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-success bg-success/10 px-2 py-0.5 rounded text-sm shrink-0">
                      +{task.reward}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between p-4 gap-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {task.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={task.isActive} 
                        onCheckedChange={() => toggleActive(task)} 
                        id={`task-active-${task.id}`}
                      />
                      <Label htmlFor={`task-active-${task.id}`} className="text-xs cursor-pointer">
                        {task.isActive ? 'Active' : 'Draft'}
                      </Label>
                    </div>
                    
                    <div className="flex gap-1">
                      {task.link && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                          <a href={task.link} target="_blank" rel="noreferrer" title="Open Link">
                            <ExternalLink size={14} />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(task)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(task.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!dialogMode} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={currentTask.title || ''} 
                onChange={e => setCurrentTask((prev: Partial<Task>) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Subscribe to our Channel"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={currentTask.type as string} 
                  onValueChange={v => setCurrentTask((prev: Partial<Task>) => ({ ...prev, type: v as TaskType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="join_bonus">Join Bonus</SelectItem>
                    <SelectItem value="bonus">Daily Bonus</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reward Amount</Label>
                <Input 
                  type="number" 
                  min="0" 
                  value={currentTask.reward || 0} 
                  onChange={e => setCurrentTask((prev: Partial<Task>) => ({ ...prev, reward: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Action Link (Optional)</Label>
              <Input 
                type="url"
                value={currentTask.link || ''} 
                onChange={e => setCurrentTask((prev: Partial<Task>) => ({ ...prev, link: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea 
                value={currentTask.description || ''} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentTask((prev: Partial<Task>) => ({ ...prev, description: e.target.value }))}
                placeholder="Instructions for the user..."
                className="resize-none"
                rows={3}
              />
            </div>
            
            {dialogMode === 'create' && (
              <div className="flex items-center space-x-2 bg-accent/30 p-3 rounded-lg border border-accent">
                <Switch 
                  id="create-active" 
                  checked={currentTask.isActive !== false} 
                  onCheckedChange={c => setCurrentTask((prev: Partial<Task>) => ({ ...prev, isActive: c }))} 
                />
                <Label htmlFor="create-active" className="cursor-pointer">Publish immediately</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createTask.isPending || updateTask.isPending}>
              {createTask.isPending || updateTask.isPending ? 'Saving...' : 'Save Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}