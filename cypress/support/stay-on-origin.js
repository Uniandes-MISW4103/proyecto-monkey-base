/**
 * Keeps the monkey on the application under test.
 *
 * Cypress fails the run when the page navigates to another origin (even a subdomain) without
 * cy.origin(), and random clicks, double clicks or an Enter on a focused link easily follow links to other
 * sites. This guard cancels link clicks and form submissions that would leave the current origin;
 * everything else (including same-origin navigation) behaves normally.
 */
const leavesOrigin = (win, target) => {
  const url = new URL(target, win.location.href);
  return ["http:", "https:"].includes(url.protocol) && url.origin !== win.location.origin;
};

Cypress.on("window:before:load", (win) => {
  win.addEventListener(
    "click",
    (event) => {
      const link = event.target?.closest?.("a[href]");
      if (link && leavesOrigin(win, link.href)) event.preventDefault();
    },
    true
  );
  win.addEventListener(
    "submit",
    (event) => {
      const action = event.target?.getAttribute?.("action");
      if (action && leavesOrigin(win, action)) event.preventDefault();
    },
    true
  );
});
