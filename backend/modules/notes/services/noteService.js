/**
 * Service to handle Supabase interactions for Notes
 */

const getNotesByNotebookId = async (supabase, notebookId, { page = 1, limit = 12, categoryId, search } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('notes')
    .select('*, note_categories(*)', { count: 'exact' })
    .eq('notebook_id', notebookId);

  if (categoryId !== undefined && categoryId !== null && categoryId !== 'All') {
    if (categoryId === 'null') {
      query = query.is('category_id', null);
    } else {
      query = query.eq('category_id', categoryId);
    }
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  
  // Get all unique category IDs for this notebook (ignoring pagination and filters)
  const { data: catData, error: catError } = await supabase
    .from('notes')
    .select('category_id')
    .eq('notebook_id', notebookId);
    
  if (catError) throw catError;
  
  const usedCategoryIds = [...new Set(catData.map(n => n.category_id))];

  return {
    data,
    count,
    page: parseInt(page),
    limit: parseInt(limit),
    usedCategoryIds
  };
};

const createNote = async (supabase, userId, { notebookId, title, content, categoryId }) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      { 
        notebook_id: notebookId,
        title, 
        content,
        user_id: userId,
        category_id: categoryId || null
      }
    ])
    .select('*, note_categories(*)')
    .single();

  if (error) throw error;
  return data;
};


const updateNote = async (supabase, id, { title, content, categoryId, is_pinned }) => {
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (categoryId !== undefined) updates.category_id = categoryId || null;
  if (is_pinned !== undefined) updates.is_pinned = is_pinned;

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select('*, note_categories(*)')
    .single();

  if (error) throw error;
  return data;
};

const deleteNote = async (supabase, id) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
};

module.exports = {
  getNotesByNotebookId,
  createNote,
  updateNote,
  deleteNote
};
