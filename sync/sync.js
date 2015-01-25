"use strict";
var http = require('http');
var path = require('path');
var fs = require('fs');
var URL = require('url');
var readline = require('readline');

// This all runs in the browser
var clientSide = function() {
	// Grab reference to the commit button
	var buttons = Array.prototype.slice.call(document.body.getElementsByTagName('button')).filter(function(el) {
		return el.getAttribute('ng:disabled') === '!Script.dirty';
	});
	var commitButton = buttons[0];

	// Grab reference to the commit button
	buttons = Array.prototype.slice.call(document.body.getElementsByTagName('button')).filter(function(el) {
		return el.getAttribute('ng:click') === 'Memory.update()';
	});
	var memoryButton = buttons[0];

	// Override lodash's cloneDeep which is called from inside the internal reset method
	var modules;
	_.cloneDeep = function(cloneDeep) {
		return function(obj) {
			if (obj && typeof obj.main === 'string' && modules) {

				var req = new XMLHttpRequest ();
				req.open('GET', 'http://localhost:9090/on/updated', true);
				req.send();

				// Monkey patch!
				return modules;
			}
			return cloneDeep.apply(this, arguments);
		};
	}(_.cloneDeep);

	// Wait for changes to local filesystem
	function update(now) {
		var req = new XMLHttpRequest;
		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				if (req.status === 200) {
					modules = JSON.parse(req.responseText);
					commitButton.disabled = false;
					commitButton.click();
				}
				setTimeout(update.bind(this, false), req.status === 200 ? 0 : 1000);
			}
		};
		req.open('GET', 'http://localhost:9090/'+ (now ? 'get' : 'wait'), true);
		req.send();
	};
	update(true);

	// Look for console messages
	var sconsole = document.body.getElementsByClassName('console-messages-list')[0];
	var lastMessage;
	var playerMemory = null;
	var lastSentMemory = 0;

	setInterval(function() {
		var nodes = sconsole.getElementsByClassName('console-message');
		var messages = [];
		var found = false;
		for (var ii = nodes.length - 1; ii >= 0; --ii) {
			var el = nodes[ii];
			var ts = el.getElementsByClassName('timestamp')[0];
			ts = ts && ts.firstChild.nodeValue;
			var msg = el.getElementsByTagName('span')[0].childNodes;
			var txt = '';
			for (var jj = 0; jj < msg.length; ++jj) {
				if (msg[jj].tagName === 'BR') {
					txt += '\n';
				} else if (msg[jj].tagName === 'ANONYMOUS') {
					msg = msg[jj].childNodes;
					jj = -1;
				} else {
					txt += msg[jj].nodeValue;
				}
			}
			if (lastMessage && txt === lastMessage[1] && ts === lastMessage[0]) {
				break;
			}
			messages.push([ts, txt]);
		}
		if (messages.length) {
			var req = new XMLHttpRequest;
			req.open('GET', 'http://localhost:9090/log?log='+ encodeURIComponent(JSON.stringify(messages.reverse())), true);
			req.send();
			lastMessage = messages[messages.length - 1];
		}

		var memory = localStorage.memory;
		if (memory.length > 1000) {
			// We got the real memory
			// Sometimes screeps will replace it with a placeholder value (no idea why)
			var parsedMemory = JSON.parse(memory);
			for (var key in parsedMemory) {
				if (key != "0" && key != "1") {
					// Unique key for the player
					playerMemory = parsedMemory[key];
				}
			}
		}

		if (new Date().getTime() - lastSentMemory > 4000 && playerMemory != null) {
			memoryButton.disabled = false;
			memoryButton.click ();

			lastSentMemory = new Date().getTime();

			console.log ("Sending player memory...");
			var req = new XMLHttpRequest;
			req.open('POST', 'http://localhost:9090/arrays', true);
			//req.setRequestHeader('Content-Type', 'application/json');
			//req.setRequestHeader('Access-Control-Expose-Headers', 'x-json');
			//req.setRequestHeader('Access-Control-Request-Headers', 'origin');
			//req.setRequestHeader('Access-Control-Allow-Origin', '*');
			
			var data = JSON.stringify({data: playerMemory.arrays, context: playerMemory.arrayContext});
			console.log ("Sending " + data.length);
			req.send(data);
		}
	}, 100);
};

// Set up watch on directory changes
var modules = {};
var writeListener;
fs.readdirSync('.').forEach(function(file) {
	if (file !== 'sync.js' && /\.js$/.test(file)) {
		modules[file.replace(/\.js$/, '')] = fs.readFileSync(file, 'utf8');
	}
});

