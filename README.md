unpi
========================
Unified Network Processor Interface for Texas Instruments Wireless SoCs.  

[![NPM](https://nodei.co/npm/unpi.png?downloads=true)](https://nodei.co/npm/unpi/)  

[![Travis branch](https://img.shields.io/travis/simenkid/unpi/master.svg?maxAge=2592000)](https://travis-ci.org/simenkid/unpi)
[![npm](https://img.shields.io/npm/v/unpi.svg?maxAge=2592000)](https://www.npmjs.com/package/unpi)
[![npm](https://img.shields.io/npm/l/unpi.svg?maxAge=2592000)](https://www.npmjs.com/package/unpi)

<br />
  
## Documentation  

Please visit the [Wiki](https://github.com/simenkid/unpi/wiki).

## Overview  

The *unpi* is the packet builder and parser for Texas Instruments [_Unified Network Processor Interface (UNPI)_](http://processors.wiki.ti.com/index.php/Unified_Network_Processor_Interface) used in RF4CE, BluetoothSmart, and ZigBee wireless SoCs. As stated in TI's wiki page:  

> TI's Unified Network Processor Interface (NPI) is used for establishing a serial data link between a TI SoC and external MCUs or PCs. This is mainly used by TI's network processor solutions.  


## Installation  

> $ npm install unpi --save
  
## Usage  

Here is an quick example. See [Usage](https://github.com/simenkid/unpi/wiki#Usage) on the Wiki for details.  


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

## License  

Licensed under [MIT](https://github.com/simenkid/unpi/blob/master/LICENSE).
