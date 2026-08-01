import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import type { CartItem, CustomerInfo } from '../types';
import { formatRupiah, formatDateTime } from '../utils/format';

function receiptFilename(extension: string): string {
  const now = new Date();
  return (
    'ORDER-' +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '-' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    '.' +
    extension
  );
}

export async function generatePDF(
  items: CartItem[],
  customerInfo: CustomerInfo,
  orderNumber: string,
  totalPrice: number,
  orderDate: Date
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFillColor(139, 69, 19);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Baba Abdullah Kitchen', pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dim Sum Homemade Premium', pageWidth / 2, 22, { align: 'center' });
  y = 40;

  // Order info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`No. Order: ${orderNumber}`, 10, y);
  doc.text(`Tanggal: ${formatDateTime(orderDate)}`, 10, y + 6);
  y += 18;

  // Divider
  doc.setDrawColor(139, 69, 19);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  // Customer info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Informasi Pelanggan', 10, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nama: ${customerInfo.name}`, 10, y);
  y += 5;
  doc.text(`No. HP: ${customerInfo.phone}`, 10, y);
  y += 5;
  doc.text(`Alamat: ${customerInfo.address}`, 10, y);
  y += 5;
  doc.text(`Pengiriman: ${customerInfo.deliveryMethod}`, 10, y);
  y += 5;
  doc.text(`Pembayaran: ${customerInfo.paymentMethod}`, 10, y);
  if (customerInfo.notes) {
    y += 5;
    doc.text(`Catatan: ${customerInfo.notes}`, 10, y);
  }
  y += 10;

  // Divider
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  // Items table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Item Pesanan', 10, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setFillColor(212, 163, 115);
  doc.rect(10, y - 4, pageWidth - 20, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Item', 12, y);
  doc.text('Qty', pageWidth - 60, y);
  doc.text('Harga', pageWidth - 40, y);
  doc.text('Subtotal', pageWidth - 10, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  items.forEach((item) => {
    const subtotal = item.variant.price * item.quantity;
    doc.text(`${item.name} (${item.variant.label})`, 12, y);
    doc.text(`x${item.quantity}`, pageWidth - 60, y);
    doc.text(formatRupiah(item.variant.price), pageWidth - 40, y);
    doc.text(formatRupiah(subtotal), pageWidth - 10, y, { align: 'right' });
    y += 7;
  });

  // Total
  y += 4;
  doc.line(10, y, pageWidth - 10, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(139, 69, 19);
  doc.text('TOTAL:', 10, y);
  doc.text(formatRupiah(totalPrice), pageWidth - 10, y, { align: 'right' });
  y += 14;

  // Footer
  doc.setDrawColor(139, 69, 19);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Terima kasih telah memesan di Baba Abdullah Kitchen!', pageWidth / 2, y, {
    align: 'center',
  });
  y += 5;
  doc.text('Semoga selalu sehat dan barokah.', pageWidth / 2, y, { align: 'center' });

  doc.save(receiptFilename('pdf'));
}

export async function generatePNG(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;
  try {
    const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = receiptFilename('png');
    link.href = dataUrl;
    link.click();
  } catch (e) {
    console.error('PNG generation failed:', e);
  }
}
