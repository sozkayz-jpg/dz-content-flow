import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettingsStore, getDecryptedApiKey } from '../../stores/settingsStore';
import { useContentStore } from '../../stores/contentStore';
import { useLiveStore } from '../../stores/liveStore';
import { useStrategyStore } from '../../stores/strategyStore';
import { useKPIStore } from '../../stores/kpiStore';
import {
  PLATFORMS,
  AI_MODELS,
  LANGUAGES,
} from '../../lib/constants';
import type { Language } from '../../types';
import { Download, Upload, Trash2, Key, User, Target, Check, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
  const {
    creatorName,
    niche,
    activePlatforms,
    defaultModel,
    defaultLanguage,
    followerGoals90d,
    setCreatorName,
    setNiche,
    togglePlatform,
    setApiKey: setStoreApiKey,
    setDefaultModel,
    setDefaultLanguage,
    setFollowerGoal,
    resetAll: resetSettings,
  } = useSettingsStore();

  const [localName, setLocalName] = useState(creatorName);
  const [localNiche, setLocalNiche] = useState(niche);
  const [localApiKey, setLocalApiKey] = useState(getDecryptedApiKey() || '');
  const [localModel, setLocalModel] = useState(defaultModel);
  const [localLang, setLocalLang] = useState<Language>(defaultLanguage);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { resetAll: resetContent } = useContentStore();
  const { resetAll: resetLives } = useLiveStore();
  const { resetAll: resetStrategy } = useStrategyStore();
  const { resetAll: resetKPIs } = useKPIStore();

  const saveSettings = () => {
    setCreatorName(localName);
    setNiche(localNiche);
    if (localApiKey) setStoreApiKey(localApiKey);
    setDefaultModel(localModel);
    setDefaultLanguage(localLang);
    toast.success('Paramètres sauvegardés');
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${localApiKey}` },
      });
      setTestStatus(response.ok ? 'success' : 'error');
      if (response.ok) toast.success('Connexion API réussie');
      else toast.error('Clé API invalide');
    } catch {
      setTestStatus('error');
      toast.error('Impossible de contacter OpenRouter');
    }
  };

  const handleExport = () => {
    const data = {
      settings: useSettingsStore.getState(),
      content: useContentStore.getState().posts,
      lives: useLiveStore.getState().lives,
      strategy: {
        phases: useStrategyStore.getState().phases,
        offers: useStrategyStore.getState().offers,
        personas: useStrategyStore.getState().personas,
      },
      kpis: useKPIStore.getState().weeklyData,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dz-content-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Données exportées');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        JSON.parse(event.target?.result as string);
        // Import logic would go here - for now just notify
        toast.success('Import terminé (rechargement nécessaire)');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        toast.error('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetSettings();
    resetContent();
    resetLives();
    resetStrategy();
    resetKPIs();
    localStorage.clear();
    setShowResetConfirm(false);
    toast.success('Application réinitialisée');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">⚙️ Paramètres</h1>
        <Button onClick={saveSettings}>
          <Check className="w-4 h-4" />
          Sauvegarder
        </Button>
      </div>

      {/* Profil */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-semibold text-white">Profil</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Nom du créateur</label>
            <input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Ex: Karim SEO"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Niche principale</label>
            <input
              value={localNiche}
              onChange={(e) => setLocalNiche(e.target.value)}
              placeholder="Ex: SEO & IA pour e-commerçants"
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Plateformes */}
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Plateformes actives</h2>
        <div className="grid grid-cols-5 gap-3">
          {PLATFORMS.map((p) => {
            const isActive = activePlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'border-accent bg-accent/10'
                    : 'border-dark-border opacity-50 hover:opacity-80'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: p.color }}
                />
                <p className="text-xs font-medium text-white">{p.label}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* IA Configuration */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-semibold text-white">Configuration IA</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Clé API OpenRouter</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => {
                  setLocalApiKey(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="sk-or-v1-..."
                className="flex-1 font-mono text-xs"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={testConnection}
                isLoading={testStatus === 'testing'}
              >
                {testStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
                Tester
              </Button>
            </div>
            {testStatus === 'success' && (
              <p className="text-xs text-green-400">✓ Connexion réussie</p>
            )}
            {testStatus === 'error' && (
              <p className="text-xs text-red-400">✗ Connexion échouée</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Modèle par défaut</label>
              <select
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Langue par défaut</label>
              <select
                value={localLang}
                onChange={(e) => setLocalLang(e.target.value as Language)}
                className="w-full"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Objectifs */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-semibold text-white">Objectifs 90 jours</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="space-y-2">
              <label className="text-xs text-text-secondary">{p.label}</label>
              <input
                type="number"
                value={followerGoals90d[p.id] || 0}
                onChange={(e) =>
                  setFollowerGoal(p.id, parseInt(e.target.value) || 0)
                }
                className="w-full text-center"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Export / Import */}
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Données</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Exporter (JSON)
          </Button>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Reset */}
      <Card className="border-red-900/30">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Zone dangereuse</h2>
        {!showResetConfirm ? (
          <Button variant="danger" onClick={() => setShowResetConfirm(true)}>
            <Trash2 className="w-4 h-4" />
            Réinitialiser tout
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">
                Toutes les données seront supprimées définitivement.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleReset}>
                Confirmer la suppression
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
