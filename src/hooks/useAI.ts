import { useState } from 'react';
import { SYSTEM_PROMPT } from '../lib/constants';
import { getDecryptedApiKey, useSettingsStore } from '../stores/settingsStore';
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

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { creatorName, defaultModel } = useSettingsStore();

  const generateContent = async (options: UseAIOptions): Promise<GeneratedContent> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getDecryptedApiKey();
      if (!apiKey) {
        throw new Error('Clé API OpenRouter non configurée. Va dans Paramètres.');
      }

      const systemPrompt = SYSTEM_PROMPT.replace('{{CREATOR_NAME}}', creatorName || 'le créateur');

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
      if (!content) {
        throw new Error('Réponse vide de l\'API');
      }

      // Clean JSON from markdown code blocks
      const jsonStr = content.replace(/```json?\n?|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      return {
        hook: parsed.hook || '',
        body: parsed.body || '',
        cta: parsed.cta || '',
        hashtags: parsed.hashtags || [],
        recommendedHour: parsed.recommendedHour || '19:00',
        engagementScore: typeof parsed.engagementScore === 'number' ? parsed.engagementScore : 75,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const apiKey = getDecryptedApiKey();
      if (!apiKey) {
        return { success: false, message: 'Aucune clé API configurée' };
      }

      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (response.ok) {
        return { success: true, message: 'Connexion réussie ✓' };
      }
      return { success: false, message: `Clé invalide (${response.status})` };
    } catch {
      return { success: false, message: 'Impossible de contacter OpenRouter' };
    }
  };

  return { generateContent, testConnection, isLoading, error };
}
