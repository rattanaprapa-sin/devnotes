/**
 * Service to handle Supabase interactions for Note Categories
 */

const getCategories = async (supabase, userId, notebookId) => {
  const { data, error } = await supabase
    .from('note_categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  const allCategories = data || [];

  if (!notebookId) {
    return allCategories;
  }

  const notebookTag = `nb:${notebookId}`;

  // Fetch category_ids actually used by notes in this notebook
  const { data: noteRows, error: noteErr } = await supabase
    .from('notes')
    .select('category_id')
    .eq('notebook_id', notebookId);

  if (noteErr) throw noteErr;

  const usedCategoryIds = new Set(
    (noteRows || []).map((n) => n.category_id).filter(Boolean)
  );

  // Lazily bind legacy categories (without 'nb:' prefix) that are used in this notebook
  const legacyToBind = allCategories.filter(
    (cat) =>
      (!cat.icon || (!cat.icon.startsWith('nb:') && cat.icon !== 'hidden' && !cat.icon.endsWith(':hidden'))) &&
      usedCategoryIds.has(cat.id)
  );

  if (legacyToBind.length > 0) {
    await Promise.all(
      legacyToBind.map((cat) =>
        supabase
          .from('note_categories')
          .update({ icon: notebookTag })
          .eq('id', cat.id)
          .eq('user_id', userId)
      )
    );
    legacyToBind.forEach((cat) => {
      cat.icon = notebookTag;
    });
  }

  return allCategories.filter(
    (cat) =>
      cat.icon === notebookTag ||
      cat.icon === `${notebookTag}:hidden` ||
      usedCategoryIds.has(cat.id)
  );
};

const createCategory = async (supabase, userId, { name, color, icon, notebookId }) => {
  const resolvedIcon = notebookId
    ? `nb:${notebookId}`
    : icon || 'bi-tag';

  const { data, error } = await supabase
    .from('note_categories')
    .insert([
      {
        user_id: userId,
        name,
        color: color || '#6c757d',
        icon: resolvedIcon,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateCategory = async (supabase, id, { name, color, icon }) => {
  const updates = { name, color };
  if (icon !== undefined) {
    updates.icon = icon;
  }

  const { data, error } = await supabase
    .from('note_categories')
    .update(updates)
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
  const updates = categoryOrders.map((cat) =>
    supabase
      .from('note_categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', cat.id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(updates);

  // Check if any update failed
  const failed = results.find((r) => r.error);
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
  reorderCategories,
};
