const notebookCategoryService = require('../services/notebookCategoryService');

const getCategories = async (req, res, next) => {
  try {
    let categories = await notebookCategoryService.getCategories(req.supabase, req.user.id);
    
    // Auto-seed default categories for new users
    if (categories.length === 0 && !req.user.user_metadata?.has_seeded_notebook_categories) {
      const defaultCategories = [
        { name: 'Frontend', color: '#4f46e5', icon: 'bi-window' },
        { name: 'Backend', color: '#10b981', icon: 'bi-server' },
        { name: 'Database', color: '#ef4444', icon: 'bi-database' },
        { name: 'Tooling', color: '#f59e0b', icon: 'bi-tools' },
        { name: 'Other', color: '#6b7280', icon: 'bi-tag' }
      ];
      
      for (const cat of defaultCategories) {
        const newCat = await notebookCategoryService.createCategory(req.supabase, req.user.id, cat);
        categories.push(newCat);
      }
      
      // Mark as seeded so we don't do it again even if they delete all categories
      await req.supabase.auth.updateUser({
        data: { has_seeded_notebook_categories: true }
      });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const category = await notebookCategoryService.createCategory(req.supabase, req.user.id, { name, color, icon });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const category = await notebookCategoryService.updateCategory(req.supabase, id, { name, color, icon });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notebookCategoryService.deleteCategory(req.supabase, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const reorderCategories = async (req, res, next) => {
  try {
    const { categoryOrders } = req.body;
    if (!categoryOrders || !Array.isArray(categoryOrders)) {
      return res.status(400).json({ error: 'categoryOrders array is required' });
    }
    const result = await notebookCategoryService.reorderCategories(req.supabase, req.user.id, categoryOrders);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
