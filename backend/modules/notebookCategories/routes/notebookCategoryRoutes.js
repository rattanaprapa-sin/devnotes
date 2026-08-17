const express = require('express');
const router = express.Router();
const notebookCategoryController = require('../controllers/notebookCategoryController');

router.get('/', notebookCategoryController.getCategories);
router.post('/', notebookCategoryController.createCategory);
router.post('/reorder', notebookCategoryController.reorderCategories);
router.post('/:id/update', notebookCategoryController.updateCategory);
router.post('/:id/delete', notebookCategoryController.deleteCategory);

module.exports = router;
