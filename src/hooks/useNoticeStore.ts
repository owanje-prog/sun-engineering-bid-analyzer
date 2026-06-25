'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ChecklistItem, EngineerCareer, NoticeData, NoticeStore, ProjectRecord } from '@/types/notice';
import { loadStore, saveStore } from '@/lib/storage';

interface NoticeStoreContext {
  notices: NoticeData[];
  storageWarning: boolean;
  addNotice: (notice: NoticeData) => void;
  updateNotice: (id: string, patch: Partial<NoticeData>) => void;
  deleteNotice: (id: string) => void;
  updateChecklist: (id: string, items: ChecklistItem[]) => void;
  updateProjectRecords: (id: string, records: ProjectRecord[]) => void;
  updateEngineerCareers: (id: string, careers: EngineerCareer[]) => void;
}

const Ctx = createContext<NoticeStoreContext | null>(null);

export function useNoticeStore(): NoticeStoreContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNoticeStore must be used inside StoreProvider');
  return ctx;
}

export function useNoticeStoreProvider() {
  const [store, setStore] = useState<NoticeStore>({ notices: [] });
  const [storageWarning, setStorageWarning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const persist = useCallback((next: NoticeStore) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { overLimit } = saveStore(next);
      setStorageWarning(overLimit);
    }, 500);
  }, []);

  const addNotice = useCallback((notice: NoticeData) => {
    setStore(prev => {
      const next = { notices: [notice, ...prev.notices] };
      persist(next);
      return next;
    });
  }, [persist]);

  const updateNotice = useCallback((id: string, patch: Partial<NoticeData>) => {
    setStore(prev => {
      const next = { notices: prev.notices.map(n => n.id === id ? { ...n, ...patch } : n) };
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteNotice = useCallback((id: string) => {
    setStore(prev => {
      const next = { notices: prev.notices.filter(n => n.id !== id) };
      persist(next);
      return next;
    });
  }, [persist]);

  const updateChecklist = useCallback((id: string, items: ChecklistItem[]) => {
    updateNotice(id, { checklist: items });
  }, [updateNotice]);

  const updateProjectRecords = useCallback((id: string, records: ProjectRecord[]) => {
    updateNotice(id, { projectRecords: records });
  }, [updateNotice]);

  const updateEngineerCareers = useCallback((id: string, careers: EngineerCareer[]) => {
    updateNotice(id, { engineerCareers: careers });
  }, [updateNotice]);

  return {
    value: {
      notices: store.notices,
      storageWarning,
      addNotice,
      updateNotice,
      deleteNotice,
      updateChecklist,
      updateProjectRecords,
      updateEngineerCareers,
    },
    Ctx,
  };
}

export { Ctx as NoticeStoreCtx };