// Wraps the string in a color code that terminals can interpret
var colorExplicit = function (s, red, green, blue) {
	return ("\x1b[38;2;"+Math.round(red)+";"+Math.round(green)+";"+Math.round(blue)+"m" + s + "\x1b[0m");
}

var updateModuleFromFile = function (file) {
	modules[file.replace(/\.js$/, '')] = fs.readFileSync(file, 'utf8');
	if (writeListener) {
		process.nextTick(writeListener);
		writeListener = undefined;
	}
};

fs.watch(__dirname, function(ev, file) {
	if (file !== 'sync.js' && /\.js$/.test(file)) {
		updateModuleFromFile (file);
	}
});

// Localhost HTTP server
var server = http.createServer(function(req, res) {

	if ( req.method === 'OPTIONS' ) {
		// Set CORS headers
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Request-Method', '*');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
		res.setHeader('Access-Control-Allow-Headers', '*');

		res.writeHead(200);
		res.end();
		return;
	}

	var path = URL.parse(req.url, true);
	switch (path.pathname) {
		case '/inject':
			res.writeHead(200, { 'Content-Type': 'text/javascript' });
			res.end('~'+ clientSide.toString()+ '()');
			break;

		case '/get':
		case '/wait':
			if (writeListener) {
				writeListener();
			}
			writeListener = function() {
				res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
				res.end(JSON.stringify(modules));
			};
			if (req.url === '/get') {
				writeListener();
			}
			break;

		case '/log':
			res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
			res.end();
			var messages = JSON.parse(path.query.log);
			for (var ii = 0; ii < messages.length; ++ii) {
				if (messages[ii][0]) {
					var prefix = ' ';
					for (var jj = messages[ii][0].length; jj > 0; --jj) {
						prefix += ' ';
					}

					// Special case
					if (messages[ii][1].indexOf("CPU:") == 0) {
						var used = parseInt(messages[ii][1].split(":")[1]);
						var text = "";
						for (var i=0; i < used; i+=3) {
							var marker = "\u2591";
							if (i >= 100) marker = colorExplicit ("\u2593", 255, 0, 0);
							else if (i >= 75) marker = colorExplicit (marker, 220, 80, 40);
							else if (i >= 50) marker = colorExplicit (marker, 240, 160, 50);
							else if (i >= 25) marker = colorExplicit (marker, 220, 180, 50);
							else marker = colorExplicit (marker, 0, 255, 0);
							text += marker;
						}
						text += " " + used;
						console.log (text);
					} else {
						console.log(
							colorExplicit (messages[ii][0], 180, 180, 180),
							messages[ii][1].split(/\n/g).map(function(line, ii) {
								return (ii ? prefix : '')+ line;
							}).join('\n')
						);
					}
				} else {
					console.log(messages[ii][1]);
				}
			}
			break;
		case '/on/updated':
			console.log ("Sync completed");
			res.setHeader('Access-Control-Allow-Origin','*');
			res.writeHead(200);
			res.end();
			break;
		case '/arrays':
			//res.writeHead(200, { 'Access-Control-Request-Headers': 'origin', 'Access-Control-Allow-Origin': '*' });
			res.setHeader('Access-Control-Allow-Origin','*');

			var requestBody = '';
			req.on('data', function(data) {
				requestBody += data;
				if(requestBody.length > 1e7) {
					res.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
					res.end('Request Entity Too Large');
				}
			});

			req.on('end', function() {
				res.writeHead(200);
				res.end();

				var data = JSON.parse(requestBody);
				var arrays = data.data;

				console.log ("Received " + arrays.length + " arrays");

				for (var i = 0; i < arrays.length; i++ ) {
					var array = arrays[i];
					fs.writeFile("arrays"+i, array.join(' '), function(err) {
						if (err) {
							console.log(err);
						}
					});
				}

				fs.writeFile("context", data.context.join('\n'), function(err) {
					if (err) {
						console.log(err);
					}
				});
			});
			break;
		default:
			res.writeHead(400);
			res.end();
			break;
	}
});
server.timeout = 0;
server.listen(9090);
console.log(
	"Paste this into JS debug console in Screeps (*not* the Screeps console):\n"+
	"var s = document.createElement('script');s.src='http://localhost:9090/inject';document.body.appendChild(s);"
);

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

rl.on('line', function (cmd) {
	if (cmd == "sync") {
		console.log ("Syncing...");
		updateModuleFromFile ("main.js");
	}
});