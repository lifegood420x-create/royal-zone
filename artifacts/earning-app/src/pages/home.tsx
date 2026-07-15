import React from 'react';
import { useGetMe, useGetPublicConfig } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Wallet, PlaySquare, Users, ArrowRight, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: config, isLoading: configLoading } = useGetPublicConfig();

  const formattedBalance = user?.balance != null ? user.balance.toFixed(2) : '0.00';

  if (userLoading || configLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-6">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-primary/20">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon name={user?.firstName || 'User'} />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Welcome back</p>
            <h1 className="text-lg font-bold text-foreground leading-tight">{user?.firstName || 'User'}</h1>
          </div>
        </div>
        <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/10">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-xs font-bold">Verified</span>
        </div>
      </header>

      <div className="px-6 space-y-6 mt-2">
        {/* Main Balance Card */}
        <div className="gradient-primary gradient-card-shine text-primary-foreground rounded-3xl p-6 shadow-xl relative overflow-hidden animate-fade-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10">
            <p className="text-primary-foreground/80 font-medium text-sm mb-1 flex items-center gap-2">
              Available Balance
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold tracking-tight font-mono">৳{formattedBalance}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/withdraw" className="flex-1 bg-white text-primary text-center py-3 rounded-2xl font-bold shadow-md hover:bg-opacity-90 active-scale text-sm flex items-center justify-center gap-2 transition-colors">
                <Wallet size={16} />
                Withdraw
              </Link>
              <Link href="/earn" className="flex-1 bg-secondary text-secondary-foreground text-center py-3 rounded-2xl font-bold shadow-md hover:bg-opacity-90 active-scale text-sm flex items-center justify-center gap-2 transition-colors">
                Earn More
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-1">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Total Earned</p>
              <p className="text-lg font-bold font-mono">৳{user?.totalEarned?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Withdrawn</p>
              <p className="text-lg font-bold font-mono">৳{user?.totalWithdrawn?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Action List */}
        <div className="space-y-3 animate-fade-up stagger-2">
          <h2 className="text-sm font-bold text-muted-foreground tracking-wide uppercase px-2">Ways to Earn</h2>
          
          <Link href="/earn" className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm active-scale transition-colors hover:border-primary/30 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <PlaySquare size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Watch Ads</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Earn ৳{config?.adReward} per view</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </Link>

          <Link href="/refer" className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm active-scale transition-colors hover:border-primary/30 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Refer Friends</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Bonus ৳{config?.referralBonus} per invite</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserIcon({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return <span className="font-bold text-lg">{initial}</span>;
}
