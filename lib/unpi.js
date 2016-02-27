/*jslint node: true */
'use strict';

/*************************************************************************************************/
/*** TI Unified NPI Packet Format                                                              ***/
/***     SOF(1) + Length(2/1) + Type/Sub(1) + Cmd(1) + Payload(N) + FCS(1)                     ***/
/*************************************************************************************************/
var Concentrate = require('concentrate'),
    DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();
// Unified NPI packet format
// SOF(1) + Length(2/1) + Type/Sub(1) + Cmd(1) + Payload(N) + FCS(1)
    // This parses the incoming packet from serial port into into an object {sof, length, cmd0, cmd1, data, fcs}

function Unpi(phy, config) {
    this.phy = null;
    if (phy) {
        this.phy = phy;
        this.phy.pipe(this.parser);
        this.concentrate.pipe(this.phy);
    }

    this.parser = null;
    // this.emit('data')
    // this.emit('error')

    this.parser.on('parsed', function (result) {
        this.emit('data', result);
    });
}

Unpi.prototype.send = function (type, subsys, cmd, payload) {
    type = type & 0xE0;
    subsys = type & 0x1F;

    var packet,
        dataBuf = payload || new Buffer(0),
        sof = 0xFE,
        len = dataBuf.length,
        cmd0 = type | subsys,
        cmd1 = cmd,
        fcs = calFCS(dataBuf);  // XOR LEN0 XOR LEN1

    packet = Concentrate().uint8(sof).buffer(dataBuf).uint8(fcs).result();

    this.concentrate.buffer(packet).flush();     // emit 'readable' event => pipe to zself.sp
};

/*************************************************************************************************/
/*** Parsing Clauses                                                                           ***/
/*************************************************************************************************/
ru.clause('_unpiHeader', function (name) {
    this.loop(function (end) {
        this.uint8(name).tap(function () {
            if (this.vars[name] !== 0xFE)
                delete this.vars[name];
            else
                end();
        });
    });
});

ru.clause('_unpiLength', function (name, bytes) {
    if (bytes === 1)
        this.uint8(name);
    else if (bytes === 2)
        this.uint16(name);

});

ru.clause('_unpiCmd0', function (type, subsys) {
    this.uint8('cmd0').tap(function () {
        this.vars[type] = this.vars.cmd0 & 0xE0;
        this.vars[subsys] = this.vars.cmd0 & 0x1F;
        delete this.vars.cmd0;
    });
});

ru.clause('_unpiPayload', function (name) {
    this.tap(function () {
        this.buffer(name, this.vars.len);
    });
});

/*************************************************************************************************/
/*** Compile Rules                                                                             ***/
/*************************************************************************************************/
var chunkRules = [
    ru._unpiHeader('sof'),
    ru._unpiLength('len', 2),
    ru._unpiCmd0('type', 'subsys'),
    ru.uint8('cmd'),
    ru._unpiPayload('payload'),
    ru.uint8('fcs')
];

var parser = DChunks().join(chunkRules).compile();

function calFCS(buffer) {
    var fcs = 0,
        buf_len = buffer.length,
        i;

    for (i = 0; i < buf_len; i += 1) {
        fcs ^= buffer[i];
    }
    return fcs;
}


parser.on('parsed', function (result) {
    console.log(result);
});

var data1_buf = new Buffer([ 0xFE, 0x05, 0x00, 0x65, 0x6c, 0x6c, 0x6f, 0x1e, 
                             0x06, 0x77, 0xFE, 0xFE, 0x03, 0x00, 0x21,
                             0x05, 0x01, 0xFE, 0x03, 0x04, 0x05,
                             0x05, 0x03, 0x49, 0x74, 0xFE, 
                                   0x06, 0x6d, 0x61, 0x6b, 0x65, 0x73, 0x20,
                                   0x03, 0x6d, 0x79, 0x20,
                                   0x05, 0x6c, 0x69, 0x66, 0x65, 0x20,
                                   0x07, 0x65, 0x61, 0x73, 0x69, 0x65, 0x72, 0x2e]);


parser.write(data1_buf);
