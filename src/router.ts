export type RouteHandler = (params: Record<string, string>) => void;

interface Route {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

const routes: Route[] = [];

export function addRoute(path: string, handler: RouteHandler) {
  // Convert /category/:slug into a regex
  const paramNames: string[] = [];
  const pattern = path.replace(/:(\w+)/g, (_match, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  routes.push({
    pattern: new RegExp(`^#${pattern}$`),
    paramNames,
    handler,
  });
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function startRouter() {
  const resolve = () => {
    const hash = window.location.hash || '#/';

    // OAuth callback: Supabase appends tokens to the URL hash.
    // Clean the URL without triggering navigation so the Supabase client
    // can read the tokens from the original hash before we replace it.
    if (hash.includes('access_token=') || hash.includes('error_description=')) {
      window.history.replaceState(null, '', window.location.pathname + '#/');
      resolve();
      return;
    }

    for (const route of routes) {
      const match = hash.match(route.pattern);
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

  window.addEventListener('hashchange', resolve);
  resolve();
}
