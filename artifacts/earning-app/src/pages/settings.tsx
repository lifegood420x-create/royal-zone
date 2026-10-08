import { Link } from 'wouter';
import { ChevronRight, UserRound, Wallet, Users } from 'lucide-react';

const settingsItems = [
  {
    href: '/profile',
    label: 'প্রোফাইল',
    sub: 'আপনার অ্যাকাউন্ট ও পরিসংখ্যান',
    icon: UserRound,
    iconBg: 'var(--accent)',
    iconColor: 'var(--accent-foreground)',
  },
  {
    href: '/withdraw',
    label: 'উইথড্র',
    sub: 'bKash / Nagad-এ টাকা তুলুন',
    icon: Wallet,
    iconBg: 'oklch(0.86 0.14 95 / 15%)',
    iconColor: 'oklch(0.86 0.14 95)',
  },
  {
    href: '/refer',
    label: 'রেফার',
    sub: 'বন্ধু ইনভাইট করে বোনাস পান',
    icon: Users,
    iconBg: 'oklch(0.66 0.18 295 / 16%)',
    iconColor: 'var(--primary)',
  },
];

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col px-4 pt-5 gap-4">
      <header className="animate-fade-up">
        <p className="text-[10px] font-bold tracking-[0.22em] text-gradient mb-1">CONTROL ROOM</p>
        <h1 className="text-2xl font-bold text-foreground">মেনু</h1>
      </header>

      <div className="space-y-3">
        {settingsItems.map(({ href, label, sub, icon: Icon, iconBg, iconColor }, idx) => (
          <Link
            key={href}
            href={href}
            className={`glass rounded-3xl p-4 flex items-center justify-between active-scale animate-fade-up stagger-${idx + 1}`}
            data-testid={`settings-${href.slice(1)}`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        ))}
      </div>

      <footer className="mt-auto pt-8 pb-2 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-gradient">MONETAGE CMP</p>
        <p className="text-[10px] text-muted-foreground mt-1">টাস্ক করো, আয় করো</p>
      </footer>
    </div>
  );
}
