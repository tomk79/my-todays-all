var assert = require('assert');
var path = require('path');
var fs = require('fs');

describe('test of test', function() {

	it('test 1', function(done) {
		this.timeout(10000);
		assert.equal(1, 1);
		done();
	});

});
