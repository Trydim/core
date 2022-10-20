import * as ut from "../../utils";

export const calendar = () => {
  it('Test', () => {
    ut.entryToCms();
    cy.visit('/calendar');
  });
}
