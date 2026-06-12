import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlatformBadge } from '../../components/ui/PlatformBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useContentStore } from '../../stores/contentStore';
import {
  PLATFORMS,
  POST_STATUSES,
} from '../../lib/constants';
import type { Platform, PostStatus } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export function CalendarPage() {
  const { posts, updatePost } = useContentStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [posts, filterPlatform, filterStatus]);

  const getPostsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredPosts.filter((p) => {
      if (!p.scheduledDate) return false;
      return format(new Date(p.scheduledDate), 'yyyy-MM-dd') === dateStr;
    });
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(dateStr);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      updatePost(postId, {
        scheduledDate: new Date(dateStr).toISOString(),
        status: 'scheduled',
      });
    }
    setDragOverDate(null);
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📅 Calendrier éditorial</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'month' ? 'bg-accent text-white' : 'text-text-secondary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1" />
              Mois
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'week' ? 'bg-accent text-white' : 'text-text-secondary'
              }`}
            >
              <List className="w-3.5 h-3.5 inline mr-1" />
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card className="flex items-center gap-4">
        <Filter className="w-4 h-4 text-text-muted" />
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
          className="text-xs py-1.5"
        >
          <option value="all">Toutes plateformes</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PostStatus | 'all')}
          className="text-xs py-1.5"
        >
          <option value="all">Tous statuts</option>
          {POST_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <Button variant="secondary" size="sm">
          <Sparkles className="w-3.5 h-3.5" />
          Générer plan 90 jours
        </Button>
      </Card>

      {view === 'month' ? (
        <>
          {/* Navigation mois */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Grille calendrier */}
          <Card padding="sm" className="overflow-hidden">
            <div className="grid grid-cols-7 gap-px">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-text-muted py-2"
                >
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const dayPosts = getPostsForDay(day);
                const dateStr = format(day, 'yyyy-MM-dd');
                const isDragOver = dragOverDate === dateStr;
                return (
                  <div
                    key={dateStr}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    onDragLeave={() => setDragOverDate(null)}
                    className={`min-h-[100px] p-2 border border-dark-border/50 transition-colors ${
                      !isSameMonth(day, currentDate)
                        ? 'opacity-40 bg-dark-bg'
                        : 'bg-dark-card'
                    } ${isDragOver ? 'bg-accent/10 border-accent' : ''} ${
                      isToday(day) ? 'ring-1 ring-accent/30' : ''
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isToday(day) ? 'text-accent' : 'text-text-secondary'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', post.id);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded cursor-move truncate"
                          style={{
                            backgroundColor: `${
                              PLATFORMS.find((p) => p.id === post.platform)?.color || '#666'
                            }20`,
                            color:
                              PLATFORMS.find((p) => p.id === post.platform)?.color || '#666',
                          }}
                        >
                          {post.title || post.content?.hook?.slice(0, 20)}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <span className="text-[10px] text-text-muted">
                          +{dayPosts.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-white mb-3">
            Publications à venir
          </h3>
          {filteredPosts
            .filter((p) => p.scheduledDate)
            .sort(
              (a, b) =>
                new Date(a.scheduledDate!).getTime() -
                new Date(b.scheduledDate!).getTime()
            )
            .map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-hover border border-dark-border"
              >
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={post.platform} />
                  <div>
                    <p className="text-sm text-white">
                      {post.title || post.content?.hook?.slice(0, 50)}
                    </p>
                    <span className="text-xs text-text-muted">
                      {post.scheduledDate
                        ? format(new Date(post.scheduledDate), 'dd/MM/yyyy HH:mm')
                        : 'Non daté'}
                    </span>
                  </div>
                </div>
                <StatusBadge status={post.status} />
              </div>
            ))}
          {filteredPosts.filter((p) => p.scheduledDate).length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              Aucune publication programmée
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
