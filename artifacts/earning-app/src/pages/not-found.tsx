import { Link } from 'wouter';
import { House } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="aurora-view min-h-[100dvh] w-full flex items-center justify-center p-6">
      <div className="relative z-10 glass rounded-[32px] p-10 max-w-sm w-full text-center space-y-5 animate-scale-in">
        <p className="num text-7xl font-bold text-gradient leading-none">404</p>
        <div>
          <h1 className="text-xl font-bold text-foreground">পেজটি পাওয়া যায়নি</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            আপনি যে পেজটি খুঁজছেন সেটি এই অ্যাপে নেই।
          </p>
        </div>
        <Link
          href="/"
          className="hero-btn inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl text-sm font-bold active-scale"
          data-testid="link-go-home"
        >
          <House size={16} />
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
