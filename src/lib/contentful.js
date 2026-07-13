import { SAMPLE_POSTS } from './samplePosts.js';

/**
 * Client-side wrapper that calls the server-side API routes under `/api/*`.
 * If the server reports Contentful is not configured (404), the client falls
 * back to the bundled `SAMPLE_POSTS` so the UI still works in demo mode.
 */
const EXCERPT_LENGTH = 220; // kept for parity with server

export async function fetchLocales() {
  try {
    const res = await fetch('/api/locales.json');
    if (res.status === 404) return [];
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error === 'not-configured') return [];
      throw new Error('Failed to load locales');
    }
    return await res.json();
  } catch (err) {
    console.error('fetchLocales error', err);
    return [];
  }
}

export async function fetchPosts({ skip = 0, limit = 12, locale } = {}) {
  try {
    const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (locale) qs.set('locale', locale);
    const res = await fetch(`/api/posts.json?${qs.toString()}`);
    if (res.status === 404) {
      const slice = SAMPLE_POSTS.slice(skip, skip + limit);
      return { posts: slice, total: SAMPLE_POSTS.length };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error === 'not-configured') {
        const slice = SAMPLE_POSTS.slice(skip, skip + limit);
        return { posts: slice, total: SAMPLE_POSTS.length };
      }
      throw new Error('Failed to fetch posts');
    }
    return await res.json();
  } catch (err) {
    console.error('fetchPosts error', err);
    throw err;
  }
}

export const isConfigured = true; // client-side always uses API; server decides
