import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addNotebook } from '../../../store/notebooksSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import AppSelect from '../../../shared/ui/AppSelect';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppButton from '../../../shared/ui/AppButton';

export default function AddNotebookModal({ show, onClose, onNotebookAdded, existingNotebooks = [], categories = [] }) {
  const dispatch = useDispatch();
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');



  if (!show) return null;

  const resetAndClose = () => {
    onClose();
    setToolName('');
    setCategoryId('');
    setDescription('');
    setError('');
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
    let finalCategoryId = categoryId;
    if (!finalCategoryId && categories.length > 0) {
      const otherCat = categories.find(c => (c.name || '').toLowerCase() === 'other');
      finalCategoryId = otherCat ? otherCat.id : null;
    }

    try {
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
      <AppSelect
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={[
          { value: '', label: 'Select Category...' },
          ...categories.map(cat => ({ value: cat.id, label: cat.name }))
        ]}
      />
      <AppTextarea
        label="Brief Description (Optional)"
        placeholder="What is this tool about?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
    </AppModal>
  );
}
