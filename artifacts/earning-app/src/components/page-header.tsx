import React from 'react';

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-[11px]';
  return (
    <span
      className={`${box} rounded-xl bg-primary text-primary-foreground grid place-items-center font-black shadow-sm shadow-primary/20`}
    >
      RZ
    </span>
  );
}

export function PageHeader({
  kicker = 'Royal Zone',
  title,
  subtitle,
  trailing,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-border/80 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BrandMark size="sm" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{kicker}</p>
          </div>
          <h1 className="text-[1.4rem] font-extrabold tracking-tight text-foreground truncate">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p> : null}
        </div>
        {trailing}
      </div>
    </header>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
      </div>
      {trailing}
    </div>
  );
}
