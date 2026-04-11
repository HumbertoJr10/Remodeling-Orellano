const path = require('path');
const {
  readManifest,
  writeManifest,
  kindFromMime,
  publicUrl,
} = require('../utils/carouselStore.js');

module.exports = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere un archivo (campo file)' });
    }

    const kind = kindFromMime(req.file.mimetype);
    if (!kind) {
      return res.status(400).json({ error: 'Solo se permiten imágenes o videos' });
    }

    const fileName = req.file.filename;
    const id = path.basename(fileName, path.extname(fileName));

    const items = await readManifest();
    const addedAt = new Date().toISOString();
    const entry = { id, fileName, kind, addedAt };

    items.push(entry);
    items.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));

    await writeManifest(items);

    return res.status(201).json({
      item: {
        id: entry.id,
        kind: entry.kind,
        fileName: entry.fileName,
        url: publicUrl(entry.fileName),
        addedAt: entry.addedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
