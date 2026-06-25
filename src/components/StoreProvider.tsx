'use client';

import { ReactNode } from 'react';
import { useNoticeStoreProvider } from '@/hooks/useNoticeStore';

export default function StoreProvider({ children }: { children: ReactNode }) {
  const { value, Ctx } = useNoticeStoreProvider();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
