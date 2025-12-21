const { parentPort } = require('worker_threads');

function heavyComputation() {
    const start = Date.now();
    while (Date.now() - start < 5000);
	alert('pipeline test!');

	// loops until 5 seconds have passed
}

parentPort.postMessage(heavyComputation());
