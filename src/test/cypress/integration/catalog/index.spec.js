import * as ut from "../../utils";

export const catalog = () => {
  it('Test', () => {
    ut.entryToCms();
    cy.visit('/catalog');
  });
}
