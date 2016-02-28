unpi
========================

## Table of Contents

1. [Intro](#Intro)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs](#APIs)  

    * new Unpi()  
    * receive()  
    * send()  

5. [Events](#Events)  

    * 'data'  
    * 'error'  

<a name="Intro"></a>
## 1. Intro

The *unpi* is the packet builder and parser for Texas Instruments [_Unified Network Processor Interface (UNPI)_](http://processors.wiki.ti.com/index.php/Unified_Network_Processor_Interface) within RF4CE, BluetoothSmart, and ZigBee wireless SoCs. As stated in TI's wiki page:  

> TI's Unified Network Processor Interface (NPI) is used for establishing a serial data link between a TI SoC and external MCUs or PCs. This is mainly used by TI's network processor solutions.  

The UNPI packet consists of _sof_, _length_, _cmd0_, _cmd1_, _payload_, and _fcs_ fields. The description of each field can be found in [_Unified Network Processor Interface_](http://processors.wiki.ti.com/index.php/Unified_Network_Processor_Interface).  

It is noted that **UNPI** defines the _length_ field with 2 bytes wide, but some SoCs use [NPI](http://processors.wiki.ti.com/index.php/NPI) in their real transmission, the `length` field just occupies a single byte.  

<a name="Installation"></a>
## 2. Installation

> $ npm install unpi --save
  
<a name="Usage"></a>
## 3. Usage

To use unpi, just new an instance from the Unpi class. The Unpi constructor accepts an optional parameter `config` object. If `config` is not given, a default value of `{ lenBytes: 2 }` will be used internally. The property `lenBytes` indicates the width of the _length_ field.  
Since the transmission should be accomplished upon an UART or a SPI physical interface, you can pass the physical transceiver to your unpi by attach it to `config.phy` property, i.e., `{ phy: sp }` where `sp` is a serialport instance. The `phy` instance should be also an instance of node.js _Stream_ class.
Let me show you some examples:

```js
// In this example, we don't have a physical transceiver, but it's ok
var Unpi = require('unpi');
var unpi = new Unpi({ lenBytes: 1 });

unpi.on('data', function (data) {
    console.log(data);
});

unpi.recevie();

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
Feeds the unpi with raw data. You can take the unpi as a generic parser if you don't have any physical transceiver.  

**Arguments:**  

1. `buf` (_Buffer_): A raw packet of UNPI protocol.  

  
**Returns:**  
  
* (_Object_): unpi instance itself

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
Send the packet out through the physical transmitter if there is a `phy` transceiver. The API will return a raw buffer of the packet, you can take it as a generic packet builder.  

**Arguments:**  

1. `type` (_Number_ | _ String_): The command type.  
2. `subsys` (_Number_ | _ String_): The subsystem.  
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