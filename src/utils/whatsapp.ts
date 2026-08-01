import type { CartItem, CustomerInfo } from '../types';
import { formatRupiah } from './format';

export function buildWhatsAppMessage(
  items: CartItem[],
  customerInfo: CustomerInfo,
  orderNumber: string,
  totalPrice: number
): string {
  const itemLines = items
    .map(
      (item) =>
        `• ${item.name} ${item.variant.label} (${item.variant.pcs}) x${item.quantity}\n  ${formatRupiah(
          item.variant.price * item.quantity
        )}`
    )
    .join('\n\n');

  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  return (
    `Assalamu'alaikum Baba Abdullah Kitchen 🥟\n\n` +
    `Saya ingin memesan:\n\n` +
    `${itemLines}\n\n` +
    `────────────────\n` +
    `Subtotal: ${formatRupiah(subtotal)}\n` +
    `Total: ${formatRupiah(totalPrice)}\n` +
    `────────────────\n\n` +
    `Nama: ${customerInfo.name}\n` +
    `Alamat: ${customerInfo.address}\n` +
    `No. HP: ${customerInfo.phone}\n` +
    `Metode Pengiriman: ${customerInfo.deliveryMethod}\n` +
    `Pembayaran: ${customerInfo.paymentMethod}\n` +
    `Catatan: ${customerInfo.notes || '-'}\n` +
    `No. Order: ${orderNumber}\n\n` +
    `Terima kasih. 🙏`
  );
}

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/6282260070364?text=${encoded}`, '_blank', 'noopener,noreferrer');
}
