'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  listSectionContent,
  upsertContent,
  deleteContent,
} from '@/services/content.service';
import type { SiteContent } from '@/types/content';
import { ApiRequestError } from '@/lib/api';

/**
 * Charge utile d'un bloc lors d'une sauvegarde (par clé).
 */
export interface ContentBlockInput {
  valueFr?: string;
  valueEn?: string;
  contentType?: string;
  displayOrder?: number;
  active?: boolean;
}

/**
 * Hook réutilisable pour gérer une SECTION de contenu éditorial unifié.
 *
 * Il factorise, pour toutes les pages admin de contenu (hero, services, FAQ...),
 * le chargement des blocs d'une section et leur sauvegarde groupée via le
 * domaine SiteContent du backend, en s'appuyant sur le token de session.
 *
 * @param section nom de la section (ex: "hero", "services", "faq").
 */
export function useSiteContentSection(section: string) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  /** Blocs indexés par leur clé (contentKey). */
  const [blocks, setBlocks] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /** Recharge tous les blocs de la section (vue admin = inactifs inclus). */
  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    listSectionContent(section, token)
      .then((list) => setBlocks(Object.fromEntries(list.map((b) => [b.contentKey, b]))))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement du contenu.'))
      .finally(() => setLoading(false));
  }, [token, section]);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Sauvegarde (upsert) un ensemble de blocs identifiés par leur clé.
   * @param entries dictionnaire { clé: charge utile du bloc }
   */
  const saveAll = useCallback(
    async (entries: Record<string, ContentBlockInput>) => {
      if (!token) return;
      setSaving(true);
      setError('');
      setSuccess('');
      try {
        await Promise.all(
          Object.entries(entries).map(([key, input]) =>
            upsertContent(section, key, { section, contentKey: key, ...input }, token)
          )
        );
        setSuccess('Modifications enregistrées.');
        reload();
      } catch (e) {
        setError(e instanceof ApiRequestError ? e.message : "Erreur lors de l'enregistrement.");
      } finally {
        setSaving(false);
      }
    },
    [token, section, reload]
  );

  /**
   * Supprime un bloc identifié par sa clé (utile pour les sections de type liste).
   * @param contentKey clé du bloc à supprimer
   */
  const remove = useCallback(
    async (contentKey: string) => {
      if (!token) return;
      const block = blocks[contentKey];
      if (!block) return;
      setError('');
      try {
        await deleteContent(block.id, token);
        reload();
      } catch (e) {
        setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la suppression.');
      }
    },
    [token, blocks, reload]
  );

  /** Valeur d'un bloc dans une langue donnée, avec valeur de repli. */
  const value = useCallback(
    (key: string, lang: 'fr' | 'en', fallback = ''): string => {
      const block = blocks[key];
      if (!block) return fallback;
      const v = lang === 'fr' ? block.valueFr : block.valueEn;
      return v ?? fallback;
    },
    [blocks]
  );

  return {
    token,
    blocks,
    loading,
    saving,
    error,
    success,
    reload,
    saveAll,
    remove,
    value,
    setError,
    setSuccess,
  };
}
