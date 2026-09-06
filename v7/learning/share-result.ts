/**
 * Share text for a decision-guide result.
 *
 * The shareable moment in this app is an answer the reader got, not the app
 * itself — "here is the stack this recommended for my situation" travels, while
 * "here is an app" does not. The store link rides along so the message is still
 * useful to whoever receives it.
 */
// Relative rather than aliased: vitest resolves no `@/` alias, and this
// module is unit tested.
import { getStoreUrl } from '../more/more-links';

export const SHARE_RESULT_TITLE = 'My result';

export type ShareableResult = {
  /** The guide's question, e.g. "React Native, or something else?" */
  question: string;
  /** The winning option's name. */
  winner: string;
  /** The winner's score as a percentage of the best achievable. */
  percent: number;
  /** The criteria the reader marked as mattering, in the order shown. */
  weighted: string[];
};

const MAX_LISTED_CRITERIA = 3;

/**
 * Named criteria are capped and summarised rather than listed in full: a share
 * message that runs past a couple of lines gets truncated by the receiving app,
 * and the tail is exactly where the answer would have been.
 */
export function formatWeightedCriteria(weighted: string[]): string {
  if (weighted.length === 0) return '';
  const listed = weighted.slice(0, MAX_LISTED_CRITERIA);
  const remainder = weighted.length - listed.length;
  const joined = listed.join(', ').toLowerCase();
  return remainder > 0 ? `${joined}, and ${remainder} more` : joined;
}

export function formatResultShareMessage(result: ShareableResult, platformOS: string): string {
  const because = formatWeightedCriteria(result.weighted);
  const reason = because ? ` because I care about ${because}` : '';
  return `${result.question} I got ${result.winner} (${result.percent}%)${reason}. Worked out with this React Native app: ${getStoreUrl(platformOS)}`;
}
