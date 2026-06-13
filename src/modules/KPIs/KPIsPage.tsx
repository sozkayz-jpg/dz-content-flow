import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useKPIStore } from '../../stores/kpiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { PLATFORMS } from '../../lib/constants';
import type { Platform } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

export function KPIsPage() {
  const { weeklyData, addWeek } = useKPIStore();
  const { activePlatforms } = useSettingsStore();
  const [weekInput, setWeekInput] = useState('');
  const [platformInputs, setPlatformInputs] = useState(
    {} as Record<
      Platform,
      { followers: string; reach: string; engagementRate: string; postsPublished: string }
    >
  );
  const [businessInputs, setBusinessInputs] = useState({
    leads: '',
    clients: '',
    revenue: '',
    conversionRate: '',
  });

  const sortedWeeks = useMemo(() => {
    return [...weeklyData].sort((a, b) => a.week.localeCompare(b.week));
  }, [weeklyData]);

  const handleSave = () => {
    if (!weekInput) return;
    const platforms: Record<
      Platform,
      { followers: number; reach: number; engagementRate: number; postsPublished: number }
    > = {} as Record<
      Platform,
      { followers: number; reach: number; engagementRate: number; postsPublished: number }
    >;
    activePlatforms.forEach((p) => {
      platforms[p] = {
        followers: parseInt(platformInputs[p]?.followers || '0') || 0,
        reach: parseInt(platformInputs[p]?.reach || '0') || 0,
        engagementRate: parseFloat(platformInputs[p]?.engagementRate || '0') || 0,
        postsPublished: parseInt(platformInputs[p]?.postsPublished || '0') || 0,
      };
    });
    addWeek({
      week: weekInput,
      platforms,
      business: {
        leads: parseInt(businessInputs.leads || '0') || 0,
        clients: parseInt(businessInputs.clients || '0') || 0,
        revenue: parseInt(businessInputs.revenue || '0') || 0,
        conversionRate: parseFloat(businessInputs.conversionRate || '0') || 0,
      },
    });
  };

  const healthScore = useMemo(() => {
    if (weeklyData.length < 2) return 50;
    const current = weeklyData[weeklyData.length - 1];
    const previous = weeklyData[weeklyData.length - 2];
    let score = 50;
    const totalFollowers = Object.values(current.platforms).reduce((a, p) => a + p.followers, 0);
    const prevFollowers = Object.values(previous.platforms).reduce((a, p) => a + p.followers, 0);
    if (totalFollowers > prevFollowers) score += 15;
    if (current.business.revenue > previous.business.revenue) score += 20;
    if (current.business.leads > previous.business.leads) score += 10;
    if (current.business.conversionRate >= previous.business.conversionRate) score += 5;
    return Math.min(100, Math.max(0, score));
  }, [weeklyData]);

  const chartData = useMemo(() => {
    return sortedWeeks.map((w) => ({
      week: w.week,
      followers: Object.values(w.platforms).reduce((a, p) => a + p.followers, 0),
      revenue: w.business.revenue,
      leads: w.business.leads,
    }));
  }, [sortedWeeks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📊 KPIs & Analytics</h1>
      </div>

      {/* Score santé */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-text-secondary">Score santé</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-bold ${
                healthScore >= 70 ? 'text-green-400' : healthScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              {healthScore}
            </span>
            <span className="text-sm text-text-secondary">/100</span>
          </div>
        </Card>

        {weeklyData.length >= 2 && (
          <>
            <Card className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-text-secondary">Revenus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {weeklyData[weeklyData.length - 1].business.revenue.toLocaleString()} DZD
                </span>
                {weeklyData[weeklyData.length - 1].business.revenue >
                  weeklyData[weeklyData.length - 2].business.revenue && (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                )}
                {weeklyData[weeklyData.length - 1].business.revenue <
                  weeklyData[weeklyData.length - 2].business.revenue && (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
            </Card>
            <Card className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-text-secondary">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {weeklyData[weeklyData.length - 1].business.leads}
                </span>
                {weeklyData[weeklyData.length - 1].business.leads >
                  weeklyData[weeklyData.length - 2].business.leads && (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                )}
                {weeklyData[weeklyData.length - 1].business.leads <
                  weeklyData[weeklyData.length - 2].business.leads && (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
            </Card>
            <Card className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-text-secondary">Conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {weeklyData[weeklyData.length - 1].business.conversionRate}%
                </span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Évolution hebdomadaire</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="week" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#F5F5F5',
                  }}
                />
                <Line type="monotone" dataKey="followers" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF' }} />
                <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Formulaire saisie */}
      <Card className="space-y-5">
        <h3 className="text-sm font-semibold text-white">Saisie des métriques</h3>
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Semaine (format: 2024-W01)</label>
          <input
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            placeholder="2024-W01"
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase">Par plateforme</h4>
          <div className="grid grid-cols-2 gap-4">
            {activePlatforms.map((plat) => {
              const p = PLATFORMS.find((x) => x.id === plat);
              return (
                <Card key={plat} padding="sm" className="space-y-3">
                  <span className="text-sm font-medium" style={{ color: p?.color }}>{p?.label}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Abonnés"
                      value={platformInputs[plat]?.followers || ''}
                      onChange={(e) =>
                        setPlatformInputs((prev) => ({
                          ...prev,
                          [plat]: { ...prev[plat], followers: e.target.value },
                        }))
                      }
                      className="text-xs py-1.5"
                    />
                    <input
                      placeholder="Reach"
                      value={platformInputs[plat]?.reach || ''}
                      onChange={(e) =>
                        setPlatformInputs((prev) => ({
                          ...prev,
                          [plat]: { ...prev[plat], reach: e.target.value },
                        }))
                      }
                      className="text-xs py-1.5"
                    />
                    <input
                      placeholder="Engagement %"
                      value={platformInputs[plat]?.engagementRate || ''}
                      onChange={(e) =>
                        setPlatformInputs((prev) => ({
                          ...prev,
                          [plat]: { ...prev[plat], engagementRate: e.target.value },
                        }))
                      }
                      className="text-xs py-1.5"
                    />
                    <input
                      placeholder="Posts"
                      value={platformInputs[plat]?.postsPublished || ''}
                      onChange={(e) =>
                        setPlatformInputs((prev) => ({
                          ...prev,
                          [plat]: { ...prev[plat], postsPublished: e.target.value },
                        }))
                      }
                      className="text-xs py-1.5"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase">Business</h4>
          <div className="grid grid-cols-4 gap-4">
            <input
              placeholder="Leads"
              value={businessInputs.leads}
              onChange={(e) => setBusinessInputs((prev) => ({ ...prev, leads: e.target.value }))}
              className="text-xs py-1.5"
            />
            <input
              placeholder="Clients"
              value={businessInputs.clients}
              onChange={(e) => setBusinessInputs((prev) => ({ ...prev, clients: e.target.value }))}
              className="text-xs py-1.5"
            />
            <input
              placeholder="Revenus (DZD)"
              value={businessInputs.revenue}
              onChange={(e) => setBusinessInputs((prev) => ({ ...prev, revenue: e.target.value }))}
              className="text-xs py-1.5"
            />
            <input
              placeholder="Conversion %"
              value={businessInputs.conversionRate}
              onChange={(e) => setBusinessInputs((prev) => ({ ...prev, conversionRate: e.target.value }))}
              className="text-xs py-1.5"
            />
          </div>
        </div>

        <Button onClick={handleSave}>Enregistrer la semaine</Button>
      </Card>
    </div>
  );
}
