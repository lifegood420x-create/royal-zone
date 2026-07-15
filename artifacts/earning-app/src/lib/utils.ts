import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Format as Bangladeshi Taka
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('BDT', '৳');
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-BD', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-BD', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
