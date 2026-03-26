const { Message } = require('../db.js');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Message.destroy({ where: { id } });

    if (!deletedRows) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
