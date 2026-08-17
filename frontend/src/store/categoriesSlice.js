import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getNotebookCategories, 
  createNotebookCategory as createNbCategoryApi,
  updateNotebookCategory as updateNbCategoryApi,
  deleteNotebookCategory as deleteNbCategoryApi,
  reorderNotebookCategories as reorderNbCategoriesApi,
  getNoteCategories,
  createNoteCategory as createNtCategoryApi,
  updateNoteCategory as updateNtCategoryApi,
  deleteNoteCategory as deleteNtCategoryApi,
  reorderNoteCategories as reorderNtCategoriesApi
} from '../storage/api';

export const fetchNotebookCategories = createAsyncThunk(
  'categories/fetchNotebookCategories',
  async () => {
    const response = await getNotebookCategories();
    return response;
  }
);

export const fetchNoteCategories = createAsyncThunk(
  'categories/fetchNoteCategories',
  async () => {
    const response = await getNoteCategories();
    return response;
  }
);

// Notebook Categories CRUD
export const addNotebookCategory = createAsyncThunk(
  'categories/addNotebookCategory',
  async (data) => await createNbCategoryApi(data)
);

export const editNotebookCategory = createAsyncThunk(
  'categories/editNotebookCategory',
  async ({ id, data }) => await updateNbCategoryApi(id, data)
);

export const removeNotebookCategory = createAsyncThunk(
  'categories/removeNotebookCategory',
  async (id) => {
    await deleteNbCategoryApi(id);
    return id;
  }
);

export const updateNotebookCategoryOrder = createAsyncThunk(
  'categories/updateNotebookCategoryOrder',
  async (categoryOrders) => await reorderNbCategoriesApi(categoryOrders)
);

// Note Categories CRUD
export const addNoteCategory = createAsyncThunk(
  'categories/addNoteCategory',
  async (data) => await createNtCategoryApi(data)
);

export const editNoteCategory = createAsyncThunk(
  'categories/editNoteCategory',
  async ({ id, data }) => await updateNtCategoryApi(id, data)
);

export const removeNoteCategory = createAsyncThunk(
  'categories/removeNoteCategory',
  async (id) => {
    await deleteNtCategoryApi(id);
    return id;
  }
);

export const updateNoteCategoryOrder = createAsyncThunk(
  'categories/updateNoteCategoryOrder',
  async (categoryOrders) => await reorderNtCategoriesApi(categoryOrders)
);

const initialState = {
  notebookCategories: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  noteCategories: {
    items: [],
    status: 'idle',
    error: null,
  }
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Notebook Categories
      .addCase(fetchNotebookCategories.pending, (state) => {
        state.notebookCategories.status = 'loading';
      })
      .addCase(fetchNotebookCategories.fulfilled, (state, action) => {
        state.notebookCategories.status = 'succeeded';
        state.notebookCategories.items = action.payload || [];
        state.notebookCategories.error = null;
      })
      .addCase(fetchNotebookCategories.rejected, (state, action) => {
        state.notebookCategories.status = 'failed';
        state.notebookCategories.error = action.error.message;
      })
      // Note Categories
      .addCase(fetchNoteCategories.pending, (state) => {
        state.noteCategories.status = 'loading';
      })
      .addCase(fetchNoteCategories.fulfilled, (state, action) => {
        state.noteCategories.status = 'succeeded';
        state.noteCategories.items = action.payload || [];
        state.noteCategories.error = null;
      })
      .addCase(fetchNoteCategories.rejected, (state, action) => {
        state.noteCategories.status = 'failed';
        state.noteCategories.error = action.error.message;
      })
      // Notebook Categories CRUD
      .addCase(addNotebookCategory.fulfilled, (state, action) => {
        if (action.payload) {
          state.notebookCategories.items.push(action.payload);
        }
      })
      .addCase(editNotebookCategory.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.notebookCategories.items.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.notebookCategories.items[index] = action.payload;
          }
        }
      })
      .addCase(removeNotebookCategory.fulfilled, (state, action) => {
        state.notebookCategories.items = state.notebookCategories.items.filter(c => c.id !== action.payload);
      })
      // Note Categories CRUD
      .addCase(addNoteCategory.fulfilled, (state, action) => {
        if (action.payload) {
          state.noteCategories.items.push(action.payload);
        }
      })
      .addCase(editNoteCategory.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.noteCategories.items.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.noteCategories.items[index] = action.payload;
          }
        }
      })
      .addCase(removeNoteCategory.fulfilled, (state, action) => {
        state.noteCategories.items = state.noteCategories.items.filter(c => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
