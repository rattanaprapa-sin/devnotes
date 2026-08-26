import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={className}>
      <div 
        className={`d-flex align-items-center rounded-pill overflow-hidden transition-all ${
          isFocused 
            ? `shadow-sm ${theme === 'dark' ? 'bg-dark border border-light border-opacity-25' : 'bg-white border border-primary border-opacity-25'}` 
            : `${theme === 'dark' ? 'bg-dark border border-secondary border-opacity-25' : 'border border-secondary border-opacity-10'}`
        }`}
        style={{ 
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isFocused ? (theme === 'dark' ? '0 0 0 2px rgba(255, 255, 255, 0.15)' : '0 0 0 3px rgba(13, 110, 253, 0.15)') : '',
          height: '38px',
          backgroundColor: (!isFocused && theme !== 'dark') ? 'rgba(0,0,0,0.04)' : ''
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
          className={`flex-grow-1 py-1 pe-4 bg-transparent ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
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
  );
}
