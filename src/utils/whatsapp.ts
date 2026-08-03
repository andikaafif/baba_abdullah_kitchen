import type { CartItem, CustomerInfo } from '../types';
import { formatRupiah } from './format';

export function buildWhatsAppMessage(
  items: CartItem[],
  customerInfo: CustomerInfo,
  orderNumber: string,
  totalPrice: number,
  shippingFee: number
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
  const shippingLine = shippingFee > 0 ? `Ongkos Kirim: ${formatRupiah(shippingFee)}\n` : '';

  return (
    `Assalamu'alaikum Dapoer Baba Abdullah 🥟\n\n` +
    `Saya ingin memesan:\n\n` +
    `${itemLines}\n\n` +
    `────────────────\n` +
    `Subtotal: ${formatRupiah(subtotal)}\n` +
    `${shippingLine}` +
    `Total Bayar: ${formatRupiah(totalPrice + shippingFee)}\n` +
    `────────────────\n\n` +
    `Nama: ${customerInfo.name}\n` +
    `Alamat: ${customerInfo.address}\n` +
    `No. HP: ${customerInfo.phone}\n` +
    `Metode Pengiriman: ${customerInfo.deliveryMethod}${customerInfo.deliveryArea ? ` - ${customerInfo.deliveryArea}` : ''}\n` +
    `Pembayaran: ${customerInfo.paymentMethod}\n` +
    `Catatan: ${customerInfo.notes || '-'}\n` +
    `No. Order: ${orderNumber}\n\n` +
    `Terima kasih. 🙏`
  );
}

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/6282260070364?text=${encoded}`;
  // Safari on iOS blocks window.open for deep links; use location redirect instead
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
