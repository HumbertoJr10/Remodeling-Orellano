const { Invoice } = require('../db.js');
const { regenerateInvoicePdf } = require('../utils/invoicePdf.js');

function dbg(...args) {
  // eslint-disable-next-line no-console
  console.log('[billing:regenerate-all]', new Date().toISOString(), ...args);
}

module.exports = async (req, res) => {
  dbg('POST /invoices/regenerate-all start');
  try {
    const invoices = await Invoice.findAll({ order: [['createdAt', 'ASC']] });
    dbg('invoices to process', invoices.length);

    const failed = [];
    let ok = 0;

    for (const inv of invoices) {
      try {
        await regenerateInvoicePdf(inv);
        ok += 1;
        dbg('ok', inv.invoiceNumber);
      } catch (err) {
        dbg('fail', inv.invoiceNumber, err.message);
        failed.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      message: 'Regeneración completada',
      processed: invoices.length,
      ok,
      failed,
    });
  } catch (error) {
    dbg('ERROR', error.message);
    return res.status(500).json({ error: error.message });
  }
};
