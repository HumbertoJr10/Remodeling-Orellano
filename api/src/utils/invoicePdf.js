const fs = require('fs').promises;
const https = require('https');
const path = require('path');
const PDFDocument = require('pdfkit');

const INVOICES_DIR = path.join(__dirname, '../../uploads/invoices');

/** A4 width ~595.28pt; márgenes laterales 40 */
const PAGE_W = 595.28;
const M = 40;
const INNER_W = PAGE_W - M * 2;
const RIGHT_COL_X = M + 320;
const RIGHT_COL_W = INNER_W - 320;
const HEADER_BG_URL = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80';
let headerBackgroundPromise;
let companySignaturePromise;

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`header bg status ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getHeaderBackground() {
  if (!headerBackgroundPromise) {
    headerBackgroundPromise = fetchImageBuffer(HEADER_BG_URL).catch(() => null);
  }
  return headerBackgroundPromise;
}

async function getCompanySignature() {
  if (!companySignaturePromise) {
    companySignaturePromise = (async () => {
      const candidates = [
        process.env.COMPANY_SIGNATURE_PATH,
        path.join(__dirname, '../../assets/company-signature.png'),
        'C:/Users/Ariannys/.cursor/projects/c-Users-Ariannys-Desktop-Proyectos-Remodeling-Orellano/assets/c__Users_Ariannys_AppData_Roaming_Cursor_User_workspaceStorage_476e40c02d166302f8665d2e5c5882df_images_image-15c5d16d-6eae-4cce-919b-57ba714bbee2.png',
      ].filter(Boolean);

      for (const candidate of candidates) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const buffer = await fs.readFile(candidate);
          if (buffer?.length) return buffer;
        } catch {
          // Try next candidate path.
        }
      }

      return null;
    })();
  }

  return companySignaturePromise;
}

async function ensureInvoicesDir() {
  await fs.mkdir(INVOICES_DIR, { recursive: true });
}

function money(value) {
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatDateUs(value) {
  if (!value) return '';

  const s = String(value).trim();

  // YYYY-MM-DD -> MM-DD-YYYY
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[2]}-${isoMatch[3]}-${isoMatch[1]}`;
  }

  // MM-DD-YYYY (already in desired format)
  const usMatch = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (usMatch) return s;

  // Date parse fallback
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  return s;
}

