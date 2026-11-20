import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useModal from '../../shared/hooks/useModal';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { toggleNotebookPin, removeNotebook } from '../../store/notebooksSlice';
import { fetchNotebookCategories } from '../../store/categoriesSlice';
import { getNotebooks } from '../../storage/api';
import Header from '../../modules/notebooks/components/Header';
import GlobalSearchBar from '../../shared/components/GlobalSearchBar';
import CategoryFilter from '../../modules/notebooks/components/CategoryFilter';
import NotebookCard from '../../modules/notebooks/components/NotebookCard';
import AddButton from '../../modules/notebooks/components/AddButton';
import AddNotebookModal from '../../modules/notebooks/components/AddNotebookModal';
import EditNotebookModal from '../../modules/notebooks/components/EditNotebookModal';
import NotebookCategoryManager from '../../modules/notebooks/components/NotebookCategoryManager';
import StickyChecklist from '../../modules/notebooks/components/StickyChecklist';
import SkeletonLayout from '../../shared/components/SkeletonLayout';
import EmptyState from '../../shared/components/EmptyState';
import DeleteConfirmModal from '../../shared/components/DeleteConfirmModal';
import useKeyboardShortcuts from '../../shared/hooks/useKeyboardShortcuts';
import Pagination from '../../shared/components/Pagination';
import { isCategoryHidden } from '../../shared/utils/categoryUtils';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeCategory, setActiveCategory] = useState('All');
  const categoryManagerModal = useModal(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usedCategoryIds, setUsedCategoryIds] = useState([]);
  const [usedCategoryStrings, setUsedCategoryStrings] = useState([]);
  const addModal = useModal(false);
  const editModal = useModal(false);
  const deleteModal = useModal(false);
  const [notebookToEdit, setNotebookToEdit] = useState(null);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cache: key = `${categoryId}__${search}__${page}`, value = { data, count, page, limit }
  const cache = useRef({});
  const hasLoadedOnce = useRef(false);
  const CACHE_TTL = 60_000; // 60 seconds

  // Local display state (used for instant cache hit display)
  const [displayedNotebooks, setDisplayedNotebooks] = useState([]);
  const [displayedPagination, setDisplayedPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 12 });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);

  const { items: categories, status: categoryStatus } = useSelector((state) => state.categories.notebookCategories);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      if (categoryStatus === 'idle') {
        dispatch(fetchNotebookCategories());
      }
    }
  }, [user?.id, categoryStatus, dispatch]);

  useEffect(() => {
    if (activeCategory !== 'All' && categories?.length > 0) {
      const activeCat = categories.find((c) => c.id === activeCategory);
      if (activeCat && (activeCat.icon === 'hidden' || activeCat.icon?.endsWith(':hidden'))) {
        setActiveCategory('All');
      }
    }
  }, [categories, activeCategory]);

  useKeyboardShortcuts();

  const buildCacheKey = useCallback((categoryId, search, page) => {
    return `${categoryId ?? 'null'}__${search ?? ''}__${page ?? 1}`;
  }, []);

  const fetchAndCache = useCallback(async (categoryId, search, page = 1) => {
    const key = buildCacheKey(categoryId, search, page);
    const result = await getNotebooks({ page, limit: 12, categoryId, search });
    // Save to cache with timestamp
    cache.current[key] = { ...result, cachedAt: Date.now() };
    return result;
  }, [buildCacheKey]);

  const getCachedEntry = useCallback((key) => {
    const entry = cache.current[key];
    if (!entry) return null;
    // Check if cache is still fresh
    if (Date.now() - entry.cachedAt > CACHE_TTL) {
      delete cache.current[key]; // Evict expired entry
      return null;
    }
    return entry;
  }, [CACHE_TTL]);

  // Main fetch effect - with debounce for search
  useEffect(() => {
    if (!user?.id) return;

    const key = buildCacheKey(activeCategory, searchQuery, 1);
    const cached = getCachedEntry(key);

    if (cached) {
      // Cache hit (fresh): show immediately
      setDisplayedNotebooks(cached.data);
      setDisplayedPagination({
        currentPage: cached.page,
        totalPages: Math.ceil(cached.count / cached.limit) || 1,
        totalItems: cached.count,
        limit: cached.limit,
      });
      setIsInitialLoading(false);
      if (cached.usedCategoryIds) setUsedCategoryIds(cached.usedCategoryIds);
      if (cached.usedCategoryStrings) setUsedCategoryStrings(cached.usedCategoryStrings);
      // Still refresh in background silently
      setIsBackgroundFetching(true);
      fetchAndCache(activeCategory, searchQuery, 1).then((result) => {
        setDisplayedNotebooks(result.data);
        if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
        if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
        setDisplayedPagination({
          currentPage: result.page,
          totalPages: Math.ceil(result.count / result.limit) || 1,
          totalItems: result.count,
          limit: result.limit,
        });
        setIsBackgroundFetching(false);
        hasLoadedOnce.current = true;
      }).catch(() => setIsBackgroundFetching(false));
    } else {
      // No cache: show loading only if never loaded before
      if (!hasLoadedOnce.current) {
        setIsInitialLoading(true);
      } else {
        setIsBackgroundFetching(true);
      }

      const timer = setTimeout(() => {
        fetchAndCache(activeCategory, searchQuery, 1).then((result) => {
          setDisplayedNotebooks(result.data);
          if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
          if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
          setDisplayedPagination({
            currentPage: result.page,
            totalPages: Math.ceil(result.count / result.limit) || 1,
            totalItems: result.count,
            limit: result.limit,
          });
          setIsInitialLoading(false);
          setIsBackgroundFetching(false);
          hasLoadedOnce.current = true;
        }).catch(() => {
          setIsInitialLoading(false);
          setIsBackgroundFetching(false);
        });
      }, searchQuery ? 300 : 0); // Debounce only for search typing

      return () => clearTimeout(timer);
    }
  }, [user?.id, activeCategory, searchQuery, fetchAndCache, buildCacheKey]);

  const handlePageChange = (newPage) => {
    const key = buildCacheKey(activeCategory, searchQuery, newPage);
    const cached = getCachedEntry(key);

    if (cached) {
      setDisplayedNotebooks(cached.data);
      if (cached.usedCategoryIds) setUsedCategoryIds(cached.usedCategoryIds);
      if (cached.usedCategoryStrings) setUsedCategoryStrings(cached.usedCategoryStrings);
      setDisplayedPagination({
        currentPage: cached.page,
        totalPages: Math.ceil(cached.count / cached.limit) || 1,
        totalItems: cached.count,
        limit: cached.limit,
      });
    }

    // Always refresh
    setIsBackgroundFetching(!cached);
    fetchAndCache(activeCategory, searchQuery, newPage).then((result) => {
      setDisplayedNotebooks(result.data);
      if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
      if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
      setDisplayedPagination({
        currentPage: result.page,
        totalPages: Math.ceil(result.count / result.limit) || 1,
        totalItems: result.count,
        limit: result.limit,
      });
      setIsBackgroundFetching(false);
    }).catch(() => setIsBackgroundFetching(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const invalidateCache = () => {
    // Clear cache when data mutates (add/edit/delete)
    cache.current = {};
  };

  const handleNotebookAdded = () => {
    invalidateCache();
    fetchAndCache(activeCategory, searchQuery, 1).then((result) => {
      setDisplayedNotebooks(result.data);
      if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
      if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
      setDisplayedPagination({
        currentPage: result.page,
        totalPages: Math.ceil(result.count / result.limit) || 1,
        totalItems: result.count,
        limit: result.limit,
      });
    });
  };

  const handleTogglePin = (notebook) => {
    invalidateCache();
    dispatch(toggleNotebookPin({ id: notebook.id, isPinned: !notebook.is_pinned }))
      .then(() => {
        fetchAndCache(activeCategory, searchQuery, displayedPagination.currentPage).then((result) => {
          setDisplayedNotebooks(result.data);
          if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
          if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
          setDisplayedPagination({
            currentPage: result.page,
            totalPages: Math.ceil(result.count / result.limit) || 1,
            totalItems: result.count,
            limit: result.limit,
          });
        });
      });
  };

  const handleDeleteClick = (notebook) => {
    setNotebookToDelete(notebook);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (notebookToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(removeNotebook(notebookToDelete.id)).unwrap();
        toast.success('Notebook deleted successfully');
        deleteModal.close();
        setNotebookToDelete(null);
        invalidateCache();
        const result = await fetchAndCache(activeCategory, searchQuery, displayedPagination.currentPage);
        setDisplayedNotebooks(result.data);
        if (result.usedCategoryIds) setUsedCategoryIds(result.usedCategoryIds);
        if (result.usedCategoryStrings) setUsedCategoryStrings(result.usedCategoryStrings);
        setDisplayedPagination({
          currentPage: result.page,
          totalPages: Math.ceil(result.count / result.limit) || 1,
          totalItems: result.count,
          limit: result.limit,
        });
      } catch (error) {
        console.error('Failed to delete notebook:', error);
        toast.error('Failed to delete notebook');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (notebook) => {
    setNotebookToEdit(notebook);
    editModal.open();
  };

  // Show all visible categories (exclude hidden ones)
  const usedCategories = categories.filter((cat) => !isCategoryHidden(cat));

  return (
    <>
      <Header />
      <div className="container pb-5">
        <div className="text-center mt-2 mt-md-3 mb-2">
          <p className="text-secondary mb-0" style={{ fontSize: 'clamp(0.78rem, 2.5vw, 0.95rem)' }}>
            Your modern workspace for frameworks, tools, and coding wisdom
          </p>
        </div>

        <div className="d-flex flex-column align-items-center w-100">
          <div className="w-100">
            <GlobalSearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="d-flex align-items-center gap-1.5 gap-md-2 mt-0 mb-2 mb-md-3 w-100 position-relative" style={{ maxWidth: '960px', gap: '6px' }}>
            <div className="flex-grow-1 overflow-hidden">
              <CategoryFilter
                categories={usedCategories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                isLoading={categoryStatus === 'loading'}
              />
            </div>
            <button
              className="btn btn-light border rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center shadow-sm hover-lift p-0"
              style={{ width: '34px', height: '34px', zIndex: 10 }}
              onClick={() => categoryManagerModal.open()}
              title="Manage Categories"
            >
              <i className="bi bi-gear-fill text-secondary opacity-75" style={{ fontSize: '0.88rem' }}></i>
            </button>
          </div>
        </div>

        {categoryManagerModal.isOpen && (
          <NotebookCategoryManager
            show={categoryManagerModal.isOpen}
            onClose={() => categoryManagerModal.close()}
            onCategoryUpdate={() => {
              dispatch(fetchNotebookCategories());
              invalidateCache();
              fetchAndCache(activeCategory, searchQuery, 1).then((result) => {
                setDisplayedNotebooks(result.data);
                setDisplayedPagination({
                  currentPage: result.page,
                  totalPages: Math.ceil(result.count / result.limit) || 1,
                  totalItems: result.count,
                  limit: result.limit,
                });
              });
            }}
          />
        )}

        <StickyChecklist />

        {(() => {
          if (isInitialLoading) {
            return <SkeletonLayout count={6} />;
          }
          if (displayedNotebooks.length === 0 && !isBackgroundFetching) {
            // Check if the empty result is due to filtering
            if (!searchQuery && activeCategory === 'All') {
              return (
                <EmptyState
                  title="Welcome to DevNotes!"
                  description="Start by creating a notebook for your favorite framework or tool."
                  icon="bi-journal-plus"
                  actionLabel="Create Notebook"
                  onAction={() => addModal.open()}
                />
              );
            }
            return (
              <EmptyState
                title="No notebooks match your search"
                description="Try using different keywords or categories"
                icon="bi-search"
              />
            );
          }
          return (
            <div
              className="row g-2 g-md-4"
              style={{ opacity: isBackgroundFetching ? 0.6 : 1, transition: 'opacity 0.15s ease', pointerEvents: isBackgroundFetching ? 'none' : 'auto' }}
            >
              {displayedNotebooks.map((notebook, index) => (
                <div
                  key={notebook.id}
                  className="col-6 col-lg-4 animate-fade-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/notebook/${notebook.id}`)}
                >
                  <NotebookCard
                    title={notebook.title}
                    category={notebook.category}
                    categoryObj={notebook.notebook_categories}
                    description={notebook.description}
                    noteCount={notebook.noteCount}
                    colorContext={notebook.colorContext}
                    isPinned={notebook.is_pinned}
                    onTogglePin={() => handleTogglePin(notebook)}
                    onEdit={() => handleEdit(notebook)}
                    onDelete={() => handleDeleteClick(notebook)}
                  />
                </div>
              ))}
            </div>
          );
        })()}

        {displayedNotebooks.length > 0 && displayedPagination?.totalPages > 1 && (
          <Pagination
            currentPage={displayedPagination.currentPage}
            totalPages={displayedPagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {!(displayedNotebooks.length === 0 && !isBackgroundFetching && !searchQuery && activeCategory === 'All') && (
          <AddButton onClick={() => addModal.open()} label="New Notebook" />
        )}

        <AddNotebookModal show={addModal.isOpen} onClose={() => addModal.close()} onNotebookAdded={handleNotebookAdded} existingNotebooks={displayedNotebooks} categories={categories} />
        <EditNotebookModal show={editModal.isOpen} onClose={() => editModal.close()} notebookData={notebookToEdit} categories={categories} onNotebookUpdated={() => { invalidateCache(); handleNotebookAdded(); }} />

        <DeleteConfirmModal
          show={deleteModal.isOpen}
          onClose={() => deleteModal.close()}
          onConfirm={handleConfirmDelete}
          title="Delete Notebook?"
          message={
            <>
              Are you sure you want to delete <strong>"{notebookToDelete?.title ? notebookToDelete.title.charAt(0).toUpperCase() + notebookToDelete.title.slice(1) : 'this notebook'}"</strong>?<br />
              <span className="d-block mt-1">All notes inside will be permanently deleted</span>
            </>
          }
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}
