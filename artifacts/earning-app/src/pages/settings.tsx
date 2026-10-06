import { Link } from 'wouter';
import { ChevronRight, Settings as SettingsIcon, UserRound, Wallet, Users } from 'lucide-react';
import { Button } from '../components/ui/button';

const settingsItems = [
  { href: '/profile', label: 'Profile', icon: UserRound },
  { href: '/withdraw', label: 'Withdraw', icon: Wallet },
  { href: '/refer', label: 'Refer', icon: Users },
];

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <header className="royal-header px-5 pt-9 pb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>
      <div className="px-4 py-5">
        <div className="royal-panel rounded-lg border border-border overflow-hidden divide-y divide-border">
          {settingsItems.map(({ href, label, icon: Icon }) => (
            <Button key={href} asChild variant="ghost" className="w-full h-auto rounded-none justify-between px-4 py-5 hover:bg-muted text-foreground">
              <Link href={href} data-testid={`settings-${label.toLowerCase()}`}>
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon size={20} /></span>
                  <span className="text-sm font-semibold">{label}</span>
                </span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
