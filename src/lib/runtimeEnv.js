let cachedEnv = null;

async function loadRuntimeEnv() {
  if (cachedEnv) return cachedEnv;

  let envSource = null;
  try {
    const cloudflare = await import('cloudflare:workers');
    envSource = cloudflare.env;
  } catch {
    envSource = import.meta.env;
  }

  cachedEnv = {
    CONTENTFUL_SPACE_ID: envSource.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: envSource.CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_ENVIRONMENT:
      envSource.CONTENTFUL_ENVIRONMENT || 'master',
    CONTENTFUL_CONTENT_TYPE:
      envSource.CONTENTFUL_CONTENT_TYPE || 'post'
  };

  return cachedEnv;
}

export async function getRuntimeEnv() {
  return await loadRuntimeEnv();
}
