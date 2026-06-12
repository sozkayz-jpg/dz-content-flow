import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Live } from '../types';
import { generateId } from '../lib/utils';
import { syncLivesToSupabase, loadLivesFromSupabase } from '../lib/supabase';

interface LiveState {
  lives: Live[];
  addLive: (live: Omit<Live, 'id' | 'createdAt'>) => string;
  updateLive: (id: string, updates: Partial<Live>) => void;
  deleteLive: (id: string) => void;
  toggleFavorite: (id: string) => void;
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set, get) => ({
      lives: [],
      addLive: (live) => {
        const id = generateId();
        const newLive: Live = { ...live, id, createdAt: new Date().toISOString() };
        set((state) => ({ lives: [newLive, ...state.lives] }));
        syncLivesToSupabase(get().lives);
        return id;
      },
      updateLive: (id, updates) => {
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
        syncLivesToSupabase(get().lives);
      },
      deleteLive: (id) => {
        set((state) => ({ lives: state.lives.filter((l) => l.id !== id) }));
        syncLivesToSupabase(get().lives);
      },
      toggleFavorite: (id) => {
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          ),
        }));
        syncLivesToSupabase(get().lives);
      },
      loadFromSupabase: async () => {
        const remote = await loadLivesFromSupabase();
        if (remote && remote.length > 0) {
          set({ lives: remote });
        }
      },
      resetAll: () => {
        set({ lives: [] });
        syncLivesToSupabase([]);
      },
    }),
    { name: 'dz-lives' }
  )
);
