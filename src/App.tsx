import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { OnboardingWizard } from './components/shared/OnboardingWizard';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { useSettingsStore } from './stores/settingsStore';
import { useContentStore } from './stores/contentStore';
import { useLiveStore } from './stores/liveStore';
import { useStrategyStore } from './stores/strategyStore';
import { useKPIStore } from './stores/kpiStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { isSupabaseConfigured } from './lib/supabase';
import {
  generateSeedPosts,
  generateSeedLives,
  generateSeedPhases,
  generateSeedOffers,
  generateSeedPersonas,
} from './seed/initialData';

/* ───── Lazy-loaded pages ───── */
const SettingsPage = lazy(() =>
  import('./modules/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const GeneratorPage = lazy(() =>
  import('./modules/Generator/GeneratorPage').then((m) => ({ default: m.GeneratorPage }))
);
const CockpitPage = lazy(() =>
  import('./modules/Cockpit/CockpitPage').then((m) => ({ default: m.CockpitPage }))
);
const CalendarPage = lazy(() =>
  import('./modules/Calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);
const LivePlannerPage = lazy(() =>
  import('./modules/LivePlanner/LivePlannerPage').then((m) => ({ default: m.LivePlannerPage }))
);
const LibraryPage = lazy(() =>
  import('./modules/Library/LibraryPage').then((m) => ({ default: m.LibraryPage }))
);
const StrategyPage = lazy(() =>
  import('./modules/Strategy/StrategyPage').then((m) => ({ default: m.StrategyPage }))
);
const KPIsPage = lazy(() =>
  import('./modules/KPIs/KPIsPage').then((m) => ({ default: m.KPIsPage }))
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-text-secondary animate-pulse">Chargement...</div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  useKeyboardShortcuts();

  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/cockpit" replace />} />
          <Route
            path="/cockpit"
            element={
              <ErrorBoundary moduleName="Cockpit">
                <CockpitPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/calendar"
            element={
              <ErrorBoundary moduleName="Calendrier">
                <CalendarPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/generator"
            element={
              <ErrorBoundary moduleName="Générateur">
                <GeneratorPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/lives"
            element={
              <ErrorBoundary moduleName="Live Planner">
                <LivePlannerPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/library"
            element={
              <ErrorBoundary moduleName="Bibliothèque">
                <LibraryPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/strategy"
            element={
              <ErrorBoundary moduleName="Stratégie">
                <StrategyPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/kpis"
            element={
              <ErrorBoundary moduleName="KPIs">
                <KPIsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={
              <ErrorBoundary moduleName="Paramètres">
                <SettingsPage />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const { hasCompletedOnboarding, completeOnboarding } = useSettingsStore();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !useSettingsStore.getState().hasCompletedOnboarding
  );
  const seeded = useRef(false);

  /* ── Init data (Supabase or seed) ── */
  useEffect(() => {
    if (!hasCompletedOnboarding || seeded.current) return;
    seeded.current = true;

    if (isSupabaseConfigured()) {
      Promise.all([
        useContentStore.getState().loadFromSupabase(),
        useLiveStore.getState().loadFromSupabase(),
        useStrategyStore.getState().loadFromSupabase(),
        useKPIStore.getState().loadFromSupabase(),
      ]).then(() => {
        console.log('[App] Sync from Supabase complete');
      });
      return;
    }

    // Fallback: seed local data if empty
    if (useContentStore.getState().posts.length === 0) {
      generateSeedPosts().forEach((post) => useContentStore.getState().addPost(post));
    }
    if (useLiveStore.getState().lives.length === 0) {
      generateSeedLives().forEach((live) => useLiveStore.getState().addLive(live));
    }
    if (useStrategyStore.getState().phases.length === 0) {
      generateSeedPhases().forEach((phase) => useStrategyStore.getState().addPhase(phase));
    }
    if (useStrategyStore.getState().offers.length === 0) {
      generateSeedOffers().forEach((offer) => useStrategyStore.getState().addOffer(offer));
    }
    if (useStrategyStore.getState().personas.length === 0) {
      generateSeedPersonas().forEach((persona) => useStrategyStore.getState().addPersona(persona));
    }
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F5F5F5',
              border: '1px solid #2A2A2A',
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F5F5F5',
            border: '1px solid #2A2A2A',
          },
        }}
      />
    </>
  );
}
