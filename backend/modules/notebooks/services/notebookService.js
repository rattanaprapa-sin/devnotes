/**
 * Service to handle Supabase interactions for Notebooks
 */

const getNotebooks = async (supabase, { page = 1, limit = 12 } = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('notebooks')
    .select('*, notes(count)', { count: 'exact' })
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Format response to include noteCount
  const formattedData = data.map(nb => ({
    ...nb,
    title: nb.tool_name, // Map tool_name to title for frontend
    noteCount: nb.notes[0]?.count || 0
  }));

  return {
    data: formattedData,
    count,
    page: parseInt(page),
    limit: parseInt(limit)
  };
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
  // Check for duplicate tool_name (case-insensitive) excluding the current notebook
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
