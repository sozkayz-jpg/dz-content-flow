import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Phase, Offer, Persona } from '../types';
import { generateId } from '../lib/utils';
import { scheduleStrategySync } from '../lib/syncManager';
import { loadStrategyFromSupabase } from '../lib/supabase';

const STORE_VERSION = 1;

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
  deletePhase: (id: string) => void;
  deleteOffer: (id: string) => void;
  deletePersona: (id: string) => void;
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

function migrateStrategyState(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return { phases: [], offers: [], personas: [] };
  const state = persisted as Record<string, unknown>;
  return {
    phases: Array.isArray(state.phases) ? state.phases : [],
    offers: Array.isArray(state.offers) ? state.offers : [],
    personas: Array.isArray(state.personas) ? state.personas : [],
  };
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
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
        return id;
      },
      addOffer: (offer) => {
        const id = generateId();
        const newOffer = { ...offer, id };
        set((state) => ({ offers: [...state.offers, newOffer] }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
        return id;
      },
      addPersona: (persona) => {
        const id = generateId();
        const newPersona = { ...persona, id };
        set((state) => ({ personas: [...state.personas, newPersona] }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
        return id;
      },
      updatePhase: (id, updates) => {
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
      },
      updateOffer: (id, updates) => {
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
      },
      updatePersona: (id, updates) => {
        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
      },
      deletePhase: (id) => {
        set((state) => ({ phases: state.phases.filter((p) => p.id !== id) }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
      },
      deleteOffer: (id) => {
        set((state) => ({ offers: state.offers.filter((o) => o.id !== id) }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
      },
      deletePersona: (id) => {
        set((state) => ({ personas: state.personas.filter((p) => p.id !== id) }));
        const { phases, offers, personas } = get();
        scheduleStrategySync(() => ({ phases, offers, personas }));
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
        scheduleStrategySync(() => ({ phases: [], offers: [], personas: [] }));
      },
    }),
    {
      name: 'dz-strategy',
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return migrateStrategyState(persistedState);
        }
        return persistedState;
      },
    }
  )
);
