import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addNotebook } from '../../../store/notebooksSlice';
import { addNotebookCategory } from '../../../store/categoriesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import CreatableCategorySelect from '../../../shared/components/CreatableCategorySelect';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppButton from '../../../shared/ui/AppButton';

export default function AddNotebookModal({ show, onClose, onNotebookAdded, existingNotebooks = [], categories = [] }) {
  const dispatch = useDispatch();
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const resetAndClose = () => {
    onClose();
    setToolName('');
    setCategoryId('');
    setCustomCategoryName('');
    setDescription('');
    setError('');
  };

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

  const handleSave = async () => {
    if (!toolName.trim()) {
      setError('Please enter a tool name.');
      return;
    }
    if (existingNotebooks.some(nb => nb.title.toLowerCase() === toolName.trim().toLowerCase())) {
      setError('A notebook with this name already exists.');
      return;
    }
    
    setIsSaving(true);
    try {
      let finalCategoryId = categoryId;
      if (!finalCategoryId && customCategoryName.trim()) {
        const createdCat = await handleCreateCategory(customCategoryName.trim(), '#6c757d');
        if (createdCat?.id) {
          finalCategoryId = createdCat.id;
        }
      }

      if (!finalCategoryId && categories.length > 0) {
        const otherCat = categories.find(c => (c.name || '').toLowerCase() === 'other');
        finalCategoryId = otherCat ? otherCat.id : null;
      }

      await dispatch(addNotebook({
        title: toolName.trim(),
        categoryId: finalCategoryId,
        description: description.trim()
      })).unwrap();
      toast.success('Notebook created successfully');
      if (onNotebookAdded) onNotebookAdded();
      resetAndClose();
    } catch (error) {
      console.error('Error saving notebook:', error);
      toast.error(error.message || 'Failed to save notebook.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="w-100 d-flex justify-content-end">
      <AppButton 
        variant={toolName.trim() ? 'primary' : 'secondary'} 
        onClick={handleSave}
        disabled={isSaving || !toolName.trim()}
        isLoading={isSaving}
        loadingText="Saving..."
        icon={!isSaving ? 'bi-check2' : null}
      >
        {isSaving ? '' : 'Save & Create'}
      </AppButton>
    </div>
  );

  return (
    <AppModal
      show={show}
      onClose={resetAndClose}
      title="New Tool Note"
      icon="bi-journal-plus"
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
  );
}
