import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchNotebookDetails, clearCurrentNotebook, removeNote, toggleNotePin, fetchFilteredNotes } from '../../store/notesSlice';
import { fetchNoteCategories } from '../../store/categoriesSlice';
import Header from '../../modules/notebooks/components/Header';
import NoteCard from '../../modules/notes/components/NoteCard';
import AddNoteModal from '../../modules/notes/components/AddNoteModal';
import EditNoteModal from '../../modules/notes/components/EditNoteModal';
import ViewNoteModal from '../../modules/notes/components/ViewNoteModal';
import NoteCategoryManager from '../../modules/notes/components/NoteCategoryManager';
import useHorizontalScroll from '../../shared/hooks/useHorizontalScroll';
import AppButton from '../../shared/ui/AppButton';
import AddButton from '../../modules/notebooks/components/AddButton';
import SearchBar from '../../shared/components/SearchBar';
import SkeletonLayout from '../../shared/components/SkeletonLayout';
import EmptyState from '../../shared/components/EmptyState';
import DeleteConfirmModal from '../../shared/components/DeleteConfirmModal';
import useKeyboardShortcuts from '../../shared/hooks/useKeyboardShortcuts';
import Pagination from '../../shared/components/Pagination';
import { useTheme } from '../../contexts/ThemeContext';
import useModal from '../../shared/hooks/useModal';
import useLocalStorage from '../../shared/hooks/useLocalStorage';

