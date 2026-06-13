import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyKPI } from '../types';
import { scheduleKPISync } from '../lib/syncManager';
import { loadKPIsFromSupabase } from '../lib/supabase';

const STORE_VERSION = 1;

interface KPIState {
  weeklyData: WeeklyKPI[];
  addWeek: (data: WeeklyKPI) => void;
  updateWeek: (week: string, data: Partial<WeeklyKPI>) => void;
  deleteWeek: (week: string) => void;
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

function migrateKPIState(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return { weeklyData: [] };
  const state = persisted as Record<string, unknown>;
  if (!Array.isArray(state.weeklyData)) return { weeklyData: [] };
  return state;
}

export const useKPIStore = create<KPIState>()(
  persist(
    (set, get) => ({
      weeklyData: [],
      addWeek: (data) =>
        set((state) => {
          const exists = state.weeklyData.find((w) => w.week === data.week);
          const next = exists
            ? state.weeklyData.map((w) =>
                w.week === data.week ? { ...w, ...data } : w
              )
            : [...state.weeklyData, data];
          scheduleKPISync(() => next);
          return { weeklyData: next };
        }),
      updateWeek: (week, data) => {
        set((state) => ({
          weeklyData: state.weeklyData.map((w) =>
            w.week === week ? { ...w, ...data } : w
          ),
        }));
        scheduleKPISync(() => get().weeklyData);
      },
      deleteWeek: (week) => {
        set((state) => ({
          weeklyData: state.weeklyData.filter((w) => w.week !== week),
        }));
        scheduleKPISync(() => get().weeklyData);
      },
      loadFromSupabase: async () => {
        const remote = await loadKPIsFromSupabase();
        if (remote && remote.length > 0) {
          set({ weeklyData: remote });
        }
      },
      resetAll: () => {
        set({ weeklyData: [] });
        scheduleKPISync(() => []);
      },
    }),
    {
      name: 'dz-kpis',
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return migrateKPIState(persistedState);
        }
        return persistedState;
      },
    }
  )
);
