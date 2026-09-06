/**
 * The single-instance rule for the paywall, with no React around it.
 *
 * Presence is a value rather than a navigation event, so "open the paywall" is
 * idempotent: a second press while it is open resolves to the paywall that is
 * already there. That is what stops two presses inside one transition from
 * producing two paywalls, and it holds where a press guard did not — React
 * applies queued updaters in order against the accumulating value, so the
 * second press sees the first press's result even before it is committed,
 * whereas a guard's ref did not survive the list remounting mid-transition.
 */
export function nextPaywallSource(current: string | null, requested: string): string | null {
  return current ?? requested;
}
