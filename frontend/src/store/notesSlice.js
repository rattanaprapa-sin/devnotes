import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotebook, getNotes, createNote as createNoteApi, updateNote, deleteNoteApi, togglePinNote } from '../storage/api';

export const fetchNotebookDetails = createAsyncThunk(
  'notes/fetchNotebookDetails',
  async (notebookId) => {
    const [notebookData, notesData] = await Promise.all([
      getNotebook(notebookId),
      getNotes(notebookId)
    ]);
    return { notebook: notebookData, notes: notesData };
  },
  {
    condition: (arg, { getState }) => {
      const { status } = getState().notes;
      if (status === 'loading') {
        return false;
      }
    }
  }
);

export const addNote = createAsyncThunk(
  'notes/addNote',
  async (data) => {
    const response = await createNoteApi(data);
    return response;
  }
);

export const editNote = createAsyncThunk(
  'notes/editNote',
  async ({ id, data }) => {
    const response = await updateNote(id, data);
    return response;
  }
);

export const removeNote = createAsyncThunk(
  'notes/removeNote',
  async (id) => {
    await deleteNoteApi(id);
    return id;
  }
);

export const toggleNotePin = createAsyncThunk(
  'notes/toggleNotePin',
  async ({ id, isPinned }) => {
    const response = await togglePinNote(id, isPinned);
    return response;
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    currentNotebook: null,
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearCurrentNotebook: (state) => {
      state.currentNotebook = null;
      state.items = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotebookDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotebookDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNotebook = action.payload.notebook;
        state.items = action.payload.notes;
      })
      .addCase(fetchNotebookDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editNote.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        const index = state.items.findIndex(note => note.id === updatedNote.id);
        if (index !== -1) {
          state.items[index] = updatedNote;
        }
      })
      .addCase(removeNote.fulfilled, (state, action) => {
        state.items = state.items.filter(note => note.id !== action.payload);
      })
      .addCase(toggleNotePin.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        const index = state.items.findIndex(note => note.id === updatedNote.id);
        if (index !== -1) {
          state.items[index] = updatedNote;
          // Re-sort array: pinned notes first, then by created_at descending
          state.items.sort((a, b) => {
            if (a.is_pinned === b.is_pinned) {
              return new Date(b.created_at) - new Date(a.created_at);
            }
            return a.is_pinned ? -1 : 1;
          });
        }
      });
  }
});

export const { clearCurrentNotebook } = notesSlice.actions;
export default notesSlice.reducer;
