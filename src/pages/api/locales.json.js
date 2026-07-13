import { getRuntimeEnv } from '../../lib/runtimeEnv.js';

export const prerender = false;

export async function get() {
  const { CONTENTFUL_SPACE_ID: SPACE_ID, CONTENTFUL_ACCESS_TOKEN: ACCESS_TOKEN, CONTENTFUL_ENVIRONMENT: ENVIRONMENT } = await getRuntimeEnv();

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

  try {
    const { createClient } = await import('contentful');
    const client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
      environment: ENVIRONMENT
    });
    const response = await client.getLocales();
    const items = response.items.map((item) => ({
      code: item.code,
      name: item.name,
      default: item.default
    }));
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Failed to load locales', err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
