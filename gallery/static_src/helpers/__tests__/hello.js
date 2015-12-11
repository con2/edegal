import assert from 'assert';
import Browser from 'zombie';

describe('Front page', function() {
  const browser = new Browser();

  before(() => browser.visit('/'));

  it('should return HTTP 200', function() {
    browser.assert.success();
  });

  it('should contain the gallery title', function() {
    browser.assert.text('#header', 'My Swell Picture Gallery');
  });
});