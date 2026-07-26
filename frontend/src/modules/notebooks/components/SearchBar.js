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
          className={`d-flex align-items-center rounded-pill overflow-hidden border ${theme === 'dark' ? 'bg-dark' : 'bg-white'} ${
            isFocused 
              ? `shadow-lg ${theme === 'dark' ? 'border-light border-opacity-50' : 'border-primary'}` 
              : isHovered 
                ? `shadow ${theme === 'dark' ? 'border-light border-opacity-25' : 'border-secondary border-opacity-25'}`
                : `shadow-sm ${theme === 'dark' ? 'border-light border-opacity-10' : 'border-light-subtle'}`
          }`}
          style={{ 
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isFocused ? (theme === 'dark' ? '0 0 0 2px rgba(255, 255, 255, 0.15)' : '0 0 0 3px rgba(13, 110, 253, 0.2)') : ''
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span 
            className={`d-flex align-items-center justify-content-center ps-4 pe-2 bg-transparent ${isFocused ? (theme === 'dark' ? 'text-light' : 'text-primary') : 'text-secondary'}`}
            style={{ transition: 'color 0.3s ease' }}
          >
            <i className="bi bi-search"></i>
          </span>
          <input 
            id="search-input"
            type="text" 
            className={`flex-grow-1 py-3 pe-4 bg-transparent ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ 
              border: 'none', 
              outline: 'none',
              boxShadow: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
