# DZ Content Flow

Outil de pilotage de contenu pour créateur algérien spécialisé en business en ligne, SEO et IA agentique.

## Stack technique

- **React 19 + TypeScript + Vite**
- **React Router v7 (HashRouter)** — routing côté client, URLs partageables
- **Tailwind CSS v3** — thème 100% sombre
- **Zustand** — state management avec persist localStorage
- **Framer Motion** — animations
- **Lucide React** — icônes
- **Recharts** — graphiques KPI
- **date-fns** — manipulation des dates
- **sonner** — notifications toast

## Démarrage rapide

```bash
cd dz-content-flow
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

## Modules

1. **🏠 Cockpit** — Dashboard quotidien (objectifs, tâches, streak, citation darija)
2. **📅 Calendrier** — Vue mensuelle + liste semaine, drag & drop, filtres
3. **✨ Générateur IA** — Génération de posts via OpenRouter (hook, corps, CTA, hashtags)
4. **🎥 Live Planner** — Planification de lives avec script minute par minute généré par IA
5. **📚 Bibliothèque** — Recherche full-text, filtres, favoris, export TXT/MD
6. **🗺️ Stratégie** — Roadmap 90 jours, offres, personas
7. **📊 KPIs** — Saisie manuelle, graphiques d'évolution, score santé
8. **⚙️ Paramètres** — Clé API, modèle IA, export/import JSON, reset

## Architecture & améliorations

| Amélioration | Détail |
|--------------|--------|
| **Lazy loading** | Chaque module est chargé à la demande (`React.lazy`) — le bundle initial est allégé |
| **Routing** | `HashRouter` pour des URLs partageables (`#/cockpit`, `#/calendar`, …) et historique navigateur natif |
| **Sync debounced** | La synchronisation Supabase attend 2s après la dernière mutation pour éviter le spam réseau |
| **Daily Store** | Objectif, tâches et citation du jour centralisés dans Zustand (plus de `localStorage` dispersé dans le Cockpit) |
| **Streak auto** | Calculé dynamiquement depuis les vraies dates de publication, plus de valeur hardcodée |
| **Parsing IA sécurisé** | `try/catch` + validation de schema sur la réponse JSON des LLMs (OpenRouter & Ollama) |
| **Typage strict** | Suppression des `any` résiduels et respect des règles `noUnusedLocals` / `noUnusedParameters` |

## Raccourcis clavier

| Touche | Module |
|--------|--------|
| `G` | Générateur |
| `C` | Calendrier |
| `L` | Lives |
| `B` | Bibliothèque |
| `S` | Stratégie |
| `K` | KPIs |

## Configuration IA

1. Crée un compte sur [openrouter.ai](https://openrouter.ai)
2. Génère une clé API dans [openrouter.ai/keys](https://openrouter.ai/keys)
3. Colle-la dans **Paramètres > Configuration IA**
4. Choisis ton modèle (Claude 3.5 Sonnet, GPT-4o, Mistral, Llama, DeepSeek)

## Données

100% localStorage. Aucun backend. Les données restent sur ton navigateur.
Exporte/importe en JSON depuis les Paramètres.

## Build production

```bash
npm run build
```

Les fichiers statiques sont générés dans le dossier `dist/`.
