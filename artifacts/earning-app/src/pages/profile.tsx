import { useState } from 'react';
import { useGetMe, useGetPublicConfig } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/auth-provider';
import { 
  Wallet, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function Profile() {
  const { data: user } = useGetMe();
  const { data: config } = useGetPublicConfig();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [photoFailed, setPhotoFailed] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 p-5 space-y-4 animate-pulse" style={{ background: '#F8F4FF' }}>
        <div className="h-48 rounded-2xl" style={{ background: 'linear-gradient(150deg, #6C21E8, #E8347A, #FF7B4A)' }} />
        <div className="space-y-3">
          <div className="h-24 bg-white rounded-2xl" />
          <div className="h-16 bg-white rounded-2xl" />
          <div className="h-16 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F4FF' }}>
      {/* Gradient Hero with profile */}
      <div
        className="relative overflow-hidden px-5 pt-10 pb-16 text-center"
        style={{ background: 'linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-0 left-6 w-24 h-24 rounded-full opacity-10 bg-white" />

        {/* Avatar */}
        <div className="relative inline-block mb-4">
          {user.photoUrl && !photoFailed ? (
            <img
              src={user.photoUrl}
              alt="Profile"
              className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-xl object-cover"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-3xl border-4 border-white/30 shadow-xl">
              {user.firstName.charAt(0)}
            </div>
          )}
          {isAdmin && (
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg text-[11px]">⭐</div>
          )}
        </div>

        <h1 className="text-white text-xl font-black">{user.firstName} {user.username ? `@${user.username}` : ''}</h1>
        <p className="text-white/65 text-xs mt-1">Joined {formatDate(user.createdAt)}</p>
        <div className="mt-2 inline-block bg-white/15 rounded-full px-3 py-0.5 text-white/80 text-xs font-bold">
          ID: {user.telegramId}
        </div>
      </div>

      <div className="px-4 pb-6 -mt-6 space-y-4">
        {/* Admin button */}
        {isAdmin && (
          <button
            className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-purple-100 active:scale-95 transition-transform"
            onClick={() => setLocation('/admin')}
            data-testid="link-admin-panel"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C21E8, #E8347A)' }}>
                <ShieldAlert size={18} color="white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-foreground">Admin Panel</p>
                <p className="text-xs text-muted-foreground">Manage the app</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Balance', value: formatCurrency(user.balance), color: '#6C21E8', bg: '#EDE0FF' },
            { label: 'Withdrawn', value: formatCurrency(user.totalWithdrawn), color: '#E8347A', bg: '#FFF0F5' },
            { label: 'Tasks Done', value: String(user.totalTasksCount), color: '#16A34A', bg: '#F0FDF4' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-3.5 shadow-sm border border-purple-100 text-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: stat.bg }}>
                <div className="w-3 h-3 rounded-full" style={{ background: stat.color }} />
              </div>
              <p className="text-base font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          {[
            {
              icon: HelpCircle,
              iconBg: '#EFF6FF',
              iconColor: '#3B82F6',
              title: 'Help & Support',
              sub: 'Contact our team on Telegram',
              onClick: () => window.open(`https://t.me/${(config?.adminUsername || 'shanto_As').replace(/^@/, '')}`, '_blank'),
              testId: 'link-support',
            },
            {
              icon: ShieldAlert,
              iconBg: '#FFF7ED',
              iconColor: '#F97316',
              title: 'App Rules',
              sub: 'Read before earning',
              onClick: () => setLocation('/rules'),
              testId: 'link-rules',
            },
          ].map((item, i, arr) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors active:scale-[0.99] text-left"
                  onClick={item.onClick}
                  data-testid={item.testId}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.iconBg }}>
                      <Icon size={18} style={{ color: item.iconColor }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
                {i < arr.length - 1 && <div className="h-px bg-purple-50 mx-4" />}
              </div>
            );
          })}
        </div>

        {/* Flagged warning */}
        {user.isFlagged && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-destructive text-sm">Account Flagged</p>
              <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                Your account has been flagged for suspicious activity. Ad rewards are disabled and withdrawals may be delayed. Please contact support.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
