import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { editNote } from '../../../store/notesSlice';
import { addNoteCategory } from '../../../store/categoriesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import CreatableCategorySelect from '../../../shared/components/CreatableCategorySelect';
import AppButton from '../../../shared/ui/AppButton';
import NoteEditor from './NoteEditor';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';

export default function EditNoteModal({
  show,
  onClose,
  noteData,
  categories: categoriesProp,
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (noteData && show) {
      setTopic(noteData.title || '');
      setContent(noteData.content || '');
      setCategoryId(noteData.category_id || '');
      setCustomCategoryName('');
      setShowConfirm(false);
    }
  }, [show, noteData]);

  // Clear selected category if it was deleted in Category Manager
  useEffect(() => {
    if (categoryId && categories.length > 0 && !categories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [categories, categoryId]);

  if (!show) return null;

  const notebookId = noteData?.notebook_id;

  const normalizeText = (str) => (str || '').replace(/\r\n/g, '\n').trim();

  const hasChanges =
    normalizeText(topic) !== normalizeText(noteData?.title) ||
    normalizeText(content) !== normalizeText(noteData?.content) ||
    (categoryId || '') !== (noteData?.category_id || '') ||
    Boolean(customCategoryName.trim());

  const canSave = Boolean(topic.trim() && content.trim()) && hasChanges;

  const handleClose = () => {
    setIsExpanded(false);
    setCustomCategoryName('');
    setShowConfirm(false);
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
        editNote({
          id: noteData.id,
          data: {
            title: topic,
            content,
            categoryId: finalCategoryId,
          },
        })
      ).unwrap();

      toast.success('Note updated successfully');
      setShowConfirm(false);
      handleClose();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to update note.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="w-100 d-flex justify-content-center justify-content-sm-end gap-3">
      <AppButton
        variant="light"
        onClick={handleClose}
        disabled={isSaving}
        className="border shadow-sm"
      >
        Cancel
      </AppButton>
      <AppButton
        variant={canSave ? 'dark' : 'secondary'}
        onClick={() => setShowConfirm(true)}
        disabled={isSaving || !canSave}
        isLoading={isSaving}
        loadingText="Saving..."
        icon={!isSaving ? 'bi-check2' : null}
      >
        {isSaving ? '' : 'Save Changes'}
      </AppButton>
    </div>
  );

  return (
    <>
    <AppModal
      show={show}
      onClose={handleClose}
      title="Edit Short Note"
      icon="bi-pencil-square"
      size={isExpanded ? 'xl' : 'lg'}
      maxWidth={isExpanded ? '1100px' : '700px'}
      footer={footer}
      closeOnBackdrop={false}
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
              size="sm"
              className="text-decoration-none p-0 d-flex align-items-center gap-1 text-primary"
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
          emptyOptionLabel="Other (No Category)"
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

    <DeleteConfirmModal
      show={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleSave}
      title="Save Changes?"
      message={
        <>
          Are you sure you want to save changes to <strong>"{topic.trim()}"</strong>?
        </>
      }
      confirmText="Save"
      variant="dark"
      icon="bi-pencil-square"
      isDeleting={isSaving}
    />
    </>
  );
}
