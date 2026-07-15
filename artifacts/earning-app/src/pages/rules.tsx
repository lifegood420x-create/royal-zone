import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const doRules = [
  'Use only one account per person, per device, and per Telegram ID.',
  'Watch ads and complete tasks yourself — automation, bots, and click-farms are not allowed.',
  'Refer real friends who genuinely want to use the app.',
  'Keep your withdrawal account details accurate and up to date.',
  'Report bugs or suspicious activity to Help & Support.',
];

const dontRules = [
  'Do not create multiple/duplicate accounts to farm referral bonuses or ad rewards.',
  'Do not use VPNs, emulators, bots, or scripts to fake ad views or task completions.',
  'Do not refer accounts created from the same device or network as your own.',
  'Do not share, sell, or trade your account with anyone.',
  'Do not attempt to exploit bugs for extra balance — report them instead.',
];

export default function Rules() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setLocation('/profile')}
          data-testid="button-back-rules"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">App Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">Read before earning</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-bold text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              Do
            </h2>
            <ul className="space-y-2.5">
              {doRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground/90 leading-relaxed">
                  <span className="text-green-600 font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-bold text-base flex items-center gap-2 text-destructive">
              <XCircle size={18} />
              Don't
            </h2>
            <ul className="space-y-2.5">
              {dontRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground/90 leading-relaxed">
                  <span className="text-destructive font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start">
          <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-destructive text-sm">Enforcement</p>
            <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
              Accounts that break these rules — including fake referrals, multi-accounting, or faked ad/task activity — will be
              flagged and may be permanently banned, and pending balances forfeited. Withdrawals from flagged or banned accounts
              will be rejected. If you believe your account was flagged by mistake, contact Help & Support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
