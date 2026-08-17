/**
 * Service to handle Supabase interactions for Notebooks
 */

const getNotebooks = async (supabase, userId, { page = 1, limit = 12, categoryId, search } = {}) => {
  const { data, error } = await supabase.rpc('get_notebooks', {
    p_user_id: userId,
    p_page: parseInt(page),
    p_limit: parseInt(limit),
    p_category_id: categoryId !== undefined && categoryId !== 'All' ? (categoryId || 'null') : null,
    p_search: search || null
  });

  if (error) throw error;

  // RPC returns JSON directly — parse if needed
  const result = typeof data === 'string' ? JSON.parse(data) : data;

  // Map notebook_categories fields back to the shape the rest of the code expects
  const formattedData = (result.data || []).map(nb => ({
    ...nb,
    title: nb.tool_name,
    noteCount: nb.note_count || 0,
    notebook_categories: nb.cat_id ? {
      id: nb.cat_id,
      name: nb.cat_name,
      color: nb.cat_color
    } : null
  }));

  // Get all unique category IDs and legacy string categories used by this user's notebooks
  const { data: catData, error: catError } = await supabase
    .from('notebooks')
    .select('category_id, category')
    .eq('user_id', userId);
    
  if (catError) throw catError;
  
  const usedCategoryIds = [...new Set(catData.map(n => n.category_id).filter(id => id))];
  const usedCategoryStrings = [...new Set(catData.map(n => n.category).filter(c => c))];

  return {
    data: formattedData,
    count: result.count,
    page: result.page,
    limit: result.limit,
    usedCategoryIds,
    usedCategoryStrings
  };
};

const getNotebookById = async (supabase, id) => {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*, notebook_categories(*)')
    .eq('id', id)
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const createNotebook = async (supabase, userId, { title, category, categoryId, description }) => {
  // Check for duplicate tool_name (case-insensitive)
  const { data: existing } = await supabase
    .from('notebooks')
    .select('id')
    .ilike('tool_name', title)
    .single();

  if (existing) {
    const error = new Error(`Notebook "${title}" already exists`);
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from('notebooks')
    .insert([
      { 
        tool_name: title,
        category,
        category_id: categoryId || null,
        description,
        user_id: userId
      }
    ])
    .select('*, notebook_categories(*)')
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const updateNotebook = async (supabase, id, { title, category, categoryId, description, is_pinned }) => {
  // Check for duplicate tool_name (case-insensitive) excluding the current notebook
  if (title) {
    const { data: existing } = await supabase
      .from('notebooks')
      .select('id')
      .ilike('tool_name', title)
      .neq('id', id)
      .single();

    if (existing) {
      const error = new Error(`Notebook "${title}" already exists`);
      error.statusCode = 400;
      throw error;
    }
  }

  const updates = {};
  if (title !== undefined) updates.tool_name = title;
  if (category !== undefined) updates.category = category;
  if (categoryId !== undefined) updates.category_id = categoryId || null;
  if (description !== undefined) updates.description = description;
  if (is_pinned !== undefined) updates.is_pinned = is_pinned;

  const { data, error } = await supabase
    .from('notebooks')
    .update(updates)
    .eq('id', id)
    .select('*, notebook_categories(*)')
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const deleteNotebook = async (supabase, id) => {
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

module.exports = {
  getNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook
};
