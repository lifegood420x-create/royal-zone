import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useGetReferralLeaderboard } from '@workspace/api-client-react';
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

  const botUsername = config?.botUsername || 'Bangla_TaskHub_bot';
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
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F4FF' }}>
      {/* Gradient Hero */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-12 text-center"
        style={{ background: 'linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-0 left-6 w-24 h-24 rounded-full opacity-10 bg-white" />

        <div className="relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={30} color="white" />
          </div>
          <h1 className="text-white text-2xl font-black mb-1">Invite & Earn</h1>
          <p className="text-white/75 text-sm mb-6">
            Get <span className="text-white font-black">{formatCurrency(config?.referralBonus || 0)}</span> for every friend who joins
          </p>

          {/* Referral link box */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-1 flex items-center border border-white/25">
            <div className="flex-1 text-sm font-mono truncate px-3 py-2 text-white text-left">
              {referralLink || 'Loading...'}
            </div>
            <div className="flex gap-1 shrink-0 bg-white/20 p-1 rounded-xl">
              <button
                className="h-9 w-9 flex items-center justify-center rounded-lg text-white hover:bg-white/20 active:scale-95 transition-all"
                onClick={handleCopy}
                data-testid="button-copy-referral"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                className="h-9 w-9 flex items-center justify-center rounded-lg text-white hover:bg-white/20 active:scale-95 transition-all"
                onClick={handleShare}
                data-testid="button-share-referral"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 -mt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 text-center">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Referrals</p>
            <p className="text-3xl font-black text-foreground" data-testid="text-total-referrals">
              {referralsData?.totalReferrals || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 text-center">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Earned</p>
            <p className="text-3xl font-black" style={{ color: '#6C21E8' }} data-testid="text-referral-earnings">
              {formatCurrency(referralsData?.totalReferralEarnings || 0)}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1.5 shadow-sm border border-purple-100">
          {([
            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { key: 'my-referrals', label: 'Your Referrals', icon: Users },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg, #6C21E8, #E8347A)', color: 'white' }
                : { color: '#9B8AB3' }
              }
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div>
            {isLoadingLeaderboard ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white animate-pulse rounded-2xl border border-purple-100" />
                ))}
              </div>
            ) : (leaderboard?.entries?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {leaderboard!.entries.map((entry) => {
                  const rankBg: Record<number, string> = {
                    1: 'linear-gradient(135deg, #FFF8E1, #FFF3CD)',
                    2: 'linear-gradient(135deg, #F5F5F5, #ECECEC)',
                    3: 'linear-gradient(135deg, #FFF0E8, #FFE4D0)',
                  };
                  const rankEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
                  const isTop3 = entry.rank <= 3;

                  return (
                    <div
                      key={entry.userId}
                      className="rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-purple-100"
                      style={{ background: isTop3 ? rankBg[entry.rank] : 'white' }}
                    >
                      <div className="w-8 shrink-0 text-center">
                        {isTop3 ? (
                          <span className="text-xl">{rankEmoji[entry.rank]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>
                      {entry.photoUrl && !failedLeaderboardIds.has(entry.userId) ? (
                        <img
                          src={entry.photoUrl}
                          alt={entry.firstName}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedLeaderboardIds(prev => new Set(prev).add(entry.userId))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
                          {entry.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{entry.firstName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black" style={{ color: '#6C21E8' }}>{entry.referralCount}</p>
                        <p className="text-[10px] text-muted-foreground">Referrals</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-8 flex flex-col items-center text-center shadow-sm">
                <Trophy size={32} className="text-muted-foreground/25 mb-2" />
                <p className="text-sm text-muted-foreground">No one on the leaderboard yet</p>
              </div>
            )}
          </div>
        )}

        {/* My Referrals */}
        {activeTab === 'my-referrals' && (
          <div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-white animate-pulse rounded-2xl border border-purple-100" />
                ))}
              </div>
            ) : referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="bg-white rounded-2xl p-3.5 flex items-center justify-between shadow-sm border border-purple-100">
                    <div className="flex items-center gap-3">
                      {ref.photoUrl && !failedPhotoIds.has(ref.id) ? (
                        <img
                          src={ref.photoUrl}
                          alt={ref.firstName}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedPhotoIds((prev) => new Set(prev).add(ref.id))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
                          {ref.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-foreground">{ref.firstName}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(ref.joinedAt)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white px-3 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
                      +{formatCurrency(config?.referralBonus || 0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-8 flex flex-col items-center text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#EDE0FF' }}>
                  <Users size={24} style={{ color: '#6C21E8' }} />
                </div>
                <p className="font-bold text-foreground mb-1">No referrals yet</p>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Share your link with friends to start earning.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
