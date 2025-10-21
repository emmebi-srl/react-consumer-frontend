import { matchPath, useLocation } from 'react-router-dom';

function useRouteMatch(patterns: readonly string[]) {
  const { pathname, search } = useLocation();
  const exactMatch = patterns.find((pattern) => {
    return pattern === pathname || pattern === `${pathname}${search}`;
  });
  if (exactMatch) return exactMatch;

  return patterns.find((pattern) => {
    return matchPath(pattern, pathname) || pathname.startsWith(pattern);
  });
}

export default useRouteMatch;
