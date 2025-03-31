// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// Custom command for Supabase auth login
Cypress.Commands.add("login", (email, password) => {
  cy.log(`Logging in as ${email}`);
  cy.visit("/auth");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.contains("button", "Sign In").click();

  // Wait for redirection to happen
  cy.url().should("not.include", "/auth");
});

// Custom command to test responsive layouts
Cypress.Commands.add("setViewport", (size) => {
  if (Cypress._.isArray(size)) {
    cy.viewport(size[0], size[1]);
  } else {
    cy.viewport(size);
  }
});

// Check for server-side validation error
Cypress.Commands.add("checkValidationError", (errorMessage) => {
  cy.get('[role="alert"]').should("contain", errorMessage);
});

// Validate form field error
Cypress.Commands.add("formFieldHasError", (fieldName, errorMessage) => {
  cy.get(`[name="${fieldName}"]`)
    .closest("div")
    .find('[role="alert"]')
    .should("contain", errorMessage);
});
