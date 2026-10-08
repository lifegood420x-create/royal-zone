import { useState, type CSSProperties } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useGetReferralLeaderboard } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Users, Copy, Share2, Check, UserPlus, Trophy } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { PageHeader } from '../components/page-header';

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

  const botUsername = 'Monetage_cpm_bot';
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
    const text = `Monetage BD

এখন ঘরে বসেই ইনকাম করুন সহজে!

মনিটাইজ ডট পাবলিশ এর এড দেখা।

টেলিগ্রাম চ্যানেল সাবস্ক্রিপশন টাস্ক ।

ইউটিউব চ্যানেল সাবস্ক্রাইব ও ভিডিও দেখার কাজ ।

Daily Bonus

Instant Withdraw

Trusted & Professional Telegram Earning Platform

আজই জয়েন করুন এবং ইনকাম শুরু করুন!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const referrals = referralsData?.referrals || [];

  const rankStyle = (rank: number): CSSProperties => {
    if (rank === 1) return { background: 'var(--grad-gold)', color: 'oklch(0.25 0.07 90)' };
    if (rank === 2) return { background: 'linear-gradient(135deg, oklch(0.9 0.01 260), oklch(0.7 0.02 265))', color: 'oklch(0.25 0.03 265)' };
    if (rank === 3) return { background: 'linear-gradient(135deg, oklch(0.72 0.12 65), oklch(0.58 0.11 55))', color: 'oklch(0.96 0.02 65)' };
    return { background: 'oklch(1 0 0 / 6%)', color: 'var(--muted-foreground)' };
  };

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader title="রেফার" subtitle="বন্ধু ইনভাইট করে বোনাস পান" backTo="/settings" testId="button-back-refer" />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="px-4 pt-3 pb-2 text-center animate-fade-up">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-[22px] animate-float" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--shadow-glow-primary)' }} />
          <div className="absolute inset-0 rounded-[22px] flex items-center justify-center">
            <UserPlus size={28} style={{ color: 'var(--primary-foreground)' }} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">ইনভাইট করুন, <span className="text-gradient">আয় করুন</span></h1>
        <p className="text-muted-foreground text-sm mt-1">
          প্রতিটি সফল রেফারে পান <span className="num font-bold text-gradient-gold">{formatCurrency(config?.referralBonus || 0)}</span>
        </p>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* ── Magic link tile ─────────────────────────────────────────── */}
        <section className="glass rounded-3xl p-4 animate-fade-up stagger-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2.5">আপনার রেফারেল লিংক</p>
          <div
            className="rounded-2xl px-4 py-3.5 flex items-center gap-2"
            style={{ border: '1.5px dashed oklch(0.66 0.18 295 / 45%)', background: 'oklch(0.66 0.18 295 / 8%)' }}
          >
            <span className="flex-1 text-xs font-semibold truncate text-foreground/90" style={{ fontFamily: 'var(--app-font-mono)' }}>
              {referralLink || 'লোড হচ্ছে…'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              className="h-11 rounded-2xl hero-btn flex items-center justify-center gap-2 text-sm font-bold active-scale"
              onClick={handleCopy}
              data-testid="button-copy-referral"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
            </button>
            <button
              className="h-11 rounded-2xl glass-strong flex items-center justify-center gap-2 text-sm font-bold text-foreground active-scale"
              onClick={handleShare}
              data-testid="button-share-referral"
            >
              <Share2 size={16} style={{ color: 'var(--accent-foreground)' }} />
              শেয়ার করুন
            </button>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-3 animate-fade-up stagger-2">
          <div className="glass rounded-3xl p-4 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.8 0.13 196 / 25%) 0%, transparent 65%)' }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--accent-foreground)' }}>মোট রেফারেল</p>
            <p className="num text-3xl font-bold text-foreground mt-1" data-testid="text-total-referrals">
              {referralsData?.totalReferrals || 0}
            </p>
          </div>
          <div className="glass rounded-3xl p-4 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.66 0.22 305 / 30%) 0%, transparent 65%)' }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gradient">রেফারেল আয়</p>
            <p className="num text-3xl font-bold text-gradient-gold mt-1" data-testid="text-referral-earnings">
              {formatCurrency(referralsData?.totalReferralEarnings || 0)}
            </p>
          </div>
        </section>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-1.5 flex gap-1.5 animate-fade-up stagger-3">
          {([
            { key: 'leaderboard', label: 'লিডারবোর্ড', icon: Trophy },
            { key: 'my-referrals', label: 'আমার রেফারেল', icon: Users },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-bold transition-all duration-300"
              style={
                activeTab === key
                  ? { background: 'var(--grad-brand)', color: 'var(--primary-foreground)', boxShadow: 'var(--shadow-glow-primary)' }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Leaderboard ─────────────────────────────────────────────── */}
        {activeTab === 'leaderboard' && (
          <div>
            {isLoadingLeaderboard ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 glass animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : (leaderboard?.entries?.length ?? 0) > 0 ? (
              <div className="space-y-2.5">
                {leaderboard!.entries.map((entry, idx) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <div
                      key={entry.userId}
                      className={`glass rounded-3xl p-3.5 flex items-center gap-3 animate-fade-up`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div
                        className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center num text-xs font-bold"
                        style={rankStyle(entry.rank)}
                      >
                        {isTop3 ? entry.rank : `#${entry.rank}`}
                      </div>
                      {entry.photoUrl && !failedLeaderboardIds.has(entry.userId) ? (
                        <img
                          src={entry.photoUrl}
                          alt={entry.firstName}
                          className="w-10 h-10 rounded-full border border-white/15 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedLeaderboardIds(prev => new Set(prev).add(entry.userId))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'var(--grad-brand-soft)', color: 'var(--foreground)', border: '1px solid oklch(0.66 0.18 295 / 30%)' }}>
                          {entry.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{entry.firstName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="num text-sm font-bold text-gradient-cyan">{entry.referralCount}</p>
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">রেফারেল</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-3xl border-dashed p-8 flex flex-col items-center text-center">
                <Trophy size={32} className="text-muted-foreground/25 mb-2" />
                <p className="text-sm text-muted-foreground">লিডারবোর্ডে এখনও কেউ নেই</p>
              </div>
            )}
          </div>
        )}

        {/* ── My Referrals ────────────────────────────────────────────── */}
        {activeTab === 'my-referrals' && (
          <div>
            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 glass animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : referrals.length > 0 ? (
              <div className="space-y-2.5">
                {referrals.map((ref, idx) => (
                  <div
                    key={ref.id}
                    className="glass rounded-3xl p-3.5 flex items-center justify-between animate-fade-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      {ref.photoUrl && !failedPhotoIds.has(ref.id) ? (
                        <img
                          src={ref.photoUrl}
                          alt={ref.firstName}
                          className="w-10 h-10 rounded-full border border-white/15 object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setFailedPhotoIds((prev) => new Set(prev).add(ref.id))}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--grad-brand-soft)', color: 'var(--foreground)', border: '1px solid oklch(0.66 0.18 295 / 30%)' }}>
                          {ref.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-foreground">{ref.firstName}</p>
                        <p className="text-xs text-muted-foreground">জয়েন {formatDate(ref.joinedAt)}</p>
                      </div>
                    </div>
                    <span className="num text-xs font-bold px-3 py-1 rounded-xl" style={{ background: 'oklch(0.8 0.17 155 / 14%)', color: 'var(--success)', border: '1px solid oklch(0.8 0.17 155 / 28%)' }}>
                      +{formatCurrency(config?.referralBonus || 0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-3xl border-dashed p-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent)' }}>
                  <Users size={24} style={{ color: 'var(--accent-foreground)' }} />
                </div>
                <p className="font-bold text-foreground mb-1">এখনও রেফারেল নেই</p>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  আপনার লিংকটি বন্ধুদের সাথে শেয়ার করে আয় শুরু করুন।
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
