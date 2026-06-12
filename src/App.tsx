import { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { OnboardingWizard } from './components/shared/OnboardingWizard';
import { useSettingsStore } from './stores/settingsStore';
import { useContentStore } from './stores/contentStore';
import { useLiveStore } from './stores/liveStore';
import { useStrategyStore } from './stores/strategyStore';
import { useKPIStore } from './stores/kpiStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  generateSeedPosts,
  generateSeedLives,
  generateSeedPhases,
  generateSeedOffers,
  generateSeedPersonas,
} from './seed/initialData';
import { SettingsPage } from './modules/Settings/SettingsPage';
import { GeneratorPage } from './modules/Generator/GeneratorPage';
import { CockpitPage } from './modules/Cockpit/CockpitPage';
import { CalendarPage } from './modules/Calendar/CalendarPage';
import { LivePlannerPage } from './modules/LivePlanner/LivePlannerPage';
import { LibraryPage } from './modules/Library/LibraryPage';
import { StrategyPage } from './modules/Strategy/StrategyPage';
import { KPIsPage } from './modules/KPIs/KPIsPage';

export default function App() {
  const [currentView, setCurrentView] = useState('cockpit');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { hasCompletedOnboarding, completeOnboarding } = useSettingsStore();
  const { posts, addPost } = useContentStore();
  const { lives, addLive } = useLiveStore();
  const { phases, offers, personas, addPhase, addOffer, addPersona } = useStrategyStore();
  useKPIStore();

  // Check onboarding
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [hasCompletedOnboarding]);

  // Seed data on first load
  useEffect(() => {
    if (hasCompletedOnboarding && posts.length === 0) {
      const seedPosts = generateSeedPosts();
      seedPosts.forEach((post) => addPost(post));
    }
    if (hasCompletedOnboarding && lives.length === 0) {
      const seedLives = generateSeedLives();
      seedLives.forEach((live) => addLive(live));
    }
    if (hasCompletedOnboarding && phases.length === 0) {
      const seedPhases = generateSeedPhases();
      seedPhases.forEach((phase) => addPhase(phase));
    }
    if (hasCompletedOnboarding && offers.length === 0) {
      const seedOffers = generateSeedOffers();
      seedOffers.forEach((offer) => addOffer(offer));
    }
    if (hasCompletedOnboarding && personas.length === 0) {
      const seedPersonas = generateSeedPersonas();
      seedPersonas.forEach((persona) => addPersona(persona));
    }
  }, [hasCompletedOnboarding]);

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view);
  }, []);

  useKeyboardShortcuts(handleNavigate);

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

  const renderView = () => {
    switch (currentView) {
      case 'cockpit':
        return <CockpitPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'generator':
        return <GeneratorPage />;
      case 'lives':
        return <LivePlannerPage />;
      case 'library':
        return <LibraryPage />;
      case 'strategy':
        return <StrategyPage />;
      case 'kpis':
        return <KPIsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CockpitPage />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} onNavigate={handleNavigate}>
        {renderView()}
      </Layout>
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
