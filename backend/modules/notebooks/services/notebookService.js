/**
 * Service to handle Supabase interactions for Notebooks
 */

const getNotebooks = async (supabase) => {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*, notes(count)')
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Format response to include noteCount
  return data.map(nb => ({
    ...nb,
    title: nb.tool_name, // Map tool_name to title for frontend
    noteCount: nb.notes[0]?.count || 0
  }));
};

const getNotebookById = async (supabase, id) => {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const createNotebook = async (supabase, userId, { title, category, description }) => {
  const { data, error } = await supabase
    .from('notebooks')
    .insert([
      { 
        tool_name: title,
        category, 
        description,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const togglePinNotebook = async (supabase, id, isPinned) => {
  const { data, error } = await supabase
    .from('notebooks')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  data.title = data.tool_name;
  return data;
};

const updateNotebook = async (supabase, id, { title, category, description }) => {
  const { data, error } = await supabase
    .from('notebooks')
    .update({ 
      tool_name: title,
      category, 
      description 
    })
    .eq('id', id)
    .select()
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
  togglePinNotebook,
  updateNotebook,
  deleteNotebook
};
