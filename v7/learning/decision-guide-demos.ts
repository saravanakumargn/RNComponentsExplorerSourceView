import { libraries } from '../../data/libraries';

import type { ContentDemo } from './data/learning-types';

/*
 * The bridge from a recommendation to a running demo.
 *
 * Guide options already carry `npm_package`, and the catalogue already knows
 * which package each demo is built on, so the link is *derived* rather than
 * authored: no `content_demos` row to keep in step, and every guide written
 * from here on inherits its demo links for free. Author a row only where the
 * link cannot be inferred from a package name.
 *
 * `reference` and `planned` libraries are excluded deliberately — a reference
 * entry documents a library the explorer does not run, so sending a reader
 * there from "we recommend this" would promise a demo that does not exist.
 *
 * Value imports are relative rather than through `@/` because this module is
 * unit tested, and the alias does not resolve for value imports under vitest.
 */
const DEMOS_BY_PACKAGE = new Map(
  libraries
    .filter((library) => library.status === 'available' && library.npmPackage)
    .map((library) => [library.npmPackage as string, { demoId: library.id, label: `Open the ${library.title} demo` }]),
);

/**
 * The demo for an option's npm package, or `null` when the explorer ships no
 * demo of it — which is the common case for options like `react` itself, and
 * is not a content error.
 */
export function getDemoForPackage(npmPackage: string | null | undefined): ContentDemo | null {
  if (!npmPackage) return null;
  return DEMOS_BY_PACKAGE.get(npmPackage) ?? null;
}
