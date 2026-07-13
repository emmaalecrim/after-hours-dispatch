import { useCallback, useEffect, useRef, useState } from 'react';
import Masthead from './Masthead.jsx';
import PostGrid from './PostGrid.jsx';
import PostDialog from './PostDialog.jsx';
import ContentWarningDialog, { CONSENT_KEY } from './ContentWarningDialog.jsx';
import { fetchPosts, fetchLocales } from '../lib/contentful.js';
import { SAMPLE_POSTS } from '../lib/samplePosts.js';

const PAGE_SIZE = 12;
const FALLBACK_LOCALE = 'en-US';

export default function App() {
  const [showWarning, setShowWarning] = useState(false);
  const [warningChecked, setWarningChecked] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const skipRef = useRef(0);

  const [locales, setLocales] = useState([]);
  const [locale, setLocale] = useState(null);

  const [activePost, setActivePost] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let hasConsent = false;
    try {
      hasConsent = window.localStorage.getItem(CONSENT_KEY) === 'true';
    } catch {
      hasConsent = false;
    }
    setShowWarning(!hasConsent);
    setWarningChecked(true);
  }, []);

  // Discover which locales this Contentful space publishes in, then default
  // to whichever one is marked as the space's default locale.
  useEffect(() => {
    let cancelled = false;

    async function loadLocales() {
      try {
        const items = await fetchLocales();
        if (cancelled) return;
        setLocales(items || []);
        const defaultLocale = (items && items.find((item) => item.default)) || (items && items[0]);
        setLocale(defaultLocale ? defaultLocale.code : FALLBACK_LOCALE);
      } catch (err) {
        console.error('Failed to load locales', err);
        if (!cancelled) setLocale(FALLBACK_LOCALE);
      }
    }

    loadLocales();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const { posts: page, total } = await fetchPosts({
        skip: skipRef.current,
        limit: PAGE_SIZE,
        locale
      });
      if (requestId !== requestIdRef.current) return;
      setPosts((prev) => [...prev, ...page]);
      skipRef.current += page.length;
      setHasMore(skipRef.current < total && page.length > 0);
      setError(false);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to load posts', err);
      setError(true);
      setHasMore(false);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [locale]);

  // (Re)load the first page whenever the active locale is set or changes.
  useEffect(() => {
    if (!locale) return;
    requestIdRef.current += 1;
    skipRef.current = 0;
    setPosts([]);
    setHasMore(true);
    setError(false);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const retryLoadMore = useCallback(() => {
    setError(false);
    loadMore();
  }, [loadMore]);

  if (!warningChecked) return null;

  return (
    <>
      <Masthead
        issueLabel="After Hours Dispatch — No. 001"
        title="After Hours Dispatch"
        subtitle="Field notes on neon, longing, and the parts of the night nobody photographs."
        locales={locales}
        activeLocale={locale}
        onLocaleChange={setLocale}
      />

      <PostGrid
        posts={posts}
        onOpenPost={setActivePost}
        onLoadMore={loadMore}
        onRetry={retryLoadMore}
        loading={loading}
        hasMore={hasMore}
        error={error}
        locale={locale}
      />

      {activePost && (
        <PostDialog
          post={activePost}
          locale={locale}
          onClose={() => setActivePost(null)}
        />
      )}

      {showWarning && (
        <ContentWarningDialog onAccept={() => setShowWarning(false)} />
      )}
    </>
  );
}
