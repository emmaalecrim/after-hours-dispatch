import { getRuntimeEnv } from '../../lib/runtimeEnv.js';

export const prerender = false;

export async function get({ url }) {
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

  // create client lazily to avoid importing node-only code at module eval time
  let client = null;
  try {
    const { createClient } = await import('contentful');
    client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
      environment: ENVIRONMENT
    });
  } catch (err) {
    console.error('Failed to load Contentful client', err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const skip = Number(url.searchParams.get('skip') || 0);
  const limit = Number(url.searchParams.get('limit') || 12);
  const locale = url.searchParams.get('locale') || undefined;

  try {
    const response = await client.getEntries({
      content_type: CONTENT_TYPE,
      order: '-fields.publishDate',
      skip,
      limit,
      ...(locale ? { locale } : {})
    });

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

    const posts = response.items.map(normalize);

    return new Response(JSON.stringify({ posts, total: response.total }), {
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
