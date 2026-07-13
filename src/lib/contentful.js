import { createClient } from 'contentful';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

const SPACE_ID = import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const ENVIRONMENT = import.meta.env.PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
export const CONTENT_TYPE = import.meta.env.PUBLIC_CONTENTFUL_CONTENT_TYPE || 'post';

export const isConfigured = Boolean(SPACE_ID && ACCESS_TOKEN);

let client = null;
if (isConfigured) {
  client = createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN,
    environment: ENVIRONMENT
  });
}

const EXCERPT_LENGTH = 220;

function toExcerpt(fields) {
  if (fields.excerpt) return fields.excerpt;
  if (fields.content) {
    try {
      const plain = documentToPlainTextString(fields.content).trim();
      return plain.length > EXCERPT_LENGTH
        ? `${plain.slice(0, EXCERPT_LENGTH).trim()}…`
        : plain;
    } catch {
      return '';
    }
  }
  return '';
}

function normalize(entry) {
  const fields = entry.fields || {};
  return {
    id: entry.sys.id,
    title: fields.title || 'Untitled',
    subtitle: fields.subtitle || '',
    excerpt: toExcerpt(fields),
    content: fields.content || null,
    date: fields.publishDate || entry.sys.createdAt
  };
}

/**
 * Lists the locales enabled on this space (Settings → Locales in Contentful),
 * so the app can offer an edition switcher instead of hardcoding one locale.
 */
export async function fetchLocales() {
  if (!client) return [];

  const response = await client.getLocales();
  return response.items.map((item) => ({
    code: item.code,
    name: item.name,
    default: item.default
  }));
}

/**
 * Fetches one page of posts, newest first.
 * Throws if Contentful isn't configured or the request fails —
 * callers decide how to fall back.
 */
export async function fetchPosts({ skip = 0, limit = 12, locale } = {}) {
  if (!client) {
    throw new Error('Contentful is not configured');
  }

  const response = await client.getEntries({
    content_type: CONTENT_TYPE,
    order: '-fields.publishDate',
    skip,
    limit,
    ...(locale ? { locale } : {})
  });

  return {
    posts: response.items.map(normalize),
    total: response.total
  };
}
