import { ORDER_STATUSES, OrderStatus } from './constants.js';

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Price on Request';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getStatusMeta(status: OrderStatus | string) {
  const found = ORDER_STATUSES.find(s => s.value === status);
  if (found) return found;
  return { value: status, label: status.replace(/_/g, ' '), color: 'gray' };
}
