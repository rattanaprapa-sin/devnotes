import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { editNote } from '../../../store/notesSlice';
import { useTheme } from '../../../contexts/ThemeContext';
import useEscape from '../../../shared/hooks/useEscape';

export default function EditNoteModal({ show, onClose, noteData }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noteData && show) {
      setTopic(noteData.title || '');
      setContent(noteData.content || '');
    }
  }, [show, noteData]);

  useEscape(show, onClose);

  if (!show) return null;

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      await dispatch(editNote({
        id: noteData.id,
        data: {
          title: topic,
          content
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

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-pencil-square"></i>
              Edit Short Note
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium">Topic / Subject</label>
              <input 
                type="text" 
                className={`form-control rounded-3 py-2 shadow-none ${theme === 'dark' ? 'border-secondary border-opacity-50' : 'border-dark'}`}
                placeholder="e.g., Hooks, Database connection..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium">Content</label>
              <textarea 
                className={`form-control rounded-3 py-2 shadow-none ${theme === 'dark' ? 'border-secondary border-opacity-50' : 'border-dark'} text-opacity-50`}
                rows="5" 
                placeholder="Write your short notes, tricks, or code snippets here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
            <div className="d-flex justify-content-center justify-content-sm-end gap-3">
              <button className="btn btn-light border shadow-sm rounded-pill px-4" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-dark rounded-pill px-4" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-check2 me-1"></i>
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
