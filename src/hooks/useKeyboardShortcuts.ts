import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VIEW_SHORTCUTS } from '../lib/constants';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === '?') {
        e.preventDefault();
        // Show shortcuts help - handled in component
        return;
      }
      const view = VIEW_SHORTCUTS[key];
      if (view) {
        e.preventDefault();
        navigate('/' + view);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
