/**
 * The recommendation engine behind every decision guide.
 *
 * The content schema stores a *static* comparison — options, criteria, and one
 * score per pair — not a questionnaire. Rather than add a question table, the
 * wizard asks how much each criterion matters to this reader and ranks the
 * options by the weighted sum of scores they already carry. Every guide
 * therefore gets a wizard for free, and authoring stays a matter of scoring a
 * grid rather than writing a decision tree.
 */
import type { DecisionGuide, DecisionGuideOption } from '@/features/learning/data/learning-types';

/** How much a criterion matters to this reader. */
/**
 * `label` is deliberately short: four segments share one row, and anything
 * longer than "Critical" truncates to an ellipsis on a narrow phone, which
 * makes the middle two options unreadable. `description` carries the full
 * phrasing for screen readers.
 */
export const CRITERION_WEIGHTS = [
  { value: 0, label: 'No', description: 'Does not matter' },
  { value: 1, label: 'Some', description: 'Nice to have' },
  { value: 2, label: 'A lot', description: 'Important' },
  { value: 3, label: 'Critical', description: 'Critical' },
] as const;

export const MAX_CRITERION_WEIGHT = 3;
/** The 0–3 range each authored score uses; kept here so the build and UI agree. */
export const MAX_SCORE_VALUE = 3;

export type CriterionWeights = Record<number, number>;

export type RankedOption = {
  option: DecisionGuideOption;
  /** Weighted total. Comparable only within one ranking. */
  score: number;
  /** `score` as a percentage of the best achievable total, for display. */
  percent: number;
  /**
   * The criteria that contributed most to this option, heaviest first — the
   * "why" behind a recommendation. Only criteria the reader actually weighted
   * appear here.
   */
  reasons: { criterionId: number; label: string; note: string | null }[];
};

export type WizardOutcome =
  | { kind: 'unscored' }
  | { kind: 'no-preference'; options: DecisionGuideOption[] }
  | { kind: 'ranked'; ranked: RankedOption[] };

function scoreFor(guide: DecisionGuide, optionId: number, criterionId: number): number | null {
  const match = guide.scores.find((score) => score.optionId === optionId && score.criterionId === criterionId);
  return match ? match.value : null;
}

function noteFor(guide: DecisionGuide, optionId: number, criterionId: number): string | null {
  return guide.scores.find((score) => score.optionId === optionId && score.criterionId === criterionId)?.note ?? null;
}

/**
 * Rank a guide's options against the reader's weights.
 *
 * Returns a discriminated outcome rather than an empty list so the screen can
 * say something useful in each case: a guide nobody has scored yet is a content
 * gap, while weighting nothing is a reader who has not answered — those are
 * different states and must not both render as "no results".
 */
export function rankDecisionOptions(guide: DecisionGuide, weights: CriterionWeights): WizardOutcome {
  if (guide.scores.length === 0 || guide.criteria.length === 0) return { kind: 'unscored' };

  const weighted = guide.criteria.filter((criterion) => (weights[criterion.criterionId] ?? 0) > 0);
  if (weighted.length === 0) return { kind: 'no-preference', options: [...guide.options] };

  const best = weighted.reduce((total, criterion) => total + (weights[criterion.criterionId] ?? 0) * MAX_SCORE_VALUE, 0);

  const ranked = guide.options.map<RankedOption>((option) => {
    const contributions = weighted.map((criterion) => ({
      criterion,
      weight: weights[criterion.criterionId] ?? 0,
      value: scoreFor(guide, option.optionId, criterion.criterionId) ?? 0,
    }));
    const score = contributions.reduce((total, entry) => total + entry.weight * entry.value, 0);
    return {
      option,
      score,
      percent: best > 0 ? Math.round((score / best) * 100) : 0,
      reasons: contributions
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.weight * b.value - a.weight * a.value || a.criterion.position - b.criterion.position)
        .slice(0, 3)
        .map((entry) => ({
          criterionId: entry.criterion.criterionId,
          label: entry.criterion.label,
          note: noteFor(guide, option.optionId, entry.criterion.criterionId),
        })),
    };
  });

  // Ties resolve by authored position so the same answers always produce the
  // same order — a recommendation that reshuffles on reopen reads as a bug.
  ranked.sort((a, b) => b.score - a.score || a.option.position - b.option.position);
  return { kind: 'ranked', ranked };
}

/**
 * Whether the top option actually beat the rest.
 *
 * Weighting a single criterion commonly leaves several options tied on full
 * marks, and labelling the first of them "best fit" would be an accident of
 * authoring order presented as a recommendation.
 */
export function hasClearWinner(ranked: RankedOption[]): boolean {
  return ranked.length > 1 && ranked[0].score > ranked[1].score;
}
