import { useState } from 'react';
import { 
  useListPendingPayouts, 
  useApprovePayout, 
  useRejectPayout, 
  useUpdatePayoutAccountNumber 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Banknote
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPayouts() {
  const { data: payouts, isLoading, refetch } = useListPendingPayouts();
  const approvePayout = useApprovePayout();
  const rejectPayout = useRejectPayout();
  const updateAccount = useUpdatePayoutAccountNumber();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [rejectReason, setRejectReason] = useState("");
  
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; id: number | null; current: string }>({ isOpen: false, id: null, current: "" });
  const [newAccount, setNewAccount] = useState("");

  const handleApprove = (id: number) => {
    approvePayout.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Payout Approved", description: "The withdrawal has been marked as paid." });
        refetch();
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to approve payout.", variant: "destructive" });
      }
    });
  };

  const handleReject = () => {
    if (!rejectDialog.id) return;
    rejectPayout.mutate({ id: rejectDialog.id, data: { note: rejectReason || null } }, {
      onSuccess: () => {
        toast({ title: "Payout Rejected", description: "The user's balance has been refunded." });
        setRejectDialog({ isOpen: false, id: null });
        setRejectReason("");
        refetch();
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to reject payout.", variant: "destructive" });
      }
    });
  };

  const handleEditAccount = () => {
    if (!editDialog.id || !newAccount.trim()) return;
    updateAccount.mutate({ id: editDialog.id, data: { accountNumber: newAccount.trim() } }, {
      onSuccess: () => {
        toast({ title: "Account Updated", description: "The account number has been saved." });
        setEditDialog({ isOpen: false, id: null, current: "" });
        refetch();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update account number.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Payouts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review, approve, or correct pending withdrawal requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-accent px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Clock size={16} className="text-warning" />
            <span>{payouts?.length || 0} Pending</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading} className="shrink-0">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-24 animate-pulse bg-muted/50 border-none" />
          ))}
        </div>
      ) : !payouts || payouts.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Inbox Zero</h3>
          <p className="text-muted-foreground max-w-sm">There are no pending withdrawal requests to review at this time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {payouts.map(payout => (
            <Card key={payout.id} className="overflow-hidden border-accent/50 hover:border-primary/30 transition-colors shadow-sm group">
              <div className="flex flex-col sm:flex-row">
                {/* Info Section */}
                <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                    <Banknote size={24} />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount</p>
                      <p className="text-lg font-bold text-foreground font-mono">৳{payout.amount}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Account & Method</p>
                      <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => {
                        setNewAccount(payout.accountNumber);
                        setEditDialog({ isOpen: true, id: payout.id, current: payout.accountNumber });
                      }}>
                        <p className="font-mono font-medium text-foreground bg-accent px-2 py-0.5 rounded text-sm">
                          {payout.accountNumber}
                        </p>
                        <span className="text-xs font-bold text-muted-foreground uppercase px-1.5 py-0.5 border rounded">
                          {payout.method}
                        </span>
                        <Edit2 size={12} className="text-primary opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">User & Time</p>
                      <p className="text-sm font-medium text-foreground truncate" title={payout.user.firstName}>
                        {payout.user.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {format(new Date(payout.requestedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="bg-accent/30 p-4 sm:p-5 flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:w-48 justify-end sm:justify-center">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => setRejectDialog({ isOpen: true, id: payout.id })}
                    disabled={approvePayout.isPending || rejectPayout.isPending}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground transition-colors shadow-sm"
                    onClick={() => handleApprove(payout.id)}
                    disabled={approvePayout.isPending || rejectPayout.isPending}
                  >
                    Pay
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.isOpen} onOpenChange={(open) => !open && setRejectDialog({ isOpen: false, id: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle size={20} />
              Reject Payout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this payout? The amount will be refunded to the user's balance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Reason (Optional)</label>
            <Input 
              placeholder="e.g. Invalid account number, suspected fraud..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ isOpen: false, id: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectPayout.isPending}>
              {rejectPayout.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, id: null, current: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correct Account Number</DialogTitle>
            <DialogDescription>
              Update the account number before approving the payout.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Current Number</label>
              <div className="font-mono bg-accent p-2 rounded text-sm text-muted-foreground">{editDialog.current}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-foreground">New Number</label>
              <Input 
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                placeholder="Enter correct number"
                className="font-mono text-lg"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false, id: null, current: "" })}>Cancel</Button>
            <Button onClick={handleEditAccount} disabled={updateAccount.isPending || !newAccount.trim() || newAccount === editDialog.current}>
              {updateAccount.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}