export default function NotebookDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const addModal = useModal(false);
  const editModal = useModal(false);
  const deleteModal = useModal(false);
  const viewModal = useModal(false);
  const categoryManagerModal = useModal(false);
  
  const [viewMode, setViewMode] = useLocalStorage('notesViewMode', 'grid');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const { scrollContainerRef, isDragging, events, hasDragged } = useHorizontalScroll();

  const [animKey, setAnimKey] = useState(0);

  const handleCategoryClick = (catId) => {
    if (hasDragged()) return;
    setActiveCategoryFilter(catId);
    setAnimKey(k => k + 1);
  };
  
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  


  useKeyboardShortcuts();

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [noteToView, setNoteToView] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentNotebook: notebook, items: notes, usedCategoryIds, status, pagination } = useSelector((state) => state.notes);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.categories.noteCategories);

  const descriptionRef = useRef(null);
  const containerRef = useRef(null);
  const [descHeight, setDescHeight] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (!descriptionRef.current || !notebook?.description) return;

    const checkOverflow = () => {
      if (descriptionRef.current) {
        const innerHeight = descriptionRef.current.scrollHeight;
        setDescHeight(innerHeight);
        
        // Calculate the threshold based on 3.6rem
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const threshold = 3.6 * rootFontSize;
        
        // Add a small 2px buffer for rounding discrepancies
        setIsOverflowing(innerHeight > threshold + 2);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(descriptionRef.current);
    
    // Also re-check on window resize in case root font size changes
    window.addEventListener('resize', checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [notebook?.description]);

  useEffect(() => {
    if (id) {
      // Only fetch on mount or when notebook id changes — not on pagination/category changes
      dispatch(fetchNotebookDetails({ notebookId: id, page: 1, limit: 12 }));
    }
    return () => {
      dispatch(clearCurrentNotebook());
    };
  }, [id, dispatch]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (id) {
      const timer = setTimeout(() => {
        dispatch(fetchFilteredNotes({ 
          notebookId: id, 
          page: 1, 
          limit: pagination?.limit || 12, 
          categoryId: activeCategoryFilter, 
          search: searchQuery 
        }));
      }, searchQuery ? 300 : 0);
      return () => clearTimeout(timer);
    }
  }, [id, dispatch, activeCategoryFilter, searchQuery]); // Skip pagination deps to avoid loop

  useEffect(() => {
    if (categoryStatus === 'idle') {
      dispatch(fetchNoteCategories());
    }
  }, [categoryStatus, dispatch]);

  const handlePageChange = (newPage) => {
    if (id) {
      dispatch(fetchFilteredNotes({ 
        notebookId: id, 
        page: newPage, 
        limit: pagination?.limit || 12,
        categoryId: activeCategoryFilter,
        search: searchQuery
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  const handleCategoryUpdate = () => {
    dispatch(fetchNoteCategories());
    if (id) {
      dispatch(fetchNotebookDetails({ notebookId: id, page: pagination?.currentPage || 1, limit: pagination?.limit || 12 }));
    }
  };

  const handleViewClick = (note) => {
    setNoteToView(note);
    viewModal.open();
  };

  const handleEditClick = (note) => {
    setNoteToEdit(note);
    editModal.open();
  };

  const handleTogglePin = (note) => {
    dispatch(toggleNotePin({ id: note.id, isPinned: !note.is_pinned }));
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(removeNote(noteToDelete.id)).unwrap();
        toast.success('Note deleted successfully');
        deleteModal.close();
        setNoteToDelete(null);
        if (id) {
          dispatch(fetchFilteredNotes({ 
            notebookId: id, 
            page: pagination?.currentPage || 1, 
            limit: pagination?.limit || 12,
            categoryId: activeCategoryFilter,
            search: searchQuery
          }));
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
        toast.error('Failed to delete note');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Only show skeleton on initial load, not on filtering
  if (!notebook && (status === 'loading' || status === 'idle')) {
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

  const filteredNotes = notes || [];
  const usedCategoryIdsSet = new Set(usedCategoryIds || []);
  // Show all categories instead of hiding unused ones
  const usedCategories = categories;
  const hasOtherCategory = usedCategoryIdsSet.has(null);

  return (
    <>
      <Header />
      <div className="container pb-5">
      <div className="row g-3 align-items-center mb-4 pb-4 pt-4 border-bottom">
        <div className="col-12 col-md d-flex align-items-center gap-3 order-1">
          <button
            onClick={() => navigate('/')}
            className={`btn btn-link p-0 border-0 d-flex align-items-center justify-content-center flex-shrink-0 text-decoration-none opacity-75 hover-opacity-100 ${theme === 'dark' ? 'text-light' : 'text-secondary'}`}
            style={{ transition: 'opacity 0.2s' }}
            title="Back to Dashboard"
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <h1 className="fw-bolder display-5 mb-0 text-dark">
            {notebook.title ? notebook.title.charAt(0).toUpperCase() + notebook.title.slice(1) : ''}
          </h1>
          <span 
            className="badge rounded-pill px-4 py-2 fs-6 fw-semibold shadow-sm"
            style={notebook.notebook_categories?.color ? {
              backgroundColor: theme === 'blue' ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? `${notebook.notebook_categories.color}4D` : `${notebook.notebook_categories.color}15`),
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : notebook.notebook_categories.color,
              border: `1px solid ${theme === 'blue' ? 'rgba(255, 255, 255, 0.8)' : (theme === 'dark' ? `${notebook.notebook_categories.color}66` : `${notebook.notebook_categories.color}30`)}`,
              backdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
              WebkitBackdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
            } : {
              backgroundColor: theme === 'blue' ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)'),
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : '#6c757d',
              border: `1px solid ${theme === 'blue' ? 'rgba(255, 255, 255, 0.8)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.1)')}`,
              backdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
              WebkitBackdropFilter: theme === 'blue' ? 'blur(10px)' : 'none',
            }}
          >
            {notebook.notebook_categories?.name || notebook.category || 'Other'}
          </span>
        </div>
        
        <div className="col-12 col-md-auto d-flex flex-column flex-md-row justify-content-md-end align-items-stretch align-items-md-center gap-3 order-3 order-md-2 mt-4 mt-md-0">
          <div 
            className={`w-100 w-md-auto d-flex justify-content-between align-items-center p-2 px-3 rounded-pill ${theme === 'dark' ? 'bg-dark border border-secondary border-opacity-25' : 'bg-light border border-light-subtle shadow-sm'}`} 
            title="Hide contents to practice your memory"
            style={{ minHeight: '38px' }}
          >
            <label className="form-check-label fw-semibold text-secondary d-flex align-items-center mb-0" htmlFor="flashcardSwitch" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.875rem' }}>
              <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
              Flashcard Mode
            </label>
            <div className="form-check form-switch m-0 p-0 ms-3 d-flex align-items-center">
              <input 
                className="form-check-input m-0 shadow-sm" 
                type="checkbox" 
                role="switch" 
                id="flashcardSwitch" 
                checked={isFlashcardMode} 
                onChange={(e) => setIsFlashcardMode(e.target.checked)} 
                style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer', marginLeft: 0 }} 
              />
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm text-secondary transition-all px-3 flex-grow-1 d-flex justify-content-center"
              onClick={() => categoryManagerModal.open()}
              style={{ fontSize: '0.875rem', height: '38px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              icon="bi-tags-fill opacity-75"
            >
              Categories
            </AppButton>
            
            <div 
              className={`d-flex shadow-sm border rounded-pill p-1 position-relative flex-grow-1 ${
                theme === 'dark' ? 'bg-dark border-light border-opacity-10' : 
                theme === 'blue' ? 'bg-white border-primary border-opacity-25' : 
                'bg-white border-light-subtle'
              }`} 
              style={{ minWidth: '160px', height: '38px' }}
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
                style={{ transition: 'color 0.3s', zIndex: 1, padding: '0.25rem 0', fontSize: '0.875rem' }}
              >
                <i className="bi bi-list me-1"></i> List
              </button>
              <button 
                className={`btn btn-sm rounded-pill flex-grow-1 border-0 ${viewMode === 'grid' ? (theme === 'dark' ? 'text-black fw-bold' : 'text-white fw-bold') : 'text-secondary'}`}
                onClick={() => handleViewModeChange('grid')}
                style={{ transition: 'color 0.3s', zIndex: 1, padding: '0.25rem 0', fontSize: '0.875rem' }}
              >
                <i className="bi bi-grid me-1"></i> Grid
              </button>
            </div>
          </div>
        </div>

        {notebook.description && (
          <div className="col-12 order-2 order-md-3 mt-4 mt-md-3">
            <div 
              className={`p-4 rounded-4 transition-all ${theme === 'dark' ? 'bg-dark border border-secondary border-opacity-25' : 'bg-light border border-light-subtle'}`}
              style={{ cursor: isOverflowing ? 'pointer' : 'default' }}
              onClick={() => isOverflowing && setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <div ref={containerRef} style={{ 
                height: isDescriptionExpanded ? (descHeight ? `${descHeight}px` : 'auto') : '3.6rem', 
                overflow: 'hidden',
                transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}>
                <div ref={descriptionRef}>
                  <p className="text-secondary fs-6 mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {notebook.description}
                  </p>
                </div>
                {!isDescriptionExpanded && isOverflowing && (
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2rem',
                      background: `linear-gradient(transparent, ${theme === 'dark' ? '#212529' : '#f8f9fa'})`,
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
              {isOverflowing && (
                <div className="text-center mt-2 mb-n2">
                  <span className="small fw-semibold text-primary" style={{ opacity: 0.85 }}>
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-4 col-lg-3">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder={`Search ${notebook.title ? notebook.title.charAt(0).toUpperCase() + notebook.title.slice(1) : ''} notes...`} 
            className="w-100"
          />
        </div>

        <div className="col-12 col-md-8 col-lg-9 d-flex overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="d-flex gap-2 flex-nowrap overflow-x-auto pb-2 pt-1 custom-scrollbar-hide pe-3 flex-grow-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: isDragging.current ? 'auto' : 'smooth', WebkitOverflowScrolling: 'touch', cursor: 'grab' }}
            {...events}
          >
          <style>{`
            .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
          `}</style>
          <button 
            className={`btn rounded-pill px-3 py-1 flex-shrink-0 category-filter-btn fw-medium border ${activeCategoryFilter === 'All' ? 'text-white shadow-sm' : 'bg-light text-secondary hover-text-white'}`}
            style={activeCategoryFilter === 'All' ? { backgroundColor: '#212529', borderColor: '#212529' } : {}}
            onClick={() => handleCategoryClick('All')}
          >
            All
          </button>
          {usedCategories.map(cat => (
            <button 
              key={cat.id}
              className={`btn rounded-pill px-3 py-1 d-flex align-items-center gap-1 flex-shrink-0 category-filter-btn fw-medium border ${activeCategoryFilter === cat.id ? 'text-white shadow-sm' : ''}`}
              style={{ 
                transition: 'all 0.2s',
                backgroundColor: activeCategoryFilter === cat.id ? cat.color : (theme === 'blue' ? 'rgba(255, 255, 255, 0.7)' : (theme === 'dark' ? `${cat.color}4D` : `${cat.color}15`)),
                color: activeCategoryFilter === cat.id ? '#fff' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : cat.color),
                borderColor: activeCategoryFilter === cat.id ? cat.color : (theme === 'blue' ? 'rgba(255, 255, 255, 0.5)' : (theme === 'dark' ? `${cat.color}66` : `${cat.color}30`))
              }}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.name}
            </button>
          ))}

        </div>
        
        <div className="text-secondary fw-semibold flex-shrink-0 ps-3 border-start d-flex align-items-center" style={{ height: '32px' }}>
          {filteredNotes.length} Note{filteredNotes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

      <div 
        className="row justify-content-center"
        style={{ opacity: status === 'loading' ? 0.5 : 1, transition: 'opacity 0.2s ease', pointerEvents: status === 'loading' ? 'none' : 'auto' }}
      >
        {(() => {
          if (notes.length === 0) {
            return (
              <EmptyState
                title="No notes found"
                description="Create a note to save important snippets or information."
                icon="bi-journal-plus"
                actionLabel="Create Note"
                onAction={() => addModal.open()}
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
          
          const renderNoteCard = (note, index) => (
            <div
              key={note.id}
              className={`${viewMode === 'grid' ? 'col-12 col-md-6 col-lg-4' : 'col-12'} animate-fade-slide-up`}
              style={{ animationDelay: `${(index ?? 0) * 40}ms` }}
            >
              <NoteCard
                title={note.title}
                content={note.content}
                category={note.note_categories}
                date={new Date(note.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                isPinned={note.is_pinned}
                isFlashcardMode={isFlashcardMode}
                onTogglePin={() => handleTogglePin(note)}
                onEdit={() => handleEditClick(note)}
                onDelete={() => handleDeleteClick(note)}
                onClick={() => handleViewClick(note)}
              />
            </div>
          );

          const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
          const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned);

          if (pinnedNotes.length > 0) {
            return (
              <div className="col-12" key={animKey}>
                <div className="d-flex align-items-center gap-2 mb-3 mt-2">
                  <i className="bi bi-pin-angle-fill text-warning"></i>
                  <h6 className="mb-0 fw-bold text-secondary text-uppercase tracking-wider" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Pinned</h6>
                </div>
                <div className="row g-4 mb-5">
                  {pinnedNotes.map(renderNoteCard)}
                </div>
                
                {unpinnedNotes.length > 0 && (
                  <>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <h6 className="mb-0 fw-bold text-secondary text-uppercase tracking-wider" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Others</h6>
                      <div className="flex-grow-1 border-bottom" style={{ opacity: 0.1 }}></div>
                    </div>
                    <div className="row g-4">
                      {unpinnedNotes.map(renderNoteCard)}
                    </div>
                  </>
                )}
              </div>
            );
          }

          return (
            <div className="col-12" key={animKey}>
              <div className="row g-4">
                {filteredNotes.map(renderNoteCard)}
              </div>
            </div>
          );
        })()}
      </div>

      {notes.length > 0 && pagination?.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.currentPage} 
          totalPages={pagination.totalPages} 
          onPageChange={handlePageChange} 
        />
      )}

      {notes.length > 0 && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1000 }}>
          <AddButton onClick={() => addModal.open()} label="New Note" />
        </div>
      )}
      
      <AddNoteModal
        show={addModal.isOpen}
        onClose={() => addModal.close()}
        notebookId={id}
        categories={categories}
      />
      
      <EditNoteModal
        show={editModal.isOpen}
        onClose={() => editModal.close()}
        noteData={noteToEdit}
        categories={categories}
      />
      
      <ViewNoteModal
        show={viewModal.isOpen}
        onClose={() => viewModal.close()}
        noteData={noteToView}
        categoryObj={noteToView ? categories.find(c => c.id === noteToView.category_id) : null}
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
        show={deleteModal.isOpen} 
        onClose={() => deleteModal.close()} 
        onConfirm={handleConfirmDelete}
        title="Delete Note?"
        message={
          <>
            Are you sure you want to delete "{noteToDelete?.title ? noteToDelete.title.charAt(0).toUpperCase() + noteToDelete.title.slice(1) : 'this note'}"?<br />
            This action cannot be undone.
          </>
        }
        isDeleting={isDeleting}
      />
      
      {categoryManagerModal.isOpen && (
        <NoteCategoryManager
          show={categoryManagerModal.isOpen}
          onClose={() => categoryManagerModal.close()}
          onCategoryUpdate={handleCategoryUpdate} 
        />
      )}
      </div>
    </>
  );
}
