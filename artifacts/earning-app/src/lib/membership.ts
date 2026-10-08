export type MembershipTierId = 'member' | 'bronze' | 'silver' | 'gold' | 'royal';

export interface MembershipTier {
  id: MembershipTierId;
  label: string;
  bn: string;
  tagline: string;
  /** CSS background for the membership card face */
  face: string;
  accent: string;
  text: string;
  muted: string;
  chip: string;
}

const TIERS: MembershipTier[] = [
  {
    id: 'member',
    label: 'Member',
    bn: 'মেম্বার',
    tagline: 'Monetage CPM-এ স্বাগতম',
    face: 'linear-gradient(135deg, oklch(0.28 0.06 286) 0%, oklch(0.2 0.05 300) 55%, oklch(0.26 0.07 250) 100%)',
    accent: 'oklch(0.82 0.12 196)',
    text: 'oklch(0.96 0.01 282)',
    muted: 'oklch(0.82 0.03 282 / 75%)',
    chip: 'oklch(1 0 0 / 14%)',
  },
  {
    id: 'bronze',
    label: 'Bronze',
    bn: 'ব্রোঞ্জ',
    tagline: 'শুরুটা ভালো হয়েছে',
    face: 'linear-gradient(135deg, oklch(0.42 0.1 55) 0%, oklch(0.28 0.08 45) 50%, oklch(0.36 0.1 70) 100%)',
    accent: 'oklch(0.82 0.12 70)',
    text: 'oklch(0.97 0.02 85)',
    muted: 'oklch(0.88 0.04 70 / 80%)',
    chip: 'oklch(0.78 0.12 65 / 28%)',
  },
  {
    id: 'silver',
    label: 'Silver',
    bn: 'সিলভার',
    tagline: 'নিয়মিত আয় চলছে',
    face: 'linear-gradient(135deg, oklch(0.62 0.02 260) 0%, oklch(0.38 0.03 270) 48%, oklch(0.55 0.025 250) 100%)',
    accent: 'oklch(0.9 0.02 250)',
    text: 'oklch(0.98 0.005 260)',
    muted: 'oklch(0.9 0.01 260 / 78%)',
    chip: 'oklch(1 0 0 / 18%)',
  },
  {
    id: 'gold',
    label: 'Gold',
    bn: 'গোল্ড',
    tagline: 'টপ আর্নার টিয়ার',
    face: 'linear-gradient(135deg, oklch(0.78 0.14 90) 0%, oklch(0.5 0.12 70) 48%, oklch(0.68 0.14 55) 100%)',
    accent: 'oklch(0.95 0.08 95)',
    text: 'oklch(0.22 0.05 80)',
    muted: 'oklch(0.28 0.05 80 / 72%)',
    chip: 'oklch(0.22 0.05 80 / 16%)',
  },
  {
    id: 'royal',
    label: 'Royal',
    bn: 'রয়্যাল',
    tagline: 'ভল্টের সর্বোচ্চ সম্মান',
    face: 'linear-gradient(135deg, oklch(0.58 0.22 300) 0%, oklch(0.32 0.14 286) 42%, oklch(0.5 0.18 328) 100%)',
    accent: 'oklch(0.86 0.14 95)',
    text: 'oklch(0.98 0.01 300)',
    muted: 'oklch(0.9 0.04 300 / 78%)',
    chip: 'oklch(0.86 0.14 95 / 22%)',
  },
];

/** Earning thresholds (BDT) that unlock each tier. */
const THRESHOLDS: { min: number; id: MembershipTierId }[] = [
  { min: 2000, id: 'royal' },
  { min: 500, id: 'gold' },
  { min: 200, id: 'silver' },
  { min: 50, id: 'bronze' },
  { min: 0, id: 'member' },
];

export function getMembershipTier(totalEarned: number): MembershipTier {
  const id = THRESHOLDS.find((t) => totalEarned >= t.min)?.id ?? 'member';
  return TIERS.find((t) => t.id === id)!;
}

export function formatMemberId(telegramId: string): string {
  const digits = telegramId.replace(/\D/g, '') || telegramId;
  if (digits.length <= 4) return `RZ-${digits.padStart(4, '0')}`;
  return `RZ-${digits.slice(0, 4)} ${digits.slice(-4)}`;
}
