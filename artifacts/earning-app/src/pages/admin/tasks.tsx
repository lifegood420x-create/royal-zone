import { useState } from 'react';
import { 
  useListAdminTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask,
  getListAdminTasksQueryKey,
  TaskType,
  Task
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Link as LinkIcon, Loader2, ListTodo } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { TaskIcon, getTaskIconConfig } from '../../lib/task-icons';
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

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  reward: z.coerce.number().min(0, 'Reward must be positive'),
  type: z.enum([
    TaskType.youtube, 
    TaskType.facebook, 
    TaskType.telegram, 
    TaskType.join_bonus, 
    TaskType.bonus, 
    TaskType.other
  ] as const),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  telegramChatId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasks() {
  const { data: tasks, isLoading } = useListAdminTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      reward: 0,
      type: TaskType.telegram,
      link: '',
      telegramChatId: '',
      isActive: true,
    },
  });

  const openAddDialog = () => {
    setEditingTask(null);
    form.reset({
      title: '',
      description: '',
      reward: 0,
      type: TaskType.telegram,
      link: '',
      telegramChatId: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      reward: task.reward,
      type: task.type,
      link: task.link || '',
      telegramChatId: task.telegramChatId || '',
      isActive: task.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: 'Task deleted' });
          queryClient.invalidateQueries({ queryKey: getListAdminTasksQueryKey() });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Could not delete task.', variant: 'destructive' });
        }
      }
    );
  };

  const onSubmit = (data: TaskFormValues) => {
    const payload = {
      ...data,
      link: data.link || undefined,
      description: data.description || undefined,
      telegramChatId: data.telegramChatId?.trim() || null,
    };

    if (editingTask) {
      updateMutation.mutate(
        { id: editingTask.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Task updated' });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListAdminTasksQueryKey() });
          },
          onError: (err: any) => {
            toast({ title: 'Error', description: err.message || 'Could not update task', variant: 'destructive' });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: 'Task created' });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getListAdminTasksQueryKey() });
          },
          onError: (err: any) => {
            toast({ title: 'Error', description: err.message || 'Could not create task', variant: 'destructive' });
          }
        }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage earning opportunities for users</p>
        </div>
        <Button onClick={openAddDialog} className="font-bold">
          <Plus size={18} className="mr-1.5" /> Add Task
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg mx-4" />)}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="divide-y">
              {tasks.map((task) => (
                <div key={task.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/30 ${!task.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex-1 min-w-0 flex gap-3">
                    <div className={`w-10 h-10 rounded-full ${getTaskIconConfig(task.type).bgClassName} flex items-center justify-center shrink-0`}>
                      <TaskIcon type={task.type} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${task.isActive ? 'bg-success/10' : 'bg-muted-foreground'}`} />
                      <h3 className="font-bold text-foreground truncate">{task.title}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {task.type.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="text-xs font-bold text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded">
                        Reward: {formatCurrency(task.reward)}
                      </span>
                      {task.link && (
                        <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center">
                          <LinkIcon size={12} className="mr-1" /> Link
                        </a>
                      )}
                    </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(task)}
                    >
                      <Edit2 size={14} className="mr-1.5" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent"
                      onClick={() => handleDelete(task.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <ListTodo size={48} className="text-muted-foreground/30 mb-4" />
              <p className="font-bold text-lg text-foreground">No tasks defined</p>
              <p className="text-sm mb-4">Create some tasks so users can start earning.</p>
              <Button onClick={openAddDialog} variant="outline">Create First Task</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Join our Telegram Channel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions for the user..." 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Amount (৳) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(TaskType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegramChatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Chat ID (join verify)</FormLabel>
                    <FormControl>
                      <Input placeholder="@channelusername or -1001234567890" {...field} />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">
                      Set this to verify the user actually joined before paying. Required for
                      private invite links. The bot must be an admin of that channel/group.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20 mt-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-[10px] text-muted-foreground">
                        Users can only see and complete active tasks.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
