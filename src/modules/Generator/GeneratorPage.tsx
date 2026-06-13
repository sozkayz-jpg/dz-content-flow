import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlatformBadge } from '../../components/ui/PlatformBadge';
import { useAI } from '../../hooks/useAI';
import { useContentStore } from '../../stores/contentStore';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  PLATFORMS,
  CONTENT_TYPES,
  THEMES,
  TONES,
  LANGUAGES,
} from '../../lib/constants';
import type {
  Platform,
  ContentType,
  Theme,
  Tone,
  Language,
} from '../../types';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Clock,
  TrendingUp,
  Hash,
  Zap,
  Calendar,
  Send,
} from 'lucide-react';

export function GeneratorPage() {
  const navigate = useNavigate();
  const { defaultLanguage, defaultModel, aiProvider, ollamaModel } = useSettingsStore();
  const { generateContent, isLoading } = useAI();
  const { addPost } = useContentStore();

  const [platform, setPlatform] = useState<Platform>('facebook');
  const [type, setType] = useState<ContentType>('text');
  const [theme, setTheme] = useState<Theme>('migration');
  const [tone, setTone] = useState<Tone>('educational');
  const [language, setLanguage] = useState<Language>(defaultLanguage || 'frenchy');
  const [context, setContext] = useState('');
  const [generated, setGenerated] = useState<{
    hook: string;
    body: string;
    cta: string;
    hashtags: string[];
    recommendedHour: string;
    engagementScore: number;
  } | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [scheduleDate, setScheduleDate] = useState(todayStr);

  const handleGenerate = async () => {
    try {
      const result = await generateContent({
        platform,
        type,
        theme,
        tone,
        language,
        context: context || undefined,
      });
      setGenerated(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de génération');
    }
  };

  const createPost = (status: 'scheduled' | 'published') => {
    if (!generated) return;
    const date = status === 'published' ? new Date() : new Date(scheduleDate);
    const isoDate = new Date(
      date.toDateString() + 'T' + (generated.recommendedHour || '19:00')
    ).toISOString();

    addPost({
      platform,
      type,
      theme,
      tone,
      language,
      context,
      status,
      scheduledDate: isoDate,
      content: generated,
      isFavorite: false,
      tags: [],
      title: generated.hook.slice(0, 60),
    });

    if (status === 'published') {
      toast.success('Post publié ! 🔥 Streak mis à jour.');
    } else {
      toast.success(`Post planifié le ${format(date, 'dd/MM/yyyy')}`);
      navigate('/calendar');
    }

    setGenerated(null);
  };

  const handleCopy = () => {
    if (!generated) return;
    const text = `${generated.hook}\n\n${generated.body}\n\n${generated.cta}\n\n${generated.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const handleRegenerate = () => {
    setGenerated(null);
    handleGenerate();
  };

  const getTypeLabel = (t: ContentType) => CONTENT_TYPES.find((x) => x.id === t)?.label || t;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">✨ Générateur de contenu IA</h1>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Zap className="w-3 h-3" />
          {aiProvider === 'ollama' ? `Ollama: ${ollamaModel}` : defaultModel.split('/')[1] || defaultModel}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Formulaire */}
        <Card className="space-y-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Configuration
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Plateforme</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      platform === p.id
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-dark-border text-text-secondary hover:border-text-muted'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Type de contenu</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="w-full"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Thématique</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="w-full"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Ton</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full"
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Langue</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">
                Contexte additionnel (optionnel)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: Mon client vend des produits bio en Algérie et veut attirer plus de jeunes..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full justify-center"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Génération en cours...' : 'Générer le contenu'}
          </Button>
        </Card>

        {/* Résultat */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {generated ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Métadonnées */}
                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={platform} />
                    <span className="text-xs text-text-secondary">
                      {getTypeLabel(type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-text-secondary">
                        {generated.recommendedHour}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-medium">
                        {generated.engagementScore}/100
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Hook */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-accent">Hook</h3>
                  </div>
                  <p className="text-white leading-relaxed">{generated.hook}</p>
                </Card>

                {/* Corps */}
                <Card className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary">
                    Corps du post
                  </h3>
                  <p className="text-white leading-relaxed whitespace-pre-line">
                    {generated.body}
                  </p>
                </Card>

                {/* CTA */}
                <Card className="space-y-3 border-accent/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-accent">Call to Action</h3>
                  </div>
                  <p className="text-white leading-relaxed">{generated.cta}</p>
                </Card>

                {/* Hashtags */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-text-muted" />
                    <h3 className="text-sm font-semibold text-text-secondary">
                      Hashtags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generated.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-dark-hover text-xs text-text-secondary border border-dark-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Planification directe */}
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Publication</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="text-sm py-2"
                    />
                    <span className="text-xs text-text-muted">à {generated.recommendedHour || '19:00'}</span>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button variant="secondary" onClick={handleCopy}>
                      <Copy className="w-4 h-4" />
                      Copier
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleRegenerate}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Régénérer
                    </Button>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-dark-border">
                    <Button
                      variant="secondary"
                      onClick={() => createPost('scheduled')}
                    >
                      <Calendar className="w-4 h-4" />
                      Planifier
                    </Button>
                    <Button onClick={() => createPost('published')}>
                      <Send className="w-4 h-4" />
                      Publier maintenant
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-secondary mb-2">
                  Configure tes paramètres et clique sur "Générer"
                </p>
                <p className="text-xs text-text-muted">
                  L'IA créera un hook viral, un corps de post optimisé et un CTA
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
