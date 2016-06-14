unpi
========================
Unified Network Processor Interface for Texas Instruments Wireless SoCs.  

[![NPM](https://nodei.co/npm/unpi.png?downloads=true)](https://nodei.co/npm/unpi/)  

[![Travis branch](https://img.shields.io/travis/simenkid/unpi/master.svg?maxAge=2592000)](https://travis-ci.org/simenkid/unpi)
[![npm](https://img.shields.io/npm/v/unpi.svg?maxAge=2592000)](https://www.npmjs.com/package/unpi)
[![npm](https://img.shields.io/npm/l/unpi.svg?maxAge=2592000)](https://www.npmjs.com/package/unpi)

## Table of Contents

1. [Intro](#Intro)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs](#APIs): new Unpi(), receive(), and send()   
5. [Events](#Events): 'data', 'flushed' and 'error'  
6. [Appendix](#Appendix): Command types and Subsystems  

<a name="Intro"></a>
## 1. Intro

The *unpi* is the packet builder and parser for Texas Instruments [_Unified Network Processor Interface (UNPI)_](http://processors.wiki.ti.com/index.php/Unified_Network_Processor_Interface) used in RF4CE, BluetoothSmart, and ZigBee wireless SoCs. As stated in TI's wiki page:  

> TI's Unified Network Processor Interface (NPI) is used for establishing a serial data link between a TI SoC and external MCUs or PCs. This is mainly used by TI's network processor solutions.  

The UNPI packet consists of _sof_, _length_, _cmd0_, _cmd1_, _payload_, and _fcs_ fields. The description of each field can be found in [_Unified Network Processor Interface_](http://processors.wiki.ti.com/index.php/Unified_Network_Processor_Interface).  

It is noted that **UNPI** defines the _length_ field with 2 bytes wide, but some SoCs use [NPI](http://processors.wiki.ti.com/index.php/NPI) in their real transmission (physical layer), the _length_ field just occupies a single byte. (The _length_ field will be normalized to 2 bytes in the transportation layer of NPI stack.)  

<a name="Installation"></a>
## 2. Installation

> $ npm install unpi --save
  
<a name="Usage"></a>
## 3. Usage

To use unpi, just new an instance from the Unpi class. The Unpi constructor accepts an optional parameter `config` object. If `config` is not given, a default value of `{ lenBytes: 2 }` will be used internally. The property `lenBytes` indicates the width of the _length_ field.  
  
Since the transmission should be accomplished upon an UART or a SPI physical interface, you can pass the physical transceiver to your unpi by attach it to `config.phy` property, i.e., `{ phy: sp }` where `sp` is a serialport instance. The `phy` instance should be a _Stream_.  

Here is an quick example and the parsed data format can be found in the ['data' event](#EVT_data) section.

```js
var Unpi = require('unpi'),
    SerialPort = require("serialport").SerialPort;

var sp = new SerialPort("/dev/ttyUSB0", {
        baudrate: 57600
    }),
    unpi = new Unpi({
        lenBytes: 1
        phy: sp
    });

unpi.on('data', function (data) {
    console.log(data);  // The parsed data receiving from the serial port
});
```
  
<a name="APIs"></a>
## 4. APIs

* [new Unpi()](#API_Unpi)  
* [receive()](#API_receive)  
* [send()](#API_send)  

*************************************************

## Unpi Class
Exposed by `require('unpi')`  
  
Unpi class also exports its dependencies [DChunks](https://www.npmjs.com/package/dissolve-chunks) and [Concentrate](https://www.npmjs.com/package/concentrate) for your convenient.  

**Examples:**  
```js
var Unpi = require('unpi');
var DChunks = Unpi.DChunks;
var Concentrate = Unpi.Concentrate;

var myBuffer = Concentrate().uint8(1).uint8(20).uint16(100).result();
```

<a name="API_Unpi"></a>
### new Unpi([config])
Create a new instance of the `Unpi` class.  
  
**Arguments:**  

1. `config` (_Object_, optional): Configuration of the unpi instance. Accepted properties of `config` are listed in the following table.  

| Property     | Type    | Description                                                                    |
|--------------|---------|--------------------------------------------------------------------------------|
| lenBytes     | Number  | 1 or 2 to indicate the width of length field. Default is 2.                    |
| phy          | Stream  | The transceiver instance, i.e. serial port, spi. It should be a duplex stream. |
    
**Returns:**  
  
* (_Object_): unpi, an instance of Unpi

**Examples:**  

* Create an unpi instance without physical transceiver

```js
var Unpi = require('unpi');
var unpi = new Unpi({
        lenBytes: 1
    });

unpi.on('data', function (data) {
    console.log(data);  // The parsed data
});

// You can use .receive(buffer) to test it
unpi.receive(new Buffer([
    0xFE, 0x01, 0x41, 0x00, 0x00, 0x40
]));
```

* Create an unpi instance with a serialport transceiver. The unpi will internally pipe from and to it.

```js
var SerialPort = require("serialport").SerialPort
var sp = new SerialPort("/dev/ttyUSB0", {
  baudrate: 57600
});

var Unpi = require('unpi');
var unpi = new Unpi({
        lenBytes: 1
        phy: sp
    });

unpi.on('data', function (data) {
    console.log(data);  // The parsed data receiving from the serial port
});
```

*************************************************
<a name="API_receive"></a>
### .receive(buf)
Feeds the unpi with some binary raw data. You can take the unpi as a generic parser if you don't have any physical transceiver.  

**Arguments:**  

1. `buf` (_Buffer_): An UNPI raw packet.  
  
**Returns:**  
  
* (_Object_): this (unpi instance itself)

**Examples:**  
    
```js
unpi.receive(new Buffer([
    0xFE, 0x01, 0x41, 0x00, 0x00, 0x40
]));
```

*************************************************
<a name="API_send"></a>
### .send(type, subsys, cmdId, payload)
Send the binaries out through the physical transmitter if there is a `phy` transceiver. The API will return a raw buffer of the packet, you can take it as a generic packet builder. If the `phy` exists, unpi will fire an `'flushed'` event after each command packet flushed to the `phy` transceiver.  

**Arguments:**  

1. `type` (_Number_ | _String_): The command type. For exmaple, set `type` to `1` or `'SREQ'` to send a synchronous command.  
2. `subsys` (_Number_ | _String_): The subsystem. For example, send a command of subsystem 'RPC_SYS_UTIL', you can set `subsys` to `7`, `'RPC_SYS_UTIL'`, or simply `'UTIL'` (the prefix `'RPC_SYS_'` can be ignored).  
3. `cmdId` (_Number_): The command id which is a number according to which subsystem you are using.  
4. `payload` (_Buffer_): The data payload.  
  
**Returns:**  
  
* (_Buffer_): Buffer of the built command packet.  

**Examples:**  
    
```js
// The following calls do the same thing
unpi.send('AREQ', 'SYS', 0, new Buffer([ 0 ]));
unpi.send('AREQ', 1, 0, new Buffer([ 0 ]));
unpi.send(2, 'SYS', 0, new Buffer([ 0 ]));
unpi.send(2, 1, 0, new Buffer([ 0 ]));
```

<a name="Events"></a>
## 5. Events

* [data](#EVT_data)
* [flushed](#EVT_flushed)
* [error](#EVT_error)

*************************************************
<a name="EVT_data"></a>
### unpi.on('data', function (data) { ... })
The 'data' event will be fired along with the parsed result. Here is an example of the parsed data to show you the format. The `csum` is the checksum calculated from the received binaries. You can use it to check that if the received packet is corrupted.  

```js
{ 
    sof: 254,
    len: 6,
    type: 2,
    subsys: 1,
    cmd: 128,
    payload: <Buffer 02 02 00 02 06 02>,
    fcs: 193,   // this is the checksum originated from the sender
    csum: 193   // this is the checksum calculated from the received binaries
}
```

**Examples:**  
    
```js
unpi.on('data', function (data) {
    console.log(data);  // The parsed data
});
```

<br />  

*************************************************
<a name="EVT_flushed"></a>
### unpi.on('flushed', function (cmdInfo) { ... })
After each command packet is sending out to `phy` transceiver, a 'flushed' event will be fired along with the data of command information. The `cmdInfo` object has three properties of `type`, `subsys`, and `cmdId` to indicate which command was send.  

**Examples:**  
    
```js
unpi.on('flushed', function (cmdInfo) {
    console.log(cmdInfo);  // { type: 1 , subsys: 2, cmdId: 10 }
});
```

<br />  

*************************************************
<a name="EVT_error"></a>
### unpi.on('error', function (err) { ... })
Fired when any error occurs. Each time unpi finds that there is a corrupted packet with a bad checksum, both an `data` event and an `error` event will be fired along with the parsed result.  

**Examples:**  
    
```js
unpi.on('error', function (err, parsedData) {
    console.log(err);   // for example: [Error: Invalid checksum.]
});
```
<br />  

<a name="Appendix"></a>
## 6. Appendix

* Command Type

```js
{
    "POLL": 0,
    "SREQ": 1,
    "AREQ": 2,
    "SRSP": 3,
    "RES0": 4,
    "RES1": 5,
    "RES2": 6,
    "RES3": 7
}
```
* Subsystem  

```js
{
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
}

```