async function generateInvoicePdf({
  fileName,
  invoiceNumber,
  customerName,
  invoiceDate,
  items,
  total,
}) {
  await ensureInvoicesDir();
  const headerBackground = await getHeaderBackground();
  const companySignature = await getCompanySignature();
  const outputPath = path.join(INVOICES_DIR, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: M });
    const stream = require('fs').createWriteStream(outputPath);
    doc.pipe(stream);

    const headerBgY = M - 6;
    const headerBgH = 82;

    if (headerBackground) {
      doc.save();
      doc.rect(M, headerBgY, INNER_W, headerBgH).clip();
      doc.image(headerBackground, M, headerBgY, { width: INNER_W, height: headerBgH });
      doc.restore();

      doc.save();
      doc.fillOpacity(0.42);
      doc.rect(M, headerBgY, INNER_W, headerBgH).fill('#0f1117');
      doc.restore();

      // Capas suaves para simular un blur visual en el encabezado.
      doc.save();
      doc.fillOpacity(0.1);
      doc.rect(M, headerBgY + 16, INNER_W, 12).fill('#ffffff');
      doc.rect(M, headerBgY + 42, INNER_W, 9).fill('#ffffff');
      doc.restore();
    } else {
      doc.save();
      doc.rect(M, headerBgY, INNER_W, headerBgH).fill('#2a3040');
      doc.restore();
    }

    // El bloque de datos del cliente debe iniciar debajo del encabezado con imagen.
    let y = headerBgY + headerBgH + 8;

    const invoiceBoxX = M;
    const invoiceBoxY = y;
    const invoiceBoxW = 230;
    const invoiceBoxH = 38;
    doc.roundedRect(invoiceBoxX, invoiceBoxY, invoiceBoxW, invoiceBoxH, 18).fillAndStroke('#ffffff', '#111111');
    doc
      .fillColor('#111111')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('INVOICE', invoiceBoxX, invoiceBoxY + 10, { width: invoiceBoxW, align: 'center' });

    const companyBoxX = M + 250;
    const companyBoxY = y + 4;
    const companyBoxW = INNER_W - 250;
    const companyBoxH = 28;
    doc.roundedRect(companyBoxX, companyBoxY, companyBoxW, companyBoxH, 14).fillAndStroke('#ffffff', '#111111');
    doc
      .fillColor('#111111')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('RCO HIGH LEVEL CONSTRUCTION LLC', companyBoxX, companyBoxY + 10, {
        width: companyBoxW,
        align: 'center',
      });

    y += 58;

    const boxH = 86;
    doc.roundedRect(M, y, INNER_W, boxH, 22).lineWidth(2).stroke('#111111');

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#111111')
      .text('CUSTOMER NAME', M + 16, y + 18);
    doc
      .font('Helvetica')
      .fontSize(13)
      .text(customerName, M + 16, y + 32, { width: 290, ellipsis: true });

    doc.font('Helvetica-Bold').fontSize(9).text('BILL:', RIGHT_COL_X, y + 16);
    doc
      .font('Helvetica')
      .fontSize(11)
      .text(`N°${invoiceNumber}`, RIGHT_COL_X + 36, y + 14, { width: RIGHT_COL_W - 44 });

    doc.font('Helvetica-Bold').fontSize(9).text('DATE:', RIGHT_COL_X, y + 42);
    doc
      .font('Helvetica')
      .fontSize(11)
      .text(formatDateUs(invoiceDate), RIGHT_COL_X + 36, y + 40, { width: RIGHT_COL_W - 44 });

    y += boxH + 14;

    const col = {
      descX: M + 10,
      descW: 268,
      qtyX: M + 285,
      qtyW: 36,
      priceX: M + 328,
      priceW: 72,
      subX: M + 408,
      subW: INNER_W - 418,
    };

    const headerH = 28;
    doc.roundedRect(M, y, INNER_W, headerH, 14).fill('#111111');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.8);
    doc.text('DESCRIPTION', col.descX, y + 9, { width: col.descW });
    doc.text('QTY', col.qtyX, y + 9, { width: col.qtyW, align: 'center' });
    doc.text('PRICE', col.priceX, y + 9, { width: col.priceW, align: 'right' });
    doc.text('Subtotal', col.subX, y + 9, { width: col.subW, align: 'right' });

    y += headerH + 4;
    doc.fillColor('#111111');

    // Footer anclado al fondo: desde la línea sobre subtotal hasta contacto.
    // Debe caber completo en una sola hoja.
    const FOOTER_BLOCK_H = 220;
    const footerTop = doc.page.height - M - FOOTER_BLOCK_H;

    const rowH = 24;
    const availableRowsSpace = Math.max(0, footerTop - y - 6);
    const maxRowsFit = Math.max(0, Math.floor(availableRowsSpace / rowH));
    const visibleItems = items.slice(0, maxRowsFit);
    const hiddenCount = items.length - visibleItems.length;

    visibleItems.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.roundedRect(M + 4, y - 2, INNER_W - 8, rowH, 12).fill('#f1f2f5');
        doc.fillColor('#111111');
      }

      doc.font('Helvetica-Bold').fontSize(7.8);
      doc.text(item.name, col.descX, y + 7, { width: col.descW, ellipsis: true });
      doc.text(String(item.quantity), col.qtyX, y + 7, { width: col.qtyW, align: 'center' });
      doc.text(money(item.price), col.priceX, y + 7, { width: col.priceW, align: 'right' });
      doc.text(money(item.subtotal), col.subX, y + 7, { width: col.subW, align: 'right' });

      y += rowH;
    });

    if (hiddenCount > 0) {
      doc.font('Helvetica').fontSize(7).fillColor('#111111');
      doc.text(`... +${hiddenCount} item(s) más`, col.descX, y + 2, { width: col.descW });
    }

    y = footerTop;

    doc.moveTo(M + 8, y).lineTo(PAGE_W - M - 8, y).lineWidth(1.5).stroke('#111111');
    y += 12;

    doc.font('Helvetica').fontSize(9);
    doc.text('Subtotal', M + 8, y, { width: 200 });
    doc.text(money(total), M, y, { width: INNER_W - 16, align: 'right' });
    y += 18;

    const totalRowH = 24;
    doc.roundedRect(M + 8, y - 2, 64, totalRowH, 12).fill('#111111');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text('TOTAL', M + 23, y + 7);

    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11);
    doc.text(money(total), M + 80, y + 3, {
      width: INNER_W - 88,
      align: 'right',
    });

    y += totalRowH + 12;

    doc.moveTo(M + 8, y).lineTo(PAGE_W - M - 8, y).lineWidth(1.5).stroke('#111111');
    y += 16;

    doc.font('Helvetica-Bold').fontSize(12).text('THANK YOU FOR', M, y);
    y += 15;
    doc.text('CHOOSING US!', M, y);

    y += 26;
    doc.moveTo(250, y).lineTo(370, y).lineWidth(1.2).stroke('#111111');
    doc.moveTo(420, y).lineTo(550, y).lineWidth(1.2).stroke('#111111');

    if (companySignature) {
      doc.image(companySignature, 436, y - 36, {
        fit: [100, 32],
        align: 'center',
        valign: 'center',
      });
    }

    doc.fontSize(9).text('Customer Firm', 250, y + 4);
    doc.text('Company Firm', 420, y + 4);

    y += 34;

    const contactBoxH = 30;
    doc.roundedRect(M, y, 76, 22, 12).fill('#111111');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5).text('Contact:', M + 12, y + 6);

    doc.roundedRect(M + 84, y, INNER_W - 84, contactBoxH, 12).lineWidth(2).stroke('#111111');
    doc
      .fillColor('#111111')
      .font('Helvetica')
      .fontSize(7)
      .text(
        'PH 612 940 43 93  |  richarcorrales7@gmail.com  |  8321 6th St NE, MN 55434',
        M + 92,
        y + 9,
        { width: INNER_W - 104, align: 'center' },
      );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return outputPath;
}

