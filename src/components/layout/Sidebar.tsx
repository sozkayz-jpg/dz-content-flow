import { cn } from '../../lib/utils';
import { VIEW_LABELS } from '../../lib/constants';
import {
  Home,
  CalendarDays,
  Sparkles,
  Video,
  Library,
  Map,
  BarChart3,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'cockpit', label: VIEW_LABELS.cockpit, icon: Home, shortcut: '1' },
  { id: 'calendar', label: VIEW_LABELS.calendar, icon: CalendarDays, shortcut: 'c' },
  { id: 'generator', label: VIEW_LABELS.generator, icon: Sparkles, shortcut: 'g' },
  { id: 'lives', label: VIEW_LABELS.lives, icon: Video, shortcut: 'l' },
  { id: 'library', label: VIEW_LABELS.library, icon: Library, shortcut: 'b' },
  { id: 'strategy', label: VIEW_LABELS.strategy, icon: Map, shortcut: 's' },
  { id: 'kpis', label: VIEW_LABELS.kpis, icon: BarChart3, shortcut: 'k' },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-dark-card border-r border-dark-border flex flex-col z-50">
      <div className="p-5 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">DZ Content Flow</h1>
            <p className="text-[10px] text-text-muted">Pilotage de contenu</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left',
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-white hover:bg-dark-hover'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && 'text-accent')} />
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] text-text-muted font-mono opacity-60">
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dark-border">
        <button
          onClick={() => onNavigate('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left',
            currentView === 'settings'
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'text-text-secondary hover:text-white hover:bg-dark-hover'
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="flex-1">{VIEW_LABELS.settings}</span>
        </button>
      </div>
    </aside>
  );
}
