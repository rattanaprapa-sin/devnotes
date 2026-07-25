const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/notebook/:notebookId', noteController.getNotesByNotebookId);
router.post('/', noteController.createNote);
router.post('/:id/pin', noteController.togglePinNote);
router.post('/:id/update', noteController.updateNote);
router.post('/:id/delete', noteController.deleteNote);

module.exports = router;
