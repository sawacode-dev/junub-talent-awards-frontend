export type RouteHandler = (params: Record<string, string>) => void;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

const routes: Route[] = [];

export function addRoute(path: string, handler: RouteHandler) {
  const paramNames: string[] = [];
  const pattern = path.replace(/:(\w+)/g, (_match, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  routes.push({
    pattern: new RegExp(`^${pattern}$`),
    paramNames,
    handler,
  });
}

export function navigate(path: string) {
  history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
}

export function startRouter() {
  const resolve = () => {
    const path = window.location.pathname;

    // Supabase PKCE OAuth callback lands with ?code= in the query string.
    // detectSessionInUrl handles auth; we just clean the URL and re-resolve.
    const search = window.location.search;
    if (search.includes('code=') || search.includes('error=') || search.includes('error_description=')) {
      history.replaceState(null, '', window.location.pathname);
      // Don't re-resolve immediately — let Supabase process the code first,
      // then onAuthStateChange will trigger a header re-render.
      return;
    }

    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          try {
            params[name] = decodeURIComponent(match[i + 1]);
          } catch {
            params[name] = match[i + 1];
          }
        });
        route.handler(params);
        return;
      }
    }
    // Fallback to home
    navigate('/');
  };

  window.addEventListener('popstate', resolve);

  // Intercept all internal <a> clicks so navigation uses pushState
  // instead of a full page reload. External links and _blank targets
  // are left untouched.
  document.addEventListener('click', (e) => {
    const anchor = (e.target as Element).closest<HTMLAnchorElement>('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('#') ||
      anchor.target === '_blank' ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
    ) return;
    e.preventDefault();
    navigate(href);
  });

  resolve();
}
