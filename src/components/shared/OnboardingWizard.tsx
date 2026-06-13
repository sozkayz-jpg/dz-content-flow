import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PLATFORMS, AI_MODELS } from '../../lib/constants';
import type { Platform } from '../../types';
import { Check, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'facebook',
    'instagram',
    'tiktok',
  ]);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const { setCreatorName, setNiche: setStoreNiche, togglePlatform, setApiKey: setStoreApiKey, setDefaultModel, activePlatforms } = useSettingsStore();

  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const testApiKey = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      setTestStatus(response.ok ? 'success' : 'error');
    } catch {
      setTestStatus('error');
    }
  };

  const handleComplete = () => {
    setCreatorName(name);
    setStoreNiche(niche);
    // Sync platforms
    activePlatforms.forEach((p) => {
      if (!selectedPlatforms.includes(p)) togglePlatform(p);
    });
    selectedPlatforms.forEach((p) => {
      if (!activePlatforms.includes(p as Platform)) togglePlatform(p as Platform);
    });
    if (apiKey) setStoreApiKey(apiKey);
    setDefaultModel(model);
    onComplete();
  };

  const canProceedStep1 = name.trim().length >= 2 && niche.trim().length >= 3;
  const canProceedStep2 = selectedPlatforms.length > 0;
  const canProceedStep3 = apiKey.trim().length > 10;

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">DZ Content Flow</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-accent' : 'bg-dark-hover'
              }`}
            />
          ))}
        </div>

        <Card className="space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Qui es-tu ?</h2>
                <p className="text-sm text-text-secondary">Personnalisons ton expérience</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Ton nom / pseudo
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Karim SEO"
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Ta niche principale
                </label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ex: E-commerce SEO pour vendeurs algériens"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Tes plateformes</h2>
                <p className="text-sm text-text-secondary">Sélectionne celles sur lesquelles tu publies</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatformSelection(p.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-dark-border hover:border-text-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {isSelected && <Check className="w-4 h-4 text-accent" />}
                      </div>
                      <p className="text-sm font-medium text-white">{p.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Configuration IA</h2>
                <p className="text-sm text-text-secondary">Connecte ton compte OpenRouter</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Clé API OpenRouter
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('idle');
                  }}
                  placeholder="sk-or-v1-..."
                  className="w-full font-mono text-xs"
                />
                <p className="text-xs text-text-muted">
                  Trouve ta clé sur{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
                {apiKey && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={testApiKey}
                    isLoading={testStatus === 'testing'}
                  >
                    {testStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
                    {testStatus === 'success'
                      ? 'Connexion OK'
                      : testStatus === 'error'
                      ? 'Échec - Retester'
                      : 'Tester la connexion'}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Modèle par défaut
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-dark-border">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Retour
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceedStep3}
              >
                Commencer
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
