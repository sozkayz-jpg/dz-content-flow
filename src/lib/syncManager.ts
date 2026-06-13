import type { Post, Live, Phase, Offer, Persona, WeeklyKPI } from '../types';
import {
  syncPostsToSupabase,
  syncLivesToSupabase,
  syncStrategyToSupabase,
  syncKPIToSupabase,
} from './supabase';

const DEBOUNCE_MS = 2000;

function createDebouncedSync<T>(syncFn: (data: T) => void | Promise<void>) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (getData: () => T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      syncFn(getData());
    }, DEBOUNCE_MS);
  };
}

export const schedulePostsSync = createDebouncedSync<Post[]>((posts) =>
  syncPostsToSupabase(posts)
);

export const scheduleLivesSync = createDebouncedSync<Live[]>((lives) =>
  syncLivesToSupabase(lives)
);

export const scheduleStrategySync = createDebouncedSync<{
  phases: Phase[];
  offers: Offer[];
  personas: Persona[];
}>((data) => syncStrategyToSupabase(data.phases, data.offers, data.personas));

export const scheduleKPISync = createDebouncedSync<WeeklyKPI[]>((data) =>
  syncKPIToSupabase(data)
);
