'use strict';

var expect = require('chai').expect;
var cashbotBindings = require('../index');

describe('#cashbotBindings', function() {

  it('should return true', function() {
    var result = cashbotBindings();
    expect(result).to.equal(true);
  });

});
