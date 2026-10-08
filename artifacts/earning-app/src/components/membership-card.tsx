import { Crown, ShieldCheck } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { formatMemberId, getMembershipTier } from '../lib/membership';

interface MembershipCardProps {
  firstName: string;
  telegramId: string;
  totalEarned: number;
  createdAt: string;
  isVerified?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function MembershipCard({
  firstName,
  telegramId,
  totalEarned,
  createdAt,
  isVerified = false,
  compact = false,
  onClick,
}: MembershipCardProps) {
  const tier = getMembershipTier(totalEarned);
  const name = firstName.split(/\s*[|·•—]\s*/)[0].trim();
  const className = `relative w-full overflow-hidden membership-shine text-left ${
    compact ? 'rounded-[24px] p-4' : 'rounded-[28px] p-5'
  } ${onClick ? 'active-scale' : ''}`;
  const style = { background: tier.face, color: tier.text, boxShadow: 'var(--shadow-lg)' };

  const inner = (
    <>
      <div
        className="absolute -top-16 -right-10 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tier.accent}55 0%, transparent 68%)` }}
      />
      <div
        className="absolute -bottom-20 -left-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, oklch(1 0 0 / 12%) 0%, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: tier.chip }}
          >
            <Crown size={16} style={{ color: tier.accent }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[10px] font-bold tracking-[0.22em] uppercase leading-none"
              style={{ color: tier.muted }}
            >
              Monetage CPM
            </p>
            <p className="text-xs font-bold mt-1 truncate" style={{ color: tier.text }}>
              {tier.bn} · {tier.label}
            </p>
          </div>
        </div>
        {isVerified && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shrink-0"
            style={{ background: tier.chip, color: tier.text }}
          >
            <ShieldCheck size={11} />
            Verified
          </span>
        )}
      </div>

      <p
        className={`relative font-bold truncate ${compact ? 'text-lg mt-4' : 'text-2xl mt-6'}`}
        style={{ color: tier.text }}
      >
        {name}
      </p>
      <p className="relative num text-xs font-semibold tracking-[0.14em] mt-1" style={{ color: tier.muted }}>
        {formatMemberId(telegramId)}
      </p>

      {!compact && (
        <div className="relative flex items-end justify-between mt-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: tier.muted }}>
              Member since
            </p>
            <p className="text-xs font-bold mt-0.5" style={{ color: tier.text }}>
              {formatDate(createdAt)}
            </p>
          </div>
          <p className="text-[11px] font-semibold max-w-[50%] text-right leading-snug" style={{ color: tier.muted }}>
            {tier.tagline}
          </p>
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style} data-testid="card-membership">
        {inner}
      </button>
    );
  }

  return (
    <section className={className} style={style} data-testid="card-membership">
      {inner}
    </section>
  );
}
