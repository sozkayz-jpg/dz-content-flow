import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useContentStore } from '../../stores/contentStore';
import { DARIJA_QUOTES } from '../../lib/constants';
import { formatDate, getWeekNumber } from '../../lib/utils';
import {
  Target,
  CheckCircle2,
  Circle,
  Flame,
  CalendarClock,
  TrendingUp,
  Quote,
} from 'lucide-react';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export function CockpitPage() {
  const { posts } = useContentStore();
  const [objective, setObjective] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: '', done: false },
    { id: '2', text: '', done: false },
    { id: '3', text: '', done: false },
  ]);
  const [streak, setStreak] = useState(12);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayStr = today.toDateString();
    const stored = localStorage.getItem('dz-cockpit-' + dayStr);
    if (stored) {
      const parsed = JSON.parse(stored);
      setObjective(parsed.objective || '');
      setTasks(parsed.tasks || tasks);
      setStreak(parsed.streak || 12);
    } else {
      setQuote(DARIJA_QUOTES[Math.floor(Math.random() * DARIJA_QUOTES.length)]);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const dayStr = today.toDateString();
    localStorage.setItem(
      'dz-cockpit-' + dayStr,
      JSON.stringify({ objective, tasks, streak })
    );
  }, [objective, tasks, streak]);

  const scheduledPosts = posts
    .filter((p) => p.status === 'scheduled' && p.scheduledDate)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
    );

  const nextPost = scheduledPosts[0];
  const publishedThisWeek = posts.filter((p) => {
    if (!p.scheduledDate) return false;
    const postDate = new Date(p.scheduledDate);
    const now = new Date();
    return (
      postDate >= new Date(now.setDate(now.getDate() - now.getDay())) &&
      p.status === 'published'
    );
  }).length;

  const weekGoal = 7;
  const weekScore = Math.round((publishedThisWeek / weekGoal) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateTaskText = (id: string, text: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  const today = new Date();
  const weekNum = getWeekNumber(today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🏠 Cockpit</h1>
          <p className="text-sm text-text-secondary">
            {formatDate(today)} — Semaine {weekNum}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Objectif du jour */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Objectif du jour</h3>
          </div>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Quel est ton objectif principal aujourd'hui ?"
            className="w-full resize-none bg-transparent border-none p-0 text-sm text-white placeholder:text-text-muted focus:ring-0"
            rows={3}
          />
        </Card>

        {/* Tâches prioritaires */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">3 tâches prioritaires</h3>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <button onClick={() => toggleTask(task.id)}>
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-muted" />
                  )}
                </button>
                <input
                  value={task.text}
                  onChange={(e) => updateTaskText(task.id, e.target.value)}
                  placeholder={`Tâche ${task.id}`}
                  className={`flex-1 bg-transparent border-none p-0 text-sm ${
                    task.done
                      ? 'text-text-muted line-through'
                      : 'text-white'
                  } placeholder:text-text-muted focus:ring-0`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Streak */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">Streak</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-orange-400">{streak}</span>
            <span className="text-sm text-text-secondary">jours</span>
          </div>
          <p className="text-xs text-text-muted">
            Publie aujourd'hui pour maintenir ta série !
          </p>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < (streak % 7) + 1 ? 'bg-orange-400' : 'bg-dark-hover'
                }`}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Prochaine publication */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Prochaine publication</h3>
          </div>
          {nextPost ? (
            <div className="space-y-2">
              <p className="text-sm text-white line-clamp-2">{nextPost.title || nextPost.content?.hook}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">
                  {nextPost.scheduledDate
                    ? formatDate(nextPost.scheduledDate)
                    : 'Non daté'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Aucune publication programmée</p>
          )}
        </Card>

        {/* Score hebdo */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Progression hebdo</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-green-400">{weekScore}</span>
            <span className="text-sm text-text-secondary">%</span>
          </div>
          <p className="text-xs text-text-muted">
            {publishedThisWeek} / {weekGoal} posts publiés cette semaine
          </p>
          <div className="w-full h-2 bg-dark-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${weekScore}%` }}
            />
          </div>
        </Card>

        {/* Citation */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Citation du jour</h3>
          </div>
          <p className="text-sm text-white leading-relaxed italic">"{quote}"</p>
          <p className="text-xs text-text-muted">— Proverbe algérien</p>
        </Card>
      </div>
    </div>
  );
}
