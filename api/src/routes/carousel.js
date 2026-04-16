const { Router } = require('express');
const multer = require('multer');
const getCarousel = require('../controllers/getCarousel.js');
const postCarousel = require('../controllers/postCarousel.js');
const deleteCarouselItem = require('../controllers/deleteCarouselItem.js');
const { buildMulterStorage, kindFromMime } = require('../utils/carouselStore.js');

const router = Router();

const storage = buildMulterStorage();

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!kindFromMime(file.mimetype)) {
      cb(new Error('Solo imágenes o videos'));
      return;
    }
    cb(null, true);
  },
});

router.get('/', getCarousel);

router.post('/', (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('[carousel:upload]', new Date().toISOString(), 'multer: inicio recepción');
  upload.single('file')(req, res, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('[carousel:upload]', new Date().toISOString(), 'multer: error', err.message);
      return res.status(400).json({
        error: err.message || 'Error al subir el archivo',
      });
    }
    const f = req.file;
    // eslint-disable-next-line no-console
    console.log(
      '[carousel:upload]',
      new Date().toISOString(),
      'multer: archivo en disco',
      f ? { name: f.filename, bytes: f.size, mime: f.mimetype } : 'sin archivo',
    );
    return next();
  });
}, postCarousel);

router.delete('/:id', deleteCarouselItem);

module.exports = router;
