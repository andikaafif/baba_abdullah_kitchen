export function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID').replace(/,/g, '.');
}

export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const counterKey = `bak-order-counter-${dateStr}`;
  const stored = localStorage.getItem(counterKey);
  const counter = stored ? parseInt(stored) + 1 : 1;
  localStorage.setItem(counterKey, counter.toString());
  return `BAK-${dateStr}-${String(counter).padStart(4, '0')}`;
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
