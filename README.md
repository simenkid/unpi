unpi
========================

## Table of Contents

1. [Intro](#Intro)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs](#APIs): new Unpi(), receive(), and send()   
5. [Events](#Events): 'data' and 'error'  
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
  
<a name="API_MqttShepherd"></a>
### new Unpi([config])
Create a new instance of the `Unpi` class.  
  
**Arguments:**  

1. `config` (_Object_, optional): Configuration of the unpi instance. Accepted properties of `config` are listed in the following table.  

| Property     | Type    | Description                                                 |
|--------------|---------|-------------------------------------------------------------|
| lenBytes     | Number  | 1 or 2 to indicate the width of length field. Default is 2. |
| phy          | Stream  | The transceiver instance, i.e. serial port, spi.            |
    
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
    0xFE, 0x05, 0x00, 0x65, 0x6c,
    0x6c, 0x6f, 0x1e, 0x06, 0x77
]));
```

* Create with a serialport transceiver. The unpi will internally pipe from and to it.

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
    0xFE, 0x05, 0x00, 0x65, 0x6c,
    0x6c, 0x6f, 0x1e, 0x06, 0x77
]));
```

*************************************************
<a name="API_send"></a>
### .send(type, subsys, cmdId, payload)
Send the binaries out through the physical transmitter if there is a `phy` transceiver. The API will return a raw buffer of the packet, you can take it as a generic packet builder.  

**Arguments:**  

1. `type` (_Number_ | _String_): The command type.  
2. `subsys` (_Number_ | _String_): The subsystem.  
3. `cmdId` (_Number_): The command id.  
4. `payload` (_Buffer_): The data payload.  
  
**Returns:**  
  
* (_Buffer_): Raw buffer of the built packet.

**Examples:**  
    
```js
unpi.send('SREQ', 'UTIL', 6, new Buffer([ 1, 2, 3, 4, 5 ]));
```

<a name="Events"></a>
## 5. Events

* [data](#EVT_data)
* [error](#EVT_error)

*************************************************
<a name="EVT_data"></a>
### unpi.on('data', function (data) { ... })
The 'data' event will be fired along with the parsed result. Here is an example of the parsed data to show you the format. The `csum` is the checksum calculated from the received binaries. You can use it to check that if the received packet is corrupted.  

```js
{ 
    sof: 254,
    len: 5,
    type: 0,
    subsys: 0,
    cmd: 101,
    payload: <Buffer 6c 6c 6f 1e 06>,
    fcs: 119,   // this is the checksum originated from the sender
    csum: 23    // this is the checksum calculated from the received binaries
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
    "RES01": 4,
    "RES02": 5,
    "RES03": 6,
    "RES04": 7
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