describe("Авторизация", () => {
  it("Пользователь должен авторизоваться", () => {
    cy.visit("http://localhost:4200/login");
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[formcontrolname="phoneNumber"]').type("89533937549");
    cy.get('[formcontrolname="phoneNumber"]').should("have.class", "ng-valid");
    cy.get('[formcontrolname="password"]').type("Tre45hbq1");
    cy.get('[formcontrolname="password"]').should("have.class", "ng-valid");
    cy.get(".formBtn").should("not.be.disabled");
    cy.contains("Войти")
      .click()
      .intercept("POST", "http://localhost:3000/api/**", (req) => {
        req.url = req.url.replace("localhost", "127.0.0.1");
      });
    cy.intercept("GET", "http://localhost:3000/api/**", (req) => {
      req.url = req.url.replace("localhost", "127.0.0.1");
    });
    /* ==== End Cypress Studio ==== */
  });
});
