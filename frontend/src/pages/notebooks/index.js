import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchNotebookDetails, clearCurrentNotebook, removeNote, toggleNotePin } from '../../store/notesSlice';
import Header from '../../modules/notebooks/components/Header';
import NoteCard from '../../modules/notes/components/NoteCard';
import AddNoteModal from '../../modules/notes/components/AddNoteModal';
import EditNoteModal from '../../modules/notes/components/EditNoteModal';
import ViewNoteModal from '../../modules/notes/components/ViewNoteModal';
import AddButton from '../../modules/notebooks/components/AddButton';
import SearchBar from '../../modules/notebooks/components/SearchBar';
import SkeletonLayout from '../../shared/components/SkeletonLayout';
import EmptyState from '../../shared/components/EmptyState';
import DeleteConfirmModal from '../../shared/components/DeleteConfirmModal';
import useKeyboardShortcuts from '../../shared/hooks/useKeyboardShortcuts';
import { useTheme } from '../../contexts/ThemeContext';

export default function NotebookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('notesViewMode') || 'grid';
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFlashcardMode, setIsFlashcardMode] = useState(() => {
    return localStorage.getItem('flashcardMode') === 'true';
  });

  useKeyboardShortcuts();

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('notesViewMode', mode);
  };
  
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [noteToView, setNoteToView] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentNotebook: notebook, items: notes, status } = useSelector((state) => state.notes);

  useEffect(() => {
    if (id) {
      dispatch(fetchNotebookDetails(id));
    }
    return () => {
      dispatch(clearCurrentNotebook());
    };
  }, [id, dispatch]);

  const handleNoteAdded = () => {
    dispatch(fetchNotebookDetails(id));
  };

  const handleViewClick = (note) => {
    setNoteToView(note);
    setShowViewModal(true);
  };

  const handleEditClick = (note) => {
    setNoteToEdit(note);
    setShowEditModal(true);
  };

  const handleTogglePin = (note) => {
    dispatch(toggleNotePin({ id: note.id, isPinned: !note.is_pinned }));
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(removeNote(noteToDelete.id)).unwrap();
      setShowDeleteModal(false);
      setNoteToDelete(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <>
        <Header />
        <div className="container pb-5">
          <div className="mt-5 pt-4">
            <SkeletonLayout count={6} />
          </div>
        </div>
      </>
    );
  }

  if (!notebook) {
    return <div className="container py-5 text-center">Notebook not found</div>;
  }

  const filteredNotes = (notes || []).filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="container pb-5">
        <button
        className="btn btn-light rounded-pill text-secondary border shadow-sm mb-4 mt-3 d-inline-flex align-items-center gap-2 px-3 py-2"
        onClick={() => navigate('/')}
        style={{ transition: 'all 0.2s' }}
      >
        <i className="bi bi-arrow-left"></i>
        <span className="fw-medium">Back to Dashboard</span>
      </button>

      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
        <h1 className="fw-bolder display-5 mb-0 text-dark">
          {notebook.title ? notebook.title.charAt(0).toUpperCase() + notebook.title.slice(1) : ''}
        </h1>
        <span className={`badge rounded-pill bg-${notebook.colorContext || 'success'}-subtle text-${notebook.colorContext || 'success'} border border-${notebook.colorContext || 'success'}-subtle px-4 py-2 fs-6 fw-semibold`}>
          {notebook.category}
        </span>
      </div>

      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder={`Search ${notebook.title ? notebook.title.charAt(0).toUpperCase() + notebook.title.slice(1) : ''} notes...`} 
      />

      <div className="row align-items-center mb-0 mb-md-4 gy-2 gy-md-3">
        <div className="col-auto order-1">
          <h5 className="mb-0 text-secondary fw-semibold">
            {filteredNotes.length} Note{filteredNotes.length !== 1 ? 's' : ''}
          </h5>
        </div>
        
        <div className="col-12 col-md-auto order-3 order-md-2 ms-md-auto">
          <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0" title="Hide contents to practice your memory">
            <input 
              className="form-check-input m-0 shadow-sm" 
              type="checkbox" 
              role="switch" 
              id="flashcardSwitch" 
              checked={isFlashcardMode} 
              onChange={(e) => {
                setIsFlashcardMode(e.target.checked);
                localStorage.setItem('flashcardMode', e.target.checked);
              }} 
              style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            />
            <label className="form-check-label fw-semibold text-secondary" htmlFor="flashcardSwitch" style={{ cursor: 'pointer', userSelect: 'none' }}>
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
              Flashcard Mode
            </label>
          </div>
        </div>

        <div className="col-auto order-2 order-md-3 ms-auto ms-md-4">
          <div 
            className={`d-flex shadow-sm border rounded-pill p-1 position-relative ${
              theme === 'dark' ? 'bg-dark border-light border-opacity-10' : 
              theme === 'blue' ? 'bg-white border-primary border-opacity-25' : 
              'bg-white border-light-subtle'
            }`} 
            style={{ width: '160px' }}
          >
            <div 
              className={`rounded-pill position-absolute`} 
              style={{
                top: '4px',
                bottom: '4px',
                left: '4px',
                width: 'calc(50% - 4px)',
                transform: viewMode === 'list' ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s',
                backgroundColor: theme === 'dark' ? '#ffffff' : theme === 'blue' ? 'var(--bs-primary)' : '#212529',
                zIndex: 0
              }}
            ></div>
            <button 
              className={`btn btn-sm rounded-pill flex-grow-1 border-0 ${viewMode === 'list' ? (theme === 'dark' ? 'text-black fw-bold' : 'text-white fw-bold') : 'text-secondary'}`}
              onClick={() => handleViewModeChange('list')}
              style={{ transition: 'color 0.3s', zIndex: 1, padding: '0.25rem 0' }}
            >
              <i className="bi bi-list me-1"></i> List
            </button>
            <button 
              className={`btn btn-sm rounded-pill flex-grow-1 border-0 ${viewMode === 'grid' ? (theme === 'dark' ? 'text-black fw-bold' : 'text-white fw-bold') : 'text-secondary'}`}
              onClick={() => handleViewModeChange('grid')}
              style={{ transition: 'color 0.3s', zIndex: 1, padding: '0.25rem 0' }}
            >
              <i className="bi bi-grid me-1"></i> Grid
            </button>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        {(() => {
          if (notes.length === 0) {
            return (
              <EmptyState
                title="No notes found"
                description="Create a new note to start organizing your knowledge."
                icon="bi-box2-heart-fill"
                actionLabel="Create Note"
                onAction={() => setShowAddModal(true)}
              />
            );
          }
          
          if (filteredNotes.length === 0) {
            return (
              <div className="col-12">
                <EmptyState 
                  title="No notes match your search"
                  description="Try using different keywords"
                  icon="bi-search"
                />
              </div>
            );
          }
          
          return (
            <div className="row g-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className={viewMode === 'grid' ? 'col-12 col-md-6 col-lg-4' : 'col-12'}>
                  <NoteCard
                    title={note.title}
                    content={note.content}
                    date={new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    isPinned={note.is_pinned}
                    isFlashcardMode={isFlashcardMode}
                    onTogglePin={() => handleTogglePin(note)}
                    onEdit={() => handleEditClick(note)}
                    onDelete={() => handleDeleteClick(note)}
                    onClick={() => handleViewClick(note)}
                  />
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {notes.length > 0 && (
        <AddButton onClick={() => setShowAddModal(true)} label="New Note" />
      )}
      
      <AddNoteModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        notebookId={notebook.id}
        onNoteAdded={handleNoteAdded}
      />
      
      <EditNoteModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        noteData={noteToEdit}
      />
      
      <ViewNoteModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        noteData={noteToView}
        isFlashcardMode={isFlashcardMode}
        hasPrev={noteToView && filteredNotes.findIndex(n => n.id === noteToView.id) > 0}
        hasNext={noteToView && filteredNotes.findIndex(n => n.id === noteToView.id) < filteredNotes.length - 1}
        onPrev={() => {
          const idx = filteredNotes.findIndex(n => n.id === noteToView.id);
          if (idx > 0) setNoteToView(filteredNotes[idx - 1]);
        }}
        onNext={() => {
          const idx = filteredNotes.findIndex(n => n.id === noteToView.id);
          if (idx < filteredNotes.length - 1) setNoteToView(filteredNotes[idx + 1]);
        }}
      />
      
      <DeleteConfirmModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleConfirmDelete}
        title="Delete Note?"
        message={`Are you sure you want to delete "${noteToDelete?.title ? noteToDelete.title.charAt(0).toUpperCase() + noteToDelete.title.slice(1) : 'this note'}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
      </div>
    </>
  );
}
