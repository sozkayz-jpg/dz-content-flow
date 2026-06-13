import { useState } from 'react';
import { SYSTEM_PROMPT } from '../lib/constants';
import {
  getDecryptedApiKey,
  getDecryptedOllamaApiKey,
  useSettingsStore,
} from '../stores/settingsStore';
import type { Platform, ContentType, Theme, Tone, Language } from '../types';

export interface GeneratedContent {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  recommendedHour: string;
  engagementScore: number;
}

interface UseAIOptions {
  platform: Platform;
  type: ContentType;
  theme: Theme;
  tone: Tone;
  language: Language;
  context?: string;
}

const platformLabels: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

const typeLabels: Record<ContentType, string> = {
  text: 'post texte',
  carousel: 'carousel (liste de slides)',
  reel: 'Reel/Short (script)',
  thread: 'thread',
  article: 'article LinkedIn',
};

const themeLabels: Record<Theme, string> = {
  migration: 'Migration FB → Site Web',
  seo: 'SEO pour Algériens',
  ai: 'IA Agentique',
  ecommerce: 'E-commerce DZ',
  personal_brand: 'Personal Branding',
  success_story: 'Success Story',
  myth: 'Mythe à briser',
  advice: 'Conseil pratique',
};

const toneLabels: Record<Tone, string> = {
  educational: 'éducatif',
  inspiring: 'inspirant',
  provocative: 'provocateur',
  storytelling: 'storytelling',
};

const languageLabels: Record<Language, string> = {
  darija: 'arabe dialectal algérien (darija)',
  french: 'français',
  frenchy: 'français avec expressions algériennes (mixte darija/français)',
};

function buildPrompt(
  options: UseAIOptions,
  creatorName: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = SYSTEM_PROMPT.replace('{{CREATOR_NAME}}', creatorName || 'le créateur');

  const userPrompt = `Crée un ${typeLabels[options.type]} pour ${platformLabels[options.platform]}.
Thématique: ${themeLabels[options.theme]}
Ton: ${toneLabels[options.tone]}
Langue: ${languageLabels[options.language]}
${options.context ? `Contexte additionnel: ${options.context}` : ''}

Réponds EXACTEMENT au format JSON suivant (pas de markdown, pas de texte avant/après):
{
  "hook": "accroche viral (1 phrase)",
  "body": "corps du post complet",
  "cta": "call to action",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
  "recommendedHour": "HH:00",
  "engagementScore": 85
}`;

  return { systemPrompt, userPrompt };
}

function extractJSON(raw: string): string {
  const noCodeBlocks = raw.replace(/```json?\n?|```/g, '').trim();
  const match = noCodeBlocks.match(/\{[\s\S]*\}/);
  return match ? match[0] : noCodeBlocks;
}

function parseResponse(content: string): GeneratedContent {
  const jsonStr = extractJSON(content);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      "L'IA n'a pas répondu au format JSON attendu. Réessaie ou change de modèle."
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error("Réponse IA invalide : pas un objet JSON.");
  }

  const p = parsed as Record<string, unknown>;

  const hook = typeof p.hook === 'string' ? p.hook : '';
  const body = typeof p.body === 'string' ? p.body : '';
  const cta = typeof p.cta === 'string' ? p.cta : '';
  const hashtags =
    Array.isArray(p.hashtags) && p.hashtags.every((t) => typeof t === 'string')
      ? (p.hashtags as string[])
      : [];
  const recommendedHour =
    typeof p.recommendedHour === 'string' ? p.recommendedHour : '19:00';
  const engagementScore =
    typeof p.engagementScore === 'number' ? p.engagementScore : 75;

  if (!hook && !body) {
    throw new Error("L'IA a retourné un contenu vide.");
  }

  return { hook, body, cta, hashtags, recommendedHour, engagementScore };
}

/* ───── OpenRouter ───── */
async function generateViaOpenRouter(
  options: UseAIOptions,
  defaultModel: string,
  creatorName: string
): Promise<GeneratedContent> {
  const apiKey = getDecryptedApiKey();
  if (!apiKey) throw new Error('Clé API OpenRouter non configurée. Va dans Paramètres.');

  const { systemPrompt, userPrompt } = buildPrompt(options, creatorName);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'DZ Content Flow',
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur API: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Réponse vide de l'API");
  return parseResponse(content);
}

/* ───── Ollama ───── */
async function generateViaOllama(
  options: UseAIOptions,
  ollamaBaseUrl: string,
  ollamaModel: string,
  creatorName: string
): Promise<GeneratedContent> {
  const url = (ollamaBaseUrl || '').replace(/\/$/, '');
  const model = ollamaModel || 'llama3.1';
  if (!url) throw new Error('URL Ollama non configurée. Va dans Paramètres.');

  const { systemPrompt, userPrompt } = buildPrompt(options, creatorName);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const ollamaKey = getDecryptedOllamaApiKey();
  if (ollamaKey) headers['Authorization'] = `Bearer ${ollamaKey}`;

  const response = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.8,
        num_predict: 2000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur Ollama: ${response.status} — Vérifie l'URL et la clé API`);
  }

  const data = await response.json();
  const content = data.response || data.message?.content || '';
  if (!content) throw new Error("Réponse vide d'Ollama");
  return parseResponse(content);
}

/* ───── Public API ───── */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    creatorName,
    aiProvider,
    defaultModel,
    ollamaBaseUrl,
    ollamaModel,
  } = useSettingsStore();

  const generateContent = async (options: UseAIOptions): Promise<GeneratedContent> => {
    setIsLoading(true);
    setError(null);
    try {
      const result =
        aiProvider === 'ollama'
          ? await generateViaOllama(options, ollamaBaseUrl, ollamaModel, creatorName)
          : await generateViaOpenRouter(options, defaultModel, creatorName);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (aiProvider === 'ollama') {
      const url = (ollamaBaseUrl || '').replace(/\/$/, '');
      if (!url) return { success: false, message: 'URL Ollama non configurée' };
      try {
        const headers: Record<string, string> = {};
        const ollamaKey = getDecryptedOllamaApiKey();
        if (ollamaKey) headers['Authorization'] = `Bearer ${ollamaKey}`;
        const response = await fetch(`${url}/api/tags`, { method: 'GET', headers });
        if (response.ok) return { success: true, message: 'Ollama connecté ✓' };
        return { success: false, message: `Ollama erreur ${response.status}` };
      } catch {
        return { success: false, message: `Ollama injoignable sur ${url}` };
      }
    }

    try {
      const apiKey = getDecryptedApiKey();
      if (!apiKey) return { success: false, message: 'Aucune clé API configurée' };
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (response.ok) return { success: true, message: 'Connexion réussie ✓' };
      return { success: false, message: `Clé invalide (${response.status})` };
    } catch {
      return { success: false, message: 'Impossible de contacter OpenRouter' };
    }
  };

  return { generateContent, testConnection, isLoading, error };
}
