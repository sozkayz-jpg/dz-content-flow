import { createClient } from '@supabase/supabase-js';
import { useSettingsStore } from '../stores/settingsStore';
import type { Post, Live, Phase, Offer, Persona, WeeklyKPI } from '../types';

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (client) return client;
  const state = useSettingsStore.getState();
  const url = state.supabaseUrl?.trim();
  const key = state.supabaseAnonKey?.trim();
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asAny(x: unknown): any { return x; }

export function isSupabaseConfigured(): boolean {
  const state = useSettingsStore.getState();
  return !!state.supabaseUrl?.trim() && !!state.supabaseAnonKey?.trim();
}

/* ───── Posts ───── */
export async function syncPostsToSupabase(posts: Post[]) {
  const sb = getClient();
  if (!sb) return;
  const { error } = await sb
    .from('posts')
    .upsert(asAny(posts.map((p) => ({ ...p, content: p.content ?? null }))), { onConflict: 'id' });
  if (error) console.warn('[Supabase] syncPosts error:', error.message);
}

export async function loadPostsFromSupabase(): Promise<Post[] | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb.from('posts').select('*');
  if (error) {
    console.warn('[Supabase] loadPosts error:', error.message);
    return null;
  }
  return (data ?? []) as Post[];
}

/* ───── Lives ───── */
export async function syncLivesToSupabase(lives: Live[]) {
  const sb = getClient();
  if (!sb) return;
  const { error } = await sb
    .from('lives')
    .upsert(asAny(lives.map((l) => ({ ...l, content: l.content ?? null }))), { onConflict: 'id' });
  if (error) console.warn('[Supabase] syncLives error:', error.message);
}

export async function loadLivesFromSupabase(): Promise<Live[] | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb.from('lives').select('*');
  if (error) {
    console.warn('[Supabase] loadLives error:', error.message);
    return null;
  }
  return (data ?? []) as Live[];
}

/* ───── Strategy ───── */
export async function syncStrategyToSupabase(
  phases: Phase[],
  offers: Offer[],
  personas: Persona[]
) {
  const sb = getClient();
  if (!sb) return;
  await Promise.all([
    sb.from('phases').upsert(asAny(phases), { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[Supabase] syncPhases error:', error.message);
    }),
    sb.from('offers').upsert(asAny(offers), { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[Supabase] syncOffers error:', error.message);
    }),
    sb.from('personas').upsert(asAny(personas), { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[Supabase] syncPersonas error:', error.message);
    }),
  ]);
}

export async function loadStrategyFromSupabase(): Promise<{
  phases: Phase[] | null;
  offers: Offer[] | null;
  personas: Persona[] | null;
}> {
  const sb = getClient();
  if (!sb) return { phases: null, offers: null, personas: null };
  const [phasesRes, offersRes, personasRes] = await Promise.all([
    sb.from('phases').select('*'),
    sb.from('offers').select('*'),
    sb.from('personas').select('*'),
  ]);
  if (phasesRes.error) console.warn('[Supabase] loadPhases error:', phasesRes.error.message);
  if (offersRes.error) console.warn('[Supabase] loadOffers error:', offersRes.error.message);
  if (personasRes.error) console.warn('[Supabase] loadPersonas error:', personasRes.error.message);
  return {
    phases: (phasesRes.data ?? []) as Phase[],
    offers: (offersRes.data ?? []) as Offer[],
    personas: (personasRes.data ?? []) as Persona[],
  };
}

/* ───── KPIs ───── */
export async function syncKPIToSupabase(weeklyData: WeeklyKPI[]) {
  const sb = getClient();
  if (!sb) return;
  const rows = weeklyData.map((w) => ({
    week: w.week,
    platforms: w.platforms,
    business: w.business,
  }));
  const { error } = await sb.from('weekly_kpis').upsert(asAny(rows), { onConflict: 'week' });
  if (error) console.warn('[Supabase] syncKPI error:', error.message);
}

export async function loadKPIsFromSupabase(): Promise<WeeklyKPI[] | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb.from('weekly_kpis').select('*');
  if (error) {
    console.warn('[Supabase] loadKPIs error:', error.message);
    return null;
  }
  return (data ?? []) as WeeklyKPI[];
}
