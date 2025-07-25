import { useLocation } from "wouter";

export function useDemoMode() {
  const [location] = useLocation();
  const isDemoMode = location.startsWith('/demo');
  
  const getApiPath = (path: string) => {
    return isDemoMode ? `/api/demo${path}` : `/api${path}`;
  };

  return {
    isDemoMode,
    getApiPath
  };
}