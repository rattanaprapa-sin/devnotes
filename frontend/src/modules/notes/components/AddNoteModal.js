import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addNote } from '../../../store/notesSlice';
import { addNoteCategory } from '../../../store/categoriesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import CreatableCategorySelect from '../../../shared/components/CreatableCategorySelect';
import AppButton from '../../../shared/ui/AppButton';
import NoteEditor from './NoteEditor';

export default function AddNoteModal({
  show,
  onClose,
  notebookId,
  categories: categoriesProp,
  onNoteAdded,
  onManageCategories,
}) {
  const dispatch = useDispatch();
  const storeCategories = useSelector((state) => state.categories.noteCategories.items);
  const categories = categoriesProp || storeCategories;

  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Clear selected category if it was deleted in Category Manager
  useEffect(() => {
    if (categoryId && categories.length > 0 && !categories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [categories, categoryId]);

  if (!show) return null;

  const handleClose = () => {
    setTopic('');
    setContent('');
    setCategoryId('');
    setCustomCategoryName('');
    setIsExpanded(false);
    onClose();
  };

  const handleCreateCategory = async (name, color = '#6c757d') => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const existing = categories.find(
      (c) => (c.name || '').toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const created = await dispatch(
      addNoteCategory({
        name: trimmed,
        color,
        notebookId,
        icon: notebookId ? `nb:${notebookId}` : 'bi-tag',
      })
    ).unwrap();
    toast.success(`Category "${trimmed}" created`);
    return created;
  };

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      let finalCategoryId = categoryId || null;
      if (!finalCategoryId && customCategoryName.trim()) {
        const createdCat = await handleCreateCategory(customCategoryName.trim(), '#6c757d');
        if (createdCat?.id) {
          finalCategoryId = createdCat.id;
        }
      }

      await dispatch(
        addNote({
          notebookId,
          title: topic,
          content,
          categoryId: finalCategoryId,
        })
      ).unwrap();
      toast.success('Note created successfully');

      handleClose();
      if (onNoteAdded) onNoteAdded();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="d-flex justify-content-center gap-3 w-100">
      <AppButton variant="light" className="border text-dark" onClick={handleClose}>
        Cancel
      </AppButton>
      <AppButton
        variant={topic.trim() && content.trim() ? 'dark' : 'secondary'}
        onClick={handleSave}
        disabled={isSaving || !topic.trim() || !content.trim()}
        isLoading={isSaving}
        loadingText="Saving..."
        icon="bi-box-arrow-down"
      >
        Save Note
      </AppButton>
    </div>
  );

  return (
    <AppModal
      show={show}
      onClose={handleClose}
      title="New Short Note"
      icon="bi-file-earmark-text"
      footer={footer}
      size={isExpanded ? 'xl' : 'lg'}
      maxWidth={isExpanded ? '1100px' : '700px'}
      borderless
    >
      <AppInput
        label="Topic / Subject"
        placeholder="e.g., Hooks, Database connection..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        containerClassName="mb-2"
      />

      <div className="mb-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label text-secondary small fw-semibold mb-0">
            Category (Optional)
          </label>
          {onManageCategories && (
            <AppButton
              variant="link"
              className="btn-sm text-decoration-none p-0 d-flex align-items-center gap-1 text-primary"
              onClick={onManageCategories}
              icon="bi-gear-fill"
            >
              Manage
            </AppButton>
          )}
        </div>
        <CreatableCategorySelect
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          customName={customCategoryName}
          onCustomNameChange={setCustomCategoryName}
          onCreateCategory={handleCreateCategory}
          placeholder="Select or type to create category..."
          emptyOptionLabel="None (No Category)"
          containerClassName="mb-0"
        />
      </div>

      <div className="mb-1">
        <label className="form-label text-secondary small fw-semibold">
          Content
        </label>
        <NoteEditor
          content={content}
          onChange={setContent}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      </div>
    </AppModal>
  );
}
