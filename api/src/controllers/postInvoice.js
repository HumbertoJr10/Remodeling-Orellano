const path = require('path');
const { Invoice } = require('../db.js');
const { generateInvoicePdf } = require('../utils/invoicePdf.js');

function dbg(...args) {
  // eslint-disable-next-line no-console
  console.log('[billing]', new Date().toISOString(), ...args);
}

function formatInvoiceNumber(num) {
  return String(num).padStart(6, '0');
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

module.exports = async (req, res) => {
  dbg('POST /invoices/generate start');
  try {
    const { customerName, invoiceDate, items } = req.body;
    dbg('payload headers ok', {
      customerName,
      invoiceDate,
      itemsCount: Array.isArray(items) ? items.length : 'invalid',
    });

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ error: 'customerName es obligatorio' });
    }
    if (!invoiceDate) {
      return res.status(400).json({ error: 'invoiceDate es obligatorio' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debe agregar al menos un item' });
    }

    const normalizedItems = items.map((it, index) => {
      const name = String(it.name || '').trim();
      const quantity = toNumber(it.quantity);
      const price = toNumber(it.price);
      if (!name) throw new Error(`Item #${index + 1} sin nombre`);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error(`Item #${index + 1} con cantidad inválida`);
      if (!Number.isFinite(price) || price < 0) throw new Error(`Item #${index + 1} con precio inválido`);
      const subtotal = Number((quantity * price).toFixed(2));
      return {
        name,
        quantity: Number(quantity),
        price: Number(price.toFixed(2)),
        subtotal,
      };
    });

    const total = Number(
      normalizedItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
    );

    const count = await Invoice.count();
    const invoiceNumber = formatInvoiceNumber(count + 1);
    dbg('invoice number generated', invoiceNumber);

    const customer = String(customerName).trim();
    const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;

    const pdfPath = await generateInvoicePdf({
      fileName,
      invoiceNumber,
      customerName: customer,
      invoiceDate,
      items: normalizedItems,
      total,
    });
    dbg('pdf generated', pdfPath);

    const created = await Invoice.create({
      invoiceNumber,
      customerName: customer,
      invoiceDate,
      total,
      items: normalizedItems,
      pdfPath: `/uploads/invoices/${encodeURIComponent(path.basename(fileName))}`,
    });
    dbg('invoice saved', created.id);

    return res.status(201).json({
      invoice: {
        id: created.id,
        invoiceNumber: created.invoiceNumber,
        customerName: created.customerName,
        invoiceDate: created.invoiceDate,
        total: Number(created.total),
        items: created.items,
        pdfUrl: created.pdfPath,
      },
    });
  } catch (error) {
    dbg('POST /invoices/generate ERROR', error.message);
    return res.status(500).json({ error: error.message });
  }
};
