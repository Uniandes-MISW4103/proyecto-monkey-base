import { faker } from "@faker-js/faker";

function jsf32(a, b, c, d) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = (a - ((b << 27) | (b >>> 5))) | 0;
    a = b ^ ((c << 17) | (c >>> 15));
    b = (c + d) | 0;
    c = (d + t) | 0;
    d = (a + t) | 0;
    return (d >>> 0) / 4294967296;
  };
}

describe("monkey", () => {
  cy.on("uncaught:exception", (value) => {
    cy.addActionContext({ title: "Uncaught exception", value });
  });
  cy.on("window:alert", (value) => {
    cy.addActionContext({ title: "Window alert", value });
  });
  cy.on("fail", (value) => {
    cy.addActionContext({ title: "Fail", value });
    return false;
  });

  /** seed to generate pseudo-random events */
  const seed = Cypress.env("seed");
  /** delay between events */
  const delay = Cypress.env("delay");
  /** number of actions to perform during execution */
  const actions = Cypress.env("actions");

  /**
   * Represents the state of the application during testing.
   * @property {Object} viewport - The current viewport settings.
   * @property {Object} pos - The current position coordinates.
   * @property {number} pos.x - The x-coordinate of the position.
   * @property {number} pos.y - The y-coordinate of the position.
   */
  const state = {
    viewport: {},
    pos: { x: 0, y: 0 },
  };

  /** random functions to generate pseudo-random events */
  let random, randInt;

  before(() => {
    // initializer pseudo-random generator functions
    random = jsf32(0xf1ae533d, seed, seed, seed);
    randInt = (min, max) => Math.round(random() * (max - min)) + min;
    faker.seed(seed);

    // set the viewport and max scroll dimensions
    cy.window().updateViewport(state);
    cy.wait(delay);
    cy.addActionContext({
      title: "Before All",
      value: {
        viewport: `${state.viewport.w}x${state.viewport.h}`,
        seed,
        delay,
      },
    });

    cy.visit("");
    cy.wait(delay);
  });

  after(() => {
    cy.addActionContext("videos/monkey.cy.js.mp4");
  });

  /**
   * An object containing various random event generators for testing purposes.
   * Each property is a function that triggers a specific type of event.
   *
   * @property {Function} click - Simulates a random click event on the window.
   * @property {Function} scroll - Simulates a random scroll event.
   * @property {Function} kepress - Simulates a random keyboard event.
   * @property {Function} viewport - Simulates a random viewport change and refreshes the viewport state.
   * @property {Function} navigation - Simulates random navigation events.
   */
  const events = {
    click: (cb) => cy.window().rElement(randInt, state).rClick(randInt, cb),
    scroll: (cb) => cy.rScroll(randInt, state, cb),
    keypress: (cb) => cy.window().rKeypress(randInt, cb),
    viewport: (cb) => cy.rViewport(randInt, cb).updateViewport(state),
    navigation: (cb) => cy.rNavigation(randInt, cb),

    smartClick: (cb) => cy.window().rClickable(randInt).rClick(randInt, cb),
    smartCleanup: (cb) => cy.rCleanup(randInt, cb),
    smartInput: (cb) => cy.rInput(randInt, cb),
  };

  it("test random events", function () {
    const addActionContext = (details) => cy.addActionContext(details);

    // Extracts available actions with remaining counts and calculates total actions left.
    let [names, actionsLeft] = Object.entries(actions).reduce(
      (acc, a) => {
        if (a[1] > 0) return [[...acc[0], a[0]], acc[1] + a[1]];
        return acc;
      },
      [[], 0]
    );
    const availableActions = names.length - 1;

    let index;
    while (actionsLeft > 0) {
      cy.addActionContext({
        title: "Actions left",
        value: names.reduce((acc, a) => {
          acc[a] = actions[a];
          return acc;
        }, {}),
      });

      index = names[randInt(0, availableActions)];
      if (actions[index] > 0) {
        events[index](addActionContext);
        cy.wait(delay);

        actions[index]--;
        actionsLeft--;
      } else {
        // remove the action from the list once it is exhausted
        delete actions[index];
        names = names.filter((n) => n !== index);
      }
    }
  });
});
