import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post } from '../types';
import { generateId } from '../lib/utils';

interface ContentState {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  getPostById: (id: string) => Post | undefined;
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
        return id;
      },
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePost: (id) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        })),
      addTag: (id, tag) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id && !p.tags.includes(tag)
              ? { ...p, tags: [...p.tags, tag] }
              : p
          ),
        })),
      removeTag: (id, tag) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p
          ),
        })),
      getPostById: (id) => get().posts.find((p) => p.id === id),
      resetAll: () => set({ posts: [] }),
    }),
    { name: 'dz-content' }
  )
);
