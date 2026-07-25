import { useEffect } from 'react';

export default function useEscape(show, onClose) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (show) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);
}
