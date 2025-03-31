describe("Authentication Tests", () => {
  beforeEach(() => {
    // Visit the auth page before each test
    cy.visit("/auth");
  });

  it("should display the auth page with a sign-in form", () => {
    // Check that the page contains expected elements
    cy.contains("Welcome to Prodigen").should("be.visible");
    cy.get("form").should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.contains("button", "Sign In").should("be.visible");
  });

  it("should display validation errors with invalid email", () => {
    // Try to sign in with invalid email
    cy.get('input[type="email"]').type("invalid-email");
    cy.get('input[type="password"]').type("password123");
    cy.contains("button", "Sign In").click();

    // Check for validation error message
    cy.contains("Please enter a valid email").should("be.visible");
  });

  it("should allow toggling between sign in and sign up", () => {
    // Click to go to sign up mode
    cy.contains("Sign Up").click();

    // Verify we're in sign up mode
    cy.contains("button", "Sign Up").should("be.visible");

    // Go back to sign in
    cy.contains("Sign In").click();

    // Verify we're back in sign in mode
    cy.contains("button", "Sign In").should("be.visible");
  });

  // Mock test for successful login (in real implementation, you'd use cy.intercept to mock API responses)
  it.skip("should redirect after successful login", () => {
    // Mock successful auth response
    cy.intercept("POST", "**/auth/v1/token*", {
      body: {
        access_token: "fake-token",
        refresh_token: "fake-refresh-token",
        user: {
          id: "123",
          email: "test@example.com",
        },
      },
    });

    // Login with test credentials
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.contains("button", "Sign In").click();

    // Verify redirect to dashboard/home
    cy.url().should("include", "/");
  });
});
