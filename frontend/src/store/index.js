import { configureStore } from '@reduxjs/toolkit';
import notebooksReducer from './notebooksSlice';
import notesReducer from './notesSlice';
import categoriesReducer from './categoriesSlice';

export const store = configureStore({
  reducer: {
    notebooks: notebooksReducer,
    notes: notesReducer,
    categories: categoriesReducer,
  },
});
