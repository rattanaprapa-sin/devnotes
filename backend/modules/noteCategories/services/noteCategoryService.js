/**
 * Service to handle Supabase interactions for Note Categories
 */

const getCategories = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('note_categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

const createCategory = async (supabase, userId, { name, color, icon }) => {
  const { data, error } = await supabase
    .from('note_categories')
    .insert([
      { 
        user_id: userId,
        name, 
        color: color || '#6c757d',
        icon: icon || 'bi-tag'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateCategory = async (supabase, id, { name, color, icon }) => {
  const { data, error } = await supabase
    .from('note_categories')
    .update({ 
      name, 
      color,
      icon
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteCategory = async (supabase, id) => {
  const { error } = await supabase
    .from('note_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

const reorderCategories = async (supabase, userId, categoryOrders) => {
  // Validate input
  if (!Array.isArray(categoryOrders)) {
    throw new Error('Invalid input format');
  }

  // Use a transaction-like approach with multiple promises
  const updates = categoryOrders.map(cat => 
    supabase
      .from('note_categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', cat.id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(updates);
  
  // Check if any update failed
  const failed = results.find(r => r.error);
  if (failed) {
    console.error('Error reordering note categories:', failed.error);
    throw new Error('Failed to reorder categories');
  }

  return { success: true };
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
