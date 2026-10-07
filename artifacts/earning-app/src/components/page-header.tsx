import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo: string;
  testId?: string;
}

export function PageHeader({ title, subtitle, backTo, testId = 'button-back' }: PageHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="px-4 pt-5 pb-1 animate-fade-up">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-10 h-10 rounded-2xl glass-strong flex items-center justify-center active-scale shrink-0"
          onClick={() => setLocation(backTo)}
          aria-label="Back"
          data-testid={testId}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
