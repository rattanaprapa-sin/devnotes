import { useState } from 'react';
import toast from 'react-hot-toast';
import { createNotebook } from '../../../storage/api';
import useEscape from '../../../shared/hooks/useEscape';

export default function AddNotebookModal({ show, onClose, onNotebookAdded, existingNotebooks = [] }) {
  const [step, setStep] = useState(1); // 1: Form, 2: AI Result
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [error, setError] = useState('');

  useEscape(show, onClose);

  if (!show) return null;

  const resetAndClose = () => {
    onClose();
    setStep(1);
    setIsManual(false);
    setToolName('');
    setDescription('');
    setError('');
  };

  const getCategoryClass = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'frontend': return 'badge-frontend';
      case 'backend': return 'badge-backend';
      case 'database': return 'badge-database';
      case 'devops': return 'badge-devops';
      case 'tooling': return 'badge-tooling';
      default: return 'badge-other';
    }
  };

  const handleCategorize = () => {
    if (!toolName.trim()) {
      setError('Please enter a tool name.');
      return;
    }

    if (existingNotebooks.some(nb => nb.title.toLowerCase() === toolName.trim().toLowerCase())) {
      setError('A notebook with this name already exists.');
      return;
    }

    setError('');
    
    // Basic AI categorization logic based on keywords
    const name = toolName.toLowerCase();
    let cat = 'Other';
    
    if (['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'tailwind', 'bootstrap', 'material', 'mui', 'html', 'css', 'javascript', 'redux', 'framer'].some(k => name.includes(k))) {
      cat = 'Frontend';
    } else if (['node', 'express', 'nest', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'ruby', 'rails', 'asp', 'dotnet', 'go', 'golang', 'php'].some(k => name.includes(k))) {
      cat = 'Backend';
    } else if (['mysql', 'postgres', 'mongo', 'redis', 'sqlite', 'oracle', 'sql', 'firebase', 'firestore', 'supabase', 'cassandra', 'elastic'].some(k => name.includes(k))) {
      cat = 'Database';
    } else if (['docker', 'kubernetes', 'k8s', 'jenkins', 'terraform', 'ansible', 'nginx', 'aws', 'gcp', 'azure', 'prometheus', 'grafana', 'linux', 'ubuntu', 'ci'].some(k => name.includes(k))) {
      cat = 'DevOps';
    } else if (['git', 'github', 'gitlab', 'postman', 'swagger', 'openapi', 'vite', 'webpack', 'npm', 'yarn', 'pnpm', 'vscode', 'figma', 'eslint', 'prettier', 'insomnia'].some(k => name.includes(k))) {
      cat = 'Tooling';
    }
    
    setCategory(cat);
    setIsManual(false);
    setStep(2);
  };

  const handleSave = async () => {
    if (!toolName) return;
    setIsSaving(true);
    try {
      await createNotebook({
        title: toolName.trim(),
        category,
        description: description.trim()
      });
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

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" onClick={resetAndClose} style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 shadow border-0">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-journal-plus"></i>
              New Tool Note
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={resetAndClose}></button>
          </div>
          <div className="modal-body p-4">
            {step === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-medium">Tool / Framework Name</label>
                  <input 
                    type="text" 
                    className={`form-control rounded-3 py-2 shadow-none ${error ? 'border-danger' : 'border-secondary'}`} 
                    placeholder="e.g., React, Docker, Tailwind..."
                    value={toolName}
                    onChange={(e) => { setToolName(e.target.value); setError(''); }}
                  />
                  {error && <div className="text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
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
                <div className="d-flex justify-content-end">
                  <button 
                    className={`btn text-white rounded-pill px-4 ${toolName.trim() ? 'btn-dark' : 'btn-secondary'}`} 
                    style={{ transition: 'background-color 0.3s ease' }}
                    onClick={handleCategorize}
                  >
                    Categorize & Create <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="text-center py-3">
                {isManual ? (
                  <>
                    <h4 className="fw-bold mb-3">Select Category</h4>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      {['Frontend', 'Backend', 'Database', 'DevOps', 'Tooling', 'Other'].map(c => (
                        <button 
                          key={c}
                          className={`btn rounded-pill px-3 py-1 ${category === c ? `${getCategoryClass(c)} fw-semibold` : `bg-light border text-secondary`}`}
                          onClick={() => setCategory(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn bg-white border text-dark rounded-pill px-4" onClick={() => setStep(1)}>
                        <i className="bi bi-arrow-left me-1"></i> Back
                      </button>
                      <button className="btn btn-dark rounded-pill px-4" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-check2 me-1"></i>
                        )}
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <i className="bi bi-stars fs-1 text-secondary mb-3 d-block"></i>
                    <h4 className="fw-bold mb-2">AI categorization</h4>
                    <p className="text-secondary mb-4">We've identified this tool as:</p>
                    
                    <span className={`badge rounded-pill px-4 py-2 fs-5 fw-medium mb-4 ${getCategoryClass(category)}`}>
                      {category}
                    </span>
                    
                    <p className="text-secondary small mb-4">Does this look right to you?</p>
                    
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn bg-white border text-dark rounded-pill px-4" onClick={() => setIsManual(true)}>
                        <i className="bi bi-pencil me-1"></i> Change Manually
                      </button>
                      <button className="btn btn-dark rounded-pill px-4" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-check2 me-1"></i>
                        )}
                        {isSaving ? 'Saving...' : 'Yes, Save'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
