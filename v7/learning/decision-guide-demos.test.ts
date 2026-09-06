import { describe, expect, it } from 'vitest';

import { getDemoForPackage } from './decision-guide-demos';

/*
 * Deliberately checked against the real catalogue rather than a fixture. The
 * failure this guards is a guide naming a package the app no longer ships
 * under that name — which a fixture cannot see.
 */
describe('getDemoForPackage', () => {
  it('resolves a recommended package to the demo the app ships', () => {
    expect(getDemoForPackage('zustand')).toEqual({ demoId: 'zustand', label: 'Open the Zustand demo' });
  });

  it('resolves a scoped package', () => {
    expect(getDemoForPackage('@tanstack/react-query')?.demoId).toBe('tanstack-query');
  });

  it('resolves the gluestack package the app actually installs, not the v1 name', () => {
    expect(getDemoForPackage('@gluestack-ui/core')?.demoId).toBe('gluestack-ui');
    expect(getDemoForPackage('@gluestack-ui/themed')).toBeNull();
  });

  it('returns null for an option with no demo behind it', () => {
    expect(getDemoForPackage('react')).toBeNull();
    expect(getDemoForPackage(null)).toBeNull();
    expect(getDemoForPackage(undefined)).toBeNull();
  });
});
