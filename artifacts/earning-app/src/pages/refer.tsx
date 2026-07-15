import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useGetReferralLeaderboard } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Copy, Share2, Check, UserPlus, Trophy } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

type Tab = 'leaderboard' | 'my-referrals';

export default function Refer() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { data: referralsData, isLoading } = useListReferrals();
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useGetReferralLeaderboard();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<number>>(new Set());
  const [failedLeaderboardIds, setFailedLeaderboardIds] = useState<Set<number>>(new Set());

  const botUsername = config?.botUsername || 'as_earning_bot';
  const referralLink = user ? `https://t.me/${botUsername}?start=${user.referralCode}` : '';

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!referralLink) return;
    const text = `Join me on Bangla Task Hub and get rewarded! Use my link: ${referralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const referrals = referralsData?.referrals || [];

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Refer Friends</h1>
        <p className="text-sm text-muted-foreground mt-1">Earn bonuses together</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Hero Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden relative">
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Users size={120} />
          </div>
          <CardContent className="p-6 relative z-10 text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <UserPlus size={32} className="text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invite & Earn</h2>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-[250px] mx-auto leading-relaxed">
              Get <span className="font-bold text-white">{formatCurrency(config?.referralBonus || 0)}</span> for every friend who joins using your link.
            </p>
            <div className="bg-background/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/20">
              <div className="flex-1 text-sm font-mono truncate px-3 py-2 text-white text-left">
                {referralLink || 'Loading...'}
              </div>
              <div className="flex gap-1 shrink-0 bg-background/20 p-1 rounded-lg">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/20 text-white rounded-md" onClick={handleCopy} data-testid="button-copy-referral">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/20 text-white rounded-md" onClick={handleShare} data-testid="button-share-referral">
                  <Share2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Referrals</p>
              <p className="text-2xl font-black text-foreground" data-testid="text-total-referrals">
                {referralsData?.totalReferrals || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Earned</p>
              <p className="text-2xl font-black text-foreground text-primary" data-testid="text-referral-earnings">
                {formatCurrency(referralsData?.totalReferralEarnings || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="bg-muted rounded-xl p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === 'leaderboard'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy size={15} />
            লিডারবোর্ড
          </button>
          <button
            onClick={() => setActiveTab('my-referrals')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === 'my-referrals'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={15} />
            Your Referral
          </button>
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <section>
            {isLoadingLeaderboard ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl border border-border" />
                ))}
              </div>
            ) : (leaderboard?.entries?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {leaderboard!.entries.map((entry) => {
                  const rankColors: Record<number, string> = {
                    1: 'bg-yellow-400/20 border-yellow-400/40',
                    2: 'bg-gray-300/20 border-gray-300/40',
                    3: 'bg-orange-400/20 border-orange-400/40',
                  };
                  const rankEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
                  const isTop3 = entry.rank <= 3;

                  return (
                    <div
                      key={entry.userId}
                      className={`border rounded-xl p-3 flex items-center gap-3 shadow-sm ${
                        isTop3 ? `${rankColors[entry.rank]} bg-card` : 'bg-card'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-7 shrink-0 text-center">
                        {isTop3 ? (
                          <span className="text-xl leading-none">{rankEmoji[entry.rank]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      {entry.photoUrl && !failedLeaderboardIds.has(entry.userId) ? (
                        <img
                          src={entry.photoUrl}
                          alt={entry.firstName}
                          className="w-10 h-10 rounded-full border border-border shadow-sm object-cover shrink-0"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedLeaderboardIds(prev => new Set(prev).add(entry.userId))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {entry.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{entry.firstName}</p>
                      </div>

                      {/* Count */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-primary">{entry.referralCount}</p>
                        <p className="text-[10px] text-muted-foreground">রেফারেল</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="border shadow-sm bg-card border-dashed">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <Trophy size={32} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">এখনো কেউ লিডারবোর্ডে নেই</p>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* My Referrals Tab */}
        {activeTab === 'my-referrals' && (
          <section>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl border border-border" />
                ))}
              </div>
            ) : referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="bg-card border rounded-xl p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      {ref.photoUrl && !failedPhotoIds.has(ref.id) ? (
                        <img
                          src={ref.photoUrl}
                          alt={ref.firstName}
                          className="w-10 h-10 rounded-full border border-border shadow-sm object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedPhotoIds((prev) => new Set(prev).add(ref.id))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {ref.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-foreground">{ref.firstName}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(ref.joinedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-secondary-foreground bg-secondary/20 px-2 py-1 rounded">
                        +{formatCurrency(config?.referralBonus || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border shadow-sm bg-card border-dashed">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users size={24} className="text-muted-foreground/50" />
                  </div>
                  <p className="font-bold text-foreground mb-1">No referrals yet</p>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Share your link with friends to start earning passive income.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
