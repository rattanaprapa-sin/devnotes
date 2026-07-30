/**
 * Service to handle Supabase interactions for Notes
 */

const getNotesByNotebookId = async (supabase, notebookId, { page = 1, limit = 12 } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('notebook_id', notebookId)
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  
  return {
    data,
    count,
    page: parseInt(page),
    limit: parseInt(limit)
  };
};

const createNote = async (supabase, userId, { notebookId, title, content }) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      { 
        notebook_id: notebookId,
        title, 
        content,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const togglePinNote = async (supabase, id, isPinned) => {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateNote = async (supabase, id, { title, content }) => {
  const { data, error } = await supabase
    .from('notes')
    .update({ 
      title, 
      content 
    })
    .eq('id', id)
    .select()
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
  togglePinNote,
  updateNote,
  deleteNote
};
