const { Invoice } = require('../db.js');

module.exports = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
