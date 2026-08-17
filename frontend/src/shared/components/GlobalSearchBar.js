import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import useClickOutside from '../hooks/useClickOutside';
import { globalSearch } from '../../storage/api';

// Helper to strip markdown/html and get a snippet around the match
const getSnippet = (text, query) => {
  if (!text) return '';
  // Basic strip html/markdown (very rudimentary)
  const plainText = text.replace(/<[^>]*>?/gm, '').replace(/[#*_~`>]/g, '');
  if (!query) return plainText.substring(0, 60) + (plainText.length > 60 ? '...' : '');
  
  const lowerText = plainText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return plainText.substring(0, 60) + (plainText.length > 60 ? '...' : '');
  
  const start = Math.max(0, index - 20);
  const end = Math.min(plainText.length, index + query.length + 40);
  
  let snippet = plainText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < plainText.length) snippet = snippet + '...';
  
  return snippet;
};

export default function GlobalSearchBar({ value, onChange, placeholder = "Search notebooks and notes..." }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [results, setResults] = useState({ notebooks: [], notes: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const containerRef = useClickOutside(() => {
    setShowDropdown(false);
  });

  // Debounced search
  useEffect(() => {
    if (!value || value.trim() === '') {
      setResults({ notebooks: [], notes: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await globalSearch(value);
        // Handle standard API response format `{ success, data }` or direct data
        const data = response.data || response;
        setResults({ notebooks: data.notebooks || [], notes: data.notes || [] });
        setShowDropdown(true);
      } catch (error) {
        console.error('Global search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleInputFocus = () => {
    setIsFocused(true);
    if (value && (results.notebooks.length > 0 || results.notes.length > 0 || isLoading)) {
      setShowDropdown(true);
    }
  };

  const navigateToNotebook = (id) => {
    setShowDropdown(false);
    navigate(`/notebook/${id}`);
  };

  const hasResults = results.notebooks.length > 0 || results.notes.length > 0;

  return (
    <div className="row justify-content-center mb-5 w-100" ref={containerRef}>
      <div className="col-12 col-md-8 col-lg-6 position-relative">
        <div 
          className={`d-flex align-items-center rounded-pill overflow-hidden border ${theme === 'dark' ? 'bg-dark' : 'bg-white'} ${
            isFocused 
              ? `shadow-lg ${theme === 'dark' ? 'border-light border-opacity-50' : 'border-primary'}` 
              : isHovered 
                ? `shadow ${theme === 'dark' ? 'border-light border-opacity-25' : 'border-secondary border-opacity-25'}`
                : `shadow-sm ${theme === 'dark' ? 'border-light border-opacity-10' : 'border-light-subtle'}`
          }`}
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isFocused ? (theme === 'dark' ? '0 0 0 2px rgba(255, 255, 255, 0.15)' : '0 0 0 3px rgba(13, 110, 253, 0.2)') : '',
            zIndex: isFocused ? 1050 : 1
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span 
            className={`d-flex align-items-center justify-content-center ps-4 pe-2 bg-transparent ${isFocused ? (theme === 'dark' ? 'text-light' : 'text-primary') : 'text-secondary'}`}
            style={{ transition: 'color 0.3s ease' }}
          >
            {isLoading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className="bi bi-search"></i>
            )}
          </span>
          <input 
            id="global-search-input"
            type="text" 
            className={`flex-grow-1 py-3 pe-4 bg-transparent ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            style={{ 
              border: 'none', 
              outline: 'none',
              boxShadow: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (hasResults || (!isLoading && !hasResults && value)) && (
          <div 
            className={`position-absolute w-100 mt-2 rounded-4 shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-dark border-secondary border-opacity-25' : 'bg-white border-light-subtle'}`}
            style={{ 
              top: '100%', 
              left: 0, 
              zIndex: 1050,
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {!isLoading && !hasResults && value && (
              <div className="p-4 text-center text-secondary">
                <i className="bi bi-search mb-2 fs-4 d-block"></i>
                <p className="mb-0">No results found for "{value}"</p>
              </div>
            )}

            {results.notebooks.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Notebooks
                </div>
                {results.notebooks.map((notebook, index) => (
                  <div 
                    key={`nb-${notebook.id}`}
                    className={`px-4 py-2 d-flex align-items-center gap-3 text-decoration-none ${theme === 'dark' ? 'text-light hover-bg-secondary hover-bg-opacity-25' : 'text-dark hover-bg-light'} ${index < results.notebooks.length - 1 ? (theme === 'dark' ? 'border-bottom border-secondary border-opacity-25' : 'border-bottom border-light-subtle') : ''}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigateToNotebook(notebook.id)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                      <i className="bi bi-journal-bookmark fs-5"></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate">{notebook.title}</div>
                      {notebook.category && (
                        <div className="text-secondary small text-truncate" style={{ fontSize: '0.8rem' }}>
                          {notebook.notebook_categories?.name || notebook.category}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.notebooks.length > 0 && results.notes.length > 0 && (
              <div className="border-bottom mx-3 my-1" style={{ opacity: theme === 'dark' ? 0.2 : 0.5 }}></div>
            )}

            {results.notes.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Notes
                </div>
                {results.notes.map((note, index) => (
                  <div 
                    key={`note-${note.id}`}
                    className={`px-4 py-2 d-flex align-items-center gap-3 text-decoration-none ${theme === 'dark' ? 'text-light hover-bg-secondary hover-bg-opacity-25' : 'text-dark hover-bg-light'} ${index < results.notes.length - 1 ? (theme === 'dark' ? 'border-bottom border-secondary border-opacity-25' : 'border-bottom border-light-subtle') : ''}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigateToNotebook(note.notebook_id)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="bg-success bg-opacity-10 text-success rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                      <i className="bi bi-file-earmark-text fs-5"></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate">{note.title || 'Untitled Note'}</div>
                      <div className="text-secondary small text-truncate" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {getSnippet(note.content, value)}
                      </div>
                      <div className="text-primary small text-truncate mt-1" style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                        <i className="bi bi-journal-bookmark me-1"></i>
                        {note.notebook_title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`p-2 text-center text-primary ${theme === 'dark' ? 'bg-secondary bg-opacity-10' : 'bg-light'} fw-semibold`} style={{ fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setShowDropdown(false)}>
              Press Enter to view all results in main layout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
