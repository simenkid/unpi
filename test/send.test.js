var expect = require('chai').expect,
    Unpi = require('../index.js');  // unpi module

describe('Send Testing', function() {
    var unpi = new Unpi();

    describe('#.send', function() {

        it('should be a function', function () {
            expect(unpi.send).to.be.a('function');
        });

        describe('#Argument Type', function() {
            it('should throw if type is not a string or a number', function () {
                expect(function () { return unpi.send(undefined, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send(null, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send([], 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send({}, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send(NaN, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send(true, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send(function () {}, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(TypeError);
            });

            it('should throw if type is not a string or a number', function () {
                expect(function () { return unpi.send('AREQ', undefined, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', null, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', [], 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', {}, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', NaN, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', true, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', function () {}, 0, new Buffer([ 0 ])); }).to.throw(TypeError);
            });

            it('should throw if cmdId is not a number', function () {
                expect(function () { return unpi.send('AREQ', 'SYS', '0', new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', undefined, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', null, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', NaN, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', [], new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', {}, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', true, new Buffer([ 0 ])); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', function () {}, new Buffer([ 0 ])); }).to.throw(TypeError);
            });

            it('should throw if payload is given but not a buffer', function () {
                expect(function () { return unpi.send('AREQ', 'SYS', 6, function () {}); }).not.to.throw(Error);

                expect(function () { return unpi.send('AREQ', 'SYS', 0, 0); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, '0'); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, null); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, NaN); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, []); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, {}); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, true); }).to.throw(TypeError);
            });

            describe('#Invalid cmdType', function() {
                expect(function () { return unpi.send('AREQx', 'SYS', 0, new Buffer([ 0 ])); }).to.throw(Error);

            });

        });

// unpi.send('AREQ', 'SYS', 0, new Buffer([ 0 ]));
// unpi.send('AREQ', 1, 0, new Buffer([ 0 ]));
// unpi.send(2, 'SYS', 0, new Buffer([ 0 ]));
// unpi.send(2, 1, 0, new Buffer([ 0 ]));

    });

// (type, subsys, cmdId, payload, callback)
});
