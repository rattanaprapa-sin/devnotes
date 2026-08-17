import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addNote } from '../../../store/notesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppSelect from '../../../shared/ui/AppSelect';
import AppButton from '../../../shared/ui/AppButton';

export default function AddNoteModal({ show, onClose, notebookId, onNoteAdded, onManageCategories }) {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.noteCategories.items);
  
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!show) return null;

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      await dispatch(addNote({
        notebookId,
        title: topic,
        content,
        categoryId: categoryId || null
      })).unwrap();
      toast.success('Note created successfully');
      
      onClose();
      setTopic('');
      setContent('');
      setCategoryId('');
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
      <AppButton variant="light" className="border text-dark" onClick={onClose}>
        Cancel
      </AppButton>
      <AppButton 
        variant={(topic.trim() && content.trim()) ? 'dark' : 'secondary'} 
        onClick={handleSave} 
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
      onClose={onClose} 
      title="New Short Note" 
      icon="bi-file-earmark-text"
      footer={footer}
      borderless
    >
      <AppInput 
        label="Topic / Subject"
        placeholder="e.g., Hooks, Database connection..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label text-secondary small fw-medium mb-0">Category (Optional)</label>
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
        <AppSelect 
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[
            { value: '', label: 'Select Category...' },
            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
          ]}
          containerClassName="mb-0"
        />
      </div>

      <AppTextarea 
        label="Content"
        placeholder="Write your short notes, tricks, or code snippets here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
      />
    </AppModal>
  );
}
