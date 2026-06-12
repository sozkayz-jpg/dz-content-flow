import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Live } from '../types';
import { generateId } from '../lib/utils';

interface LiveState {
  lives: Live[];
  addLive: (live: Omit<Live, 'id' | 'createdAt'>) => string;
  updateLive: (id: string, updates: Partial<Live>) => void;
  deleteLive: (id: string) => void;
  toggleFavorite: (id: string) => void;
  resetAll: () => void;
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set) => ({
      lives: [],
      addLive: (live) => {
        const id = generateId();
        const newLive: Live = { ...live, id, createdAt: new Date().toISOString() };
        set((state) => ({ lives: [newLive, ...state.lives] }));
        return id;
      },
      updateLive: (id, updates) =>
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      deleteLive: (id) =>
        set((state) => ({ lives: state.lives.filter((l) => l.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          ),
        })),
      resetAll: () => set({ lives: [] }),
    }),
    { name: 'dz-lives' }
  )
);
