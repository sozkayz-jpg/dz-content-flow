import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DARIJA_QUOTES } from '../lib/constants';

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
    { name: 'dz-daily' }
  )
);
