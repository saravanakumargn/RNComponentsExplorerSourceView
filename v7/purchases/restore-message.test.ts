import { describe, expect, it } from 'vitest';

import { getRestoreMessage } from './restore-message';

describe('restore message', () => {
  it('confirms an ads-only restore instead of claiming nothing was found', () => {
    // The treat buyer from after the cutoff: ads really are removed.
    const message = getRestoreMessage({ adsRemoved: true, learningUnlocked: false });
    expect(message).toContain('restored');
    expect(message).not.toContain('No previous purchase');
    expect(message).toContain('does not include the learning library');
  });

  it('confirms a full restore', () => {
    expect(getRestoreMessage({ adsRemoved: true, learningUnlocked: true })).toContain('learning library is unlocked');
  });

  it('still says so when there is genuinely nothing to restore', () => {
    expect(getRestoreMessage({ adsRemoved: false, learningUnlocked: false })).toBe('No previous purchase was found to restore.');
  });
});
