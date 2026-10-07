import { useGetMe, useGetPublicConfig } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/auth-provider';
import {
  LifeBuoy,
  ScrollText,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { PageHeader } from '../components/page-header';
import { MembershipCard } from '../components/membership-card';

export default function Profile() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="flex-1 px-4 pt-5 space-y-4">
        <div className="h-10 w-40 rounded-2xl glass animate-pulse" />
        <div className="h-52 rounded-[28px] glass animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 rounded-3xl glass animate-pulse" />
          <div className="h-24 rounded-3xl glass animate-pulse" />
          <div className="h-24 rounded-3xl glass animate-pulse" />
        </div>
        <div className="h-28 rounded-3xl glass animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <PageHeader title="প্রোফাইল" subtitle="আপনার মেম্বারশিপ ও অ্যাকাউন্ট" backTo="/settings" testId="button-back-profile" />

      <div className="px-4 flex flex-col gap-4">
        {/* ── Membership card ──────────────────────────────────────────── */}
        <div className="animate-fade-up">
          <MembershipCard
            firstName={user.firstName}
            telegramId={user.telegramId}
            totalEarned={user.totalEarned}
            createdAt={user.createdAt}
            isVerified={user.isVerified}
          />
          {user.username && (
            <p className="text-center text-gradient-cyan text-sm font-semibold mt-3">@{user.username}</p>
          )}
        </div>

        {/* ── Admin gateway ─────────────────────────────────────────────── */}
        {isAdmin && (
          <button
            className="rounded-[26px] p-[1.2px] active-scale animate-fade-up stagger-1"
            style={{ background: 'var(--grad-brand)' }}
            onClick={() => setLocation('/admin')}
            data-testid="link-admin-panel"
          >
            <div className="rounded-[25px] px-4 py-3.5 flex items-center justify-between" style={{ background: 'oklch(0.19 0.04 288 / 96%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl hero-btn flex items-center justify-center">
                  <ShieldAlert size={18} style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">অ্যাডমিন প্যানেল</p>
                  <p className="text-[11px] text-muted-foreground">অ্যাপ ম্যানেজ করুন</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </button>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3 animate-fade-up stagger-2">
          {[
            { label: 'ব্যালেন্স', value: formatCurrency(user.balance), valueStyle: 'text-gradient-cyan' },
            { label: 'উইথড্র', value: formatCurrency(user.totalWithdrawn), valueStyle: 'text-gradient-gold' },
            { label: 'টাস্ক ডান', value: String(user.totalTasksCount), valueStyle: 'text-gradient' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-3xl p-3.5 text-center">
              <p className={`num text-[15px] font-bold truncate ${stat.valueStyle}`}>{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mt-1.5">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ── Menu ──────────────────────────────────────────────────────── */}
        <section className="glass rounded-3xl overflow-hidden animate-fade-up stagger-3">
          {[
            {
              icon: LifeBuoy,
              iconBg: 'var(--accent)',
              iconColor: 'var(--accent-foreground)',
              title: 'হেল্প ও সাপোর্ট',
              sub: 'Telegram-এ আমাদের টিমের সাথে যোগাযোগ করুন',
              onClick: () => window.open(`https://t.me/${(config?.adminUsername || 'shanto_As').replace(/^@/, '')}`, '_blank'),
              testId: 'link-support',
            },
            {
              icon: ScrollText,
              iconBg: 'oklch(0.86 0.14 95 / 15%)',
              iconColor: 'oklch(0.86 0.14 95)',
              title: 'অ্যাপের নিয়মাবলী',
              sub: 'আয় শুরুর আগে পড়ে নিন',
              onClick: () => setLocation('/rules'),
              testId: 'link-rules',
            },
          ].map((item, i, arr) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <button
                  className="w-full flex items-center justify-between p-4 transition-colors active-scale text-left"
                  onClick={item.onClick}
                  data-testid={item.testId}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: item.iconBg }}>
                      <Icon size={18} style={{ color: item.iconColor }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
                {i < arr.length - 1 && <div className="h-px mx-4" style={{ background: 'oklch(1 0 0 / 7%)' }} />}
              </div>
            );
          })}
        </section>

        {/* ── Flagged warning ───────────────────────────────────────────── */}
        {user.isFlagged && (
          <div className="glass rounded-3xl p-4 flex gap-3 items-start" style={{ borderLeft: '3px solid var(--destructive)' }}>
            <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-destructive text-sm">Account Flagged</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your account has been flagged for suspicious activity. Ad rewards are disabled and withdrawals may be delayed. Please contact support.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
