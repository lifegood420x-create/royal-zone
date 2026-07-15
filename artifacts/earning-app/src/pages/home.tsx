import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Wallet, Gift, Users, Trophy } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../components/auth-provider';

export default function Home() {
  const { data: user, isLoading: isLoadingMe } = useGetMe();
  const { data: config, isLoading: isLoadingConfig } = useGetPublicConfig();
  const { data: referralsData } = useListReferrals();
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth(); // just to be safe if useGetMe is slow
  // Falls back to the initial avatar if the Telegram photo URL fails to
  // load (expired, CORS, deleted), instead of showing a broken-image icon.
  const [photoFailed, setPhotoFailed] = useState(false);

  const currentUser = user || authUser;

  if (isLoadingMe || isLoadingConfig || !currentUser || !config) {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-40 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted animate-pulse rounded-2xl" />
          <div className="h-24 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      {/* Header section with gradient */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-4 px-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-greeting">
              Hi, {currentUser.firstName}!
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Ready to earn today?</p>
          </div>
          {currentUser.photoUrl && !photoFailed ? (
            <img 
              src={currentUser.photoUrl} 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-background shadow-sm"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border-2 border-background shadow-sm">
              {currentUser.firstName.charAt(0)}
            </div>
          )}
        </div>

        {/* Balance Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={80} />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-primary-foreground/80 font-medium text-sm mb-1">Current Balance</p>
            <div className="flex items-baseline gap-1" data-testid="text-balance">
              <span className="text-4xl font-black tracking-tight">{formatCurrency(currentUser.balance)}</span>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 font-bold text-secondary-foreground shadow-md active:scale-95 transition-transform"
                onClick={() => setLocation('/withdraw')}
                data-testid="button-home-withdraw"
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 pb-8 space-y-6 flex-1">
        {/* Call to Action */}
        <div className="bg-card rounded-2xl p-1 border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center shrink-0">
              <Play size={20} className="ml-0.5 fill-current" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight text-foreground">Watch Ads & Earn</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Get {formatCurrency(config.adReward)} per ad</p>
            </div>
          </div>
          <Button 
            className="rounded-xl mr-2 font-bold px-6" 
            onClick={() => setLocation('/earn')}
            data-testid="button-home-watch-ad"
          >
            Start
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setLocation('/refer')}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground" data-testid="text-referral-count">{referralsData?.totalReferrals ?? 0}</p>
                <p className="text-xs font-medium text-muted-foreground">Total Referrals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(currentUser.totalEarned)}</p>
                <p className="text-xs font-medium text-muted-foreground">Total Earned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules / Info */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-primary" size={20} />
              <h3 className="font-bold text-foreground">How to earn</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-muted-foreground">Watch rewarded video ads daily up to the limit.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-muted-foreground">Complete simple tasks like joining channels and following pages.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-sm text-muted-foreground">Invite friends with your referral link and get {formatCurrency(config.referralBonus)} each.</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
