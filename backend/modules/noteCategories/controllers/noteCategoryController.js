const noteCategoryService = require('../services/noteCategoryService');

const getCategories = async (req, res) => {
  try {
    let categories = await noteCategoryService.getCategories(req.supabase, req.user.id);
    
    // Auto-seed default note categories for new users
    if (categories.length === 0 && !req.user.user_metadata?.has_seeded_note_categories) {
      const defaultCategories = [
        { name: 'Personal', color: '#8b5cf6', icon: 'bi-person' },
        { name: 'Work', color: '#0ea5e9', icon: 'bi-briefcase' },
        { name: 'Ideas', color: '#f43f5e', icon: 'bi-lightbulb' }
      ];
      
      for (const cat of defaultCategories) {
        const newCat = await noteCategoryService.createCategory(req.supabase, req.user.id, cat);
        categories.push(newCat);
      }
      
      // Mark as seeded so we don't do it again
      await req.supabase.auth.updateUser({
        data: { has_seeded_note_categories: true }
      });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const category = await noteCategoryService.createCategory(req.supabase, req.user.id, { name, color, icon });
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

    const category = await noteCategoryService.updateCategory(req.supabase, id, { name, color, icon });
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
    const result = await noteCategoryService.reorderCategories(req.supabase, req.user.id, categoryOrders);
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
  reorderCategories
};
