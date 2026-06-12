import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Platform, Language } from '../types';
import { encryptSimple, decryptSimple } from '../lib/utils';

interface SettingsState extends Settings {
  hasCompletedOnboarding: boolean;
  setCreatorName: (name: string) => void;
  setNiche: (niche: string) => void;
  togglePlatform: (platform: Platform) => void;
  setApiKey: (key: string) => void;
  setDefaultModel: (model: string) => void;
  setDefaultLanguage: (lang: Language) => void;
  setFollowerGoal: (platform: Platform, goal: number) => void;
  completeOnboarding: () => void;
  resetAll: () => void;
}

const defaultSettings: Settings = {
  creatorName: '',
  niche: '',
  activePlatforms: ['facebook', 'instagram', 'tiktok'],
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
};

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
      setApiKey: (key) => set({ apiKey: encryptSimple(key) }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultLanguage: (lang) => set({ defaultLanguage: lang }),
      setFollowerGoal: (platform, goal) =>
        set((state) => ({
          followerGoals90d: { ...state.followerGoals90d, [platform]: goal },
        })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetAll: () => set({ ...defaultSettings, hasCompletedOnboarding: false }),
    }),
    {
      name: 'dz-settings',
      partialize: (state) => ({
        creatorName: state.creatorName,
        niche: state.niche,
        activePlatforms: state.activePlatforms,
        apiKey: state.apiKey,
        defaultModel: state.defaultModel,
        defaultLanguage: state.defaultLanguage,
        followerGoals90d: state.followerGoals90d,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);

export function getDecryptedApiKey(): string {
  const state = useSettingsStore.getState();
  return decryptSimple(state.apiKey);
}
