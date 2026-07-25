const express = require('express');
const router = express.Router();
const notebookController = require('../controllers/notebookController');

router.get('/', notebookController.getNotebooks);
router.get('/:id', notebookController.getNotebookById);
router.post('/', notebookController.createNotebook);
router.post('/:id/pin', notebookController.togglePinNotebook);
router.post('/:id/update', notebookController.updateNotebook);
router.post('/:id/delete', notebookController.deleteNotebook);

module.exports = router;
