import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchNotebooks, toggleNotebookPin, removeNotebook } from '../../store/notebooksSlice';
import Header from '../../modules/notebooks/components/Header';
import SearchBar from '../../modules/notebooks/components/SearchBar';
import CategoryFilter from '../../modules/notebooks/components/CategoryFilter';
import NotebookCard from '../../modules/notebooks/components/NotebookCard';
import AddButton from '../../modules/notebooks/components/AddButton';
import AddNotebookModal from '../../modules/notebooks/components/AddNotebookModal';
import EditNotebookModal from '../../modules/notebooks/components/EditNotebookModal';
import SkeletonLayout from '../../shared/components/SkeletonLayout';
import EmptyState from '../../shared/components/EmptyState';
import DeleteConfirmModal from '../../shared/components/DeleteConfirmModal';
import useKeyboardShortcuts from '../../shared/hooks/useKeyboardShortcuts';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [activeCategory, setActiveCategory] = useState('All Tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notebookToEdit, setNotebookToEdit] = useState(null);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { items: notebooks, status } = useSelector((state) => state.notebooks);
  
  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tooling', 'Other'];
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotebooks());
    }
  }, [status, dispatch]);

  const handleNotebookAdded = () => {
    dispatch(fetchNotebooks());
  };

  const handleTogglePin = (notebook) => {
    dispatch(toggleNotebookPin({ id: notebook.id, isPinned: !notebook.is_pinned }));
  };

  const handleDeleteClick = (notebook) => {
    setNotebookToDelete(notebook);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!notebookToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(removeNotebook(notebookToDelete.id)).unwrap();
      setShowDeleteModal(false);
      setNotebookToDelete(null);
      toast.success('Notebook deleted successfully');
    } catch (error) {
      console.error('Failed to delete notebook:', error);
      toast.error('Failed to delete notebook');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (notebook) => {
    setNotebookToEdit(notebook);
    setShowEditModal(true);
  };

  // notebooks are already sorted by is_pinned in the Redux slice and backend
  const filteredNotebooks = notebooks.filter(nb => {
    const matchesCategory = activeCategory === 'All Tools' || nb.category === activeCategory;
    const matchesSearch = nb.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (nb.description && nb.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container pb-5">
      <Header />

      <div className="text-center mt-5 pt-4 mb-4">
        <p className="text-secondary fs-5">
          Your modern workspace for frameworks, tools, and coding wisdom.
        </p>
      </div>
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter 
        categories={categories} 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />
      
      {(() => {
        if (status === 'loading' || status === 'idle') {
          return <SkeletonLayout count={6} />;
        }
        if (notebooks.length === 0) {
          return (
            <EmptyState 
              title="Welcome to DevNotes!"
              description="Start by creating a notebook for your favorite framework or tool."
              icon="bi-journal-plus"
              actionLabel="Create Notebook"
              onAction={() => setShowAddModal(true)}
            />
          );
        }
        if (filteredNotebooks.length === 0) {
          return (
            <div className="py-5 text-center text-secondary">
              <i className="bi bi-search display-1 mb-3 text-secondary opacity-25"></i>
              <h5>No notebooks match your search</h5>
              <p>Try using different keywords or categories.</p>
            </div>
          );
        }
        return (
          <div className="row g-4" key={activeCategory}>
            {filteredNotebooks.map((notebook, index) => (
              <div 
                key={notebook.id} 
                className="col-12 col-md-6 col-lg-4 animate-fade-slide-up" 
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/notebook/${notebook.id}`)}
              >
                <NotebookCard 
                  title={notebook.title}
                  category={notebook.category}
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
      
      {notebooks.length > 0 && (
        <AddButton onClick={() => setShowAddModal(true)} label="New Notebook" />
      )}
      <AddNotebookModal show={showAddModal} onClose={() => setShowAddModal(false)} onNotebookAdded={handleNotebookAdded} existingNotebooks={notebooks} />
      <EditNotebookModal show={showEditModal} onClose={() => setShowEditModal(false)} notebookData={notebookToEdit} />
      
      <DeleteConfirmModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleConfirmDelete}
        title="Delete Notebook?"
        message={`Are you sure you want to delete "${notebookToDelete?.title ? notebookToDelete.title.charAt(0).toUpperCase() + notebookToDelete.title.slice(1) : 'this notebook'}"? All notes inside will be permanently lost.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
