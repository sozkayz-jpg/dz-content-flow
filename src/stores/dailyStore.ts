import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DARIJA_QUOTES } from '../lib/constants';

const STORE_VERSION = 1;

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface DayData {
  objective: string;
  tasks: Task[];
  quote: string;
}

interface DailyState {
  days: Record<string, DayData>;
  ensureToday: () => void;
  setObjective: (text: string) => void;
  updateTask: (id: string, text: string, done?: boolean) => void;
  toggleTask: (id: string) => void;
}

function getTodayKey(): string {
  return new Date().toDateString();
}

function createEmptyDay(): DayData {
  return {
    objective: '',
    tasks: [
      { id: '1', text: '', done: false },
      { id: '2', text: '', done: false },
      { id: '3', text: '', done: false },
    ],
    quote: DARIJA_QUOTES[Math.floor(Math.random() * DARIJA_QUOTES.length)],
  };
}

function migrateDailyState(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return { days: {} };
  const state = persisted as Record<string, unknown>;
  if (!state.days || typeof state.days !== 'object') return { days: {} };
  return state;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      days: {},
      ensureToday: () => {
        const key = getTodayKey();
        const state = get();
        if (!state.days[key]) {
          const fresh = createEmptyDay();
          set((s) => ({ days: { ...s.days, [key]: fresh } }));
        }
      },
      setObjective: (text) => {
        const key = getTodayKey();
        set((state) => ({
          days: {
            ...state.days,
            [key]: { ...(state.days[key] ?? createEmptyDay()), objective: text },
          },
        }));
      },
      updateTask: (id, text, done) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key] ?? createEmptyDay();
          const tasks = day.tasks.map((t) =>
            t.id === id ? { ...t, text, done: done ?? t.done } : t
          );
          return { days: { ...state.days, [key]: { ...day, tasks } } };
        });
      },
      toggleTask: (id) => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key] ?? createEmptyDay();
          const tasks = day.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          );
          return { days: { ...state.days, [key]: { ...day, tasks } } };
        });
      },
    }),
    {
      name: 'dz-daily',
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return migrateDailyState(persistedState);
        }
        return persistedState;
      },
    }
  )
);
