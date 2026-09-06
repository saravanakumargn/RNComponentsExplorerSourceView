import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningResetSummary } from '@/features/learning/data/learning-types';
import { describeLearningReset, hasLearningProgress } from '@/features/learning/learning-reset';
import { getRestoreMessage } from '@/features/purchases/restore-message';
import { useSubscription } from '@/features/purchases/use-subscription';

/**
 * Everything the More screen does, with none of how it looks.
 *
 * Extracted so the SwiftUI screen and the Paper screen it replaces on iOS
 * cannot drift apart in behaviour. Purchase restoring and progress resetting
 * are the two operations here with real consequences; they should not exist
 * twice.
 */
export function useMoreScreen() {
  const { isLoading, adsRemoved, learningUnlocked, restore } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState<LearningResetSummary | null>(null);

  const onRestore = useCallback(async () => {
    setRestoreMessage(null);
    setIsRestoring(true);
    try {
      setRestoreMessage(getRestoreMessage(await restore()));
    } finally {
      setIsRestoring(false);
    }
  }, [restore]);

  const dismissReset = useCallback(() => setPendingReset(null), []);

  const performReset = useCallback(async () => {
    setIsResetting(true);
    try {
      await (await getLearningProgressRepository()).resetLearningProgress();
      setResetMessage('Your learning progress was reset. Every lesson, quiz, and review starts fresh.');
    } catch {
      setResetMessage('Your progress could not be reset. Please try again.');
    } finally {
      setIsResetting(false);
      dismissReset();
    }
  }, [dismissReset]);

  /**
   * Counts first, then asks. The reader is told exactly what they are about to
   * lose, and what deletes it is a word they typed — not a button that happened
   * to be under their thumb.
   */
  const onResetProgress = useCallback(async () => {
    setResetMessage(null);
    let summary;
    try {
      summary = await (await getLearningProgressRepository()).getLearningResetSummary();
    } catch {
      setResetMessage('Your saved progress could not be read, so nothing was changed.');
      return;
    }

    if (!hasLearningProgress(summary)) {
      Alert.alert('Nothing to reset', describeLearningReset(summary), [{ text: 'OK' }]);
      return;
    }

    setPendingReset(summary);
  }, []);

  return {
    adsRemoved,
    dismissReset,
    isLoading,
    isResetting,
    isRestoring,
    learningUnlocked,
    onResetProgress,
    onRestore,
    pendingReset,
    performReset,
    resetMessage,
    restoreMessage,
  };
}
