const fs = require('fs').promises;
const path = require('path');
const { Invoice } = require('../db.js');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (invoice.pdfPath) {
      const fileName = decodeURIComponent(path.basename(invoice.pdfPath));
      const filePath = path.join(__dirname, '../../uploads/invoices', fileName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }

    await invoice.destroy();
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
