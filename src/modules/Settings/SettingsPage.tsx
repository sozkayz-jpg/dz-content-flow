import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettingsStore, getDecryptedApiKey, getDecryptedOllamaApiKey } from '../../stores/settingsStore';
import { useContentStore } from '../../stores/contentStore';
import { useLiveStore } from '../../stores/liveStore';
import { useStrategyStore } from '../../stores/strategyStore';
import { useKPIStore } from '../../stores/kpiStore';
import {
  PLATFORMS,
  AI_MODELS,
  LANGUAGES,
  AI_PROVIDERS,
  OLLAMA_MODELS,
} from '../../lib/constants';
import type { Language } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Download,
  Upload,
  Trash2,
  Key,
  User,
  Target,
  Check,
  AlertTriangle,
  Database,
  RefreshCw,
} from 'lucide-react';

export function SettingsPage() {
  const {
    creatorName,
    niche,
    activePlatforms,
    aiProvider,
    defaultModel,
    defaultLanguage,
    followerGoals90d,
    supabaseUrl,
    supabaseAnonKey,
    ollamaBaseUrl,
    ollamaModel,
    setCreatorName,
    setNiche,
    togglePlatform,
    setAiProvider,
    setApiKey: setStoreApiKey,
    setDefaultModel,
    setDefaultLanguage,
    setFollowerGoal,
    setSupabaseUrl,
    setSupabaseAnonKey,
    setOllamaBaseUrl,
    setOllamaModel,
    setOllamaApiKey,
    resetAll: resetSettings,
  } = useSettingsStore();

  const [localName, setLocalName] = useState(creatorName);
  const [localNiche, setLocalNiche] = useState(niche);
  const [localApiKey, setLocalApiKey] = useState(getDecryptedApiKey() || '');
  const [localModel, setLocalModel] = useState(defaultModel);
  const [localLang, setLocalLang] = useState<Language>(defaultLanguage);
  const [localAiProvider, setLocalAiProvider] = useState(aiProvider);
  const [localSupabaseUrl, setLocalSupabaseUrl] = useState(supabaseUrl);
  const [localSupabaseKey, setLocalSupabaseKey] = useState(supabaseAnonKey);
  const [localOllamaUrl, setLocalOllamaUrl] = useState(ollamaBaseUrl);
  const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);
  const [localOllamaApiKey, setLocalOllamaApiKey] = useState(getDecryptedOllamaApiKey() || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');

  const { resetAll: resetContent, loadFromSupabase: loadPosts } = useContentStore();
  const { resetAll: resetLives, loadFromSupabase: loadLives } = useLiveStore();
  const { resetAll: resetStrategy, loadFromSupabase: loadStrategy } = useStrategyStore();
  const { resetAll: resetKPIs, loadFromSupabase: loadKPIs } = useKPIStore();

  const saveSettings = () => {
    setCreatorName(localName);
    setNiche(localNiche);
    if (localApiKey) setStoreApiKey(localApiKey);
    setAiProvider(localAiProvider);
    setDefaultModel(localModel);
    setDefaultLanguage(localLang);
    setSupabaseUrl(localSupabaseUrl);
    setSupabaseAnonKey(localSupabaseKey);
    setOllamaBaseUrl(localOllamaUrl);
    setOllamaModel(localOllamaModel);
    if (localOllamaApiKey) setOllamaApiKey(localOllamaApiKey);
    toast.success('Paramètres sauvegardés');
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const url = (localOllamaUrl || 'http://localhost:11434').replace(/\/$/, '');
      if (localAiProvider === 'ollama') {
        const response = await fetch(`${url}/api/tags`, { method: 'GET' });
        setTestStatus(response.ok ? 'success' : 'error');
        if (response.ok) toast.success('Ollama connecté ✓');
        else toast.error(`Ollama erreur ${response.status}`);
      } else {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: { Authorization: `Bearer ${localApiKey}` },
        });
        setTestStatus(response.ok ? 'success' : 'error');
        if (response.ok) toast.success('Connexion API réussie');
        else toast.error('Clé API invalide');
      }
    } catch {
      setTestStatus('error');
      toast.error(
        localAiProvider === 'ollama'
          ? `Ollama injoignable`
          : 'Impossible de contacter OpenRouter'
      );
    }
  };

  const handleSyncSupabase = async () => {
    setSyncStatus('syncing');
    await Promise.all([loadPosts(), loadLives(), loadStrategy(), loadKPIs()]);
    setSyncStatus('idle');
    toast.success('Données syncronisées depuis Supabase');
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

  const supabaseConfigured = isSupabaseConfigured();

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
            <input value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Ex: Karim SEO" className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Niche principale</label>
            <input value={localNiche} onChange={(e) => setLocalNiche(e.target.value)} placeholder="Ex: SEO & IA pour e-commerçants" className="w-full" />
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
              <button key={p.id} onClick={() => togglePlatform(p.id)} className={`p-3 rounded-xl border text-center transition-all ${isActive ? 'border-accent bg-accent/10' : 'border-dark-border opacity-50 hover:opacity-80'}`}>
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: p.color }} />
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
          {/* Provider */}
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Provider IA</label>
            <div className="flex gap-2">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLocalAiProvider(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    localAiProvider === p.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-dark-border text-text-secondary hover:border-text-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {localAiProvider === 'openrouter' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Clé API OpenRouter</label>
                <div className="flex gap-2">
                  <input type="password" value={localApiKey} onChange={(e) => { setLocalApiKey(e.target.value); setTestStatus('idle'); }} placeholder="sk-or-v1-..." className="flex-1 font-mono text-xs" />
                  <Button variant="secondary" size="sm" onClick={testConnection} isLoading={testStatus === 'testing'}>
                    {testStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
                    Tester
                  </Button>
                </div>
                {testStatus === 'success' && <p className="text-xs text-green-400">✓ Connexion réussie</p>}
                {testStatus === 'error' && <p className="text-xs text-red-400">✗ Connexion échouée</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Modèle par défaut</label>
                  <select value={localModel} onChange={(e) => setLocalModel(e.target.value)} className="w-full">
                    {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Langue par défaut</label>
                  <select value={localLang} onChange={(e) => setLocalLang(e.target.value as Language)} className="w-full">
                    {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">URL Ollama (Cloud)</label>
                <div className="flex gap-2">
                  <input value={localOllamaUrl} onChange={(e) => { setLocalOllamaUrl(e.target.value); setTestStatus('idle'); }} placeholder="https://ton-ollama.run.app" className="flex-1 font-mono text-xs" />
                  <Button variant="secondary" size="sm" onClick={testConnection} isLoading={testStatus === 'testing'}>
                    {testStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
                    Tester
                  </Button>
                </div>
                {testStatus === 'success' && <p className="text-xs text-green-400">✓ Ollama connecté</p>}
                {testStatus === 'error' && <p className="text-xs text-red-400">✗ Connexion échouée</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Clé API Ollama (optionnelle)</label>
                <input type="password" value={localOllamaApiKey} onChange={(e) => { setLocalOllamaApiKey(e.target.value); setTestStatus('idle'); }} placeholder="sk-..." className="w-full font-mono text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Modèle Ollama</label>
                  <select value={localOllamaModel} onChange={(e) => setLocalOllamaModel(e.target.value)} className="w-full">
                    {OLLAMA_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Langue par défaut</label>
                  <select value={localLang} onChange={(e) => setLocalLang(e.target.value as Language)} className="w-full">
                    {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Supabase */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-accent" />
          <h2 className="text-lg font-semibold text-white">Base de données Supabase</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Supabase URL</label>
            <input value={localSupabaseUrl} onChange={(e) => setLocalSupabaseUrl(e.target.value)} placeholder="https://xxxx.supabase.co" className="w-full font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">Supabase Anon Key</label>
            <input type="password" value={localSupabaseKey} onChange={(e) => setLocalSupabaseKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="w-full font-mono text-xs" />
          </div>
          {supabaseConfigured && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Check className="w-3.5 h-3.5" />
              Supabase configuré
            </div>
          )}
          <Button variant="secondary" onClick={handleSyncSupabase} isLoading={syncStatus === 'syncing'}>
            <RefreshCw className="w-4 h-4" />
            {syncStatus === 'syncing' ? 'Sync...' : 'Sync depuis Supabase'}
          </Button>
          <p className="text-xs text-text-muted">
            Les données sont d'abord stockées en local. La sync avec Supabase se fait automatiquement à chaque modification si configuré.
          </p>
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
              <input type="number" value={followerGoals90d[p.id] || 0} onChange={(e) => setFollowerGoal(p.id, parseInt(e.target.value) || 0)} className="w-full text-center" />
            </div>
          ))}
        </div>
      </Card>

      {/* Export / Import */}
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Données</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4" />Exporter (JSON)
          </Button>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />Importer
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </Card>

      {/* Reset */}
      <Card className="border-red-900/30">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Zone dangereuse</h2>
        {!showResetConfirm ? (
          <Button variant="danger" onClick={() => setShowResetConfirm(true)}>
            <Trash2 className="w-4 h-4" />Réinitialiser tout
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">Toutes les données seront supprimées définitivement.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleReset}>Confirmer la suppression</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
