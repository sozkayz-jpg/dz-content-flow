import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyKPI } from '../types';

interface KPIState {
  weeklyData: WeeklyKPI[];
  addWeek: (data: WeeklyKPI) => void;
  updateWeek: (week: string, data: Partial<WeeklyKPI>) => void;
  deleteWeek: (week: string) => void;
  resetAll: () => void;
}

export const useKPIStore = create<KPIState>()(
  persist(
    (set) => ({
      weeklyData: [],
      addWeek: (data) =>
        set((state) => {
          const exists = state.weeklyData.find((w) => w.week === data.week);
          if (exists) {
            return {
              weeklyData: state.weeklyData.map((w) =>
                w.week === data.week ? { ...w, ...data } : w
              ),
            };
          }
          return { weeklyData: [...state.weeklyData, data] };
        }),
      updateWeek: (week, data) =>
        set((state) => ({
          weeklyData: state.weeklyData.map((w) =>
            w.week === week ? { ...w, ...data } : w
          ),
        })),
      deleteWeek: (week) =>
        set((state) => ({
          weeklyData: state.weeklyData.filter((w) => w.week !== week),
        })),
      resetAll: () => set({ weeklyData: [] }),
    }),
    { name: 'dz-kpis' }
  )
);
