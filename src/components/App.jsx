import { useCallback, useEffect, useRef, useState } from 'react';
import Masthead from './Masthead.jsx';
import PostGrid from './PostGrid.jsx';
import PostDialog from './PostDialog.jsx';
import ContentWarningDialog, { CONSENT_KEY } from './ContentWarningDialog.jsx';
import { fetchPosts, fetchLocales, isConfigured } from '../lib/contentful.js';
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
      if (!isConfigured) {
        if (!cancelled) setLocale(FALLBACK_LOCALE);
        return;
      }
      try {
        const items = await fetchLocales();
        if (cancelled) return;
        setLocales(items);
        const defaultLocale = items.find((item) => item.default) || items[0];
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
    setLoading(true);
    try {
      if (!isConfigured) {
        // Demo mode: paginate through the local sample set.
        const skip = skipRef.current;
        const slice = SAMPLE_POSTS.slice(skip, skip + PAGE_SIZE);
        setPosts((prev) => [...prev, ...slice]);
        skipRef.current += slice.length;
        setHasMore(skipRef.current < SAMPLE_POSTS.length);
        setError(false);
        return;
      }

      const { posts: page, total } = await fetchPosts({
        skip: skipRef.current,
        limit: PAGE_SIZE,
        locale
      });
      setPosts((prev) => [...prev, ...page]);
      skipRef.current += page.length;
      setHasMore(skipRef.current < total && page.length > 0);
      setError(false);
    } catch (err) {
      console.error('Failed to load posts', err);
      setError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  // (Re)load the first page whenever the active locale is set or changes.
  useEffect(() => {
    if (!locale) return;
    skipRef.current = 0;
    setPosts([]);
    setHasMore(true);
    setError(false);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

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
        loading={loading}
        hasMore={hasMore}
        error={error}
      />

      {activePost && (
        <PostDialog post={activePost} onClose={() => setActivePost(null)} />
      )}

      {showWarning && (
        <ContentWarningDialog onAccept={() => setShowWarning(false)} />
      )}
    </>
  );
}
