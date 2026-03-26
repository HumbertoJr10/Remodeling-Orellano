const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const recipes = require('./recipes.js');
const diets = require('./diets.js');
const messages = require('./messages.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.use('/recipes', recipes);
router.use('/diets', diets);
router.use('/messages', messages);


module.exports = router;
