'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getSectionContent } from '@/services/content.service';
import type { SiteContent } from '@/types/content';

/**
 * Hook de LECTURE PUBLIQUE du contenu éditorial d'une section.
 *
 * Récupère les blocs actifs d'une section depuis le backend (sans authentification)
 * et expose un accesseur `cv(key, fallback)` qui renvoie la valeur traduite si elle
 * existe en base, sinon la valeur de repli (typiquement la traduction i18n statique).
 *
 * Permet aux composants du site vitrine de refléter le contenu géré dans l'admin,
 * tout en restant fonctionnels si la base est vide ou le backend indisponible.
 *
 * @param section nom de la section (ex: "hero", "services", "faq").
 */
export function usePublicSection(section: string) {
  const locale = useLocale();
  const [blocks, setBlocks] = useState<Record<string, SiteContent>>({});

  useEffect(() => {
    let cancelled = false;
    getSectionContent(section)
      .then((list) => {
        if (!cancelled) {
          setBlocks(Object.fromEntries(list.map((b) => [b.contentKey, b])));
        }
      })
      .catch(() => {
        // Backend indisponible : on garde les valeurs de repli (i18n).
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  /** Valeur du bloc `key` dans la locale courante, ou `fallback` si absente. */
  const cv = useCallback(
    (key: string, fallback = ''): string => {
      const block = blocks[key];
      if (!block) return fallback;
      const v = locale === 'fr' ? block.valueFr : block.valueEn;
      return v && v.length > 0 ? v : fallback;
    },
    [blocks, locale]
  );

  /** Liste brute des blocs (pour les sections de type liste). */
  const items = Object.values(blocks);

  return { cv, items, blocks };
}

/**
 * Variante pour les sections de type LISTE : renvoie les items `item-*` triés
 * par ordre d'affichage, chacun déjà fusionné pour la locale courante.
 *
 * Convention de stockage : `valueFr` contient TOUS les champs (y compris les
 * champs partagés non traduits : icône, année, badge...), `valueEn` ne contient
 * que les champs traduits. On fusionne donc `valueFr` puis, en anglais, on
 * superpose `valueEn`.
 *
 * NOTE TYPAGE : le contenu est DÉFINI PAR L'ADMIN (forme arbitraire selon la
 * section). `any` est ici un choix délibéré : c'est l'unique frontière de contenu
 * dynamique du CMS. Le typer en `unknown` ne ferait que déplacer une quinzaine de
 * casts `as` chez les consommateurs, sans gain de sûreté réel.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- frontière de contenu CMS dynamique (cf. note ci-dessus) */
export function usePublicList(section: string): Array<Record<string, any> & { id: string }> {
  const locale = useLocale();
  const { items } = usePublicSection(section);
  return items
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: Record<string, any> = {};
      let en: Record<string, any> = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      return { id: b.contentKey, ...fr, ...(locale === 'en' ? en : {}) };
    });
}
