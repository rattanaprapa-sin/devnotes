const globalSearch = async (supabase, userId, query) => {
  if (!query) {
    return { notebooks: [], notes: [] };
  }

  // Search notebooks (limit to 5)
  // Matches tool_name or description
  const { data: notebooks, error: notebooksError } = await supabase
    .from('notebooks')
    .select('*, notebook_categories(*)')
    .eq('user_id', userId)
    .or(`tool_name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(5);

  if (notebooksError) throw notebooksError;

  // Search notes (limit to 5)
  // Matches title or content
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*, note_categories(*), notebooks(tool_name)')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(5);

  if (notesError) throw notesError;

  // Format notebooks as expected by frontend
  const formattedNotebooks = (notebooks || []).map(nb => ({
    ...nb,
    title: nb.tool_name,
    notebook_categories: nb.category_id ? nb.notebook_categories : null
  }));

  const formattedNotes = (notes || []).map(note => ({
    ...note,
    notebook_title: note.notebooks?.tool_name || 'Unknown Notebook'
  }));

  return {
    notebooks: formattedNotebooks,
    notes: formattedNotes
  };
};

module.exports = {
  globalSearch
};
