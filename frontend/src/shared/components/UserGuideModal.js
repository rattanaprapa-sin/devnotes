import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AppModal from '../ui/AppModal';
import AppButton from '../ui/AppButton';

export default function UserGuideModal({ show, onClose }) {
  const { theme } = useTheme();

  if (!show) return null;

  const isDark = theme === 'dark';
  const borderClass = isDark ? 'border-light border-opacity-25' : 'border-secondary-subtle';
  const codeBg = isDark ? 'bg-light bg-opacity-10' : 'bg-light';

  // Use neutral color for dark mode (white), and primary for light/blue
  const highlightColor = isDark ? 'text-light' : 'text-primary';

  const footer = (
    <div className="w-100 d-flex justify-content-end">
      <AppButton
        variant={isDark ? 'custom' : 'dark'}
        className={`rounded-pill px-4 ${isDark ? 'border-0 hover-opacity fw-bold' : ''}`}
        style={isDark ? { backgroundColor: '#ffffff', color: '#000000' } : {}}
        onClick={onClose}
      >
        Got it!
      </AppButton>
    </div>
  );

  return (
    <AppModal
      show={show}
      onClose={onClose}
      title="DevNotes Guide"
      icon="bi-book-half"
      size="lg"
      footer={footer}
    >
      <div className="mb-4 mb-md-5 user-guide-section">
        <h6 className={`fw-bold mb-2 mb-md-3 ${highlightColor} text-uppercase user-guide-heading`} style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-star-fill me-2"></i>Key Features
        </h6>
        <div className="row g-2 g-md-3">
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-journal-code me-2"></i>Notebooks & Notes</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Group your notes into Notebooks and format text, code, or tables easily</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-sticky-fill text-warning me-2"></i>Sticky Checklist</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Quick post-it checklist on your home screen with custom colors and progress</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-check2-square text-success me-2"></i>Interactive Checklist</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Toggle tasks directly inside your notes with automatic progress tracking</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-lightning-charge me-2"></i>Flashcard Mode</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Blur note contents to test your memory and tap any card to reveal the answer</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-tags me-2"></i>Custom Categories</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Create color-coded categories, reorder by drag and drop, or hide unused ones</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100 user-guide-card`}>
              <h6 className="fw-bold user-guide-card-title"><i className="bi bi-pin-angle me-2"></i>Pin Favorites</h6>
              <p className="mb-0 text-secondary small user-guide-card-text">Pin important Notebooks or notes so they always stay at the top</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 mb-md-5 user-guide-section">
        <h6 className={`fw-bold mb-2 mb-md-3 ${highlightColor} text-uppercase user-guide-heading`} style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-keyboard me-2"></i>Keyboard Shortcuts
        </h6>
        <div className={`p-3 rounded-3 border ${borderClass} user-guide-card`}>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2 user-guide-shortcuts">
            <li className="d-flex justify-content-between align-items-center">
              <span>Close Modals</span>
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

      <div className="user-guide-section">
        <h6 className={`fw-bold mb-2 mb-md-3 ${highlightColor} text-uppercase user-guide-heading`} style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-markdown-fill me-2"></i>Markdown Cheatsheet
        </h6>
        <div className="table-responsive">
          <table
            className={`table ${isDark ? 'table-dark' : ''} table-bordered ${isDark ? 'border-light border-opacity-10' : ''} align-middle mb-0 user-guide-table`}
            style={!isDark ? { '--bs-border-color': '#dee2e6', '--bs-table-border-color': '#dee2e6' } : {}}
          >
            <thead className={codeBg}>
              <tr>
                <th style={{ width: '40%' }}>Element</th>
                <th>Markdown Syntax</th>
              </tr>
            </thead>
            <tbody className="small">
              <tr>
                <td className="fw-medium">Checklist / Tasks</td>
                <td>
                  <code className="text-danger">- [ ] To-do task</code><br/>
                  <code className="text-danger">- [x] Completed task</code>
                </td>
              </tr>
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
    </AppModal>
  );
}
