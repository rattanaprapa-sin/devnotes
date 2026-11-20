import { useEffect, useRef } from 'react';

const escapeStack = [];

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && escapeStack.length > 0) {
      e.stopPropagation();
      const topHandler = escapeStack[escapeStack.length - 1];
      topHandler?.();
    }
  });
}

export default function useEscape(show, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!show) return;

    const handler = () => onCloseRef.current?.();
    escapeStack.push(handler);

    return () => {
      const idx = escapeStack.lastIndexOf(handler);
      if (idx !== -1) {
        escapeStack.splice(idx, 1);
      }
    };
  }, [show]);
}
