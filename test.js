var Unpi = require('./index.js');
var npi = new Unpi({ lenBytes: 1 });

var data1_buf = new Buffer([ 0xFE, 0x05, 0x00, 0x65, 0x6c, 0x6c, 0x6f, 0x1e, 
                             0x06, 0x77, 96, 0xFE, 0x03, 0x00, 0x21,
                             0x05, 0x01, 0xFE, 0x03, 0x04, 0x05,
                             0x05, 0x03, 0x49, 0x74, 0xFE, 
                                   0x06, 0x6d, 0x61, 0x6b, 0x65, 0x73, 0x20,
                                   0x03, 0x6d, 0x79, 0xFE,
                                   0x0A, 0x06, 0x69, 0x66, 0x65, 0x20,
                                   0x07, 0x65, 0x61, 0x73, 0x69, 0x65, 0x72, 0x2e]);


npi.on('data', function (r) {
	console.log(r);
});

npi.on('error', function (e, r) {
	console.log(e);
	// console.log(r);
});

npi.parser.write(data1_buf);