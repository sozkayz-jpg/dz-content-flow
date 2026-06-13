import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Platform, Language, AIProvider } from '../types';
import { encryptSimple, decryptSimple } from '../lib/utils';

const STORE_VERSION = 1;

interface SettingsState extends Settings {
  hasCompletedOnboarding: boolean;
  setCreatorName: (name: string) => void;
  setNiche: (niche: string) => void;
  togglePlatform: (platform: Platform) => void;
  setAiProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setDefaultModel: (model: string) => void;
  setDefaultLanguage: (lang: Language) => void;
  setFollowerGoal: (platform: Platform, goal: number) => void;
  setSupabaseUrl: (url: string) => void;
  setSupabaseAnonKey: (key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
  setOllamaApiKey: (key: string) => void;
  completeOnboarding: () => void;
  resetAll: () => void;
}

const defaultSettings: Settings = {
  creatorName: '',
  niche: '',
  activePlatforms: ['facebook', 'instagram', 'tiktok'],
  aiProvider: 'openrouter',
  apiKey: '',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  defaultLanguage: 'frenchy',
  followerGoals90d: {
    facebook: 5000,
    instagram: 3000,
    tiktok: 10000,
    youtube: 1000,
    linkedin: 2000,
  },
  supabaseUrl: '',
  supabaseAnonKey: '',
  ollamaBaseUrl: '',
  ollamaModel: 'llama3.1',
  ollamaApiKey: '',
};

function migrateSettingsState(persisted: unknown): unknown {
  if (!persisted || typeof persisted !== 'object') return { ...defaultSettings, hasCompletedOnboarding: false };
  const state = persisted as Record<string, unknown>;
  // Ensure all default keys exist
  const merged = { ...defaultSettings, ...state };
  // Ensure followerGoals90d has all platforms
  merged.followerGoals90d = {
    ...defaultSettings.followerGoals90d,
    ...(typeof merged.followerGoals90d === 'object' && merged.followerGoals90d !== null
      ? (merged.followerGoals90d as Record<Platform, number>)
      : {}),
  };
  return { ...merged, hasCompletedOnboarding: state.hasCompletedOnboarding ?? false };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hasCompletedOnboarding: false,
      setCreatorName: (name) => set({ creatorName: name }),
      setNiche: (niche) => set({ niche }),
      togglePlatform: (platform) =>
        set((state) => {
          const has = state.activePlatforms.includes(platform);
          return {
            activePlatforms: has
              ? state.activePlatforms.filter((p) => p !== platform)
              : [...state.activePlatforms, platform],
          };
        }),
      setAiProvider: (provider) => set({ aiProvider: provider }),
      setApiKey: (key) => set({ apiKey: encryptSimple(key) }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultLanguage: (lang) => set({ defaultLanguage: lang }),
      setFollowerGoal: (platform, goal) =>
        set((state) => ({
          followerGoals90d: { ...state.followerGoals90d, [platform]: goal },
        })),
      setSupabaseUrl: (url) => set({ supabaseUrl: url }),
      setSupabaseAnonKey: (key) => set({ supabaseAnonKey: key }),
      setOllamaBaseUrl: (url) => set({ ollamaBaseUrl: url }),
      setOllamaModel: (model) => set({ ollamaModel: model }),
      setOllamaApiKey: (key) => set({ ollamaApiKey: encryptSimple(key) }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetAll: () => set({ ...defaultSettings, hasCompletedOnboarding: false }),
    }),
    {
      name: 'dz-settings',
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version < STORE_VERSION) {
          return migrateSettingsState(persistedState);
        }
        return persistedState;
      },
      partialize: (state) => ({
        creatorName: state.creatorName,
        niche: state.niche,
        activePlatforms: state.activePlatforms,
        aiProvider: state.aiProvider,
        apiKey: state.apiKey,
        defaultModel: state.defaultModel,
        defaultLanguage: state.defaultLanguage,
        followerGoals90d: state.followerGoals90d,
        supabaseUrl: state.supabaseUrl,
        supabaseAnonKey: state.supabaseAnonKey,
        ollamaBaseUrl: state.ollamaBaseUrl,
        ollamaModel: state.ollamaModel,
        ollamaApiKey: state.ollamaApiKey,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);

export function getDecryptedApiKey(): string {
  const state = useSettingsStore.getState();
  return decryptSimple(state.apiKey);
}

export function getDecryptedOllamaApiKey(): string {
  const state = useSettingsStore.getState();
  return decryptSimple(state.ollamaApiKey);
}
