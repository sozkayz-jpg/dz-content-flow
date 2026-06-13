import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post } from '../types';
import { generateId } from '../lib/utils';
import { schedulePostsSync } from '../lib/syncManager';
import { loadPostsFromSupabase } from '../lib/supabase';

interface ContentState {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  getPostById: (id: string) => Post | undefined;
  loadFromSupabase: () => Promise<void>;
  resetAll: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      posts: [],
      addPost: (post) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newPost: Post = { ...post, id, createdAt: now, updatedAt: now };
        set((state) => ({ posts: [newPost, ...state.posts] }));
        schedulePostsSync(() => get().posts);
        return id;
      },
      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
        schedulePostsSync(() => get().posts);
      },
      deletePost: (id) => {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
        schedulePostsSync(() => get().posts);
      },
      toggleFavorite: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        }));
        schedulePostsSync(() => get().posts);
      },
      addTag: (id, tag) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id && !p.tags.includes(tag)
              ? { ...p, tags: [...p.tags, tag] }
              : p
          ),
        }));
        schedulePostsSync(() => get().posts);
      },
      removeTag: (id, tag) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p
          ),
        }));
        schedulePostsSync(() => get().posts);
      },
      getPostById: (id) => get().posts.find((p) => p.id === id),
      loadFromSupabase: async () => {
        const remote = await loadPostsFromSupabase();
        if (remote && remote.length > 0) {
          set({ posts: remote });
        }
      },
      resetAll: () => {
        set({ posts: [] });
        schedulePostsSync(() => []);
      },
    }),
    { name: 'dz-content' }
  )
);
