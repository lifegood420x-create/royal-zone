import { Facebook, Youtube, Send, Gift, Coins, type LucideIcon } from 'lucide-react';
import type { TaskType } from '@workspace/api-client-react';

interface TaskIconConfig {
  Icon: LucideIcon;
  iconClassName: string;
  bgClassName: string;
}

const TASK_ICON_CONFIG: Record<string, TaskIconConfig> = {
  youtube: {
    Icon: Youtube,
    iconClassName: 'text-[#FF0000]',
    bgClassName: 'bg-[#FF0000]/10',
  },
  facebook: {
    Icon: Facebook,
    iconClassName: 'text-[#1877F2]',
    bgClassName: 'bg-[#1877F2]/10',
  },
  telegram: {
    Icon: Send,
    iconClassName: 'text-[#26A5E4]',
    bgClassName: 'bg-[#26A5E4]/10',
  },
  join_bonus: {
    Icon: Gift,
    iconClassName: 'text-amber-500',
    bgClassName: 'bg-amber-500/10',
  },
  bonus: {
    Icon: Gift,
    iconClassName: 'text-amber-500',
    bgClassName: 'bg-amber-500/10',
  },
  other: {
    Icon: Coins,
    iconClassName: 'text-primary',
    bgClassName: 'bg-primary/10',
  },
};

export function getTaskIconConfig(type: TaskType | string): TaskIconConfig {
  return TASK_ICON_CONFIG[type] ?? TASK_ICON_CONFIG.other;
}

export function TaskIcon({ type, size = 24 }: { type: TaskType | string; size?: number }) {
  const { Icon, iconClassName } = getTaskIconConfig(type);
  return <Icon className={iconClassName} size={size} />;
}
