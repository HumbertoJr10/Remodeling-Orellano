const { Router } = require('express');
const postMessage = require('../controllers/postMessage.js');
const getMessages = require('../controllers/getMessages.js');
const deleteMessage = require('../controllers/deleteMessage.js');
const patchMessage = require('../controllers/patchMessage.js');

const router = Router();

router.get('/', getMessages);
router.post('/', postMessage);
router.patch('/:id', patchMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
