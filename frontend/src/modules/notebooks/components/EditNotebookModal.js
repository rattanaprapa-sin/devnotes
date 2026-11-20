import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { editNotebook } from '../../../store/notebooksSlice';
import { addNotebookCategory } from '../../../store/categoriesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import CreatableCategorySelect from '../../../shared/components/CreatableCategorySelect';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppButton from '../../../shared/ui/AppButton';
import DeleteConfirmModal from '../../../shared/components/DeleteConfirmModal';

export default function EditNotebookModal({ show, onClose, notebookData, categories = [], onNotebookUpdated }) {
  const dispatch = useDispatch();
  
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [initialCategoryId, setInitialCategoryId] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notebookData && show) {
      setToolName(notebookData.title || '');
      setDescription(notebookData.description || '');
      let catId = notebookData.category_id;
      if (!catId && categories.length > 0) {
        const otherCat = categories.find(c => (c.name || '').toLowerCase() === 'other');
        catId = otherCat ? otherCat.id : '';
      }
      setCategoryId(catId || '');
      setInitialCategoryId(catId || '');
      setCustomCategoryName('');
      setShowConfirm(false);
      setError('');
    }
    // Only reset form fields when modal opens or target notebook changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, notebookData?.id]);

  // Clear selected category if it was deleted in Category Manager while modal was open
  useEffect(() => {
    if (categoryId && categories.length > 0 && !categories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [categories, categoryId]);

  if (!show) return null;

  const normalizeText = (str) => (str || '').replace(/\r\n/g, '\n').trim();

  const hasChanges =
    normalizeText(toolName) !== normalizeText(notebookData?.title) ||
    normalizeText(description) !== normalizeText(notebookData?.description) ||
    (categoryId || '') !== (initialCategoryId || '') ||
    Boolean(customCategoryName.trim());

  const canSave = Boolean(toolName.trim()) && hasChanges;

  const handleCreateCategory = async (name, color = '#6c757d') => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const existing = categories.find(
      (c) => (c.name || '').toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const created = await dispatch(
      addNotebookCategory({
        name: trimmed,
        color,
      })
    ).unwrap();
    toast.success(`Category "${trimmed}" created`);
    return created;
  };

  const handleRequestSave = () => {
    if (!toolName.trim()) {
      setError('Please enter a tool name.');
      return;
    }
    setShowConfirm(true);
  };

  const handleSave = async () => {
    if (!toolName.trim()) {
      setError('Please enter a tool name.');
      return;
    }
    setIsSaving(true);
    try {
      let finalCategoryId = categoryId || null;
      if (!finalCategoryId && customCategoryName.trim()) {
        const createdCat = await handleCreateCategory(customCategoryName.trim(), '#6c757d');
        if (createdCat?.id) {
          finalCategoryId = createdCat.id;
        }
      }

      await dispatch(editNotebook({
        id: notebookData.id,
        data: {
          title: toolName.trim(),
          categoryId: finalCategoryId,
          description: description.trim()
        }
      })).unwrap();
      
      toast.success('Notebook updated successfully');
      setShowConfirm(false);
      onClose();
      if (onNotebookUpdated) onNotebookUpdated();
    } catch (error) {
      console.error('Error saving notebook:', error);
      toast.error(error.message || 'Failed to update notebook.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="w-100 d-flex justify-content-center justify-content-sm-end gap-3">
      <AppButton 
        variant="light" 
        onClick={onClose} 
        disabled={isSaving}
        className="border shadow-sm"
      >
        Cancel
      </AppButton>
      <AppButton 
        variant={canSave ? 'dark' : 'secondary'} 
        onClick={handleRequestSave} 
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
      onClose={onClose}
      title="Edit Tool Note"
      icon="bi-pencil-square"
      footer={footer}
    >
      <AppInput 
        label="Tool / Framework Name"
        placeholder="Ex: React, Docker, Tailwind..."
        value={toolName}
        onChange={(e) => { setToolName(e.target.value); setError(''); }}
        error={error}
      />
      
      <CreatableCategorySelect
        label="Category"
        categories={categories}
        value={categoryId}
        onChange={setCategoryId}
        customName={customCategoryName}
        onCustomNameChange={setCustomCategoryName}
        onCreateCategory={handleCreateCategory}
        placeholder="Select or type to create category..."
        emptyOptionLabel="Other (Default)"
      />

      <AppTextarea
        label="Brief Description (Optional)"
        placeholder="What is this tool about?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        containerClassName="mb-0"
      />
    </AppModal>

    <DeleteConfirmModal
      show={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleSave}
      title="Save Changes?"
      message={
        <>
          Are you sure you want to update <strong>"{toolName.trim()}"</strong>?
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
