'use strict';

var util = require('util'),
    EventEmitter = require('events'),
    Concentrate = require('concentrate'),
    DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();

var cmdType = {
    "POLL": 0,
    "SREQ": 1,
    "AREQ": 2,
    "SRSP": 3,
    "RES01": 4,
    "RES02": 5,
    "RES03": 6,
    "RES04": 7
};

var subSys = {
    "RPC_SYS_RES0": 0,
    "RPC_SYS_SYS": 1,
    "RPC_SYS_MAC": 2,
    "RPC_SYS_NWK": 3,
    "RPC_SYS_AF": 4,
    "RPC_SYS_ZDO": 5,
    "RPC_SYS_SAPI": 6,
    "RPC_SYS_UTIL": 7,
    "RPC_SYS_DBG": 8,
    "RPC_SYS_APP": 9,
    "RPC_SYS_RCAF": 10,
    "RPC_SYS_RCN": 11,
    "RPC_SYS_RCN_CLIENT": 12,
    "RPC_SYS_BOOT": 13,
    "RPC_SYS_ZIPTEST": 14,
    "RPC_SYS_DEBUG": 15,
    "RPC_SYS_PERIPHERALS": 16,
    "RPC_SYS_NFC": 17,
    "RPC_SYS_PB_NWK_MGR": 18,
    "RPC_SYS_PB_GW": 19,
    "RPC_SYS_PB_OTA_MGR": 20,
    "RPC_SYS_BLE_SPNP": 21,
    "RPC_SYS_BLE_HCI": 22,
    "RPC_SYS_RESV01": 23,
    "RPC_SYS_RESV02": 24,
    "RPC_SYS_RESV03": 25,
    "RPC_SYS_RESV04": 26,
    "RPC_SYS_RESV05": 27,
    "RPC_SYS_RESV06": 28,
    "RPC_SYS_RESV07": 29,
    "RPC_SYS_RESV08": 30,
    "RPC_SYS_SRV_CTR": 31
};

/*************************************************************************************************/
/*** TI Unified NPI Packet Format                                                              ***/
/***     SOF(1) + Length(2/1) + Type/Sub(1) + Cmd(1) + Payload(N) + FCS(1)                     ***/
/*************************************************************************************************/
function Unpi(config) {
    var pRules,
        self = this;

    EventEmitter.call(this);

    this.config = config || {};
    this.config.lenBytes = this.config.lenBytes || 2;

    pRules = [
        ru._unpiHeader('sof'),
        ru._unpiLength('len', this.config.lenBytes),
        ru._unpiCmd0('type', 'subsys'),
        ru.uint8('cmd'),
        ru._unpiPayload('payload'),
        ru.uint8('fcs')
    ];

    this.concentrate = Concentrate();
    this.parser = DChunks().join(pRules).compile();

    this.parser.on('parsed', function (result) {
        var cmd0 = result.type | result.subsys,
            preBufLen = self.config.lenBytes + 2,
            preBuf = new Buffer(preBufLen);

        if (self.config.lenBytes === 1) {
            preBuf.writeUInt8(result.len, 0);
            preBuf.writeUInt8(cmd0, 1);
            preBuf.writeUInt8(result.cmd, 2);
        } else {
            preBuf.writeUInt16LE(result.len, 0);
            preBuf.writeUInt8(cmd0, 2);
            preBuf.writeUInt8(result.cmd, 3);
        }
        result.csum = checksum(preBuf, result.payload);

        self.emit('data', result);
        if (result.csum !== result.fcs)
            self.emit('error', new Error('Invalid checksum.'), result);
    });

    if (this.config.phy) {
        this.config.phy.pipe(this.parser);
        this.concentrate.pipe(this.config.phy);
    }
}

util.inherits(Unpi, EventEmitter);

Unpi.DChunks = DChunks;
Unpi.Concentrate = Concentrate;

Unpi.prototype.send = function (type, subsys, cmdId, payload) {
    if (typeof type === 'string')
        type = cmdType[type];

    if (typeof subsys === 'string') {
        if (!subsys.startsWith('RPC_SYS_'))
            subsys = subsys + 'RPC_SYS_';
        subsys = subSys[subsys];
    }

    if (type === undefined || subsys === undefined)
        throw new TypeError('Invalid command type or subsystem.');

    if (typeof cmdId !== 'number')
        throw new TypeError('Command id should be a number.');

    if (payload && !Buffer.isBuffer(payload))
        throw new TypeError('Payload should be a buffer.');

    type = type & 0xE0;
    subsys = type & 0x1F;
    payload = payload || new Buffer(0);

    var packet,
        sof = 0xFE,
        len = payload.length,
        cmd0 = type | subsys,
        cmd1 = cmdId,
        lenBuf,
        fcs;

    lenBuf = new Buffer(this.config.lenBytes);

    if (this.config.lenBytes === 1)
        lenBuf.writeUInt8(payload.length, 0);
    else if (this.config.lenBytes === 2)
        lenBuf.writeUInt16LE(payload.length, 0);

    fcs = checksum(lenBuf, payload);
    packet = Concentrate().uint8(sof).buffer(lenBuf).uint8(cmd0).uint8(cmd1).buffer(payload).uint8(fcs).result();
    
    if (this.config.phy)
        this.concentrate.buffer(packet).flush();

    return packet;
};

Unpi.prototype.receive = function (buf) {
    this.parser.write(buf);
    return this;
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
    else
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

function checksum(buf1, buf2) {
    var fcs = 0,
        buf1_len = buf1.length,
        buf2_len = buf2.length,
        i;

    for (i = 0; i < buf1_len; i += 1) {
        fcs ^= buf1[i];
    }

    if (buf2 !== undefined) {
        for (i = 0; i < buf2_len; i += 1) {
            fcs ^= buf2[i];
        }
    }

    return fcs;
}

module.exports = Unpi;
