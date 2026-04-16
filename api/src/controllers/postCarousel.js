const path = require('path');
const {
  readManifest,
  writeManifest,
  kindFromMime,
  publicUrl,
} = require('../utils/carouselStore.js');

function dbg(...args) {
  // eslint-disable-next-line no-console
  console.log('[carousel:upload]', new Date().toISOString(), ...args);
}

module.exports = async (req, res) => {
  dbg('postCarousel: start');
  try {
    if (!req.file) {
      dbg('postCarousel: abort — no req.file (campo "file")');
      return res.status(400).json({ error: 'Se requiere un archivo (campo file)' });
    }

    const { originalname, mimetype, size, filename } = req.file;
    dbg('postCarousel: archivo recibido', {
      originalname,
      mimetype,
      size,
      storedAs: filename,
    });

    const kind = kindFromMime(req.file.mimetype);
    if (!kind) {
      dbg('postCarousel: abort — mimetype no permitido', mimetype);
      return res.status(400).json({ error: 'Solo se permiten imágenes o videos' });
    }

    const fileName = req.file.filename;
    const id = path.basename(fileName, path.extname(fileName));

    dbg('postCarousel: leyendo manifiesto…');
    const items = await readManifest();
    const addedAt = new Date().toISOString();
    const entry = { id, fileName, kind, addedAt };

    items.push(entry);
    items.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));

    dbg('postCarousel: guardando manifiesto, total ítems:', items.length);
    await writeManifest(items);

    dbg('postCarousel: ok', { id, kind, publicUrl: publicUrl(fileName) });

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
    dbg('postCarousel: error', error.message);
    return res.status(500).json({ error: error.message });
  }
};
