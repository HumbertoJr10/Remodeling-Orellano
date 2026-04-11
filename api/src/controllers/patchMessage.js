const { Message } = require('../db.js');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const { view } = req.body;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (typeof view !== 'boolean') {
      return res.status(400).json({ error: 'view must be a boolean' });
    }

    await message.update({ view });
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
