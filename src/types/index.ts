export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin';

export type ContentType = 'text' | 'carousel' | 'reel' | 'thread' | 'article';

export type Theme =
  | 'migration'
  | 'seo'
  | 'ai'
  | 'ecommerce'
  | 'personal_brand'
  | 'success_story'
  | 'myth'
  | 'advice';

export type Tone = 'educational' | 'inspiring' | 'provocative' | 'storytelling';

export type Language = 'darija' | 'french' | 'frenchy';

export type PostStatus = 'idea' | 'written' | 'scheduled' | 'published';

export type LivePlatform = 'fb_live' | 'ig_live' | 'tt_live' | 'yt_live';

export type LiveObjective = 'educate' | 'sell' | 'engage' | 'launch';

export type LiveDuration = '30' | '60' | '90' | '120';

export interface Post {
  id: string;
  platform: Platform;
  type: ContentType;
  theme: Theme;
  tone: Tone;
  language: Language;
  context?: string;
  status: PostStatus;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  content?: {
    hook: string;
    body: string;
    cta: string;
    hashtags: string[];
    recommendedHour: string;
    engagementScore: number;
  };
  isFavorite: boolean;
  tags: string[];
  title?: string;
}

export interface Live {
  id: string;
  platform: LivePlatform;
  theme: string;
  duration: LiveDuration;
  objective: LiveObjective;
  createdAt: string;
  content?: {
    titles: string[];
    hook: string;
    minutePlan: { minute: number; topic: string; duration: number }[];
    keyPoints: string[];
    interactions: string[];
    finalCta: string;
    announcementTexts: Record<Platform, string>;
    techChecklist: string[];
    faq: { question: string; answer: string }[];
  };
  isFavorite: boolean;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  painPoints: string[];
  desires: string[];
  objections: string[];
  keyMessage: string;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  price: string;
  type: 'service' | 'product' | 'recurring';
  pipeline: string[];
}

export interface Phase {
  id: string;
  name: string;
  days: string;
  objectives: string[];
  actions: string[];
  metrics: string[];
}

export interface WeeklyKPI {
  week: string;
  platforms: Record<
    Platform,
    {
      followers: number;
      reach: number;
      engagementRate: number;
      postsPublished: number;
    }
  >;
  business: {
    leads: number;
    clients: number;
    revenue: number;
    conversionRate: number;
  };
}

export type AIProvider = 'openrouter' | 'ollama';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface Settings {
  creatorName: string;
  niche: string;
  activePlatforms: Platform[];
  aiProvider: AIProvider;
  apiKey: string;
  defaultModel: string;
  defaultLanguage: Language;
  followerGoals90d: Record<Platform, number>;
  supabaseUrl: string;
  supabaseAnonKey: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaApiKey: string;
}

export interface DailyData {
  date: string;
  objective: string;
  tasks: { id: string; text: string; done: boolean }[];
  streak: number;
  lastPublishedDate?: string;
}
