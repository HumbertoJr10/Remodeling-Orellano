const { Router } = require('express');
const getInvoices = require('../controllers/getInvoices.js');
const postInvoice = require('../controllers/postInvoice.js');
const postRegenerateAllInvoices = require('../controllers/postRegenerateAllInvoices.js');
const deleteInvoice = require('../controllers/deleteInvoice.js');

const router = Router();

router.get('/', getInvoices);
router.post('/generate', postInvoice);
router.post('/regenerate-all', postRegenerateAllInvoices);
router.delete('/:id', deleteInvoice);

module.exports = router;
