import React from 'react';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function Rules() {
  return (
    <div className="flex flex-col min-h-full pb-6 bg-background">
      <header className="px-4 pt-10 pb-4 bg-card border-b border-border z-10 sticky top-0 flex items-center gap-3">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-border transition-colors active-scale">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Rules & Guidelines</h1>
      </header>

      <div className="px-6 pt-6 space-y-8 animate-fade-up">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-success" size={24} />
            <h2 className="text-lg font-bold text-foreground">Do's</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">1</span>
              Complete tasks honestly. Watch ads fully if required by the task description.
            </li>
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">2</span>
              Invite real friends using your referral link. Ensure they are active users.
            </li>
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">3</span>
              Double-check your account number (bKash/Nagad) before submitting a withdrawal request.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-destructive" size={24} />
            <h2 className="text-lg font-bold text-foreground">Don'ts</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">1</span>
              Never use VPNs, proxies, or emulators to complete tasks or watch ads.
            </li>
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">2</span>
              Do not create multiple accounts. Fake referrals will lead to an instant ban.
            </li>
            <li className="flex items-start gap-3 bg-card border border-border p-3 rounded-2xl text-sm text-foreground shadow-sm">
              <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">3</span>
              Do not use automated bots or scripts to click buttons.
            </li>
          </ul>
        </div>

        <div className="bg-warning/10 border border-warning/20 p-4 rounded-3xl flex flex-col items-center text-center gap-2 mt-4">
          <ShieldAlert className="text-warning" size={32} />
          <h3 className="font-bold text-warning-foreground">Account Flagging</h3>
          <p className="text-xs text-warning-foreground/80 leading-relaxed">
            Accounts found violating these rules will be flagged. Flagged accounts will have their withdrawals rejected and may be permanently banned without notice.
          </p>
        </div>

      </div>
    </div>
  );
}
