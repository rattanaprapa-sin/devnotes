import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { editNotebook } from '../../../store/notebooksSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import AppSelect from '../../../shared/ui/AppSelect';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppButton from '../../../shared/ui/AppButton';

export default function EditNotebookModal({ show, onClose, notebookData, categories = [], onNotebookUpdated }) {
  const dispatch = useDispatch();
  
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notebookData && show) {
      setToolName(notebookData.title || '');
      setDescription(notebookData.description || '');
      let catId = notebookData.category_id;
      if (!catId && categories.length > 0) {
        const otherCat = categories.find(c => (c.name || '').toLowerCase() === 'other');
        catId = otherCat ? otherCat.id : categories[0].id;
      }
      setCategoryId(catId || '');
      setError('');
    }
  }, [show, notebookData]);

  if (!show) return null;

  const handleSave = async () => {
    if (!toolName.trim()) {
      setError('Please enter a tool name.');
      return;
    }
    setIsSaving(true);
    try {
      await dispatch(editNotebook({
        id: notebookData.id,
        data: {
          title: toolName.trim(),
          categoryId: categoryId || null,
          description: description.trim()
        }
      })).unwrap();
      
      toast.success('Notebook updated successfully');
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
        variant={toolName.trim() ? 'dark' : 'secondary'} 
        onClick={handleSave} 
        disabled={isSaving || !toolName.trim()}
        isLoading={isSaving}
        loadingText="Saving..."
        icon={!isSaving ? 'bi-check2' : null}
      >
        {isSaving ? '' : 'Save Changes'}
      </AppButton>
    </div>
  );

  return (
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
      
      <AppSelect
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={[
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
