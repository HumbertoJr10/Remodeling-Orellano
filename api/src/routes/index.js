const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const recipes = require('./recipes.js');
const diets = require('./diets.js');
const messages = require('./messages.js');
const carousel = require('./carousel.js');
const invoices = require('./invoices.js');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.use('/recipes', recipes);
router.use('/diets', diets);
router.use('/messages', messages);
router.use('/carousel', carousel);
router.use('/invoices', invoices);

module.exports = router;
