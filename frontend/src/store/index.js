import { configureStore } from '@reduxjs/toolkit';
import notebooksReducer from './notebooksSlice';
import notesReducer from './notesSlice';

export const store = configureStore({
  reducer: {
    notebooks: notebooksReducer,
    notes: notesReducer,
  },
});
