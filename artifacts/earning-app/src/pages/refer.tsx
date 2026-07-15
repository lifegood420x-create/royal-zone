import React, { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals } from '@workspace/api-client-react';
import { Copy, Share2, Users, Gift, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Refer() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: refData, isLoading: refLoading } = useListReferrals();

  const [copied, setCopied] = useState(false);

  if (userLoading || refLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const referralLink = `https://t.me/${config?.botUsername}?start=${user?.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AS Earning',
          text: `Join AS Earning and start earning real money! Use my link:`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-6">
      <header className="px-6 pt-10 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">Invite Friends</h1>
        <p className="text-sm text-muted-foreground font-medium">Earn bonus for every friend who joins.</p>
      </header>

      <div className="px-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-secondary/10 border border-secondary/20 rounded-3xl p-6 text-center animate-fade-up">
          <div className="w-16 h-16 bg-secondary/20 text-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">Earn ৳{config?.referralBonus} per friend</h2>
          <p className="text-muted-foreground text-sm mb-6 px-4">
            Share your unique link. When they join and verify, you both get rewarded instantly.
          </p>

          <div className="bg-card border border-border rounded-2xl p-2 pl-4 flex items-center justify-between mb-4 shadow-sm">
            <span className="text-sm font-mono font-medium truncate text-muted-foreground mr-2">
              {referralLink}
            </span>
            <button 
              onClick={handleCopy}
              className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-2.5 rounded-xl transition-colors active-scale shrink-0"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <button 
            onClick={handleShare}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold shadow-md hover:bg-opacity-90 active-scale flex justify-center items-center gap-2 transition-all"
          >
            <Share2 size={18} />
            Share Link
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-1">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Invites</p>
            <p className="text-2xl font-bold font-mono text-foreground">{refData?.totalReferrals || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Earned from Ref</p>
            <p className="text-2xl font-bold font-mono text-success">৳{refData?.totalReferralEarnings?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* List of Referrals */}
        <div className="animate-fade-up stagger-2">
          <h3 className="text-sm font-bold text-muted-foreground tracking-wide uppercase px-2 mb-3">Your Referrals</h3>
          
          {!refData?.referrals || refData.referrals.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-3xl p-8 text-center text-muted-foreground">
              <Users size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No friends invited yet.</p>
              <p className="text-xs mt-1">Start sharing to grow your network!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {refData.referrals.map((ref, idx) => (
                <div key={ref.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {ref.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{ref.firstName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ref.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-lg">
                    +৳{config?.referralBonus}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
