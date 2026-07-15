import { useState, useEffect } from 'react';
import { 
  useListAdminUsers, 
  useBanUser, 
  useUnbanUser,
  getListAdminUsersQueryKey,
} from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useDebounce } from '../../lib/use-debounce';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { data: users, isLoading } = useListAdminUsers(
    debouncedSearch ? { search: debouncedSearch } : undefined,
    { query: { queryKey: getListAdminUsersQueryKey(debouncedSearch ? { search: debouncedSearch } : undefined) } }
  );
  
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggleBan = (id: number, isBanned: boolean) => {
    const mutation = isBanned ? unbanMutation : banMutation;
    const actionStr = isBanned ? 'Unbanned' : 'Banned';
    
    mutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: `User ${actionStr}`, description: `The user has been successfully ${actionStr.toLowerCase()}.` });
          // Invalidate both with and without search term
          queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
          if (debouncedSearch) {
            queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey({ search: debouncedSearch }) });
          }
        },
        onError: () => {
          toast({ title: 'Error', description: `Could not ${isBanned ? 'unban' : 'ban'} user.`, variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Search and moderate user accounts</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search by ID, name, or username..." 
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg mx-4" />)}
            </div>
          ) : users && users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${user.isBanned ? 'bg-destructive/5 opacity-75' : 'hover:bg-muted/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user.isBanned ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {user.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{user.firstName}</span>
                        {user.username && <span className="text-muted-foreground text-sm">@{user.username}</span>}
                        {user.isBanned && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Banned
                          </span>
                        )}
                        {user.isFlagged && !user.isBanned && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded flex items-center">
                            <AlertTriangle size={10} className="mr-0.5" /> Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{user.telegramId}</span>
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="mt-1 font-bold text-primary text-sm">
                        Balance: {formatCurrency(user.balance)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col gap-2">
                    <Button 
                      variant={user.isBanned ? "outline" : "destructive"} 
                      size="sm"
                      className={`font-bold ${user.isBanned ? 'text-green-600 border-green-200 hover:bg-green-50' : ''}`}
                      onClick={() => handleToggleBan(user.id, user.isBanned)}
                      disabled={banMutation.isPending || unbanMutation.isPending}
                    >
                      {user.isBanned ? (
                        <><CheckCircle size={16} className="mr-1.5" /> Unban User</>
                      ) : (
                        <><Ban size={16} className="mr-1.5" /> Ban User</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Search size={48} className="text-muted-foreground/30 mb-4" />
              <p className="font-bold text-lg text-foreground">No users found</p>
              <p className="text-sm">{searchTerm ? 'Try a different search term.' : 'No users registered yet.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
