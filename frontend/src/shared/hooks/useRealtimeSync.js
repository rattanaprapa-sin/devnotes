import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../config/supabase';
import { fetchNotebooks } from '../../store/notebooksSlice';
import { fetchNotebookDetails } from '../../store/notesSlice';
import { useAuth } from '../../contexts/AuthContext';

export default function useRealtimeSync() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Safely get currentNotebook ID if it exists
  const currentNotebookId = useSelector(state => state.notes.currentNotebook?.id);
  
  // Get current pagination states to preserve the user's view
  const notebooksPage = useSelector(state => state.notebooks.pagination?.currentPage || 1);
  const notebooksLimit = useSelector(state => state.notebooks.pagination?.limit || 12);
  const notesPage = useSelector(state => state.notes.pagination?.currentPage || 1);
  const notesLimit = useSelector(state => state.notes.pagination?.limit || 12);

  useEffect(() => {
    // Only subscribe to realtime events if the user is logged in
    if (!user) return;

    // Create a single channel for listening to all table changes
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notebooks' },
        () => {
          // Whenever notebooks table changes, refetch notebooks list globally
          dispatch(fetchNotebooks({ page: notebooksPage, limit: notebooksLimit }));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          // Refetch notebooks globally to update note counts on the Home page
          dispatch(fetchNotebooks({ page: notebooksPage, limit: notebooksLimit }));
          
          // Determine which notebook this note belongs to
          const relevantNotebookId = payload.new?.notebook_id || payload.old?.notebook_id;
          
          // If the user is currently viewing the notebook that this note belongs to, refetch the details
          if (currentNotebookId && relevantNotebookId === currentNotebookId) {
            dispatch(fetchNotebookDetails({ notebookId: currentNotebookId, page: notesPage, limit: notesLimit }));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when user/currentNotebookId changes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dispatch, user, currentNotebookId, notebooksPage, notebooksLimit, notesPage, notesLimit]);
}
