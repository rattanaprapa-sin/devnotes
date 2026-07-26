import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { createNote } from '../../../storage/api';
import { addNote } from '../../../store/notesSlice';
import { useTheme } from '../../../contexts/ThemeContext';
import useEscape from '../../../shared/hooks/useEscape';

export default function AddNoteModal({ show, onClose, notebookId, onNoteAdded }) {
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  useEscape(show, onClose);

  if (!show) return null;

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      await createNote({
        notebookId,
        title: topic,
        content
      });
      toast.success('Note created successfully');
      
      onClose();
      setTopic('');
      setContent('');
      if (onNoteAdded) onNoteAdded();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note.');
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
              <i className="bi bi-file-earmark-text"></i>
              New Short Note
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
            <div className="d-flex justify-content-center gap-3">
              <button className="btn bg-white border text-dark rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button 
                className={`btn text-white rounded-pill px-4 ${(topic.trim() && content.trim()) ? 'btn-dark' : 'btn-secondary'}`} 
                style={{ transition: 'background-color 0.3s ease' }}
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-box-arrow-down me-1"></i>
                )}
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
