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
      <div className="mb-5">
        <h6 className={`fw-bold mb-3 ${highlightColor} text-uppercase`} style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-star-fill me-2"></i>Key Features
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
              <h6 className="fw-bold"><i className="bi bi-journal-code me-2"></i>Notebooks & Notes</h6>
              <p className="mb-0 text-secondary small">Keep your notes organized by grouping them into Notebooks. You can format your text, add code, and more using Markdown.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
              <h6 className="fw-bold"><i className="bi bi-lightning-charge me-2"></i>Flashcard Mode</h6>
              <p className="mb-0 text-secondary small">Hide your notes to test your memory, just like real flashcards! Click to reveal the answer when you are ready.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
              <h6 className="fw-bold"><i className="bi bi-tags me-2"></i>Custom Categories</h6>
              <p className="mb-0 text-secondary small">Make it yours by creating categories with custom colors. You can easily drag and drop to arrange them in any order you like!</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`p-3 rounded-3 border ${borderClass} h-100`}>
              <h6 className="fw-bold"><i className="bi bi-pin-angle me-2"></i>Pin Favorites</h6>
              <p className="mb-0 text-secondary small">Pin your favorite Notebooks or important notes so they always stay at the very top, ready for you to use.</p>
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
          <table 
            className={`table ${isDark ? 'table-dark' : ''} table-bordered ${isDark ? 'border-light border-opacity-10' : ''} align-middle mb-0`}
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
