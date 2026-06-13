import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStrategyStore } from '../../stores/strategyStore';
import { Users, Gift, Map, Plus, Trash2 } from 'lucide-react';

type StrategyTab = 'roadmap' | 'offers' | 'personas';

export function StrategyPage() {
  const { phases, offers, personas, addPhase, addOffer, addPersona, deletePhase, deleteOffer, deletePersona } =
    useStrategyStore();
  const [tab, setTab] = useState<StrategyTab>('roadmap');

  /* ─── Phase form ─── */
  const [phaseName, setPhaseName] = useState('');
  const [phaseDays, setPhaseDays] = useState('');
  const [phaseObjectives, setPhaseObjectives] = useState('');
  const [phaseActions, setPhaseActions] = useState('');
  const [phaseMetrics, setPhaseMetrics] = useState('');
  const [showPhaseForm, setShowPhaseForm] = useState(false);

  const handleAddPhase = () => {
    if (!phaseName.trim()) return;
    addPhase({
      name: phaseName.trim(),
      days: phaseDays.trim() || 'J1-J30',
      objectives: phaseObjectives.split('\n').filter((s) => s.trim()),
      actions: phaseActions.split('\n').filter((s) => s.trim()),
      metrics: phaseMetrics.split('\n').filter((s) => s.trim()),
    });
    setPhaseName('');
    setPhaseDays('');
    setPhaseObjectives('');
    setPhaseActions('');
    setPhaseMetrics('');
    setShowPhaseForm(false);
    toast.success('Phase ajoutée');
  };

  /* ─── Offer form ─── */
  const [offerName, setOfferName] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerType, setOfferType] = useState<'service' | 'product' | 'recurring'>('service');
  const [offerPipeline, setOfferPipeline] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handleAddOffer = () => {
    if (!offerName.trim()) return;
    addOffer({
      name: offerName.trim(),
      description: offerDesc.trim(),
      price: offerPrice.trim() || '0 DZD',
      type: offerType,
      pipeline: offerPipeline.split('\n').filter((s) => s.trim()),
    });
    setOfferName('');
    setOfferDesc('');
    setOfferPrice('');
    setOfferType('service');
    setOfferPipeline('');
    setShowOfferForm(false);
    toast.success('Offre ajoutée');
  };

  /* ─── Persona form ─── */
  const [personaName, setPersonaName] = useState('');
  const [personaDesc, setPersonaDesc] = useState('');
  const [personaPain, setPersonaPain] = useState('');
  const [personaDesires, setPersonaDesires] = useState('');
  const [personaObjections, setPersonaObjections] = useState('');
  const [personaKeyMsg, setPersonaKeyMsg] = useState('');
  const [showPersonaForm, setShowPersonaForm] = useState(false);

  const handleAddPersona = () => {
    if (!personaName.trim()) return;
    addPersona({
      name: personaName.trim(),
      description: personaDesc.trim(),
      painPoints: personaPain.split('\n').filter((s) => s.trim()),
      desires: personaDesires.split('\n').filter((s) => s.trim()),
      objections: personaObjections.split('\n').filter((s) => s.trim()),
      keyMessage: personaKeyMsg.trim(),
    });
    setPersonaName('');
    setPersonaDesc('');
    setPersonaPain('');
    setPersonaDesires('');
    setPersonaObjections('');
    setPersonaKeyMsg('');
    setShowPersonaForm(false);
    toast.success('Persona ajouté');
  };

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
          <div className="flex justify-end">
            {!showPhaseForm ? (
              <Button variant="secondary" size="sm" onClick={() => setShowPhaseForm(true)}>
                <Plus className="w-4 h-4" /> Ajouter une phase
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowPhaseForm(false)}>
                Annuler
              </Button>
            )}
          </div>

          {showPhaseForm && (
            <Card className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Nom de la phase</label>
                  <input value={phaseName} onChange={(e) => setPhaseName(e.target.value)} placeholder="Ex: Fondation" className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Jours</label>
                  <input value={phaseDays} onChange={(e) => setPhaseDays(e.target.value)} placeholder="J1-J30" className="w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Objectifs (1 par ligne)</label>
                <textarea value={phaseObjectives} onChange={(e) => setPhaseObjectives(e.target.value)} rows={3} className="w-full resize-none" placeholder="Lancer le site web&#10;Premier article SEO..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Actions (1 par ligne)</label>
                <textarea value={phaseActions} onChange={(e) => setPhaseActions(e.target.value)} rows={3} className="w-full resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Métriques (1 par ligne)</label>
                <textarea value={phaseMetrics} onChange={(e) => setPhaseMetrics(e.target.value)} rows={2} className="w-full resize-none" />
              </div>
              <Button size="sm" onClick={handleAddPhase}>Ajouter</Button>
            </Card>
          )}

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
                <div className="flex items-center justify-between">
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
                  <button onClick={() => deletePhase(phase.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          {phases.length === 0 && !showPhaseForm && (
            <Card className="text-center py-12">
              <Map className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucune roadmap configurée</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!showOfferForm ? (
              <Button variant="secondary" size="sm" onClick={() => setShowOfferForm(true)}>
                <Plus className="w-4 h-4" /> Ajouter une offre
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowOfferForm(false)}>
                Annuler
              </Button>
            )}
          </div>

          {showOfferForm && (
            <Card className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Nom</label>
                  <input value={offerName} onChange={(e) => setOfferName(e.target.value)} placeholder="Ex: Pack SEO Starter" className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Prix</label>
                  <input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="25 000 DZD" className="w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Type</label>
                <div className="flex gap-2">
                  {(['service', 'product', 'recurring'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOfferType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        offerType === t
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-dark-border text-text-secondary'
                      }`}
                    >
                      {t === 'service' ? 'Service' : t === 'product' ? 'Produit' : 'Récurrent'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Description</label>
                <textarea value={offerDesc} onChange={(e) => setOfferDesc(e.target.value)} rows={2} className="w-full resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Pipeline (1 étape par ligne)</label>
                <textarea value={offerPipeline} onChange={(e) => setOfferPipeline(e.target.value)} rows={3} className="w-full resize-none" placeholder="Discovery call&#10;Audit&#10;Proposition..." />
              </div>
              <Button size="sm" onClick={handleAddOffer}>Ajouter</Button>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-4">
            {offers.map((offer) => (
              <Card key={offer.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-accent uppercase">
                      {offer.type === 'service' ? 'Service' : offer.type === 'product' ? 'Produit' : 'Récurrent'}
                    </span>
                  </div>
                  <button onClick={() => deleteOffer(offer.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            {offers.length === 0 && !showOfferForm && (
              <Card className="col-span-3 text-center py-12">
                <Gift className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">Aucune offre configurée</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'personas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!showPersonaForm ? (
              <Button variant="secondary" size="sm" onClick={() => setShowPersonaForm(true)}>
                <Plus className="w-4 h-4" /> Ajouter un persona
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowPersonaForm(false)}>
                Annuler
              </Button>
            )}
          </div>

          {showPersonaForm && (
            <Card className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Nom</label>
                  <input value={personaName} onChange={(e) => setPersonaName(e.target.value)} placeholder="Ex: Samir, 32 ans, e-commerçant" className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Message clé</label>
                  <input value={personaKeyMsg} onChange={(e) => setPersonaKeyMsg(e.target.value)} placeholder="Ton site web = ta liberté" className="w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Description</label>
                <textarea value={personaDesc} onChange={(e) => setPersonaDesc(e.target.value)} rows={2} className="w-full resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Douleurs (1 par ligne)</label>
                  <textarea value={personaPain} onChange={(e) => setPersonaPain(e.target.value)} rows={3} className="w-full resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">Désirs (1 par ligne)</label>
                  <textarea value={personaDesires} onChange={(e) => setPersonaDesires(e.target.value)} rows={3} className="w-full resize-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Objections (1 par ligne)</label>
                <textarea value={personaObjections} onChange={(e) => setPersonaObjections(e.target.value)} rows={2} className="w-full resize-none" />
              </div>
              <Button size="sm" onClick={handleAddPersona}>Ajouter</Button>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {personas.map((persona) => (
              <Card key={persona.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
                  </div>
                  <button onClick={() => deletePersona(persona.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            {personas.length === 0 && !showPersonaForm && (
              <Card className="col-span-2 text-center py-12">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">Aucun persona configuré</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
