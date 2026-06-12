import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useStrategyStore } from '../../stores/strategyStore';
import { Users, Gift, Map } from 'lucide-react';

type StrategyTab = 'roadmap' | 'offers' | 'personas';

export function StrategyPage() {
  const { phases, offers, personas } = useStrategyStore();
  const [tab, setTab] = useState<StrategyTab>('roadmap');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🗺️ Stratégie & Roadmap</h1>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'roadmap' as const, label: 'Roadmap 90 jours', icon: Map },
          { id: 'offers' as const, label: 'Offres', icon: Gift },
          { id: 'personas' as const, label: 'Personas', icon: Users },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-accent text-white'
                : 'bg-dark-card text-text-secondary hover:text-white border border-dark-border'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'roadmap' && (
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <Card key={phase.id} className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  backgroundColor:
                    index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : '#10B981',
                }}
              />
              <div className="pl-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : '#10B981',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{phase.name}</h3>
                    <span className="text-xs text-text-muted">{phase.days}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase">Objectifs</h4>
                    <ul className="space-y-1">
                      {phase.objectives.map((o, i) => (
                        <li key={i} className="text-sm text-white">• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase">Actions</h4>
                    <ul className="space-y-1">
                      {phase.actions.map((a, i) => (
                        <li key={i} className="text-sm text-white">• {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase">Métriques</h4>
                    <ul className="space-y-1">
                      {phase.metrics.map((m, i) => (
                        <li key={i} className="text-sm text-white">• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {phases.length === 0 && (
            <Card className="text-center py-12">
              <Map className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucune roadmap configurée</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'offers' && (
        <div className="grid grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-accent uppercase">
                  {offer.type === 'service' ? 'Service' : offer.type === 'product' ? 'Produit' : 'Récurrent'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{offer.name}</h3>
              <p className="text-sm text-text-secondary">{offer.description}</p>
              <div className="text-xl font-bold text-accent">{offer.price}</div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-secondary uppercase">Pipeline</h4>
                <ol className="space-y-1">
                  {offer.pipeline.map((step, i) => (
                    <li key={i} className="text-sm text-white">{i + 1}. {step}</li>
                  ))}
                </ol>
              </div>
            </Card>
          ))}
          {offers.length === 0 && (
            <Card className="col-span-3 text-center py-12">
              <Gift className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucune offre configurée</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'personas' && (
        <div className="grid grid-cols-2 gap-4">
          {personas.map((persona) => (
            <Card key={persona.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
              </div>
              <p className="text-sm text-text-secondary">{persona.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 uppercase">Douleurs</h4>
                  <ul className="space-y-1">
                    {persona.painPoints.map((p, i) => (
                      <li key={i} className="text-sm text-white">• {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-400 uppercase">Désirs</h4>
                  <ul className="space-y-1">
                    {persona.desires.map((d, i) => (
                      <li key={i} className="text-sm text-white">• {d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-orange-400 uppercase">Objections</h4>
                <ul className="space-y-1">
                  {persona.objections.map((o, i) => (
                    <li key={i} className="text-sm text-white">• {o}</li>
                  ))}
                </ul>
              </div>

              <Card padding="sm" className="border-accent/20 bg-accent/5">
                <p className="text-sm text-accent font-medium">Message clé</p>
                <p className="text-sm text-white mt-1">{persona.keyMessage}</p>
              </Card>
            </Card>
          ))}
          {personas.length === 0 && (
            <Card className="col-span-2 text-center py-12">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucun persona configuré</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
