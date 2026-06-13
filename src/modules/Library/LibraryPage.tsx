import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlatformBadge } from '../../components/ui/PlatformBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useContentStore } from '../../stores/contentStore';
import { PLATFORMS, POST_STATUSES } from '../../lib/constants';
import type { Platform, PostStatus } from '../../types';
import { Search, Star, Tag, Download, RefreshCw, FileText, Trash2, BookOpen } from 'lucide-react';

export function LibraryPage() {
  const { posts, toggleFavorite, updatePost, deletePost } = useContentStore();
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [taggingPostId, setTaggingPostId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (showFavoritesOnly && !post.isFavorite) return false;
      if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false;
      if (filterStatus !== 'all' && post.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const text = `${post.title || ''} ${post.content?.hook || ''} ${post.content?.body || ''} ${post.tags.join(' ')}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });
  }, [posts, search, filterPlatform, filterStatus, showFavoritesOnly]);

  const handleExportTxt = () => {
    const text = filteredPosts
      .map((p) => {
        const parts = [
          `=== ${p.title || 'Sans titre'} ===`,
          `Plateforme: ${p.platform}`,
          `Statut: ${p.status}`,
          `Hook: ${p.content?.hook || ''}`,
          `Body: ${p.content?.body || ''}`,
          `CTA: ${p.content?.cta || ''}`,
          `Hashtags: ${p.content?.hashtags?.join(' ') || ''}`,
          '---',
        ];
        return parts.join('\n');
      })
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contenu-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export TXT réussi');
  };

  const handleExportMd = () => {
    const text = filteredPosts
      .map((p) => {
        return [
          `# ${p.title || 'Sans titre'}`,
          `**Plateforme:** ${p.platform} | **Statut:** ${p.status}`,
          '',
          '## Hook',
          p.content?.hook || '',
          '',
          '## Corps',
          p.content?.body || '',
          '',
          '## CTA',
          p.content?.cta || '',
          '',
          '## Hashtags',
          p.content?.hashtags?.join(' ') || '',
          '---',
        ].join('\n');
      })
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contenu-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export MD réussi');
  };

  const handleRecycle = (postId: string) => {
    void postId;
    // For now just notify, full recycle would call AI again
    toast.info('Fonctionnalité de recyclage à venir');
  };

  const handleAddTag = (postId: string) => {
    if (!newTag.trim()) return;
    const post = posts.find((p) => p.id === postId);
    if (post && !post.tags.includes(newTag.trim())) {
      updatePost(postId, { tags: [...post.tags, newTag.trim()] });
    }
    setNewTag('');
    setTaggingPostId(null);
  };

  const stats = useMemo(() => {
    const byPlatform = {} as Record<string, number>;
    posts.forEach((p) => {
      byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
    });
    return { total: posts.length, byPlatform };
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📚 Bibliothèque</h1>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>{stats.total} posts</span>
          {Object.entries(stats.byPlatform).map(([plat, count]) => {
            const p = PLATFORMS.find((x) => x.id === plat);
            return (
              <span key={plat} className="text-xs px-2 py-0.5 rounded-full bg-dark-hover">
                {p?.label || plat}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans les posts..."
            className="w-full pl-9"
          />
        </div>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
          className="text-xs py-2"
        >
          <option value="all">Toutes plateformes</option>
          {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PostStatus | 'all')}
          className="text-xs py-2"
        >
          <option value="all">Tous statuts</option>
          {POST_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`p-2 rounded-lg border transition-colors ${
            showFavoritesOnly ? 'border-accent bg-accent/10 text-accent' : 'border-dark-border text-text-secondary'
          }`}
        >
          <Star className="w-4 h-4" />
        </button>
        <Button variant="secondary" size="sm" onClick={handleExportTxt}>
          <FileText className="w-3.5 h-3.5" />TXT
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportMd}>
          <Download className="w-3.5 h-3.5" />MD
        </Button>
      </Card>

      {/* Liste des posts */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="space-y-3 hover:border-accent/20 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={post.platform} />
                <StatusBadge status={post.status} />
                {post.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFavorite(post.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-yellow-400">
                  <Star className={`w-4 h-4 ${post.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button onClick={() => handleRecycle(post.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-accent">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-dark-hover text-text-muted hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-white mb-1">{post.title || post.content?.hook}</h3>
              {post.content?.body && (
                <p className="text-sm text-text-secondary line-clamp-3">{post.content.body}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{tag}</span>
              ))}
              {taggingPostId === post.id ? (
                <div className="flex items-center gap-1">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(post.id)}
                    placeholder="Tag..."
                    className="w-24 py-0.5 px-2 text-xs"
                    autoFocus
                  />
                  <button onClick={() => handleAddTag(post.id)} className="text-xs text-accent">OK</button>
                </div>
              ) : (
                <button onClick={() => setTaggingPostId(post.id)} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-hover text-text-muted hover:text-accent border border-dashed border-dark-border">
                  <Tag className="w-3 h-3 inline mr-1" />+ Tag
                </button>
              )}
            </div>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">Aucun post trouvé</p>
            <p className="text-xs text-text-muted">Génère du contenu pour le voir ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
