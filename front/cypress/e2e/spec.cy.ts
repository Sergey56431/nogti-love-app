describe('Авторизация и регистрация', () => {
  it('Пользователь должен зарегистрироваться', () => {
    cy.visit('http://localhost:4200/registration');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[formcontrolname="name"]').type('Сергей');
    cy.get('[formcontrolname="name"]').should('have.class', 'ng-valid');
    cy.get('[formcontrolname="lastName"]').type('Никаноров');
    cy.get('[formcontrolname="lastName"]').should('have.class', 'ng-valid');
    cy.get('[formcontrolname="password"]').type('Tre45hb1');
    cy.get('[formcontrolname="password"]').should('have.class', 'ng-valid');
    cy.get('[formcontrolname="phone"]').type('89533937549');
    cy.get('[formcontrolname="phone"]').should('have.class', 'ng-valid');
    cy.get('#access').check();
    cy.get('#access').should('be.checked');
    cy.contains('Зарегистрироваться').click();
    cy.get('.formBtn').should('not.be.disabled').click();
    /* ==== End Cypress Studio ==== */
  });
});
