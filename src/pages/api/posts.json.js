import { getRuntimeEnv } from '../../lib/runtimeEnv.js';

export const prerender = false;

/** @type {import('astro').APIRoute} */
export const GET = async ({ url }) => {
  const {
    CONTENTFUL_SPACE_ID: SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: ACCESS_TOKEN,
    CONTENTFUL_ENVIRONMENT: ENVIRONMENT,
    CONTENTFUL_CONTENT_TYPE: CONTENT_TYPE
  } = await getRuntimeEnv();

  const missing = [];
  if (!SPACE_ID) missing.push('CONTENTFUL_SPACE_ID');
  if (!ACCESS_TOKEN) missing.push('CONTENTFUL_ACCESS_TOKEN');
  if (missing.length > 0) {
    return new Response(
      JSON.stringify({
        error: 'not-configured',
        missing,
        hint: 'Set CONTENTFUL_ACCESS_TOKEN as a secret; set other CONTENTFUL_* vars in wrangler.toml under [vars] or the Cloudflare dashboard.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const skip = Number(url.searchParams.get('skip') || 0);
  const limit = Number(url.searchParams.get('limit') || 12);
  const locale = url.searchParams.get('locale') || undefined;

  try {
    const endpoint = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}/entries`;
    const params = new URLSearchParams({
      content_type: CONTENT_TYPE,
      order: '-fields.publishDate',
      skip: String(skip),
      limit: String(limit),
      ...(locale ? { locale } : {})
    });
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Contentful fetch failed ${response.status}`);
    }

    const data = await response.json();

    if (!data?.items || !Array.isArray(data.items)) {
      throw new Error('Contentful response missing items');
    }

    const EXCERPT_LENGTH = 220;
    const { documentToPlainTextString } = await import('@contentful/rich-text-plain-text-renderer');

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

    const posts = data.items.map(normalize);
    const total = typeof data.total === 'number' ? data.total : data.items.length;

    return new Response(JSON.stringify({ posts, total }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Contentful fetch error', err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
