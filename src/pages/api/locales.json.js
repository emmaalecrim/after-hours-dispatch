export const prerender = false;

const SPACE_ID = import.meta.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.CONTENTFUL_ACCESS_TOKEN;
const ENVIRONMENT = import.meta.env.CONTENTFUL_ENVIRONMENT || 'master';

export async function get() {
  if (!SPACE_ID || !ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'not-configured' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
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
