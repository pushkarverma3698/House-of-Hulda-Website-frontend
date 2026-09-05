'use client';

import { useScrollRig, getLenis } from '@/hooks/useScrollRig';

export { getLenis };

export function Providers({ children }: { children: React.ReactNode }) {
  useScrollRig();
  return <>{children}</>;
}
