import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotebooks, createNotebook as createNotebookApi, togglePinNotebook, updateNotebook, deleteNotebookApi } from '../storage/api';

export const fetchNotebooks = createAsyncThunk(
  'notebooks/fetchNotebooks',
  async () => {
    const response = await getNotebooks();
    return response;
  }
);

export const addNotebook = createAsyncThunk(
  'notebooks/addNotebook',
  async (data) => {
    const response = await createNotebookApi(data);
    return response;
  }
);

export const toggleNotebookPin = createAsyncThunk(
  'notebooks/toggleNotebookPin',
  async ({ id, isPinned }) => {
    const response = await togglePinNotebook(id, isPinned);
    return response;
  }
);

export const editNotebook = createAsyncThunk(
  'notebooks/editNotebook',
  async ({ id, data }) => {
    const response = await updateNotebook(id, data);
    return response;
  }
);

export const removeNotebook = createAsyncThunk(
  'notebooks/removeNotebook',
  async (id) => {
    await deleteNotebookApi(id);
    return id;
  }
);

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotebooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNotebook.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add new notebook to the beginning
      })
      .addCase(toggleNotebookPin.fulfilled, (state, action) => {
        const updatedNotebook = action.payload;
        const index = state.items.findIndex(nb => nb.id === updatedNotebook.id);
        if (index !== -1) {
          state.items[index] = updatedNotebook;
          // Sort items: pinned first, then by created_at (descending)
          state.items.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
          });
        }
      })
      .addCase(editNotebook.fulfilled, (state, action) => {
        const updatedNotebook = action.payload;
        const index = state.items.findIndex(nb => nb.id === updatedNotebook.id);
        if (index !== -1) {
          state.items[index] = updatedNotebook;
        }
      })
      .addCase(removeNotebook.fulfilled, (state, action) => {
        state.items = state.items.filter(nb => nb.id !== action.payload);
      });
  }
});

export default notebooksSlice.reducer;
