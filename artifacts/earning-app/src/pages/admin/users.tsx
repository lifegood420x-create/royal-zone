import { useState } from 'react';
import { 
  useListAdminUsers, 
  useBanUser, 
  useUnbanUser, 
  useClearFlaggedUser 
} from '@workspace/api-client-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Flag,
  UserX,
  MoreVertical,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

// Custom debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }); // Note: simplified for brevity, in React 18 usually done with useDeferredValue
  return value; // Simplified, will just trigger on Enter for now to avoid custom hooks
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  
  const { data: users, isLoading, refetch } = useListAdminUsers(
    { search: appliedSearch },
    { query: { queryKey: ['/api/admin/users', { search: appliedSearch }] } }
  );

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const clearFlag = useClearFlaggedUser();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  const handleBan = (id: number) => {
    banUser.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User Banned", description: "They can no longer access the platform." });
        refetch();
      }
    });
  };

  const handleUnban = (id: number) => {
    unbanUser.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User Unbanned", description: "Their access has been restored." });
        refetch();
      }
    });
  };

  const handleClearFlag = (id: number) => {
    clearFlag.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Flag Cleared", description: "The user is no longer marked as suspicious." });
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Search and moderate user accounts.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 relative max-w-sm w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or name..." 
            className="pl-9 bg-card border-accent/50 focus-visible:ring-primary shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary" className="shrink-0">Search</Button>
        </form>
      </div>

      <Card className="border-accent/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-accent/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <UserX size={32} className="mb-3 text-muted-foreground/50" />
                      <p className="font-medium text-foreground">No users found</p>
                      <p className="text-xs mt-1">Try a different search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName}</p>
                          <p className="text-xs text-muted-foreground font-mono">ID: {user.telegramId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            <ShieldAlert size={10} /> BANNED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success border border-success/20">
                            <ShieldCheck size={10} /> ACTIVE
                          </span>
                        )}
                        {user.isFlagged && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-warning/10 text-warning-foreground border border-warning/20">
                            <Flag size={10} /> FLAGGED: {user.flagReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                      ৳{user.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {user.isFlagged && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleClearFlag(user.id)}
                                className="text-warning-foreground focus:text-warning-foreground focus:bg-warning/10 cursor-pointer"
                              >
                                <Flag className="mr-2" size={14} /> Clear Flag
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {user.isBanned ? (
                            <DropdownMenuItem 
                              onClick={() => handleUnban(user.id)}
                              className="text-success focus:text-success focus:bg-success/10 cursor-pointer"
                            >
                              <ShieldCheck className="mr-2" size={14} /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleBan(user.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                              <ShieldAlert className="mr-2" size={14} /> Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}