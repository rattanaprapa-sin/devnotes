import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { editNotebook } from '../../../store/notebooksSlice';
import useEscape from '../../../shared/hooks/useEscape';

export default function EditNotebookModal({ show, onClose, notebookData }) {
  const dispatch = useDispatch();
  
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (notebookData && show) {
      setToolName(notebookData.title || '');
      setDescription(notebookData.description || '');
      setCategory(notebookData.category || 'Frontend');
    }
  }, [show, notebookData]);

  useEscape(show, onClose);

  if (!show) return null;

  const handleSave = async () => {
    if (!toolName) return;
    setIsSaving(true);
    try {
      await dispatch(editNotebook({
        id: notebookData.id,
        data: {
          title: toolName.trim(),
          category,
          description: description.trim()
        }
      })).unwrap();
      
      toast.success('Notebook updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving notebook:', error);
      toast.error('Failed to update notebook.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" onClick={onClose} style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-pencil-square"></i>
              Edit Tool Note
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium">Tool / Framework Name</label>
              <input 
                type="text" 
                className="form-control rounded-3 py-2 shadow-none border-secondary" 
                placeholder="e.g., React, Docker, Tailwind..."
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium">Category</label>
              <select 
                className="form-select rounded-3 py-2 shadow-none border-secondary"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Tooling">Tooling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium">Brief Description (Optional)</label>
              <textarea 
                className="form-control rounded-3 py-2 shadow-none border-secondary text-opacity-50" 
                rows="3" 
                placeholder="What is this tool about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
