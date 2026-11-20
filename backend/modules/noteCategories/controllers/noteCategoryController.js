const noteCategoryService = require('../services/noteCategoryService');

const getCategories = async (req, res) => {
  try {
    const { notebookId } = req.query;
    const categories = await noteCategoryService.getCategories(
      req.supabase,
      req.user.id,
      notebookId
    );

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, color, icon, notebookId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await noteCategoryService.createCategory(
      req.supabase,
      req.user.id,
      { name, color, icon, notebookId }
    );
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = await noteCategoryService.updateCategory(
      req.supabase,
      id,
      { name, color, icon }
    );
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await noteCategoryService.deleteCategory(req.supabase, id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({ error: 'Invalid input format' });
    }
    const result = await noteCategoryService.reorderCategories(
      req.supabase,
      req.user.id,
      categoryOrders
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
