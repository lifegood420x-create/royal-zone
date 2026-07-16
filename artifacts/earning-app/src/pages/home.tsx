import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Play, Wallet, Gift, Users, Trophy, ChevronRight, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../components/auth-provider';

export default function Home() {
  const { data: user, isLoading: isLoadingMe } = useGetMe();
  const { data: config, isLoading: isLoadingConfig } = useGetPublicConfig();
  const { data: referralsData } = useListReferrals();
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const [photoFailed, setPhotoFailed] = useState(false);

  const currentUser = user || authUser;

  if (isLoadingMe || isLoadingConfig || !currentUser || !config) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="h-56 animate-pulse" style={{ background: 'linear-gradient(150deg, #6C21E8, #E8347A, #FF7B4A)' }} />
        <div className="p-5 space-y-4 -mt-6">
          <div className="h-32 bg-white rounded-2xl animate-pulse shadow-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
            <div className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F4FF' }}>
      {/* Gradient Hero */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{ background: 'linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-0 left-4 w-28 h-28 rounded-full opacity-10 bg-white" />

        <div className="relative flex justify-between items-center gap-3 mb-5">
          <div className="min-w-0 flex-1">
            <p className="text-white/70 text-xs font-semibold mb-0.5">Welcome back 👋</p>
            <h1 className="text-white text-lg font-black tracking-tight truncate" data-testid="text-greeting">
              {/* Show only the first segment before " | " to avoid long display names wrapping */}
              {currentUser.firstName.split(/\s*[|·•—]\s*/)[0].trim()}
            </h1>
          </div>
          {currentUser.photoUrl && !photoFailed ? (
            <img
              src={currentUser.photoUrl}
              alt="Profile"
              className="w-11 h-11 rounded-full border-2 border-white/30 shadow-lg shrink-0 object-cover"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-lg border-2 border-white/30 shadow-lg shrink-0">
              {currentUser.firstName.charAt(0)}
            </div>
          )}
        </div>

        <div className="relative">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Total Balance</p>
          <div data-testid="text-balance">
            <span className="text-white text-4xl font-black tracking-tight">{formatCurrency(currentUser.balance)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TrendingUp size={12} className="text-white/70" />
            <span className="text-white/70 text-xs font-medium">Total earned: {formatCurrency(currentUser.totalEarned)}</span>
          </div>
        </div>
      </div>

      {/* Content pulled up over hero */}
      <div className="px-4 pb-6 pt-5 space-y-4">

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/withdraw')}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-purple-100 active:scale-95 transition-transform"
            data-testid="button-home-withdraw"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6C21E8, #9B51E0)' }}>
              <Wallet size={18} color="white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Withdraw</p>
              <p className="text-xs text-muted-foreground">Cash out</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/refer')}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-purple-100 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #E8347A, #FF7B4A)' }}>
              <Users size={18} color="white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Refer</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(config.referralBonus)} / friend</p>
            </div>
          </button>
        </div>

        {/* Watch Ads CTA */}
        <button
          onClick={() => setLocation('/earn')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-purple-100 active:scale-95 transition-transform"
          data-testid="button-home-watch-ad"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
            <Play size={22} color="white" fill="white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground">Watch Ads & Earn</p>
            <p className="text-sm text-muted-foreground">Get {formatCurrency(config.adReward)} per ad · up to {config.adDailyLimit}/day</p>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
            Start
          </div>
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setLocation('/refer')}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#EDE0FF' }}>
              <Users size={17} style={{ color: '#6C21E8' }} />
            </div>
            <p className="text-2xl font-black text-foreground" data-testid="text-referral-count">{referralsData?.totalReferrals ?? 0}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Referrals</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#FFF0F5' }}>
              <Trophy size={17} style={{ color: '#E8347A' }} />
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(currentUser.totalEarned)}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Earned</p>
          </div>
        </div>

        {/* How to earn */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} style={{ color: '#6C21E8' }} />
            <h3 className="font-bold text-foreground">How to earn</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Watch rewarded video ads daily up to the limit.',
              'Complete simple tasks like joining channels and following pages.',
              `Invite friends with your referral link and get ${formatCurrency(config.referralBonus)} each.`,
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
