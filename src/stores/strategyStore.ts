import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Phase, Offer, Persona } from '../types';
import { generateId } from '../lib/utils';

interface StrategyState {
  phases: Phase[];
  offers: Offer[];
  personas: Persona[];
  addPhase: (phase: Omit<Phase, 'id'>) => string;
  addOffer: (offer: Omit<Offer, 'id'>) => string;
  addPersona: (persona: Omit<Persona, 'id'>) => string;
  updatePhase: (id: string, updates: Partial<Phase>) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  resetAll: () => void;
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set) => ({
      phases: [],
      offers: [],
      personas: [],
      addPhase: (phase) => {
        const id = generateId();
        const newPhase = { ...phase, id };
        set((state) => ({ phases: [...state.phases, newPhase] }));
        return id;
      },
      addOffer: (offer) => {
        const id = generateId();
        const newOffer = { ...offer, id };
        set((state) => ({ offers: [...state.offers, newOffer] }));
        return id;
      },
      addPersona: (persona) => {
        const id = generateId();
        const newPersona = { ...persona, id };
        set((state) => ({ personas: [...state.personas, newPersona] }));
        return id;
      },
      updatePhase: (id, updates) =>
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      updateOffer: (id, updates) =>
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        })),
      updatePersona: (id, updates) =>
        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      resetAll: () => set({ phases: [], offers: [], personas: [] }),
    }),
    { name: 'dz-strategy' }
  )
);
