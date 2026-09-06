import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';

import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { GlossaryTerm, GlossaryTermReference } from '@/features/learning/data/learning-types';
import { linkGlossaryTerms, parseGlossaryUrl } from '@/features/learning/glossary-inline';

/**
 * Inline glossary support for native Markdown readers.
 *
 * The term list is fetched once per reader and the linking is memoised on the
 * document, so scrolling and re-renders never re-run it. A failed lookup leaves
 * the content exactly as authored — an unavailable glossary must never cost the
 * reader the lesson.
 */
export function useGlossaryReader(contentBody: string) {
  const database = useSQLiteContext();
  const [references, setReferences] = useState<GlossaryTermReference[]>([]);
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);

  useEffect(() => {
    let active = true;
    void createLearningContentRepository(database)
      .getGlossaryTermReferences()
      .then((rows) => { if (active) setReferences(rows); })
      .catch(() => { if (active) setReferences([]); });
    return () => { active = false; };
  }, [database]);

  const linkedMarkdown = useMemo(() => linkGlossaryTerms(contentBody, references), [contentBody, references]);

  const onLinkPress = useCallback(({ url }: { url: string }) => {
    const termId = parseGlossaryUrl(url);
    if (!termId) { void Linking.openURL(url).catch(() => undefined); return; }
    void createLearningContentRepository(database)
      .getGlossaryTerm(termId)
      .then((term) => setActiveTerm(term))
      .catch(() => setActiveTerm(null));
  }, [database]);

  const dismissTerm = useCallback(() => setActiveTerm(null), []);

  /**
   * Close the popover when this reader stops being the screen on top. It is a
   * Portal, so it renders above the whole app rather than inside the screen
   * that opened it — left open, it follows the reader onto the next screen and
   * has to be dismissed from a page it says nothing about.
   */
  useFocusEffect(useCallback(() => () => setActiveTerm(null), []));

  return { activeTerm, dismissTerm, linkedMarkdown, onLinkPress };
}
