import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useEscape from '../hooks/useEscape';

export default function UserGuideModal({ show, onClose }) {
  const { theme } = useTheme();

  useEscape(show, onClose);

  if (!show) return null;

  const isDark = theme === 'dark';
  const modalBg = isDark ? 'bg-dark text-light' : 'bg-white text-dark';
  const borderClass = isDark ? 'border-secondary border-opacity-25' : 'border-light';
  const codeBg = isDark ? 'bg-secondary bg-opacity-25' : 'bg-light';
  const highlightColor = theme === 'blue' ? 'text-primary' : (isDark ? 'text-info' : 'text-primary');

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(33, 37, 41, 0.4)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      ></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={(e) => {
        if (e.target.className.includes('modal')) onClose();
      }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
          <div className={`modal-content shadow-lg border-0 rounded-4 ${modalBg}`}>
            <div className={`modal-header border-bottom ${borderClass} px-4 py-3 d-flex justify-content-between align-items-center`}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <i className={`bi bi-book-half fs-4 ${highlightColor}`}></i>
                DevNotes Guide
              </h5>
              <button 
                type="button" 
                className={`btn-close ${isDark ? 'btn-close-white' : ''}`}
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body px-4 py-4" style={{ fontSize: '0.95rem' }}>
              <div className="mb-5">
                <h6 className={`fw-bold mb-3 ${highlightColor} text-uppercase`} style={{ letterSpacing: '0.5px' }}>
                  <i className="bi bi-star-fill me-2"></i>Key Features
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
                      <h6 className="fw-bold"><i className="bi bi-journal-code me-2"></i>Notebooks & Notes</h6>
                      <p className="mb-0 text-muted small">Organize your code snippets and learning materials into isolated Notebooks. Notes support full Markdown syntax.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
                      <h6 className="fw-bold"><i className="bi bi-lightning-charge me-2"></i>Flashcard Mode</h6>
                      <p className="mb-0 text-muted small">Toggle 'Flashcard Mode' to hide note contents by default. Great for memorizing concepts before revealing the answers!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h6 className={`fw-bold mb-3 ${highlightColor} text-uppercase`} style={{ letterSpacing: '0.5px' }}>
                  <i className="bi bi-keyboard me-2"></i>Keyboard Shortcuts
                </h6>
                <div className={`p-3 rounded-3 border ${borderClass}`}>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    <li className="d-flex justify-content-between align-items-center">
                      <span>Close Modals / Modals</span>
                      <kbd className={`${codeBg} ${isDark ? 'text-light' : 'text-dark'}`}>Esc</kbd>
                    </li>
                    <li className="d-flex justify-content-between align-items-center">
                      <span>Next Note (in View Mode)</span>
                      <kbd className={`${codeBg} ${isDark ? 'text-light' : 'text-dark'}`}>Right Arrow ➡️</kbd>
                    </li>
                    <li className="d-flex justify-content-between align-items-center">
                      <span>Previous Note (in View Mode)</span>
                      <kbd className={`${codeBg} ${isDark ? 'text-light' : 'text-dark'}`}>Left Arrow ⬅️</kbd>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h6 className={`fw-bold mb-3 ${highlightColor} text-uppercase`} style={{ letterSpacing: '0.5px' }}>
                  <i className="bi bi-markdown-fill me-2"></i>Markdown Cheatsheet
                </h6>
                <div className="table-responsive">
                  <table className={`table ${isDark ? 'table-dark' : ''} table-bordered border-${isDark ? 'secondary' : 'light'} align-middle mb-0`}>
                    <thead className={codeBg}>
                      <tr>
                        <th style={{ width: '40%' }}>Element</th>
                        <th>Markdown Syntax</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      <tr>
                        <td className="fw-medium">Headings</td>
                        <td><code className="text-danger"># H1</code> <br/><code className="text-danger">## H2</code></td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Bold / Italic</td>
                        <td><code className="text-danger">**bold text**</code> <br/><code className="text-danger">*italic text*</code></td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Code Block</td>
                        <td>
                          <code className="text-danger">```javascript</code><br/>
                          <code className="text-danger">const a = 1;</code><br/>
                          <code className="text-danger">```</code>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Inline Code</td>
                        <td><code className="text-danger">`code`</code></td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Lists</td>
                        <td><code className="text-danger">- Item 1</code> <br/><code className="text-danger">1. Item 1</code></td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Links</td>
                        <td><code className="text-danger">[title](https://url.com)</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            <div className={`modal-footer border-top px-4 py-3 ${borderClass}`}>
              <button type="button" className={`btn ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'} rounded-pill px-4`} onClick={onClose}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
