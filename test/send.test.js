var expect = require('chai').expect,
    Unpi = require('../index.js');  // unpi module

describe('Arguments Testing', function() {
    var unpi = new Unpi({ lenBytes: 1 });
    var sapiStartReqBuf = new Buffer([ 0xfe, 0x00, 0x26, 0x00, 0x26 ]),
        sapiStartRspBuf = new Buffer([ 0xfe, 0x00, 0x66, 0x00, 0x66 ]);

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
                expect(function () { return unpi.send('AREQ', 'SYS', 6, function () {}); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, 0); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, '0'); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, null); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, NaN); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, []); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, {}); }).to.throw(TypeError);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, true); }).to.throw(TypeError);
            });
        });

        describe('#Invalid argument - undefined', function() {
            it('should throw if bad cmdType', function () {
                expect(function () { return unpi.send('AREQx', 'SYS', 0, new Buffer([ 0 ])); }).to.throw(Error);
                expect(function () { return unpi.send(100, 'SYS', 0, new Buffer([ 0 ])); }).to.throw(Error);
            });

            it('should throw if bad subsys', function () {
                expect(function () { return unpi.send('AREQ', 'SYSX', 0, new Buffer([ 0 ])); }).to.throw(Error);
                expect(function () { return unpi.send('AREQ', 100, 0, new Buffer([ 0 ])); }).to.throw(Error);
            });
        });

        describe('#Valid argument', function() {
            it('should not throw if everthing is ok', function () {
                expect(function () { return unpi.send('AREQ', 'SYS', 0, new Buffer([ 0 ])); }).not.to.throw(Error);
                expect(function () { return unpi.send('SRSP', 'SYS', 0, new Buffer([ 0 ])); }).not.to.throw(Error);
                expect(function () { return unpi.send('AREQ', 'UTIL', 0, new Buffer([ 0, 1, 2, 3, 4 ])); }).not.to.throw(Error);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, new Buffer([ 1, 2, 3, 0 ])); }).not.to.throw(Error);
                expect(function () { return unpi.send('AREQ', 'NWK', 0, new Buffer([ 0 ])); }).not.to.throw(Error);
                expect(function () { return unpi.send('AREQ', 'SYS', 0, new Buffer([ 10, 20, 30 ])); }).not.to.throw(Error);
            });
        });

    });

    describe('#.receive', function() {
        describe('#.Argument type is not a buffer', function() {
            it('should throw if buf is not a buffer', function () {
                expect(function () { return unpi.receive([]); }).to.throw(TypeError);
                expect(function () { return unpi.receive({}); }).to.throw(TypeError);
                expect(function () { return unpi.receive('xxx'); }).to.throw(TypeError);
                expect(function () { return unpi.receive(true); }).to.throw(TypeError);
                expect(function () { return unpi.receive(new Date()); }).to.throw(TypeError);
                expect(function () { return unpi.receive(NaN); }).to.throw(TypeError);
                expect(function () { return unpi.receive(function () {}); }).to.throw(TypeError);
            });

            it('should not throw if buf is undefined', function () {
                expect(function () { return unpi.receive(); }).not.to.throw(Error);
                expect(function () { return unpi.receive(undefined); }).not.to.throw(Error);
            });

            it('should not throw if buf is null', function () {
                expect(function () { return unpi.receive(null); }).not.to.throw(Error);
            });
        });
    });
});

describe('Functional Testing', function() {
    var unpi = new Unpi({ lenBytes: 1 });
    var sapiStartReqBuf = new Buffer([ 0xfe, 0x00, 0x26, 0x00, 0x26 ]),
        sapiStartRspBuf = new Buffer([ 0xfe, 0x00, 0x66, 0x00, 0x66 ]);

    describe('#.send', function() {
        describe('#.compiled buffer', function() {
            it('should equal to a buffer as expected sapiStartReqBuf', function () {
                expect(unpi.send('SREQ', 'SAPI', 0, new Buffer(0))).to.deep.equal(sapiStartReqBuf);
            });

            it('should equal to a buffer as expected sapiStartReqBuf + payload', function () {
                expect(unpi.send('SREQ', 'SAPI', 0, new Buffer([ 0, 1, 2 ]))).to.deep.equal(new Buffer([ 0xfe, 0x03, 0x26, 0x00, 0x00, 0x01, 0x02, 0x26 ]));
            });

            it('should equal to a buffer as expected sapiStartRspBuf', function () {
                expect(unpi.send('SRSP', 'SAPI', 0, new Buffer(0))).to.deep.equal(sapiStartRspBuf);
            });
        });
    });

    describe('#.receive', function() {
        describe('#.parse buffer', function() {
            it('should equal to a parsed result as expected sapiStartReqBuf', function (done) {
                unpi.once('data', function (data) {
                    expect(data).to.deep.equal({
                      cmd: 0, csum: 38, fcs: 38, len: 0,
                      payload: new Buffer(0),
                      sof: 254, subsys: 6, type: 1
                    });
                });
                done();
                unpi.receive(sapiStartReqBuf);
            });

            it('should equal to a parsed result as expected sapiStartRspBuf', function (done) {
                unpi.once('data', function (data) {
                    expect(data).to.deep.equal({
                      cmd: 0, csum: 102, fcs: 102, len: 0,
                      payload: new Buffer(0),
                      sof: 254, subsys: 6, type: 3
                    });
                });
                done();
                unpi.receive(sapiStartRspBuf);
            });

            it('should equal to a parsed result as expected sapiStartReqBuf + payload', function (done) {
                unpi.once('data', function (data) {
                    expect(data).to.deep.equal({
                      cmd: 0, csum: 38, fcs: 38, len: 3,
                      payload: new Buffer([ 0x00, 0x01, 0x02 ]),
                      sof: 254, subsys: 6, type: 1
                    });
                });
                done();
                unpi.receive(new Buffer([ 0xfe, 0x03, 0x26, 0x00, 0x00, 0x01, 0x02, 0x26 ]));
            });

            it('should equal to a parsed result as expected sapiStartReqBuf + payload', function (done) {
                unpi.once('data', function (data) {
                    expect(data).to.deep.equal({
                      cmd: 0, csum: 102, fcs: 102, len: 3,
                      payload: new Buffer([ 0x00, 0x01, 0x02 ]),
                      sof: 254, subsys: 6, type: 3
                    });
                });
                done();
                unpi.receive(new Buffer([ 0xfe, 0x03, 0x66, 0x00, 0x00, 0x01, 0x02, 0x66 ]));
            });
        });
    });
});

