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
    for (const route of routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
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
