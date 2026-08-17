import axiosClient from './axiosClient';

export const getNotebooks = async ({ page = 1, limit = 12, categoryId, search } = {}) => {
  let url = `/notebooks?page=${page}&limit=${limit}`;
  if (categoryId !== undefined && categoryId !== 'All') {
    url += `&categoryId=${categoryId === null ? 'null' : encodeURIComponent(categoryId)}`;
  }
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await axiosClient.get(url);
  return response.data; // Now returns { data, count, page, limit }
};

export const createNotebook = async (data) => {
  const response = await axiosClient.post(`/notebooks`, data);
  return response.data;
};

export const updateNotebook = async (id, data) => {
  const response = await axiosClient.post(`/notebooks/${id}/update`, data);
  return response.data;
};

export const togglePinNotebook = async (id, isPinned) => {
  return updateNotebook(id, { is_pinned: isPinned });
};

export const deleteNotebookApi = async (id) => {
  const response = await axiosClient.post(`/notebooks/${id}/delete`);
  return response.data;
};

export const getNotebook = async (id) => {
  const response = await axiosClient.get(`/notebooks/${id}`);
  return response.data;
};

export const getNotes = async (notebookId, { page = 1, limit = 12, categoryId, search } = {}) => {
  let url = `/notes/notebook/${notebookId}?page=${page}&limit=${limit}`;
  if (categoryId !== undefined && categoryId !== 'All') {
    url += `&categoryId=${categoryId === null ? 'null' : encodeURIComponent(categoryId)}`;
  }
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await axiosClient.get(url);
  return response.data; // Now returns { data, count, page, limit }
};

export const createNote = async (data) => {
  const response = await axiosClient.post(`/notes`, data);
  return response.data;
};

export const updateNote = async (id, data) => {
  const response = await axiosClient.post(`/notes/${id}/update`, data);
  return response.data;
};

export const deleteNoteApi = async (id) => {
  const response = await axiosClient.post(`/notes/${id}/delete`);
  return response.data;
};

export const togglePinNote = async (id, isPinned) => {
  return updateNote(id, { is_pinned: isPinned });
};

// --- Note Categories ---

export const getNoteCategories = async () => {
  return await axiosClient.get(`/note-categories`);
};

export const createNoteCategory = async (data) => {
  return await axiosClient.post(`/note-categories`, data);
};

export const updateNoteCategory = async (id, data) => {
  return await axiosClient.post(`/note-categories/${id}/update`, data);
};

export const deleteNoteCategory = async (id) => {
  return await axiosClient.post(`/note-categories/${id}/delete`);
};

export const reorderNoteCategories = async (categoryOrders) => {
  return await axiosClient.post(`/note-categories/reorder`, { categoryOrders });
};

// --- Notebook Categories ---

export const getNotebookCategories = async () => {
  return await axiosClient.get(`/notebook-categories`);
};

export const createNotebookCategory = async (data) => {
  return await axiosClient.post(`/notebook-categories`, data);
};

export const updateNotebookCategory = async (id, data) => {
  return await axiosClient.post(`/notebook-categories/${id}/update`, data);
};

export const deleteNotebookCategory = async (id) => {
  return await axiosClient.post(`/notebook-categories/${id}/delete`);
};

export const reorderNotebookCategories = async (categoryOrders) => {
  return await axiosClient.post(`/notebook-categories/reorder`, { categoryOrders });
};

// --- Global Search ---
export const globalSearch = async (query) => {
  const response = await axiosClient.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};
