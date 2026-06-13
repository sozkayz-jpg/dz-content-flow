import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Live } from '../types';
import { generateId } from '../lib/utils';
import { scheduleLivesSync } from '../lib/syncManager';
import { loadLivesFromSupabase } from '../lib/supabase';

const STORE_VERSION = 1;

interface LiveState {
  lives: Live[];
  addLive: (live: Omit<Live, 'id' | 'createdAt'>) => string;
  updateLive: (id: string, updates: Partial<Live>) => void;
  deleteLive: (id: string) => void;
  toggleFavorite: (id: string) => void;
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

function migrateLiveState(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return { lives: [] };
  const state = persisted as Record<string, unknown>;
  if (!Array.isArray(state.lives)) return { lives: [] };
  return state;
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set, get) => ({
      lives: [],
      addLive: (live) => {
        const id = generateId();
        const newLive: Live = { ...live, id, createdAt: new Date().toISOString() };
        set((state) => ({ lives: [newLive, ...state.lives] }));
        scheduleLivesSync(() => get().lives);
        return id;
      },
      updateLive: (id, updates) => {
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
        scheduleLivesSync(() => get().lives);
      },
      deleteLive: (id) => {
        set((state) => ({ lives: state.lives.filter((l) => l.id !== id) }));
        scheduleLivesSync(() => get().lives);
      },
      toggleFavorite: (id) => {
        set((state) => ({
          lives: state.lives.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          ),
        }));
        scheduleLivesSync(() => get().lives);
      },
      loadFromSupabase: async () => {
        const remote = await loadLivesFromSupabase();
        if (remote && remote.length > 0) {
          set({ lives: remote });
        }
      },
      resetAll: () => {
        set({ lives: [] });
        scheduleLivesSync(() => []);
      },
    }),
    {
      name: 'dz-lives',
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return migrateLiveState(persistedState);
        }
        return persistedState;
      },
    }
  )
);
