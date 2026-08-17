const getCategories = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('notebook_categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

const createCategory = async (supabase, userId, { name, color, icon }) => {
  const { data, error } = await supabase
    .from('notebook_categories')
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
  // We omitted updated_at in the final schema, so just update these
  const { data, error } = await supabase
    .from('notebook_categories')
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
    .from('notebook_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

const reorderCategories = async (supabase, userId, categoryOrders) => {
  const promises = categoryOrders.map((cat) => 
    supabase
      .from('notebook_categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', cat.id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error).map(r => r.error);
  if (errors.length > 0) {
    console.error('Reorder errors:', errors);
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
