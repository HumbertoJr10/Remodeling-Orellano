const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const CAROUSEL_DIR = path.join(UPLOADS_ROOT, 'carousel');
const MANIFEST_PATH = path.join(CAROUSEL_DIR, 'manifest.json');

async function ensureCarouselDir() {
  await fs.mkdir(CAROUSEL_DIR, { recursive: true });
}

async function readManifest() {
  await ensureCarouselDir();
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeManifest(items) {
  await ensureCarouselDir();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(items, null, 2), 'utf8');
}

function publicUrl(fileName) {
  return `/uploads/carousel/${encodeURIComponent(fileName)}`;
}

function kindFromMime(mimetype) {
  if (mimetype && mimetype.startsWith('video/')) return 'video';
  if (mimetype && mimetype.startsWith('image/')) return 'image';
  return null;
}

const ALLOWED_EXT = new Set([
  '.mp4', '.webm', '.mov', '.m4v',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
]);

function isAllowedExt(ext) {
  return ALLOWED_EXT.has(ext.toLowerCase());
}

function buildMulterStorage() {
  const multer = require('multer');
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureCarouselDir()
        .then(() => cb(null, CAROUSEL_DIR))
        .catch(cb);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      if (!isAllowedExt(ext)) {
        cb(new Error('Tipo de archivo no permitido'));
        return;
      }
      const id = randomUUID();
      cb(null, `${id}${ext}`);
    },
  });
}

module.exports = {
  CAROUSEL_DIR,
  MANIFEST_PATH,
  UPLOADS_ROOT,
  ensureCarouselDir,
  readManifest,
  writeManifest,
  publicUrl,
  kindFromMime,
  isAllowedExt,
  buildMulterStorage,
};
