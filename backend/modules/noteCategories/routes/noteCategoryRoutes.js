const express = require('express');
const router = express.Router();
const noteCategoryController = require('../controllers/noteCategoryController');

router.get('/', noteCategoryController.getCategories);
router.post('/', noteCategoryController.createCategory);
router.post('/reorder', noteCategoryController.reorderCategories);
router.post('/:id/update', noteCategoryController.updateCategory);
router.post('/:id/delete', noteCategoryController.deleteCategory);

module.exports = router;
