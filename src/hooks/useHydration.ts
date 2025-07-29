import { useEffect, useState } from 'react';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

export function useClientOnly<T>(clientValue: T, serverValue?: T) {
  const isHydrated = useHydration();
  
  if (!isHydrated) {
    return serverValue;
  }
  
  return clientValue;
}
