import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLiveStore } from '../../stores/liveStore';
import { useSettingsStore, getDecryptedApiKey } from '../../stores/settingsStore';
import { SYSTEM_PROMPT } from '../../lib/constants';
import { LIVE_PLATFORMS, LIVE_DURATIONS, LIVE_OBJECTIVES } from '../../lib/constants';
import type { LivePlatform, LiveDuration, LiveObjective } from '../../types';
import { Video, Clock, Target, Sparkles, Copy, Save, Mic, Users, MessageSquare, CheckSquare } from 'lucide-react';

export function LivePlannerPage() {
  const { addLive } = useLiveStore();
  const { creatorName } = useSettingsStore();
  const [platform, setPlatform] = useState<LivePlatform>('fb_live');
  const [theme, setTheme] = useState('');
  const [duration, setDuration] = useState<LiveDuration>('60');
  const [objective, setObjective] = useState<LiveObjective>('educate');
  const [generated, setGenerated] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Entre une thématique');
      return;
    }
    setIsLoading(true);
    try {
      const apiKey = getDecryptedApiKey();
      if (!apiKey) throw new Error('Clé API non configurée');

      const systemPrompt = SYSTEM_PROMPT.replace('{{CREATOR_NAME}}', creatorName || 'le créateur');
      const platformLabel = LIVE_PLATFORMS.find((p) => p.id === platform)?.label;
      const durationLabel = LIVE_DURATIONS.find((d) => d.id === duration)?.label;
      const objectiveLabel = LIVE_OBJECTIVES.find((o) => o.id === objective)?.label;

      const userPrompt = `Crée un plan complet pour un live ${platformLabel} de ${durationLabel} sur le thème: "${theme}".
Objectif: ${objectiveLabel}

Réponds au format JSON exact suivant:
{
  "titles": ["titre 1", "titre 2", "titre 3", "titre 4", "titre 5"],
  "hook": "script des 60 premières secondes",
  "minutePlan": [
    {"minute": 0, "topic": "sujet", "duration": 5}
  ],
  "keyPoints": ["point clé 1", "point clé 2", "point clé 3", "point clé 4"],
  "interactions": ["moment d'interaction 1", "moment d'interaction 2"],
  "finalCta": "call to action final",
  "announcementTexts": {
    "facebook": "texte d'annonce FB",
    "instagram": "texte d'annonce IG",
    "tiktok": "texte d'annonce TT",
    "youtube": "texte d'annonce YT",
    "linkedin": "texte d'annonce LK"
  },
  "techChecklist": ["check 1", "check 2", "check 3"],
  "faq": [
    {"question": "Q1", "answer": "R1"},
    {"question": "Q2", "answer": "R2"}
  ]
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
          model: useSettingsStore.getState().defaultModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) throw new Error('Erreur API');
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Réponse vide');

      const jsonStr = content.replace(/```json?\n?|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      setGenerated(parsed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    addLive({
      platform,
      theme,
      duration,
      objective,
      content: generated,
      isFavorite: false,
    });
    toast.success('Live sauvegardé');
  };

  const handleCopy = () => {
    if (!generated) return;
    const text = JSON.stringify(generated, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Plan copié');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🎥 Live Planner</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="space-y-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Configuration du Live
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Plateforme</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as LivePlatform)} className="w-full">
                {LIVE_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Thématique</label>
              <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Comment migrer de FB vers un site web" className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Durée</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value as LiveDuration)} className="w-full">
                  {LIVE_DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Objectif</label>
                <select value={objective} onChange={(e) => setObjective(e.target.value as LiveObjective)} className="w-full">
                  {LIVE_OBJECTIVES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} isLoading={isLoading} disabled={isLoading} className="w-full justify-center">
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Génération...' : 'Générer le plan'}
          </Button>
        </Card>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {generated ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Titres proposés</h3>
                  </div>
                  <ul className="space-y-1">
                    {generated.titles?.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-white">{i + 1}. {t}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Hook d'ouverture</h3>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{generated.hook}</p>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Plan minute par minute</h3>
                  </div>
                  <div className="space-y-2">
                    {generated.minutePlan?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-dark-hover">
                        <span className="text-xs font-mono text-accent w-12">M{item.minute}</span>
                        <span className="text-sm text-white flex-1">{item.topic}</span>
                        <span className="text-xs text-text-muted">{item.duration}min</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Points clés</h3>
                  </div>
                  <ul className="space-y-1">
                    {generated.keyPoints?.map((p: string, i: number) => (
                      <li key={i} className="text-sm text-white">• {p}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Moments d'interaction</h3>
                  </div>
                  <ul className="space-y-1">
                    {generated.interactions?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-white">• {item}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="space-y-3 border-accent/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-accent">CTA Final</h3>
                  </div>
                  <p className="text-sm text-white">{generated.finalCta}</p>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">FAQ anticipée</h3>
                  </div>
                  <div className="space-y-2">
                    {generated.faq?.map((item: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-dark-hover">
                        <p className="text-sm font-medium text-white">Q: {item.question}</p>
                        <p className="text-xs text-text-secondary mt-1">R: {item.answer}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-white">Checklist technique</h3>
                  </div>
                  <ul className="space-y-1">
                    {generated.techChecklist?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-white">☐ {item}</li>
                    ))}
                  </ul>
                </Card>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />Copier</Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4" />Sauvegarder</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-secondary mb-2">Configure ton live et génère le plan</p>
                <p className="text-xs text-text-muted">L'IA créera un script minute par minute</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
