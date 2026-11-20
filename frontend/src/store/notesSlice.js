import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotebook, getNotes, createNote as createNoteApi, updateNote, deleteNoteApi, togglePinNote } from '../storage/api';

export const fetchNotebookDetails = createAsyncThunk(
  'notes/fetchNotebookDetails',
  async ({ notebookId, page = 1, limit = 12, categoryId, search }) => {
    const [notebookData, notesResponse] = await Promise.all([
      getNotebook(notebookId),
      getNotes(notebookId, { page, limit, categoryId, search })
    ]);
    return { notebook: notebookData, notes: notesResponse };
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

export const fetchFilteredNotes = createAsyncThunk(
  'notes/fetchFilteredNotes',
  async ({ notebookId, page = 1, limit = 12, categoryId, search }) => {
    const response = await getNotes(notebookId, { page, limit, categoryId, search });
    return response;
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
    usedCategoryIds: [],
    activeCategoryFilter: 'All',
    searchQuery: '',
    status: 'idle',
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 12
    }
  },
  reducers: {
    clearCurrentNotebook: (state) => {
      state.currentNotebook = null;
      state.items = [];
      state.usedCategoryIds = [];
      state.activeCategoryFilter = 'All';
      state.searchQuery = '';
      state.status = 'idle';
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 12
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotebookDetails.pending, (state, action) => {
        state.status = 'loading';
        if (action.meta.arg?.categoryId !== undefined) {
          state.activeCategoryFilter = action.meta.arg.categoryId;
        }
        if (action.meta.arg?.search !== undefined) {
          state.searchQuery = action.meta.arg.search;
        }
      })
      .addCase(fetchNotebookDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentNotebook = action.payload.notebook;
        state.items = action.payload.notes.data;
        state.usedCategoryIds = action.payload.notes.usedCategoryIds || [];
        state.pagination = {
          currentPage: action.payload.notes.page,
          totalPages: Math.ceil(action.payload.notes.count / action.payload.notes.limit) || 1,
          totalItems: action.payload.notes.count,
          limit: action.payload.notes.limit
        };
      })
      .addCase(fetchNotebookDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchFilteredNotes.pending, (state, action) => {
        state.status = 'loading';
        if (action.meta.arg?.categoryId !== undefined) {
          state.activeCategoryFilter = action.meta.arg.categoryId;
        }
        if (action.meta.arg?.search !== undefined) {
          state.searchQuery = action.meta.arg.search;
        }
      })
      .addCase(fetchFilteredNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.usedCategoryIds = action.payload.usedCategoryIds || [];
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: Math.ceil(action.payload.count / action.payload.limit) || 1,
          totalItems: action.payload.count,
          limit: action.payload.limit
        };
      })
      .addCase(fetchFilteredNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        const newNote = action.payload;
        if (newNote.category_id && !state.usedCategoryIds.includes(newNote.category_id)) {
          state.usedCategoryIds.push(newNote.category_id);
        }
        const matchesCategory =
          !state.activeCategoryFilter ||
          state.activeCategoryFilter === 'All' ||
          (state.activeCategoryFilter === 'null' && !newNote.category_id) ||
          newNote.category_id === state.activeCategoryFilter;
        if (matchesCategory) {
          state.items.unshift(newNote);
          state.pagination.totalItems += 1;
        }
      })
      .addCase(editNote.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        if (updatedNote.category_id && !state.usedCategoryIds.includes(updatedNote.category_id)) {
          state.usedCategoryIds.push(updatedNote.category_id);
        }
        const index = state.items.findIndex(note => note.id === updatedNote.id);
        if (index !== -1) {
          const matchesCategory =
            !state.activeCategoryFilter ||
            state.activeCategoryFilter === 'All' ||
            (state.activeCategoryFilter === 'null' && !updatedNote.category_id) ||
            updatedNote.category_id === state.activeCategoryFilter;
          if (matchesCategory) {
            state.items[index] = updatedNote;
          } else {
            state.items.splice(index, 1);
            state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
          }
        }
      })
      .addCase(removeNote.fulfilled, (state, action) => {
        state.items = state.items.filter(note => note.id !== action.payload);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
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
