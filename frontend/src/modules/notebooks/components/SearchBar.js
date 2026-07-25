import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="row justify-content-center mb-5">
      <div className="col-12 col-md-8 col-lg-6">
        <div 
          className={`input-group rounded-pill overflow-hidden border ${
            isFocused 
              ? `shadow-lg border-primary` 
              : isHovered 
                ? `shadow ${theme === 'dark' ? 'border-secondary border-opacity-50' : 'border-secondary border-opacity-25'}`
                : `shadow-sm ${theme === 'dark' ? 'border-secondary border-opacity-25' : 'border-light-subtle'}`
          }`}
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isFocused ? (theme === 'dark' ? '0 0 0 2px rgba(13, 110, 253, 0.25)' : '0 0 0 3px rgba(13, 110, 253, 0.2)') : ''
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span 
            className={`input-group-text border-0 ps-4 pe-2 ${theme === 'dark' ? 'bg-dark' : 'bg-white'} ${isFocused ? 'text-primary' : 'text-secondary'}`}
            style={{ transition: 'color 0.3s ease' }}
          >
            <i className="bi bi-search"></i>
          </span>
          <input 
            id="search-input"
            type="text" 
            className={`form-control border-0 py-3 shadow-none pe-2 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white text-dark'}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ transition: 'background-color 0.3s ease, color 0.3s ease' }}
          />
          <span 
            className={`input-group-text border-0 pe-4 ps-2 ${theme === 'dark' ? 'bg-dark' : 'bg-white'} d-none d-md-flex`}
            style={{ transition: 'background-color 0.3s ease' }}
          >
            <kbd className={`px-2 py-1 ${theme === 'dark' ? 'bg-secondary bg-opacity-50 text-light border-secondary' : 'bg-light text-secondary border-secondary border-opacity-25'} border rounded-3`} style={{ fontSize: '0.75rem', fontFamily: 'inherit' }}>
              Ctrl K
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
