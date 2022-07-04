import * as ut from "../../utils";

export const admindb = () => {
  it('Test', () => {
    debugger
    ut.entryToCms();
    cy.visit('/admindb/?tableName=/z_prop/codes');
    //cy.wait(500);
  });
}
