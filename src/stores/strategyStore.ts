import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Phase, Offer, Persona } from '../types';
import { generateId } from '../lib/utils';
import { syncStrategyToSupabase, loadStrategyFromSupabase } from '../lib/supabase';

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
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      phases: [],
      offers: [],
      personas: [],
      addPhase: (phase) => {
        const id = generateId();
        const newPhase = { ...phase, id };
        set((state) => ({ phases: [...state.phases, newPhase] }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
        return id;
      },
      addOffer: (offer) => {
        const id = generateId();
        const newOffer = { ...offer, id };
        set((state) => ({ offers: [...state.offers, newOffer] }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
        return id;
      },
      addPersona: (persona) => {
        const id = generateId();
        const newPersona = { ...persona, id };
        set((state) => ({ personas: [...state.personas, newPersona] }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
        return id;
      },
      updatePhase: (id, updates) => {
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
      },
      updateOffer: (id, updates) => {
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
      },
      updatePersona: (id, updates) => {
        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        syncStrategyToSupabase(get().phases, get().offers, get().personas);
      },
      loadFromSupabase: async () => {
        const { phases, offers, personas } = await loadStrategyFromSupabase();
        const patch: Partial<StrategyState> = {};
        if (phases && phases.length > 0) patch.phases = phases;
        if (offers && offers.length > 0) patch.offers = offers;
        if (personas && personas.length > 0) patch.personas = personas;
        if (Object.keys(patch).length > 0) set(patch);
      },
      resetAll: () => {
        set({ phases: [], offers: [], personas: [] });
        syncStrategyToSupabase([], [], []);
      },
    }),
    { name: 'dz-strategy' }
  )
);
