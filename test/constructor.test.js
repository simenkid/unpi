var expect = require('chai').expect,
    Unpi = require('../index.js');  // unpi module

describe('Constructor', function() {
    describe('#Unpi', function() {
        it('should be a function', function () {
            expect(Unpi).to.be.a('function');
        });

        it('should not throw if config is undefined', function () {
            expect(function () { return new Unpi(); }).not.to.throw(Error);
        });

        it('should not throw if config is an object', function () {
            expect(function () { return new Unpi({}); }).not.to.throw(Error);
        });

        it('should throw if config is not undefined and not an object', function () {
            expect(function () { return new Unpi([]); }).to.throw(TypeError);
        });
    });
});
