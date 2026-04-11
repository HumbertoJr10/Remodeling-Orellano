const fs = require('fs').promises;
const path = require('path');
const { readManifest, writeManifest, CAROUSEL_DIR } = require('../utils/carouselStore.js');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readManifest();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    const [removed] = items.splice(index, 1);
    const filePath = path.join(CAROUSEL_DIR, removed.fileName);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    await writeManifest(items);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