function normalizeInvoiceDateForPdf(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function normalizeItemsForPdf(items) {
  let raw = items;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((it) => {
    const q = Number(it.quantity);
    const p = Number(it.price);
    const sub =
      it.subtotal != null && it.subtotal !== ''
        ? Number(it.subtotal)
        : Number((Number.isFinite(q) && Number.isFinite(p) ? q * p : 0).toFixed(2));
    return {
      name: String(it.name || '').trim() || 'Item',
      quantity: Number.isFinite(q) ? q : 0,
      price: Number.isFinite(p) ? Number(p.toFixed(2)) : 0,
      subtotal: Number.isFinite(sub) ? Number(sub.toFixed(2)) : 0,
    };
  });
}

/**
 * Vuelve a generar el PDF en el mismo archivo (mismo pdfPath en BD),
 * usando el diseño actual de generateInvoicePdf.
 */
async function regenerateInvoicePdf(invoice) {
  if (!invoice.pdfPath) {
    throw new Error('Factura sin pdfPath');
  }
  const fileName = decodeURIComponent(path.basename(invoice.pdfPath));
  const items = normalizeItemsForPdf(invoice.items);
  const total = Number(invoice.total);

  return generateInvoicePdf({
    fileName,
    invoiceNumber: String(invoice.invoiceNumber),
    customerName: String(invoice.customerName || '').trim(),
    invoiceDate: normalizeInvoiceDateForPdf(invoice.invoiceDate),
    items,
    total,
  });
}

module.exports = {
  INVOICES_DIR,
  ensureInvoicesDir,
  generateInvoicePdf,
  regenerateInvoicePdf,
};
