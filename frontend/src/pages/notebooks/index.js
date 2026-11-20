import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchNotebookDetails, clearCurrentNotebook, removeNote, toggleNotePin, fetchFilteredNotes } from '../../store/notesSlice';
import { fetchNoteCategories, editNoteCategory } from '../../store/categoriesSlice';
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
import { isCategoryHidden, filterCategoriesForNotebook } from '../../shared/utils/categoryUtils';

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
  const { items: categories } = useSelector((state) => state.categories.noteCategories);

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
        
        // Calculate the threshold based on 2.3rem on mobile (< 768px) or 3.6rem on desktop
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const collapsedRem = window.innerWidth < 768 ? 2.3 : 3.6;
        const threshold = collapsedRem * rootFontSize;
        
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
      setActiveCategoryFilter('All');
      setSearchQuery('');
      // Fetch notebook details and categories scoped to this notebook
      dispatch(fetchNotebookDetails({ notebookId: id, page: 1, limit: 12 }));
      dispatch(fetchNoteCategories(id));
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

  // Lazily bind legacy categories (without 'nb:' prefix) that are actively used in this notebook
  const boundCategoryIdsRef = useRef(new Set());
  useEffect(() => {
    if (!id || !categories?.length || !usedCategoryIds?.length) return;
    const usedSet = new Set(usedCategoryIds);
    categories.forEach((cat) => {
      if (
        (!cat.icon || (!cat.icon.startsWith('nb:') && cat.icon !== 'hidden' && !cat.icon.endsWith(':hidden'))) &&
        usedSet.has(cat.id) &&
        !boundCategoryIdsRef.current.has(cat.id)
      ) {
        boundCategoryIdsRef.current.add(cat.id);
        dispatch(
          editNoteCategory({
            id: cat.id,
            data: {
              name: cat.name,
              color: cat.color,
              icon: `nb:${id}`,
            },
          })
        );
      }
    });
  }, [id, categories, usedCategoryIds, dispatch]);

  useEffect(() => {
    if (activeCategoryFilter !== 'All' && categories?.length > 0) {
      const activeCat = categories.find((c) => c.id === activeCategoryFilter);
      if (activeCat && (activeCat.icon === 'hidden' || activeCat.icon?.endsWith(':hidden'))) {
        setActiveCategoryFilter('All');
      }
    }
  }, [categories, activeCategoryFilter]);

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
    if (id) {
      dispatch(fetchNoteCategories(id));
      dispatch(fetchNotebookDetails({ notebookId: id, page: pagination?.currentPage || 1, limit: pagination?.limit || 12, categoryId: activeCategoryFilter, search: searchQuery }));
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
  // Only show visible categories that belong to this notebook
  const notebookCategories = filterCategoriesForNotebook(categories, id, usedCategoryIds);
  const usedCategories = notebookCategories.filter((cat) => !isCategoryHidden(cat));

  return (
    <>
      <Header />
      <div className="container pb-5">
      <div className="row g-2 g-md-3 align-items-center mb-2 mb-md-4 pb-2 pb-md-4 pt-2 pt-md-4 border-bottom">
        <div className="col-12 col-md d-flex align-items-center flex-wrap gap-2 gap-md-3 order-1">
          <button
            onClick={() => navigate('/')}
            className={`btn btn-link p-0 border-0 d-flex align-items-center justify-content-center flex-shrink-0 text-decoration-none opacity-75 hover-opacity-100 ${theme === 'dark' ? 'text-light' : 'text-secondary'}`}
            style={{ transition: 'opacity 0.2s' }}
            title="Back to Dashboard"
          >
            <i className="bi bi-arrow-left fs-5 fs-md-4"></i>
          </button>
          <h1 className="fw-bolder fs-4 fs-md-1 mb-0 text-dark text-break">
            {notebook.title ? notebook.title.charAt(0).toUpperCase() + notebook.title.slice(1) : ''}
          </h1>
          <span 
            className="badge rounded-pill px-2.5 py-1 px-md-3 py-md-1.5 fw-semibold shadow-sm"
            style={{
              fontSize: '0.78rem',
              padding: '4px 12px',
              ...(notebook.notebook_categories?.color ? {
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
              }),
            }}
          >
            {notebook.notebook_categories?.name || notebook.category || 'Other'}
          </span>
          <span className="ms-auto d-md-none text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>
            {filteredNotes.length} Note{filteredNotes.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="col-12 col-md-auto d-flex flex-row justify-content-between justify-content-md-end align-items-center gap-2 order-3 order-md-2 mt-1 mt-md-0 note-page-toolbar">
          <div 
            className={`d-flex justify-content-between align-items-center px-2 px-md-3 rounded-pill flex-shrink-0 note-page-flashcard-pill ${theme === 'dark' ? 'bg-dark border border-secondary border-opacity-25' : 'bg-light border border-light-subtle shadow-sm'}`} 
            title="Hide contents to practice your memory"
            style={{ minHeight: '38px' }}
          >
            <label className="form-check-label fw-semibold text-secondary d-flex align-items-center mb-0 text-nowrap note-page-toolbar-text" htmlFor="flashcardSwitch" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.875rem' }}>
              <i className="bi bi-lightning-charge-fill text-warning me-1 me-md-2"></i>
              <span className="d-none d-sm-inline">Flashcard Mode</span>
              <span className="d-inline d-sm-none">Flashcard</span>
            </label>
            <div className="form-check form-switch m-0 p-0 ms-1.5 ms-md-3 d-flex align-items-center" style={{ marginLeft: '6px' }}>
              <input 
                className="form-check-input m-0 shadow-sm note-page-flashcard-switch" 
                type="checkbox" 
                role="switch" 
                id="flashcardSwitch" 
                checked={isFlashcardMode} 
                onChange={(e) => setIsFlashcardMode(e.target.checked)} 
                style={{ width: '2.4rem', height: '1.2rem', cursor: 'pointer', marginLeft: 0 }} 
              />
            </div>
          </div>
          
          <div className="d-flex align-items-center flex-shrink-0" style={{ gap: '6px' }}>
            <AppButton 
              variant="light"
              className="bg-white border shadow-sm text-secondary transition-all px-2 px-md-3 d-flex align-items-center justify-content-center note-page-categories-btn"
              onClick={() => categoryManagerModal.open()}
              style={{ fontSize: '0.875rem', height: '38px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              icon="bi-tags-fill opacity-75"
            >
              Categories
            </AppButton>
            
            <div 
              className={`d-flex shadow-sm border rounded-pill p-1 position-relative note-page-view-toggle ${
                theme === 'dark' ? 'bg-dark border-light border-opacity-10' : 
                theme === 'blue' ? 'bg-white border-primary border-opacity-25' : 
                'bg-white border-light-subtle'
              }`} 
              style={{ minWidth: '150px', height: '38px' }}
            >
              <div 
                className={`rounded-pill position-absolute`} 
                style={{
                  top: '3px',
                  bottom: '3px',
                  left: '3px',
                  width: 'calc(50% - 3px)',
                  transform: viewMode === 'list' ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s',
                  backgroundColor: theme === 'dark' ? '#ffffff' : theme === 'blue' ? 'var(--bs-primary)' : '#212529',
                  zIndex: 0
                }}
              ></div>
              <button 
                className={`btn btn-sm rounded-pill flex-grow-1 border-0 d-flex align-items-center justify-content-center note-page-toolbar-text ${viewMode === 'list' ? (theme === 'dark' ? 'text-black fw-bold' : 'text-white fw-bold') : 'text-secondary'}`}
                onClick={() => handleViewModeChange('list')}
                style={{ transition: 'color 0.3s', zIndex: 1, padding: '0 6px', fontSize: '0.875rem' }}
              >
                <i className="bi bi-list me-1"></i> List
              </button>
              <button 
                className={`btn btn-sm rounded-pill flex-grow-1 border-0 d-flex align-items-center justify-content-center note-page-toolbar-text ${viewMode === 'grid' ? (theme === 'dark' ? 'text-black fw-bold' : 'text-white fw-bold') : 'text-secondary'}`}
                onClick={() => handleViewModeChange('grid')}
                style={{ transition: 'color 0.3s', zIndex: 1, padding: '0 6px', fontSize: '0.875rem' }}
              >
                <i className="bi bi-grid me-1"></i> Grid
              </button>
            </div>
          </div>
        </div>

        {notebook.description && (
          <div className="col-12 order-2 order-md-3 mt-2 mt-md-3">
            <div 
              className={`p-4 rounded-4 transition-all note-page-desc-box ${theme === 'dark' ? 'bg-dark border border-secondary border-opacity-25' : 'bg-light border border-light-subtle'}`}
              style={{ cursor: isOverflowing ? 'pointer' : 'default' }}
              onClick={() => isOverflowing && setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <div
                ref={containerRef}
                className={`note-page-desc-collapse ${isDescriptionExpanded ? 'expanded' : ''}`}
                style={{ 
                  height: isDescriptionExpanded ? (descHeight ? `${descHeight}px` : 'auto') : '3.6rem', 
                  overflow: 'hidden',
                  transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                <div ref={descriptionRef}>
                  <p className="text-secondary fs-6 mb-0 note-page-desc-text" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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
                      height: '1.6rem',
                      background: `linear-gradient(transparent, ${theme === 'dark' ? '#212529' : '#f8f9fa'})`,
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
              {isOverflowing && (
                <div className="text-center mt-1 mt-md-2 mb-n1 mb-md-n2">
                  <span className="small fw-semibold text-primary note-page-desc-toggle" style={{ opacity: 0.85 }}>
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="row g-2 g-md-3 align-items-center mb-2 mb-md-4">
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
            className="d-flex flex-nowrap overflow-x-auto pb-1 pt-1 custom-scrollbar-hide pe-2 pe-md-3 flex-grow-1"
            style={{ gap: '6px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: isDragging.current ? 'auto' : 'smooth', WebkitOverflowScrolling: 'touch', cursor: 'grab' }}
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
        
        <div className="text-secondary fw-semibold flex-shrink-0 ps-3 border-start d-none d-md-flex align-items-center small" style={{ height: '32px' }}>
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
              className={`${viewMode === 'grid' ? 'col-6 col-lg-4' : 'col-12'} animate-fade-slide-up`}
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
                <div className="d-flex align-items-center gap-2 mb-2 mt-1">
                  <i className="bi bi-pin-angle-fill text-warning"></i>
                  <h6 className="mb-0 fw-bold text-secondary text-uppercase tracking-wider" style={{ fontSize: '0.76rem', letterSpacing: '1px' }}>Pinned</h6>
                </div>
                <div className="row g-2 g-md-4 mb-3 mb-md-4">
                  {pinnedNotes.map(renderNoteCard)}
                </div>
                
                {unpinnedNotes.length > 0 && (
                  <>
                    <div className="d-flex align-items-center gap-3 mb-2 mb-md-3">
                      <h6 className="mb-0 fw-bold text-secondary text-uppercase tracking-wider" style={{ fontSize: '0.76rem', letterSpacing: '1px' }}>Others</h6>
                      <div className="flex-grow-1 border-bottom" style={{ opacity: 0.1 }}></div>
                    </div>
                    <div className="row g-2 g-md-4">
                      {unpinnedNotes.map(renderNoteCard)}
                    </div>
                  </>
                )}
              </div>
            );
          }

          return (
            <div className="col-12" key={animKey}>
              <div className="row g-2 g-md-4">
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
        <AddButton onClick={() => addModal.open()} label="New Note" />
      )}
      
      <AddNoteModal
        show={addModal.isOpen}
        onClose={() => addModal.close()}
        notebookId={id}
        categories={notebookCategories}
        onManageCategories={() => categoryManagerModal.open()}
      />
      
      <EditNoteModal
        show={editModal.isOpen}
        onClose={() => editModal.close()}
        noteData={noteToEdit}
        categories={notebookCategories}
        onManageCategories={() => categoryManagerModal.open()}
      />
      
      <ViewNoteModal
        show={viewModal.isOpen}
        onClose={() => viewModal.close()}
        noteData={noteToView}
        categoryObj={noteToView ? usedCategories.find(c => c.id === noteToView.category_id) || categories.find(c => c.id === noteToView.category_id) : null}
        isFlashcardMode={isFlashcardMode}
        hasPrev={noteToView && filteredNotes.findIndex(n => n.id === noteToView.id) > 0}
        hasNext={noteToView && filteredNotes.findIndex(n => n.id === noteToView.id) < filteredNotes.length - 1}
        onPrev={() => {
          const idx = filteredNotes.findIndex(n => n.id === noteToView.id);
          if (idx > 0) setNoteToView(filteredNotes[idx - 1]);
        }}
        onNoteUpdated={(updated) => setNoteToView(updated)}
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
            Are you sure you want to delete <strong>"{noteToDelete?.title ? noteToDelete.title.charAt(0).toUpperCase() + noteToDelete.title.slice(1) : 'this note'}"</strong>?<br />
            <span className="d-block mt-1">This action cannot be undone</span>
          </>
        }
        isDeleting={isDeleting}
      />
      
      {categoryManagerModal.isOpen && (
        <NoteCategoryManager
          show={categoryManagerModal.isOpen}
          onClose={() => categoryManagerModal.close()}
          onCategoryUpdate={handleCategoryUpdate}
          notebookId={id}
          usedCategoryIds={usedCategoryIds}
        />
      )}
      </div>
    </>
  );
}
