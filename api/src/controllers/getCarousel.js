const { readManifest, publicUrl } = require('../utils/carouselStore.js');

module.exports = async (req, res) => {
  try {
    const items = await readManifest();
    const payload = items.map((item) => ({
      id: item.id,
      kind: item.kind,
      fileName: item.fileName,
      url: publicUrl(item.fileName),
      addedAt: item.addedAt,
    }));
    return res.status(200).json({ items: payload });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
