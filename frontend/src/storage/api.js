import { supabase } from '../config/supabase';

// Use environment variable if available (for production), otherwise fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let cachedToken = null;

// Listen for auth changes to instantly cache the token in memory
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    cachedToken = session.access_token;
  } else {
    cachedToken = null;
  }
});

const getHeaders = async (additionalHeaders = {}) => {
  const headers = {
    ...additionalHeaders,
  };
  
  if (cachedToken) {
    // Instant sync token!
    headers['Authorization'] = `Bearer ${cachedToken}`;
  } else {
    // Fallback if listener hasn't fired yet
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      cachedToken = session.access_token;
      headers['Authorization'] = `Bearer ${cachedToken}`;
    }
  }
  
  return headers;
};

export const getNotebooks = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notebooks`, { headers });
  if (!response.ok) throw new Error('Failed to fetch notebooks');
  const json = await response.json();
  return json.data;
};

export const createNotebook = async (data) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notebooks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create notebook');
  const json = await response.json();
  return json.data;
};

export const togglePinNotebook = async (id, isPinned) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notebooks/${id}/pin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ is_pinned: isPinned }),
  });
  if (!response.ok) throw new Error('Failed to toggle pin');
  const json = await response.json();
  return json.data;
};

export const updateNotebook = async (id, data) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notebooks/${id}/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update notebook');
  const json = await response.json();
  return json.data;
};

export const deleteNotebookApi = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notebooks/${id}/delete`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete notebook');
  const json = await response.json();
  return json.data;
};

export const getNotebook = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notebooks/${id}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch notebook');
  const json = await response.json();
  return json.data;
};

export const getNotes = async (notebookId) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notes/notebook/${notebookId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch notes');
  const json = await response.json();
  return json.data;
};

export const createNote = async (data) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create note');
  const json = await response.json();
  return json.data;
};

export const updateNote = async (id, data) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notes/${id}/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update note');
  const json = await response.json();
  return json.data;
};

export const deleteNoteApi = async (id) => {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/notes/${id}/delete`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete note');
  const json = await response.json();
  return json.data;
};
export const togglePinNote = async (id, isPinned) => {
  const headers = await getHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_URL}/notes/${id}/pin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ is_pinned: isPinned }),
  });
  if (!response.ok) throw new Error('Failed to toggle note pin');
  const json = await response.json();
  return json.data;
};
