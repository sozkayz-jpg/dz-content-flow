export const PLATFORMS = [
  { id: 'facebook' as const, label: 'Facebook', color: '#1877F2' },
  { id: 'instagram' as const, label: 'Instagram', color: '#E4405F' },
  { id: 'tiktok' as const, label: 'TikTok', color: '#FF0050' },
  { id: 'youtube' as const, label: 'YouTube', color: '#FF0000' },
  { id: 'linkedin' as const, label: 'LinkedIn', color: '#0A66C2' },
];

export const CONTENT_TYPES = [
  { id: 'text' as const, label: 'Post texte' },
  { id: 'carousel' as const, label: 'Carousel' },
  { id: 'reel' as const, label: 'Reel / Short' },
  { id: 'thread' as const, label: 'Thread' },
  { id: 'article' as const, label: 'Article LinkedIn' },
];

export const THEMES = [
  { id: 'migration' as const, label: 'Migration FB → Site Web' },
  { id: 'seo' as const, label: 'SEO pour Algériens' },
  { id: 'ai' as const, label: 'IA Agentique' },
  { id: 'ecommerce' as const, label: 'E-commerce DZ' },
  { id: 'personal_brand' as const, label: 'Personal Branding' },
  { id: 'success_story' as const, label: 'Success Story' },
  { id: 'myth' as const, label: 'Mythe à briser' },
  { id: 'advice' as const, label: 'Conseil pratique' },
];

export const TONES = [
  { id: 'educational' as const, label: 'Éducatif' },
  { id: 'inspiring' as const, label: 'Inspirant' },
  { id: 'provocative' as const, label: 'Provocateur' },
  { id: 'storytelling' as const, label: 'Storytelling' },
];

export const LANGUAGES = [
  { id: 'darija' as const, label: 'Darija' },
  { id: 'french' as const, label: 'Français' },
  { id: 'frenchy' as const, label: 'Mixte (Frenchy)' },
];

export const POST_STATUSES = [
  { id: 'idea' as const, label: 'Idée', color: '#6B7280' },
  { id: 'written' as const, label: 'Rédigé', color: '#F59E0B' },
  { id: 'scheduled' as const, label: 'Schedulé', color: '#3B82F6' },
  { id: 'published' as const, label: 'Publié', color: '#10B981' },
];

export const LIVE_PLATFORMS = [
  { id: 'fb_live' as const, label: 'Facebook Live' },
  { id: 'ig_live' as const, label: 'Instagram Live' },
  { id: 'tt_live' as const, label: 'TikTok Live' },
  { id: 'yt_live' as const, label: 'YouTube Live' },
];

export const LIVE_DURATIONS = [
  { id: '30' as const, label: '30 min' },
  { id: '60' as const, label: '1h' },
  { id: '90' as const, label: '1h30' },
  { id: '120' as const, label: '2h' },
];

export const LIVE_OBJECTIVES = [
  { id: 'educate' as const, label: 'Éduquer' },
  { id: 'sell' as const, label: 'Vendre' },
  { id: 'engage' as const, label: 'Engager' },
  { id: 'launch' as const, label: 'Lancer' },
];

export const AI_PROVIDERS = [
  { id: 'openrouter' as const, label: 'OpenRouter (Cloud)' },
  { id: 'ollama' as const, label: 'Ollama (Cloud)' },
];

export const AI_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'mistralai/mistral-large', label: 'Mistral Large' },
  { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
  { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
];

export const OLLAMA_MODELS = [
  { id: 'llama3.1', label: 'Llama 3.1' },
  { id: 'llama3', label: 'Llama 3' },
  { id: 'mistral', label: 'Mistral' },
  { id: 'gemma2', label: 'Gemma 2' },
  { id: 'qwen2.5', label: 'Qwen 2.5' },
  { id: 'phi3', label: 'Phi-3' },
];

export const DARIJA_QUOTES = [
  "Rome ما تبناتش في نهار، صبر واستمر.",
  "لي يحب يصل، ما يتعبش.",
  "الفشل ما هو إلا درس باش تتعلم.",
  "كل نهار جديد، فرصة جديدة.",
  "ما تقارن حياتك بحيات الناس، كل واحد و تمبو.",
  "النجاح يجي لللي ما يستسلمش.",
  "ابدا صغير، فكر كبير.",
  "اللي تبني اليوم، راه يخدّمك غدوة.",
  "ما تخافش من الريسك، خاف من الندم.",
  "المحتوى ملك، والانتشار هو السلطة.",
  "الSEO هو مستقبل البيزنس في الجزائر.",
  "لي ما يتعلمش التكنولوجيا، راه يتخلف.",
  "الموقع الإلكتروني هو بوابتك للعالم.",
  "ما تبقاش تبيع في فيسبوك بلا ضمانات.",
  "اللي عندو موقع، عندو مصداقية.",
];

export const SYSTEM_PROMPT = `Tu es un expert en content marketing pour le marché algérien. Tu crées du contenu viral pour des e-commerçants algériens sur Facebook qui doivent migrer vers leurs propres sites web.
Tu connais les codes culturels algériens, tu utilises des références locales, tu parles leur langage.
Le créateur de contenu s'appelle {{CREATOR_NAME}} et est expert en SEO et IA agentique.
Chaque contenu doit éduquer, créer du désir et pousser vers l action.`;

export const VIEW_LABELS: Record<string, string> = {
  cockpit: '🏠 Cockpit',
  calendar: '📅 Calendrier',
  generator: '✨ Générer',
  lives: '🎥 Lives',
  library: '📚 Bibliothèque',
  strategy: '🗺️ Stratégie',
  kpis: '📊 KPIs',
  settings: '⚙️ Paramètres',
};

export const VIEW_SHORTCUTS: Record<string, string> = {
  g: 'generator',
  c: 'calendar',
  l: 'lives',
  b: 'library',
  s: 'strategy',
  k: 'kpis',
};
