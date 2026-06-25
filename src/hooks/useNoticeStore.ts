'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ChecklistItem, EngineerCareer, NoticeData, NoticeStore, ProjectRecord } from '@/types/notice';
import { loadStore, upsertNotice, deleteNoticeFromDb } from '@/lib/storage';

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
  const storageWarning = false;

  useEffect(() => {
    loadStore().then(setStore);
  }, []);

  const addNotice = useCallback((notice: NoticeData) => {
    setStore(prev => ({ notices: [notice, ...prev.notices] }));
    upsertNotice(notice);
  }, []);

  const updateNotice = useCallback((id: string, patch: Partial<NoticeData>) => {
    setStore(prev => {
      const next = prev.notices.map(n => n.id === id ? { ...n, ...patch } : n);
      const updated = next.find(n => n.id === id);
      if (updated) upsertNotice(updated);
      return { notices: next };
    });
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setStore(prev => ({ notices: prev.notices.filter(n => n.id !== id) }));
    deleteNoticeFromDb(id);
  }, []);

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
