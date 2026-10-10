// Run summary: what the monkey did, written to cypress/results/summary.json after the run (also when
// it fails), so two runs with the same seed and parameters can be compared event by event.
export const SUMMARY_FILE = "cypress/results/summary.json";

// Cypress wraps application errors in a generic first line and quotes the original as "  > message".
const messageOf = (error) => {
  const text = String(error?.message ?? error);
  return (/^\s*> (.+)$/m.exec(text)?.[1] ?? text.split("\n")[0]).trim();
};

/**
 * @param {{ seed: number, delay: number, actions: Record<string, number> }} config the parameters of
 *   the run (copy the action budget before the run consumes it)
 */
export function createSummary(config) {
  const startedAt = new Date();
  const events = [];
  const failures = [];
  const dialogs = [];
  let current = null;

  return {
    /** Starts an event: `action` is the event type, `from` the URL before it. */
    start(action, from) {
      current = { event: events.length + 1, action, from, to: null, outcome: "running", detail: null };
      events.push(current);
      return current;
    },

    /** Ends the event with the URL after it; events without effect are "skipped". */
    finish(entry, to) {
      entry.to = to;
      entry.outcome = entry.detail === null || entry.detail.subtype === "not executable" ? "skipped" : "ok";
    },

    /** Records a failure of the application during the current event. */
    failure(oracle, error) {
      failures.push({ event: current?.event ?? 0, oracle, message: messageOf(error), url: current?.from ?? null });
    },

    dialog(message) {
      dialogs.push({ event: current?.event ?? 0, message });
    },

    /** Writes the summary. `test` is Mocha's current test (its state and error). */
    write(test) {
      if (current?.outcome === "running") current.outcome = "failed";
      const byAction = {};
      for (const { action, outcome } of events) {
        byAction[action] ??= { ok: 0, skipped: 0, failed: 0 };
        byAction[action][outcome] += 1;
      }
      const summary = {
        tool: "monkey",
        config: { ...config, baseUrl: Cypress.config("baseUrl") },
        environment: {
          cypress: Cypress.version,
          browser: `${Cypress.browser.name} ${Cypress.browser.version}`,
          platform: `${Cypress.platform} ${Cypress.arch}`,
        },
        status: test.state === "passed" ? "completed" : "failed",
        ...(test.err ? { error: messageOf(test.err) } : {}),
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        results: {
          counts: { events: events.length, failures: failures.length, byAction },
          events,
          failures,
          dialogs,
        },
      };
      cy.writeFile(SUMMARY_FILE, summary, { log: false });
    },
  };
}
