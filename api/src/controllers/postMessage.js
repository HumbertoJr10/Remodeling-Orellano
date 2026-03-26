const { Message } = require('../db.js');

module.exports = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'name, email and message are required',
      });
    }

    const createdMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
    });

    return res.status(201).json(createdMessage);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
