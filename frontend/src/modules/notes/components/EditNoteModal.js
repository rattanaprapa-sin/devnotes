import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { editNote } from '../../../store/notesSlice';
import AppModal from '../../../shared/ui/AppModal';
import AppInput from '../../../shared/ui/AppInput';
import AppSelect from '../../../shared/ui/AppSelect';
import AppTextarea from '../../../shared/ui/AppTextarea';
import AppButton from '../../../shared/ui/AppButton';

export default function EditNoteModal({ show, onClose, noteData, onManageCategories }) {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.noteCategories.items);
  
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noteData && show) {
      setTopic(noteData.title || '');
      setContent(noteData.content || '');
      setCategoryId(noteData.category_id || '');
    }
  }, [show, noteData]);

  if (!show) return null;

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      await dispatch(editNote({
        id: noteData.id,
        data: {
          title: topic,
          content,
          categoryId: categoryId || null
        }
      })).unwrap();
      
      toast.success('Note updated successfully');
      onClose();
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
        onClick={onClose} 
        disabled={isSaving}
        className="border shadow-sm"
      >
        Cancel
      </AppButton>
      <AppButton 
        variant={(topic.trim() && content.trim()) ? 'dark' : 'secondary'} 
        onClick={handleSave} 
        disabled={isSaving || !topic.trim() || !content.trim()}
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
      title="Edit Short Note"
      icon="bi-pencil-square"
      footer={footer}
    >
      <AppInput 
        label="Topic / Subject"
        placeholder="e.g., Hooks, Database connection..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      
      <div className="position-relative">
        {onManageCategories && (
          <AppButton 
            variant="link" 
            size="sm" 
            className="text-decoration-none p-0 d-flex align-items-center gap-1 text-primary position-absolute end-0 top-0 mt-1 me-1"
            onClick={onManageCategories}
            icon="bi-gear-fill"
          >
            Manage
          </AppButton>
        )}
        <AppSelect
          label="Category (Optional)"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[
            { value: '', label: 'Other' },
            ...categories.map(cat => ({ value: cat.id, label: cat.name }))
          ]}
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
