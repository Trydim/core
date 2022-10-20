/**
 * @var describe function
 * @var it function
 * @var Cypress - global object of cypress
 * @var cy - global object of cypress
 */

import * as ut from '../utils';
import {admindb} from "./adminDb/index.spec";
import {calendar} from "./calendar/index.spec";
import {catalog} from "./catalog/index.spec";

const testPage = [
  'adminDb',
  'calendar',
  'catalog',
];

describe('My Site Test',
  {
    //viewportWidth: viewportWidth,
    //viewportHeight: viewportHeight,
  },
  () => {
    beforeEach(() => {
      ut.entryToCms();
    });

    if (testPage.includes('adminDb')) admindb();

    if (testPage.includes('calendar')) calendar();

    if (testPage.includes('catalog')) catalog();
  }
);
