unpi
========================

## Table of Contents

1. [Intro](#Intro)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs](#APIs)  

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
var npi = new Unpi({ lenBytes: 1 });

npi.on('data', function (data) {
    console.log(data);
});

npi.recevie();

```
  
<a name="APIs"></a>
## 4. APIs

* [new Unpi()](#API_Unpi)
* [receive()](#API_receive)
* [send()](#API_send)

<a name="Events"></a>
## 5. Events

* [data](#API_data)
* [error](#API_error)

<br />  