!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.d1=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9iYXNlLTY0L2Jhc2U2NC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qISBodHRwOi8vbXRocy5iZS9iYXNlNjQgdjAuMS4wIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2AuXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSwgYW5kIHVzZVxuXHQvLyBpdCBhcyBgcm9vdGAuXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIEludmFsaWRDaGFyYWN0ZXJFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9O1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yO1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuXHR2YXIgZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0Ly8gTm90ZTogdGhlIGVycm9yIG1lc3NhZ2VzIHVzZWQgdGhyb3VnaG91dCB0aGlzIGZpbGUgbWF0Y2ggdGhvc2UgdXNlZCBieVxuXHRcdC8vIHRoZSBuYXRpdmUgYGF0b2JgL2BidG9hYCBpbXBsZW1lbnRhdGlvbiBpbiBDaHJvbWl1bS5cblx0XHR0aHJvdyBuZXcgSW52YWxpZENoYXJhY3RlckVycm9yKG1lc3NhZ2UpO1xuXHR9O1xuXG5cdHZhciBUQUJMRSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC9jb21tb24tbWljcm9zeW50YXhlcy5odG1sI3NwYWNlLWNoYXJhY3RlclxuXHR2YXIgUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUyA9IC9bXFx0XFxuXFxmXFxyIF0vZztcblxuXHQvLyBgZGVjb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGF0b2JgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZC4gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1hdG9iXG5cdC8vIFRoZSBvcHRpbWl6ZWQgYmFzZTY0LWRlY29kaW5nIGFsZ29yaXRobSB1c2VkIGlzIGJhc2VkIG9uIEBhdGvigJlzIGV4Y2VsbGVudFxuXHQvLyBpbXBsZW1lbnRhdGlvbi4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYXRrLzEwMjAzOTZcblx0dmFyIGRlY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpXG5cdFx0XHQucmVwbGFjZShSRUdFWF9TUEFDRV9DSEFSQUNURVJTLCAnJyk7XG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHRpZiAobGVuZ3RoICUgNCA9PSAwKSB7XG5cdFx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UoLz09PyQvLCAnJyk7XG5cdFx0XHRsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGxlbmd0aCAlIDQgPT0gMSB8fFxuXHRcdFx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvQyNhbHBoYW51bWVyaWMtYXNjaWktY2hhcmFjdGVyc1xuXHRcdFx0L1teK2EtekEtWjAtOS9dLy50ZXN0KGlucHV0KVxuXHRcdCkge1xuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdJbnZhbGlkIGNoYXJhY3RlcjogdGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgYml0Q291bnRlciA9IDA7XG5cdFx0dmFyIGJpdFN0b3JhZ2U7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdGJ1ZmZlciA9IFRBQkxFLmluZGV4T2YoaW5wdXQuY2hhckF0KHBvc2l0aW9uKSk7XG5cdFx0XHRiaXRTdG9yYWdlID0gYml0Q291bnRlciAlIDQgPyBiaXRTdG9yYWdlICogNjQgKyBidWZmZXIgOiBidWZmZXI7XG5cdFx0XHQvLyBVbmxlc3MgdGhpcyBpcyB0aGUgZmlyc3Qgb2YgYSBncm91cCBvZiA0IGNoYXJhY3RlcnPigKZcblx0XHRcdGlmIChiaXRDb3VudGVyKysgJSA0KSB7XG5cdFx0XHRcdC8vIOKApmNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBhIHNpbmdsZSBBU0NJSSBjaGFyYWN0ZXIuXG5cdFx0XHRcdG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuXHRcdFx0XHRcdDB4RkYgJiBiaXRTdG9yYWdlID4+ICgtMiAqIGJpdENvdW50ZXIgJiA2KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdC8vIGBlbmNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYnRvYWAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkOiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWJ0b2Fcblx0dmFyIGVuY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuXHRcdGlmICgvW15cXDAtXFx4RkZdLy50ZXN0KGlucHV0KSkge1xuXHRcdFx0Ly8gTm90ZTogbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMgaGVyZSwgYXMgc3Vycm9nYXRlcyBhcmVcblx0XHRcdC8vIG1hdGNoZWQsIGFuZCB0aGUgaW5wdXQgaXMgc3VwcG9zZWQgdG8gb25seSBjb250YWluIEFTQ0lJIGFueXdheS5cblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnVGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3V0c2lkZSBvZiB0aGUgJyArXG5cdFx0XHRcdCdMYXRpbjEgcmFuZ2UuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHBhZGRpbmcgPSBpbnB1dC5sZW5ndGggJSAzO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR2YXIgYTtcblx0XHR2YXIgYjtcblx0XHR2YXIgYztcblx0XHR2YXIgZDtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdC8vIE1ha2Ugc3VyZSBhbnkgcGFkZGluZyBpcyBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGxvb3AuXG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aCAtIHBhZGRpbmc7XG5cblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0Ly8gUmVhZCB0aHJlZSBieXRlcywgaS5lLiAyNCBiaXRzLlxuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDE2O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbikgPDwgODtcblx0XHRcdGMgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGIgKyBjO1xuXHRcdFx0Ly8gVHVybiB0aGUgMjQgYml0cyBpbnRvIGZvdXIgY2h1bmtzIG9mIDYgYml0cyBlYWNoLCBhbmQgYXBwZW5kIHRoZVxuXHRcdFx0Ly8gbWF0Y2hpbmcgY2hhcmFjdGVyIGZvciBlYWNoIG9mIHRoZW0gdG8gdGhlIG91dHB1dC5cblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTggJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTIgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gNiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciAmIDB4M0YpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmIChwYWRkaW5nID09IDIpIHtcblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYjtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTApICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPj4gNCkgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDIpICYgMHgzRikgK1xuXHRcdFx0XHQnPSdcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChwYWRkaW5nID09IDEpIHtcblx0XHRcdGJ1ZmZlciA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAyKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDQpICYgMHgzRikgK1xuXHRcdFx0XHQnPT0nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0dmFyIGJhc2U2NCA9IHtcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J3ZlcnNpb24nOiAnMC4xLjAnXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gYmFzZTY0O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gYmFzZTY0O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYmFzZTY0KSB7XG5cdFx0XHRcdGJhc2U2NC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gYmFzZTY0W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuYmFzZTY0ID0gYmFzZTY0O1xuXHR9XG5cbn0odGhpcykpO1xuIl19
},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiJdfQ==
},{"./support/isBuffer":3,"_process":2,"inherits":5}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
/**
 * Utility functions
 */

var util = {};

util.isObject = function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

util.isNumber = function isNumber(arg) {
  return typeof arg === 'number';
}

util.isUndefined = function isUndefined(arg) {
  return arg === void 0;
}

util.isFunction = function isFunction(arg){
  return typeof arg === 'function';
}


/**
 * EventEmitter class
 */

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!util.isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error' && !this._events.error) {
    er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      throw Error('Uncaught, unspecified "error" event.');
    }
    return false;
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;

      if (util.isFunction(console.error)) {
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
      }
      if (util.isFunction(console.trace))
        console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (Array.isArray(listeners)) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Comment out the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  require('./utils').disableLog(true);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'opera': // fallthrough as it uses chrome shims
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimPeerConnection();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimGetUserMedia();
      break;
    default:
      logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":8,"./edge/edge_shim":11,"./firefox/firefox_shim":12,"./safari/safari_shim":14,"./utils":15}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var event = new Event('track');
              event.track = te.track;
              event.receiver = {track: te.track};
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      // Translate iceTransportPolicy to iceTransports,
      // see https://code.google.com/p/webrtc/issues/detail?id=4869
      logging('PeerConnection');
      if (pcConfig && pcConfig.iceTransportPolicy) {
        pcConfig.iceTransports = pcConfig.iceTransportPolicy;
      }

      var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
      var origGetStats = pc.getStats.bind(pc);
      pc.getStats = function(selector, successCallback, errorCallback) {
        var self = this;
        var args = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats(selector, successCallback);
        }

        var fixChromeStats_ = function(response) {
          var standardReport = {};
          var reports = response.result();
          reports.forEach(function(report) {
            var standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: report.type
            };
            report.names().forEach(function(name) {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        if (arguments.length >= 2) {
          var successCallbackWrapper_ = function(response) {
            args[1](fixChromeStats_(response));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
              arguments[0]]);
        }

        // promise-support
        return new Promise(function(resolve, reject) {
          if (args.length === 1 && typeof selector === 'object') {
            origGetStats.apply(self,
                [function(response) {
                  resolve.apply(null, [fixChromeStats_(response)]);
                }, reject]);
          } else {
            origGetStats.apply(self, [resolve, reject]);
          }
        });
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

    // wrap static methods. Currently just generateCertificate.
    if (webkitRTCPeerConnection.generateCertificate) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return webkitRTCPeerConnection.generateCertificate;
        }
      });
    }

    // add promise support
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = webkitRTCPeerConnection.prototype[method];
      webkitRTCPeerConnection.prototype[method] = function() {
        var self = this;
        if (arguments.length < 1 || (arguments.length === 1 &&
            typeof(arguments[0]) === 'object')) {
          var opts = arguments.length === 1 ? arguments[0] : undefined;
          return new Promise(function(resolve, reject) {
            nativeMethod.apply(self, [resolve, reject, opts]);
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = webkitRTCPeerConnection.prototype[method];
          webkitRTCPeerConnection.prototype[method] = function() {
            var args = arguments;
            var self = this;
            args[0] = new ((method === 'addIceCandidate')?
                RTCIceCandidate : RTCSessionDescription)(args[0]);
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(self, [args[0],
                  function() {
                    resolve();
                    if (args.length >= 2) {
                      args[1].apply(null, []);
                    }
                  },
                  function(err) {
                    reject(err);
                    if (args.length >= 3) {
                      args[2].apply(null, [err]);
                    }
                  }]
                );
            });
          };
        });
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    if (browserDetails.version >= 43) {
      element.srcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      logging('Error attaching stream to element.');
    }
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    if (browserDetails.version >= 43) {
      to.srcObject = from.srcObject;
    } else {
      to.src = from.src;
    }
  }
};


// Expose public methods.
module.exports = {
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia'),
  attachMediaStream: chromeShim.attachMediaStream,
  reattachMediaStream: chromeShim.reattachMediaStream
};

},{"../utils.js":15,"./getusermedia":9}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints.audio) {
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints.video) {
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return navigator.webkitGetUserMedia(constraints, onSuccess, onError);
  };
  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (c) {
        logging('spec:   ' + JSON.stringify(c)); // whitespace for alignment
        c.audio = constraintsToChrome_(c.audio);
        c.video = constraintsToChrome_(c.video);
        logging('chrome: ' + JSON.stringify(c));
      }
      return origGetUserMedia(c);
    }.bind(this);
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":15}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parts[1],
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      default: // Unknown extensions are silently ignored.
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
       ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + ' ' + fb.parameter +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var fpLine = lines.filter(function(line) {
    return line.indexOf('a=fingerprint:') === 0;
  })[0].substr(14);
  // Note: a=setup line is ignored since we use the 'auto' role.
  var dtlsParameters = {
    role: 'auto',
    fingerprints: [{
      algorithm: fpLine.split(' ')[0],
      value: fpLine.split(' ')[1]
    }]
  };
  return dtlsParameters;
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  // FIXME: add headerExtensions, fecMechanismş and rtcp.
  sdp += 'a=rtcp-mux\r\n';
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(5), 10);
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
  if (transceiver.rtpSender) {
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],11:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('./edge_sdp');
var logging = require('../utils').log;

var edgeShim = {
  shimPeerConnection: function() {
    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
    }

    window.RTCPeerConnection = function(config) {
      var self = this;

      var _eventTarget = document.createDocumentFragment();
      ['addEventListener', 'removeEventListener', 'dispatchEvent']
          .forEach(function(method) {
            self[method] = _eventTarget[method].bind(_eventTarget);
          });

      this.onicecandidate = null;
      this.onaddstream = null;
      this.ontrack = null;
      this.onremovestream = null;
      this.onsignalingstatechange = null;
      this.oniceconnectionstatechange = null;
      this.onnegotiationneeded = null;
      this.ondatachannel = null;

      this.localStreams = [];
      this.remoteStreams = [];
      this.getLocalStreams = function() {
        return self.localStreams;
      };
      this.getRemoteStreams = function() {
        return self.remoteStreams;
      };

      this.localDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.remoteDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.signalingState = 'stable';
      this.iceConnectionState = 'new';
      this.iceGatheringState = 'new';

      this.iceOptions = {
        gatherPolicy: 'all',
        iceServers: []
      };
      if (config && config.iceTransportPolicy) {
        switch (config.iceTransportPolicy) {
          case 'all':
          case 'relay':
            this.iceOptions.gatherPolicy = config.iceTransportPolicy;
            break;
          case 'none':
            // FIXME: remove once implementation and spec have added this.
            throw new TypeError('iceTransportPolicy "none" not supported');
          default:
            // don't set iceTransportPolicy.
            break;
        }
      }
      if (config && config.iceServers) {
        // Edge does not like
        // 1) stun:
        // 2) turn: that does not have all of turn:host:port?transport=udp
        this.iceOptions.iceServers = config.iceServers.filter(function(server) {
          if (server && server.urls) {
            server.urls = server.urls.filter(function(url) {
              return url.indexOf('turn:') === 0 &&
                  url.indexOf('transport=udp') !== -1;
            })[0];
            return !!server.urls;
          }
          return false;
        });
      }

      // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
      // everything that is needed to describe a SDP m-line.
      this.transceivers = [];

      // since the iceGatherer is currently created in createOffer but we
      // must not emit candidates until after setLocalDescription we buffer
      // them in this array.
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
      var self = this;
      var sections = SDPUtils.splitSections(self.localDescription.sdp);
      // FIXME: need to apply ice candidates in a way which is async but
      // in-order
      this._localIceCandidatesBuffer.forEach(function(event) {
        var end = !event.candidate || Object.keys(event.candidate).length === 0;
        if (end) {
          for (var j = 1; j < sections.length; j++) {
            if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
              sections[j] += 'a=end-of-candidates\r\n';
            }
          }
        } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
            === -1) {
          sections[event.candidate.sdpMLineIndex + 1] +=
              'a=' + event.candidate.candidate + '\r\n';
        }
        self.localDescription.sdp = sections.join('');
        self.dispatchEvent(event);
        if (self.onicecandidate !== null) {
          self.onicecandidate(event);
        }
        if (!event.candidate && self.iceGatheringState !== 'complete') {
          var complete = self.transceivers.every(function(transceiver) {
            return transceiver.iceGatherer &&
                transceiver.iceGatherer.state === 'completed';
          });
          if (complete) {
            self.iceGatheringState = 'complete';
          }
        }
      });
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype.addStream = function(stream) {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      this.localStreams.push(stream.clone());
      this._maybeFireNegotiationNeeded();
    };

    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var idx = this.localStreams.indexOf(stream);
      if (idx > -1) {
        this.localStreams.splice(idx, 1);
        this._maybeFireNegotiationNeeded();
      }
    };

    // Determines the intersection of local and remote capabilities.
    window.RTCPeerConnection.prototype._getCommonCapabilities =
        function(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };
          localCapabilities.codecs.forEach(function(lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                  lCodec.clockRate === rCodec.clockRate &&
                  lCodec.numChannels === rCodec.numChannels) {
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // FIXME: also need to determine intersection between
                // .rtcpFeedback and .parameters
                break;
              }
            }
          });

          localCapabilities.headerExtensions
              .forEach(function(lHeaderExtension) {
                for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                     i++) {
                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                    break;
                  }
                }
              });

          // FIXME: fecMechanisms
          return commonCapabilities;
        };

    // Create ICE gatherer, ICE transport and DTLS transport.
    window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
        function(mid, sdpMLineIndex) {
          var self = this;
          var iceGatherer = new RTCIceGatherer(self.iceOptions);
          var iceTransport = new RTCIceTransport(iceGatherer);
          iceGatherer.onlocalcandidate = function(evt) {
            var event = new Event('icecandidate');
            event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === undefined) {
                iceGatherer.state = 'completed';
              }

              // Emit a candidate with type endOfCandidates to make the samples
              // work. Edge requires addIceCandidate with this empty candidate
              // to start checking. The real solution is to signal
              // end-of-candidates to the other side when getting the null
              // candidate but some apps (like the samples) don't do that.
              event.candidate.candidate =
                  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
            } else {
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
              event.candidate.candidate = SDPUtils.writeCandidate(cand);
            }

            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });

            // Emit candidate if localDescription is set.
            // Also emits null candidate when all gatherers are complete.
            switch (self.iceGatheringState) {
              case 'new':
                self._localIceCandidatesBuffer.push(event);
                if (end && complete) {
                  self._localIceCandidatesBuffer.push(
                      new Event('icecandidate'));
                }
                break;
              case 'gathering':
                self._emitBufferedCandidates();
                self.dispatchEvent(event);
                if (self.onicecandidate !== null) {
                  self.onicecandidate(event);
                }
                if (complete) {
                  self.dispatchEvent(new Event('icecandidate'));
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(new Event('icecandidate'));
                  }
                  self.iceGatheringState = 'complete';
                }
                break;
              case 'complete':
                // should not happen... currently!
                break;
              default: // no-op.
                break;
            }
          };
          iceTransport.onicestatechange = function() {
            self._updateConnectionState();
          };

          var dtlsTransport = new RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            self._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            // onerror does not set state to failed by itself.
            dtlsTransport.state = 'failed';
            self._updateConnectionState();
          };

          return {
            iceGatherer: iceGatherer,
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

    // Start the RTP Sender and Receiver for a transceiver.
    window.RTCPeerConnection.prototype._transceive = function(transceiver,
        send, recv) {
      var params = this._getCommonCapabilities(transceiver.localCapabilities,
          transceiver.remoteCapabilities);
      if (send && transceiver.rtpSender) {
        params.encodings = transceiver.sendEncodingParameters;
        params.rtcp = {
          cname: SDPUtils.localCName
        };
        if (transceiver.recvEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
        }
        transceiver.rtpSender.send(params);
      }
      if (recv && transceiver.rtpReceiver) {
        params.encodings = transceiver.recvEncodingParameters;
        params.rtcp = {
          cname: transceiver.cname
        };
        if (transceiver.sendEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
        }
        transceiver.rtpReceiver.receive(params);
      }
    };

    window.RTCPeerConnection.prototype.setLocalDescription =
        function(description) {
          var self = this;
          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // FIXME: What was the purpose of this empty if statement?
            // if (!this._pendingOffer) {
            // } else {
            if (this._pendingOffer) {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
              });
              this.transceivers = this._pendingOffer;
              delete this._pendingOffer;
            }
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
            sessionpart = sections.shift();
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = self.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;
              var rejected = mediaSection.split('\n', 1)[0]
                  .split(' ', 2)[1] === '0';

              if (!rejected) {
                var remoteIceParameters = SDPUtils.getIceParameters(
                    mediaSection, sessionpart);
                iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlled');

                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                    mediaSection, sessionpart);
                dtlsTransport.start(remoteDtlsParameters);

                // Calculate intersection of capabilities.
                var params = self._getCommonCapabilities(localCapabilities,
                    remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                self._transceive(transceiver,
                    params.codecs.length > 0,
                    false);
              }
            });
          }

          this.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-local-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }

          // If a success callback was provided, emit ICE candidates after it
          // has been executed. Otherwise, emit callback after the Promise is
          // resolved.
          var hasCallback = arguments.length > 1 &&
            typeof arguments[1] === 'function';
          if (hasCallback) {
            var cb = arguments[1];
            window.setTimeout(function() {
              cb();
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              self._emitBufferedCandidates();
            }, 0);
          }
          var p = Promise.resolve();
          p.then(function() {
            if (!hasCallback) {
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              // Usually candidates will be emitted earlier.
              window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
            }
          });
          return p;
        };

    window.RTCPeerConnection.prototype.setRemoteDescription =
        function(description) {
          var self = this;
          var stream = new MediaStream();
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var mline = lines[0].substr(2).split(' ');
            var kind = mline[0];
            var rejected = mline[1] === '0';
            var direction = SDPUtils.getDirection(mediaSection, sessionpart);

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpSender;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                  sessionpart);
            }
            recvEncodingParameters =
                SDPUtils.parseRtpEncodingParameters(mediaSection);

            var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
            if (mid.length) {
              mid = mid[0].substr(6);
            } else {
              mid = SDPUtils.generateIdentifier();
            }

            var cname;
            // Gets the first SSRC. Note that with RTX there might be multiple
            // SSRCs.
            var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                .map(function(line) {
                  return SDPUtils.parseSsrcMedia(line);
                })
                .filter(function(obj) {
                  return obj.attribute === 'cname';
                })[0];
            if (remoteSsrc) {
              cname = remoteSsrc.value;
            }

            var isComplete = SDPUtils.matchPrefix(mediaSection,
                'a=end-of-candidates').length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                .map(function(cand) {
                  return SDPUtils.parseCandidate(cand);
                })
                .filter(function(cand) {
                  return cand.component === '1';
                });
            if (description.type === 'offer' && !rejected) {
              var transports = self._createIceAndDtlsTransports(mid,
                  sdpMLineIndex);
              if (isComplete) {
                transports.iceTransport.setRemoteCandidates(cands);
              }

              localCapabilities = RTCRtpReceiver.getCapabilities(kind);
              sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

              track = rtpReceiver.track;
              receiverList.push([track, rtpReceiver]);
              // FIXME: not correct when there are multiple streams but that is
              // not currently supported in this shim.
              stream.addTrack(track);

              // FIXME: look at direction.
              if (self.localStreams.length > 0 &&
                  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                // FIXME: actually more complicated, needs to match types etc
                var localtrack = self.localStreams[0]
                    .getTracks()[sdpMLineIndex];
                rtpSender = new RTCRtpSender(localtrack,
                    transports.dtlsTransport);
              }

              self.transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: remoteCapabilities,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                cname: cname,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: recvEncodingParameters
              };
              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              self._transceive(self.transceivers[sdpMLineIndex],
                  false,
                  direction === 'sendrecv' || direction === 'sendonly');
            } else if (description.type === 'answer' && !rejected) {
              transceiver = self.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpSender = transceiver.rtpSender;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              self.transceivers[sdpMLineIndex].recvEncodingParameters =
                  recvEncodingParameters;
              self.transceivers[sdpMLineIndex].remoteCapabilities =
                  remoteCapabilities;
              self.transceivers[sdpMLineIndex].cname = cname;

              if (isComplete) {
                iceTransport.setRemoteCandidates(cands);
              }
              iceTransport.start(iceGatherer, remoteIceParameters,
                  'controlling');
              dtlsTransport.start(remoteDtlsParameters);

              self._transceive(transceiver,
                  direction === 'sendrecv' || direction === 'recvonly',
                  direction === 'sendrecv' || direction === 'sendonly');

              if (rtpReceiver &&
                  (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                stream.addTrack(track);
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          this.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-remote-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }
          if (stream.getTracks().length) {
            self.remoteStreams.push(stream);
            window.setTimeout(function() {
              var event = new Event('addstream');
              event.stream = stream;
              self.dispatchEvent(event);
              if (self.onaddstream !== null) {
                window.setTimeout(function() {
                  self.onaddstream(event);
                }, 0);
              }

              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                var trackEvent = new Event('track');
                trackEvent.track = track;
                trackEvent.receiver = receiver;
                trackEvent.streams = [stream];
                self.dispatchEvent(event);
                if (self.ontrack !== null) {
                  window.setTimeout(function() {
                    self.ontrack(trackEvent);
                  }, 0);
                }
              });
            }, 0);
          }
          if (arguments.length > 1 && typeof arguments[1] === 'function') {
            window.setTimeout(arguments[1], 0);
          }
          return Promise.resolve();
        };

    window.RTCPeerConnection.prototype.close = function() {
      this.transceivers.forEach(function(transceiver) {
        /* not yet
        if (transceiver.iceGatherer) {
          transceiver.iceGatherer.close();
        }
        */
        if (transceiver.iceTransport) {
          transceiver.iceTransport.stop();
        }
        if (transceiver.dtlsTransport) {
          transceiver.dtlsTransport.stop();
        }
        if (transceiver.rtpSender) {
          transceiver.rtpSender.stop();
        }
        if (transceiver.rtpReceiver) {
          transceiver.rtpReceiver.stop();
        }
      });
      // FIXME: clean up tracks, local streams, remote streams, etc
      this._updateSignalingState('closed');
    };

    // Update the signaling state.
    window.RTCPeerConnection.prototype._updateSignalingState =
        function(newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this.dispatchEvent(event);
          if (this.onsignalingstatechange !== null) {
            this.onsignalingstatechange(event);
          }
        };

    // Determine whether to fire the negotiationneeded event.
    window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
        function() {
          // Fire away (for now).
          var event = new Event('negotiationneeded');
          this.dispatchEvent(event);
          if (this.onnegotiationneeded !== null) {
            this.onnegotiationneeded(event);
          }
        };

    // Update the connection state.
    window.RTCPeerConnection.prototype._updateConnectionState = function() {
      var self = this;
      var newState;
      var states = {
        'new': 0,
        closed: 0,
        connecting: 0,
        checking: 0,
        connected: 0,
        completed: 0,
        failed: 0
      };
      this.transceivers.forEach(function(transceiver) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      });
      // ICETransport.completed and connected are the same for this purpose.
      states.connected += states.completed;

      newState = 'new';
      if (states.failed > 0) {
        newState = 'failed';
      } else if (states.connecting > 0 || states.checking > 0) {
        newState = 'connecting';
      } else if (states.disconnected > 0) {
        newState = 'disconnected';
      } else if (states.new > 0) {
        newState = 'new';
      } else if (states.connected > 0 || states.completed > 0) {
        newState = 'connected';
      }

      if (newState !== self.iceConnectionState) {
        self.iceConnectionState = newState;
        var event = new Event('iceconnectionstatechange');
        this.dispatchEvent(event);
        if (this.oniceconnectionstatechange !== null) {
          this.oniceconnectionstatechange(event);
        }
      }
    };

    window.RTCPeerConnection.prototype.createOffer = function() {
      var self = this;
      if (this._pendingOffer) {
        throw new Error('createOffer called while there is a pending offer.');
      }
      var offerOptions;
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        offerOptions = arguments[0];
      } else if (arguments.length === 3) {
        offerOptions = arguments[2];
      }

      var tracks = [];
      var numAudioTracks = 0;
      var numVideoTracks = 0;
      // Default to sendrecv.
      if (this.localStreams.length) {
        numAudioTracks = this.localStreams[0].getAudioTracks().length;
        numVideoTracks = this.localStreams[0].getVideoTracks().length;
      }
      // Determine number of audio and video tracks we need to send/recv.
      if (offerOptions) {
        // Reject Chrome legacy constraints.
        if (offerOptions.mandatory || offerOptions.optional) {
          throw new TypeError(
              'Legacy mandatory/optional constraints not supported.');
        }
        if (offerOptions.offerToReceiveAudio !== undefined) {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
        if (offerOptions.offerToReceiveVideo !== undefined) {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
      if (this.localStreams.length) {
        // Push local streams.
        this.localStreams[0].getTracks().forEach(function(track) {
          tracks.push({
            kind: track.kind,
            track: track,
            wantReceive: track.kind === 'audio' ?
                numAudioTracks > 0 : numVideoTracks > 0
          });
          if (track.kind === 'audio') {
            numAudioTracks--;
          } else if (track.kind === 'video') {
            numVideoTracks--;
          }
        });
      }
      // Create M-lines for recvonly streams.
      while (numAudioTracks > 0 || numVideoTracks > 0) {
        if (numAudioTracks > 0) {
          tracks.push({
            kind: 'audio',
            wantReceive: true
          });
          numAudioTracks--;
        }
        if (numVideoTracks > 0) {
          tracks.push({
            kind: 'video',
            wantReceive: true
          });
          numVideoTracks--;
        }
      }

      var sdp = SDPUtils.writeSessionBoilerplate();
      var transceivers = [];
      tracks.forEach(function(mline, sdpMLineIndex) {
        // For each track, create an ice gatherer, ice transport,
        // dtls transport, potentially rtpsender and rtpreceiver.
        var track = mline.track;
        var kind = mline.kind;
        var mid = SDPUtils.generateIdentifier();

        var transports = self._createIceAndDtlsTransports(mid, sdpMLineIndex);

        var localCapabilities = RTCRtpSender.getCapabilities(kind);
        var rtpSender;
        var rtpReceiver;

        // generate an ssrc now, to be used later in rtpSender.send
        var sendEncodingParameters = [{
          ssrc: (2 * sdpMLineIndex + 1) * 1001
        }];
        if (track) {
          rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
        }

        if (mline.wantReceive) {
          rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
        }

        transceivers[sdpMLineIndex] = {
          iceGatherer: transports.iceGatherer,
          iceTransport: transports.iceTransport,
          dtlsTransport: transports.dtlsTransport,
          localCapabilities: localCapabilities,
          remoteCapabilities: null,
          rtpSender: rtpSender,
          rtpReceiver: rtpReceiver,
          kind: kind,
          mid: mid,
          sendEncodingParameters: sendEncodingParameters,
          recvEncodingParameters: null
        };
        var transceiver = transceivers[sdpMLineIndex];
        sdp += SDPUtils.writeMediaSection(transceiver,
            transceiver.localCapabilities, 'offer', self.localStreams[0]);
      });

      this._pendingOffer = transceivers;
      var desc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.createAnswer = function() {
      var self = this;

      var sdp = SDPUtils.writeSessionBoilerplate();
      this.transceivers.forEach(function(transceiver) {
        // Calculate intersection of capabilities.
        var commonCapabilities = self._getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities);

        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
            'answer', self.localStreams[0]);
      });

      var desc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
      var mLineIndex = candidate.sdpMLineIndex;
      if (candidate.sdpMid) {
        for (var i = 0; i < this.transceivers.length; i++) {
          if (this.transceivers[i].mid === candidate.sdpMid) {
            mLineIndex = i;
            break;
          }
        }
      }
      var transceiver = this.transceivers[mLineIndex];
      if (transceiver) {
        var cand = Object.keys(candidate.candidate).length > 0 ?
            SDPUtils.parseCandidate(candidate.candidate) : {};
        // Ignore Chrome's invalid candidates since Edge does not like them.
        if (cand.protocol === 'tcp' && cand.port === 0) {
          return;
        }
        // Ignore RTCP candidates, we assume RTCP-MUX.
        if (cand.component !== '1') {
          return;
        }
        // A dirty hack to make samples work.
        if (cand.type === 'endOfCandidates') {
          cand = {};
        }
        transceiver.iceTransport.addRemoteCandidate(cand);

        // update the remoteDescription.
        var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
        sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
            : 'a=end-of-candidates') + '\r\n';
        this.remoteDescription.sdp = sections.join('');
      }
      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        window.setTimeout(arguments[1], 0);
      }
      return Promise.resolve();
    };

    window.RTCPeerConnection.prototype.getStats = function() {
      var promises = [];
      this.transceivers.forEach(function(transceiver) {
        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
            'dtlsTransport'].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
      });
      var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
          arguments[1];
      return new Promise(function(resolve) {
        var results = {};
        Promise.all(promises).then(function(res) {
          res.forEach(function(result) {
            Object.keys(result).forEach(function(id) {
              results[id] = result[id];
            });
          });
          if (cb) {
            window.setTimeout(cb, 0, results);
          }
          resolve(results);
        });
      });
    };
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    element.srcObject = stream;
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    to.srcObject = from.srcObject;
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  attachMediaStream: edgeShim.attachMediaStream,
  reattachMediaStream: edgeShim.reattachMediaStream
};

},{"../utils":15,"./edge_sdp":10}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = mozRTCSessionDescription;
      window.RTCIceCandidate = mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate')?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });
  },

  shimGetUserMedia: function() {
    // getUserMedia constraints shim.
    var getUserMedia_ = function(constraints, onSuccess, onError) {
      var constraintsToFF37_ = function(c) {
        if (typeof c !== 'object' || c.require) {
          return c;
        }
        var require = [];
        Object.keys(c).forEach(function(key) {
          if (key === 'require' || key === 'advanced' ||
              key === 'mediaSource') {
            return;
          }
          var r = c[key] = (typeof c[key] === 'object') ?
              c[key] : {ideal: c[key]};
          if (r.min !== undefined ||
              r.max !== undefined || r.exact !== undefined) {
            require.push(key);
          }
          if (r.exact !== undefined) {
            if (typeof r.exact === 'number') {
              r. min = r.max = r.exact;
            } else {
              c[key] = r.exact;
            }
            delete r.exact;
          }
          if (r.ideal !== undefined) {
            c.advanced = c.advanced || [];
            var oc = {};
            if (typeof r.ideal === 'number') {
              oc[key] = {min: r.ideal, max: r.ideal};
            } else {
              oc[key] = r.ideal;
            }
            c.advanced.push(oc);
            delete r.ideal;
            if (!Object.keys(r).length) {
              delete c[key];
            }
          }
        });
        if (require.length) {
          c.require = require;
        }
        return c;
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      if (browserDetails.version < 38) {
        logging('spec: ' + JSON.stringify(constraints));
        if (constraints.audio) {
          constraints.audio = constraintsToFF37_(constraints.audio);
        }
        if (constraints.video) {
          constraints.video = constraintsToFF37_(constraints.video);
        }
        logging('ff37: ' + JSON.stringify(constraints));
      }
      return navigator.mozGetUserMedia(constraints, onSuccess, onError);
    };

    navigator.getUserMedia = getUserMedia_;

    // Returns the result of getUserMedia as a Promise.
    var getUserMediaPromise_ = function(constraints) {
      return new Promise(function(resolve, reject) {
        navigator.getUserMedia(constraints, resolve, reject);
      });
    };

    // Shim for mediaDevices on older versions.
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
        addEventListener: function() { },
        removeEventListener: function() { }
      };
    }
    navigator.mediaDevices.enumerateDevices =
        navigator.mediaDevices.enumerateDevices || function() {
          return new Promise(function(resolve) {
            var infos = [
              {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
              {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
            ];
            resolve(infos);
          });
        };

    if (browserDetails.version < 41) {
      // Work around http://bugzil.la/1169665
      var orgEnumerateDevices =
          navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
      navigator.mediaDevices.enumerateDevices = function() {
        return orgEnumerateDevices().then(undefined, function(e) {
          if (e.name === 'NotFoundError') {
            return [];
          }
          throw e;
        });
      };
    }
  },

  // Attach a media stream to an element.
  attachMediaStream: function(element, stream) {
    logging('DEPRECATED, attachMediaStream will soon be removed.');
    element.srcObject = stream;
  },

  reattachMediaStream: function(to, from) {
    logging('DEPRECATED, reattachMediaStream will soon be removed.');
    to.srcObject = from.srcObject;
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia'),
  attachMediaStream: firefoxShim.attachMediaStream,
  reattachMediaStream: firefoxShim.reattachMediaStream
};

},{"../utils":15,"./getusermedia":13}],13:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, onError);
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
};

},{"../utils":15}],14:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: DrAlex
  // attachMediaStream: function(element, stream) { },
  // reattachMediaStream: function(to, from) { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
    navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection,
  // attachMediaStream: safariShim.attachMediaStream,
  // reattachMediaStream: safariShim.reattachMediaStream
};

},{}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = false;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser, version and minVersion
   *     properties.
   */
  detectBrowser: function() {
    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;
    result.minVersion = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/([0-9]+)\./, 1);
      result.minVersion = 31;

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/([0-9]+)\./, 2);
        result.minVersion = 38;

      // Safari or unknown webkit-based
      // for the time being Safari has support for MediaStreams but not webRTC
      } else {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/([0-9]+)\./, 1);
          result.minVersion = 602;

        // unknown webkit-based browser
        } else {
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }

    // Edge.
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
      result.minVersion = 10547;

    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    // Warn if version is less than minVersion.
    if (result.version < result.minVersion) {
      utils.log('Browser: ' + result.browser + ' Version: ' + result.version +
          ' < minimum supported version: ' + result.minVersion +
          '\n some things might not work!');
    }

    return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}],16:[function(require,module,exports){
var isBrowser = !(typeof window === 'undefined');
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }

var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = false;
var Logger = {
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


function DiyaNode(){
	EventEmitter.call(this);

	this._user = null;
	this._authenticated = null;
	this._pass = null;

	this._status = 'closed';
	this._addr = null;
	this._socket = null;
	this._nextId = 0;
	this._connectionDeferred = null;
	this._disconnectionDeferred = null;
	this._pendingMessages = [];
	this._peers = [];
	this._reconnectTimeout = 1000;
	this._connectTimeout = 5000;
}
inherits(DiyaNode, EventEmitter);

////////////////////////////////////////////////////
////////////////// Public API //////////////////////
////////////////////////////////////////////////////

DiyaNode.prototype.user = function(user) { 
	if(user) this._user = user;
	else return this._user; 
};
DiyaNode.prototype.authenticated = function(authenticated) { 
	if(authenticated !== undefined) this._authenticated = authenticated;
	else return this._authenticated; 
};
DiyaNode.prototype.pass = function(pass) { 
	if(pass !== undefined) this._pass = pass;
	else return this._pass; 
};
DiyaNode.prototype.addr = function() { return this._addr; };
DiyaNode.prototype.peers = function(){ return this._peers; };
DiyaNode.prototype.self = function() { return this._self; };
DiyaNode.prototype.setSecured = function(bSecured) { this._secured = bSecured !== false; };
DiyaNode.prototype.setWSocket = function(WSocket) {this._WSocket = WSocket;}



/** @return {Promise<String>} the connected peer name */
DiyaNode.prototype.connect = function(addr, WSocket){
	var that = this;
	this.bDontReconnect = false;

	if(WSocket) this._WSocket = WSocket;
	else if(!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	// Check and Format URI (FQDN)
	if(addr.indexOf("ws://") === 0 && this._secured) return Q.reject("Please use a secured connection (" + addr + ")");
	if(addr.indexOf("wss://") === 0 && this._secured === false) return Q.reject("Please use a non-secured connection (" + addr + ")");
	if(addr.indexOf("ws://") !== 0 && addr.indexOf("wss://") !== 0) {
		if(this._secured) addr = "wss://" + addr;
		else addr = "ws://" + addr;
	}


	if(this._addr === addr){
		if(this._status === 'opened')
			return Q(this.self());
		else if(this._connectionDeferred && this._connectionDeferred.promise && this._connectionDeferred.promise.isPending())
			return this._connectionDeferred.promise;
	}

	return this.close().then(function(){
		that._addr = addr;
		that._connectionDeferred = Q.defer();
		Logger.log('d1: connect to ' + that._addr);
		var sock = new SocketHandler(WSocket, that._addr, that._connectTimeout);

		if(!that._socketHandler) that._socketHandler = sock;

		that._onopening();

		sock.on('open', function(){
			if(that._socketHandler !== sock) {
				console.log("[d1] Websocket responded but already connected to a different one");
				return;
			}
			that._socketHandler = sock;
			that._status = 'opened';
			that._setupPingResponse();
		});

		sock.on('closing', function() {
			if(that._socketHandler !== sock) return ;
			that._onclosing();
		});

		sock.on('close', function() {
			if(that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			that._stopPingResponse();
			that._onclose();
			if(that._connectionDeferred) { that._connectionDeferred.reject("closed"); that._connectionDeferred = null;}
		});

		sock.on('error', function(error) {
			if(that._socketHandler !== sock) return;
			that._onerror(error);
		});

		sock.on('timeout', function() {
			if(that._socketHandler !== sock) return;
			that._socketHandler = null;
			that._status = 'closed';
			if(that._connectionDeferred) { that._connectionDeferred.reject("closed"); that._connectionDeferred = null;}
		})

		sock.on('message', function(message) { that._onmessage(message); });

		return that._connectionDeferred.promise;
	});
};

DiyaNode.prototype.disconnect = function() {
	this.bDontReconnect = true;
	return this.close();
};


DiyaNode.prototype.close = function(){
	this._stopPingResponse();
	if(this._socketHandler) return this._socketHandler.close();
	else return Q();
};

DiyaNode.prototype.isConnected = function(){
	return (this._socketHandler && this._socketHandler.isConnected());
};

DiyaNode.prototype.request = function(params, callback, timeout, options){
	var that = this;
	if(!options) options = {};

	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	if(!params.service) {
		Logger.error('No service defined for request !');
		return false;
	}

	var message = this._createMessage(params, "Request");
	this._appendMessage(message, callback);
	if(typeof options.callback_partial === 'function') this._pendingMessages[message.id].callback_partial = options.callback_partial;
	message.options = options;

	if(!isNaN(timeout) && timeout > 0){
		setTimeout(function(){
			var handler = that._removeMessage(message.id);
			if(handler) that._notifyListener(handler, 'Timeout exceeded ('+timeout+'ms) !');
		}, timeout);
	}

	if(!this._send(message)){
		this._removeMessage(message.id);
		console.error('Cannot send request !');
		return false;
	}

	return true;
};

DiyaNode.prototype.subscribe = function(params, callback){
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	if(!params.service){
		Logger.error('No service defined for subscription !');
		return -1;
	}

	var message = this._createMessage(params, "Subscription");
	this._appendMessage(message, callback);

	if(!this._send(message)){
		this._removeMessage(message.id);
		Logger.error('Cannot send subscription !');
		return -1;
	}

	return message.id;
};

DiyaNode.prototype.unsubscribe = function(subId){
	if(this._pendingMessages[subId] && this._pendingMessages[subId].type === "Subscription"){
		var subscription = this._removeMessage(subId);

		var message = this._createMessage({
			target: subscription.target,
			data: {
				subId: subId
			}
		}, "Unsubscribe");

		if(!this._send(message)){
			Logger.error('Cannot send unsubscribe !');
			return false;
		}

		return true;
	}
	return false;
};



///////////////////////////////////////////////////////////
//////////////////// Internal methods /////////////////////
///////////////////////////////////////////////////////////

DiyaNode.prototype._appendMessage = function(message, callback){
	this._pendingMessages[message.id] = {
		callback: callback,
		type: message.type,
		target: message.target
	};
};

DiyaNode.prototype._removeMessage = function(messageId){
	var handler = this._pendingMessages[messageId];
	if(handler){
		delete this._pendingMessages[messageId];
		return handler;
	}else{
		return null;
	}
};

DiyaNode.prototype._clearMessages = function(err, data){
	for(var messageId in this._pendingMessages){
		var handler = this._removeMessage(messageId);
		this._notifyListener(handler, err, data);
	}
};

DiyaNode.prototype._clearPeers = function(){
	while(this._peers.length) this.emit('peer-disconnected', this._peers.pop());
};

DiyaNode.prototype._getMessageHandler = function(messageId){
	var handler = this._pendingMessages[messageId];
	return handler ? handler : null;
};

DiyaNode.prototype._notifyListener = function(handler, error, data){
	if(handler && typeof handler.callback === 'function') {
		error = error ? error : null;
		data = data ? data : null;
		try {
			handler.callback(error, data);
		} catch(e) { console.log('[Error in Request callback] ' + e.stack ? e.stack : e);}
	}
};

DiyaNode.prototype._send = function(message){
	return this._socketHandler && this._socketHandler.send(message);
};

DiyaNode.prototype._setupPingResponse = function(){
	var that = this;

	this._pingTimeout = 15000;
	this._lastPing = new Date().getTime();

	function checkPing(){
		var curTime = new Date().getTime();
		if(curTime - that._lastPing > that._pingTimeout){
			that._forceClose();
			Logger.log("d1:  timed out !");
		}else{
			Logger.log("d1: last ping ok");
			that._pingSetTimeoutId = setTimeout(checkPing, Math.round(that._pingTimeout / 2.1));
		}
	}

	checkPing();
};

DiyaNode.prototype._stopPingResponse = function(){
	clearTimeout(this._pingSetTimeoutId);
};

DiyaNode.prototype._forceClose = function(){
	this._socketHandler.close();
	this._onclose();
};

///////////////////////////////////////////////////////////////
/////////////////// Socket event handlers /////////////////////
///////////////////////////////////////////////////////////////


DiyaNode.prototype._onmessage = function(message){
	if(isNaN(message.id)) return this._handleInternalMessage(message);
	var handler = this._getMessageHandler(message.id);
	if(!handler) return;
	switch(handler.type){
		case "Request":
			this._handleRequest(handler, message);
			break;
		case "Subscription":
			this._handleSubscription(handler, message);
			break;
	}
};

DiyaNode.prototype._onopening = function() {
	this.emit('opening', this);
};

DiyaNode.prototype._onerror = function(error) {
	this.emit('error', new Error(error));
};

DiyaNode.prototype._onclosing = function() {
	this.emit('closing', this);
};

DiyaNode.prototype._onclose = function(){
	var that = this;

	this._clearMessages('PeerDisconnected');
	this._clearPeers();

	if(!this.bDontReconnect) {
		Logger.log('d1: connection lost, try reconnecting');
		setTimeout(function(){
			that.connect(that._addr, that._WSocket).catch(function(err){});
		}, that._reconnectTimeout);
	}	
	this.emit('close', this._addr);
};

/////////////////////////////////////////////////////////////
/////////////// Protocol event handlers /////////////////////
/////////////////////////////////////////////////////////////

DiyaNode.prototype._handleInternalMessage = function(message){
	switch(message.type){
		case "PeerConnected":
			this._handlePeerConnected(message);
			break;
		case "PeerDisconnected":
			this._handlePeerDisconnected(message);
			break;
		case "Handshake":
			this._handleHandshake(message);
			break;
		case "Ping":
			this._handlePing(message);
			break;
	}
};

DiyaNode.prototype._handlePing = function(message){
	message.type = "Pong";
	this._lastPing = new Date().getTime();
	this._send(message);
};

DiyaNode.prototype._handleHandshake = function(message){

	if(message.peers === undefined || typeof message.self !== 'string'){
		Logger.error("Missing arguments for Handshake message, dropping...");
		return ;
	}


	this._self = message.self;

	for(var i=0;i<message.peers.length; i++){
		this._peers.push(message.peers[i]);
		this.emit('peer-connected', message.peers[i]);
	}

	this._connectionDeferred.resolve(this.self());
	this.emit('open', this._addr);
	this._status = 'opened';
	this._connectionDeferred = null;
};

DiyaNode.prototype._handlePeerConnected = function(message){
	if(message.peerId === undefined){
		Logger.error("Missing arguments for PeerConnected message, dropping...");
		return ;
	}

	//Add peer to the list of reachable peers
	this._peers.push(message.peerId);

	this.emit('peer-connected', message.peerId);
};

DiyaNode.prototype._handlePeerDisconnected = function(message){
	if(message.peerId === undefined){
		Logger.error("Missing arguments for PeerDisconnected Message, dropping...");
		return ;
	}

	//Go through all pending messages and notify the ones that are targeted
	//at the disconnected peer that it disconnected and therefore the command
	//cannot be fulfilled
	for(var messageId in this._pendingMessages){
		var handler = this._getMessageHandler(messageId);
		if(handler && handler.target === message.peerId) {
			this._removeMessage(messageId);
			this._notifyListener(handler, 'PeerDisconnected', null);
		}
	}

	//Remove peer from list of reachable peers
	for(var i=this._peers.length - 1; i >= 0; i--){
		if(this._peers[i] === message.peerId){
			this._peers.splice(i, 1);
			break;
		}
	}

	this.emit('peer-disconnected', message.peerId);
};

DiyaNode.prototype._handleRequest = function(handler, message){
	if(message.type === 'PartialAnswer') {
		if(typeof this._pendingMessages[message.id].callback_partial === 'function') {
			var error = message.error ? message.error : null;
			var data = message.data ? message.data : null;
			this._pendingMessages[message.id].callback_partial(error, data);
		}
	} else {
		this._removeMessage(message.id);
		this._notifyListener(handler, message.error, message.data);
	}
};

DiyaNode.prototype._handleSubscription = function(handler, message){
	//remove subscription if it was closed from node
	if(message.result === "closed") {
		this._removeMessage(message.id);
		message.error = 'SubscriptionClosed';
	}
	this._notifyListener(handler, message.error, message.data ? message.data : null);
};


///////////////////
// SocketHandler //
///////////////////

function SocketHandler(WSocket, addr, timeout) {
	var that = this;
	this.addr = addr;

	if(WSocket) this._WSocket = WSocket;
	else if(!this._WSocket) this._WSocket = window.WebSocket;
	WSocket = this._WSocket;

	this._status = 'opening';

	try {
		this._socket = addr.indexOf("wss://")===0 ? new WSocket(addr, undefined, {rejectUnauthorized:false}) : new WSocket(addr);

		this._socketOpenCallback = this._onopen.bind(this);
		this._socketCloseCallback = this._onclose.bind(this);
		this._socketMessageCallback = this._onmessage.bind(this);
		this._socketErrorCallback = this._onerror.bind(this);

		this._socket.addEventListener('open', this._socketOpenCallback);
		this._socket.addEventListener('close',this._socketCloseCallback);
		this._socket.addEventListener('message', this._socketMessageCallback);
		this._socket.addEventListener('error', this._socketErrorCallback);

		this._socket.addEventListener('error', function(err){
			Logger.error("[WS] error : "+JSON.stringify(err));
			that._socket.close();
		});

		setTimeout(function(){
			if(that._status === 'opened') return;
			if(that._status !== 'closed'){
				Logger.log('d1: ' + that.addr + ' timed out while connecting');
				that.close();
				that.emit('timeout', that._socket);
			}
		}, timeout);

	} catch(e) {
		Logger.error(e.stack);
		that.close();
		throw e;
	}
};
inherits(SocketHandler, EventEmitter);

SocketHandler.prototype.close = function() {
	if(this._disconnectionDeferred && this._disconnectionDeferred.promise) return this._disconnectionDeferred.promise;
	this._disconnectionDeferred = Q.defer();
	this._status = 'closing';
	this.emit('closing', this._socket);
	if(this._socket) this._socket.close();
	return this._disconnectionDeferred.promise;
};

SocketHandler.prototype.send = function(message) {
	try {
		var data = JSON.stringify(message);
	} catch(err) {
		console.error('Cannot serialize message');
		return false;
	}

	try {
		this._socket.send(data);
	} catch(err){
		console.error('Cannot send message');
		console.error(err);
		return false;
	}

	return true;
}

SocketHandler.prototype.isConnected = function() {
	return this._socket.readyState == this._WSocket.OPEN && this._status === 'opened';
};

SocketHandler.prototype._onopen = function() {
	this._status = 'opened';
	this.emit('open', this._socket);
};

SocketHandler.prototype._onclose = function(evt) {
	this._status = 'closed';
	this.unregisterCallbacks();
	this.emit('close', this._socket);
	if(this._disconnectionDeferred && this._disconnectionDeferred.promise) this._disconnectionDeferred.resolve();
};

SocketHandler.prototype._onmessage = function(evt) {
	try {
		var message = JSON.parse(evt.data);
		this.emit('message', message);
	} catch(err){
		Logger.error("[WS] cannot parse message, dropping...");
		throw err;
	}
};

SocketHandler.prototype._onerror = function(evt) {
	this.emit('error', evt);
};

SocketHandler.prototype.unregisterCallbacks = function() {
	if(this._socket && (typeof this._socket.removeEventListener === 'function')){
		this._socket.removeEventListener('open', this._socketOpenCallback);
		this._socket.removeEventListener('close', this._socketCloseCallback);
		this._socket.removeEventListener('message', this._socketMessageCallback);
	} else if(this._socket && (typeof this._socket.removeAllListeners === 'function')){
		this._socket.removeAllListeners();
	}
};

///////////////////////////////////////////////////////////////
////////////////////// Utility methods ////////////////////////
///////////////////////////////////////////////////////////////

DiyaNode.prototype._createMessage = function(params, type){
	if(!params || !type || (type !== "Request" && type !== "Subscription" && type !== "Unsubscribe")){
		return null;
	}

	return {
		type: type,
		id: this._generateId(),
		service: params.service,
		target: params.target,
		func: params.func,
		obj: params.obj,
		data: params.data
	};
};

DiyaNode.prototype._generateId = function(){
	var id = this._nextId;
	this._nextId++;
	return id;
};



module.exports = DiyaNode;

},{"inherits":5,"node-event-emitter":6,"q":undefined}],17:[function(require,module,exports){
var isBrowser = !(typeof window === 'undefined');
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }
var EventEmitter = require('node-event-emitter');
var inherits = require('inherits');

var DiyaNode = require('./DiyaNode');

var IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

//////////////
//  D1 API  //
//////////////



function newInstance () {
	
	var connection = new DiyaNode();	

	var d1inst = function (selector) {
		return new DiyaSelector(selector, connection);
	}

	d1inst.DiyaNode = DiyaNode;
	d1inst.DiyaSelector = DiyaSelector;

	d1inst.connect = function(addr, WSocket){
		return connection.connect(addr, WSocket);
	};

	d1inst.disconnect = function(){
		return connection.disconnect();
	};

	d1inst.isConnected = function() {	return connection.isConnected();};
	d1inst.peers = function() { return connection.peers();};
	d1inst.self = function() { return connection.self(); };
	d1inst.addr = function() { return connection.addr(); };
	d1inst.user = function() { return connection.user(); };
	d1inst.pass = function() { return connection.pass(); };
	d1inst.isAuthenticated = function() { return connection.authenticated(); };

	d1inst.parsePeer = function(addrStr) {
		var peer = {};

		// <nothing> -> wss://localhost/api
		if(!addrStr || addrStr === "") {
			peer.addr = "wss://localhost/api";
			peer.addrNet = "wss://localhost/net";
		}
		// 1234 -> ws://localhost:1234
		else if(/^[0-9]*$/.test(addrStr)) {
			peer.addr = "ws://localhost:"+addrStr;
		}
		// 10.42.0.1 -> wss://10.42.0.1/api
		//          -> wss://10.24.0.1/net
		else if (IP_REGEX.test(addrStr)) {
			peer.addr = "wss://"+addrStr+"/api";
			peer.addrNet = "wss://"+addrStr+"/net";
		}
		// 10.42.0.1:1234 -> ws://10.42.0.1:1234
	       	else if (IP_REGEX.test(addrStr.split(':')[0]) && /^[0-9]*$/.test(addrStr.split(':')[1])) {
			peer.addr = "ws://"+addrStr;
		}
		// wss://someaddress.com/stuff -> wss://someaddress.com/stuff
		// ws://someaddress.com/stuff -> ws://someaddress.com/stuff
		else if (addrStr.indexOf("wss://") === 0 || addrStr.indexOf("ws://") === 0) {
			peer.addr = addrStr;
		} 
		// somedomain/somesite -> "wss://somedomain/somesite/api
		//                     -> "wss://somedomain/somesite/net
		//                     -> somesite
		else if(addrStr.split('/').length === 2) {
			peer.addr = "wss://" + addrStr + '/api';
			peer.addrNet = "wss://" + addrStr + '/net'; 
			peer.name = addrStr.split('/')[1];
		} 
		// somedomain/somesite/api -> "wss://somedomain/somesite/api"
		//                         -> "wss://somedomain/somesite/net"
		//                         -> somesite
		else if(addrStr.split('/').length === 3 && addrStr.split('/')[2] === "api") {
			peer.addr = "wss://"+addrStr;
			peer.addrNet = "wss://"+addrStr.substr(0, addrStr.length - 4);
			peer.name = addrStr.split('/')[1];
		}
		// somesite -> "wss://partnering-cloud.com/somesite/api"
		//          -> "wss://partnering-cloud.com/somesite/net"
		//          -> somesite
		else {
			peer.addr = "wss://partnering-cloud.com/"+addrStr+"/api";
			peer.addrNet = "wss://partnering-cloud.com/"+addrStr+"/net";
			peer.name = addrStr;
		}

		return peer;
	};


	/** Try to connect to the given servers list in the list order, until finding an available one */
	d1inst.tryConnect = function(servers, WSocket){
		var deferred = Q.defer();
		function tc(i) {
			d1inst.connect(servers[i], WSocket).then(function(e){
				return deferred.resolve(servers[i]);
			}).catch(function(e){
				d1inst.disconnect().then(function() {
					i++;
					if(i<servers.length) setTimeout(function() {tc(i);}, 100);
					else return deferred.reject("Timeout");
				});
			});
		}
		tc(0);
		return deferred.promise;
	}

	d1inst.currentServer = function(){
		return connection._addr;
	};

	d1inst.on = function(event, callback){
		connection.on(event, callback);
		return d1inst;
	};

	d1inst.removeListener = function(event, callback){
		connection.removeListener(event, callback);
		return d1inst;
	};

	/** Shorthand function to connect and login with the given (user,password) */
	d1inst.connectAsUser = function(ip, user, password, WSocket) {
		return d1inst.connect(ip, WSocket).then(function(){
			return d1inst("#self").auth(user, password);
		});
	};

	d1inst.deauthenticate = function(){ connection.authenticated(false); connection.user(null); connection.pass(null);};
	d1inst.setSecured = function(bSecured) { connection.setSecured(bSecured); };
	d1inst.isSecured = function() {return connection._secured; }
	d1inst.setWSocket = function(WSocket) { connection.setWSocket(WSocket); }


	/** Self-authenticate the local DiyaNode bound to port <port>, using its RSA signature */
	d1inst.selfConnect = function(port, signature, WSocket) {
		return d1inst.connect('ws://localhost:' + port, WSocket)
		.then(function() {
			var deferred = Q.defer();
			d1inst("#self").request({
				service: 'peerAuth',
				func: 'SelfAuthenticate',
				data: {	signature: signature }
			}, function(peerId, err, data){
				if(err) return deferred.reject(err);
				if(data && data.authenticated){
					connection.authenticated(true);
					connection.user("#DiyaNode#"+peerId);
					deferred.resolve();
				} else {
					connection.authenticated(false);
					deferred.reject('AccessDenied');
				}
			});
			return deferred.promise;
		});
	}

	return d1inst;
}

var d1 = newInstance();
d1.newInstance = newInstance;



//////////////////
// DiyaSelector //
//////////////////

function DiyaSelector(selector, connection){
	EventEmitter.call(this);

	this._connection = connection;
	this._selector = selector;
	this._listenerCount = 0;
	this._listenCallback = null;
	this._callbackAttached = false;
}
inherits(DiyaSelector, EventEmitter);


//////////////////////////////////////////////////////////
////////////////////// Public API ////////////////////////
//////////////////////////////////////////////////////////

DiyaSelector.prototype.select = function() { return this._select(); };



/**
 * Apply callback cb to each selected peer. Peers are selected
 * according to the rule 'selector' given to constructor. Selector can
 * be a peerId, a regEx for peerIds of an array of peerIds.
 * @params 	cb		callback to be applied
 * @return 	this 	<DiyaSelector>
 */
DiyaSelector.prototype.each = function(cb){
	var peers = this._select();
	for(var i=0; i<peers.length; i++) cb.bind(this)(peers[i]);
	return this;
};

/**
 * Send request to selected peers ( see each() ) through the current connection (DiyaNode).
 * @param {String | Object} params : can be service.function or {service:service, func:function, ...}
 */
DiyaSelector.prototype.request = function(params, callback, timeout, options){
	if(!this._connection) return this;
	if(!options) options = {};
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedRequest';
		params = {service:_params[0], func:_params[1]};
	}

	var nbAnswers = 0;
	var nbExpected = this._select().length;
	return this.each(function(peerId){
		params.target = peerId;

		var opts = {};
		for(var i in options) opts[i] = options[i];
		if(typeof opts.callback_partial === 'function') opts.callback_partial = function(err, data){ options.callback_partial(peerId, err, data);}

		this._connection.request(params, function(err, data){
			if(typeof callback === 'function') callback(peerId, err, data);
			nbAnswers++;
			if(nbAnswers == nbExpected && options.bNotifyWhenFinished) callback(null, err, "##END##"); // TODO : Find a better way to notify request END !!
		}, timeout, opts);
	});
};


// IMPORTANT !!! By 30/11/15, this method doesn't return 'this' anymore, but a Subscription object instead
/* @param {String | Object} params : can be 'service.function' or {service:service, func:function, ...} */
DiyaSelector.prototype.subscribe = function(params, callback, options){
	if(params.constructor === String) {
		var _params = params.split(".");
		if(_params.length!=2) throw 'MalformedSubscription';
		params = {service:_params[0], func:_params[1]};
	}

	return new Subscription(this, params, callback, options);
};


// IMPORTANT !!! BY 30/11/15, this method doesn't take subIds as input anymore.
// Please provide a subscription instead !
DiyaSelector.prototype.unsubscribe = function(subscription){
	if(Array.isArray(subscription) || !subscription.close) return this.__old_deprecated_unsubscribe(subscription);
	return subscription.close();
};

DiyaSelector.prototype.auth = function(user, password, callback, timeout){
	var that = this;
	if(typeof callback === 'function') callback = callback.bind(this);

	var deferred = Q.defer();

	this.request({
		service: 'auth',
		func: 'Authenticate',
		data: {
			user: user,
			password: password
		}
	}, function(peerId, err, data){

		if(err === 'ServiceNotFound'){
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.reject(err);
			return ;
		}

		if(!err && data && data.authenticated){
			that._connection.authenticated(true);
			that._connection.user(user);
			that._connection.pass(password);
			if(typeof callback === 'function') callback(peerId, true);
			else deferred.resolve();
		} else {
			that._connection.authenticated(false);
			if(typeof callback === 'function') callback(peerId, false);
			else deferred.reject('AccessDenied');
		}

	}, timeout);

	return deferred.promise;
};



// Privates

DiyaSelector.prototype._select = function(selectorFunction){
	var that = this;

	if(!this._connection) return [];
	return this._connection.peers().filter(function(peerId){
		return that._match(that._selector, peerId);
	});
};

DiyaSelector.prototype._match = function(selector, str){
	if(!selector) return false;
	if(selector === "#self") { return this._connection && str === this._connection.self(); }
	else if(selector.not) return !this._match(selector.not, str);
	else if(selector.constructor.name === 'String'){
		return matchString(selector, str);
	} else if(selector.constructor.name === 'RegExp'){
		return matchRegExp(selector, str);
	} else if(Array.isArray(selector)){
		return matchArray(selector, str);
	}
	return false;
}

function matchString(selector, str){
	return selector === str;
}

function matchRegExp(selector, str){
	return str.match(selector);
}

function matchArray(selector, str){
	for(var i=0;i<selector.length; i++){
		if(selector[i] === str) return true;
	}
	return false;
}

// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._on = DiyaSelector.prototype.on;
DiyaSelector.prototype.on = function(type, callback){
	var that = this;
	callback.___DiyaSelector_hidden_wrapper = function(peerId) {
		if(that._match(that._selector, peerId)) that.emit(type, peerId);
	};
	this._connection.on(type, callback.___DiyaSelector_hidden_wrapper);
	var ret = this._on(type, callback);

	// Handle the specific case of "peer-connected" events, i.e., notify of already connected peers
	if(type === 'peer-connected' && this._connection.isConnected()) {
		var peers = this._connection.peers();
		for(var i=0;i<peers.length; i++) {
			if(this._match(this._selector, peers[i])) callback(peers[i]);
		}
	}
	return ret;
};


// Overrides EventEmitter's behavior to proxy and filter events from the connection
DiyaSelector.prototype._removeListener = DiyaSelector.prototype.removeListener;
DiyaSelector.prototype.removeListener = function(type, callback) {
	if(callback.___DiyaSelector_hidden_wrapper) this._connection.removeListener(type, callback.___DiyaSelector_hidden_wrapper);
	this._removeListener(type, callback);
};



//////////////////
// SUBSCRIPTION //
//////////////////


/**
* Handles a subscription to some DiyaNode service for multiple nodes
* according to the given selector
*/
function Subscription(selector, params, callback, options) {
		var that = this;
		this.selector = selector;
		this.params = params;
		this.callback = callback;
		this.options = options;
		this.subIds = [];

		this.doSubscribe = function(peerId) {
			that.subIds.push(that._addSubscription(peerId));
			that.state = "open";
		};

		if(this.options && this.options.auto) {
			this.selector.on('peer-connected', this.doSubscribe);
		} else {
			this.selector.each(this.doSubscribe);
		}

		return this;
};

Subscription.prototype.close = function() {
	for(var i = 0; i<this.subIds.length; i++) {
		this.selector._connection.unsubscribe(this.subIds[i]);
	}
	this.subIds = [];
	this.selector.removeListener('peer-connected', this.doSubscribe);
	this.state = "closed";
};

Subscription.prototype._addSubscription = function(peerId) {
	var that = this;
	params = {};
	for(var k in this.params) params[k] = this.params[k];
	params.target = peerId;
	var subId = this.selector._connection.subscribe(params, function(err, data){
		that.callback(peerId, err, data);
	});
	if(this.options && Array.isArray(this.options.subIds))
		this.options.subIds[peerId] = subId;
	return subId;
};





// Legacy --------------------------------------------


/** @deprecated  */
DiyaSelector.prototype.listen = function(){};

DiyaSelector.prototype.__old_deprecated_unsubscribe = function(subIds) {
	this.each(function(peerId){
		var subId = subIds[peerId];
		if(subId) this._connection.unsubscribe(subId);
	});
	return this;
}



// -------------------------------------



module.exports = d1;

},{"./DiyaNode":16,"inherits":5,"node-event-emitter":6,"q":undefined}],18:[function(require,module,exports){
var d1 = require('./DiyaSelector.js');

// require('./services/timer/timer.js');
require('./services/rtc/rtc.js');
//require('./services/explorer/explorer.js');
//require('./services/pico/pico.js');
//require('./services/viewer_explorer/viewer_explorer.js');
require('./services/ieq/ieq.js');
//require('./services/networkId/NetworkId.js');
require('./services/maps/maps.js');
require('./services/peerAuth/PeerAuth.js');
require('./services/meshNetwork/MeshNetwork.js');
//require('./services/verbose/Verbose.js');
require('./utils/encoding/encoding.js');
require('./services/status/status.js');

module.exports = d1;

},{"./DiyaSelector.js":17,"./services/ieq/ieq.js":19,"./services/maps/maps.js":20,"./services/meshNetwork/MeshNetwork.js":21,"./services/peerAuth/PeerAuth.js":23,"./services/rtc/rtc.js":24,"./services/status/status.js":25,"./utils/encoding/encoding.js":26}],19:[function(require,module,exports){
/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/**
   Todo :
   check err for each data
   improve API : getData(sensorName, dataConfig)
   return adapted vector for display with D3 to reduce code in IHM ?
   updateData(sensorName, dataConfig)
   set and get for the different dataConfig params

*/

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');


var Message = require('../message');


//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

/**
 *	callback : function called after model updated
 * */
function IEQ(selector){
	var that = this;
	this.selector = selector;
	this.dataModel={};
	this._coder = selector.encode();
	this.subscriptions = [];


	/*** structure of data config ***
		 criteria :
		   time: all 3 time criteria should not be defined at the same time. (range would be given up)
		     start: {[null],time} (null means most recent) // stored a UTC in ms (num)
		     end: {[null], time} (null means most oldest) // stored as UTC in ms (num)
		     range: {[null], time} (range of time(positive) ) // in s (num)
		   robot: {ArrayOf ID or ["all"]}
		   place: {ArrayOf ID or ["all"]}
		 operator: {[last], max, moy, sd} -( maybe moy should be default
		 ...

		 sensors : {[null] or ArrayOf SensorName}

		 sampling: {[null] or int}
	*/
	this.dataConfig = {
		criteria: {
			time: {
				start: null,
				end: null,
				range: null // in s
			},
			robot: null,
			place: null
		},
		operator: 'last',
		sensors: null,
		sampling: null //sampling
	};

	return this;
};

/**
 * Get dataModel :
 * {
 *	"senseurXX": {
 *			data:[FLOAT, ...],
 *			time:[FLOAT, ...],
 *			robot:[FLOAT, ...],
 *			place:[FLOAT, ...],
 *			qualityIndex:[FLOAT, ...],
 *			range: [FLOAT, FLOAT],
 *			unit: string,
 *		label: string
 *		},
 *	 ... ("senseursYY")
 * }
 */
IEQ.prototype.getDataModel = function(){
	return this.dataModel;
};
IEQ.prototype.getDataRange = function(){
	return this.dataModel.range;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {IEQ} this
 * else
 *	 @return {Object} current dataConfig
 */
IEQ.prototype.DataConfig = function(newDataConfig){
	if(newDataConfig) {
		this.dataConfig=newDataConfig;
		return this;
	}
	else
		return this.dataConfig;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-IEQ
 * @param  {String}	 newOperator : {[last], max, moy, sd}
 * @return {IEQ} this - chainable
 * Set operator criteria.
 * Depends on newOperator
 *	@param {String} newOperator
 *	@return this
 * Get operator criteria.
 *	@return {String} operator
 */
IEQ.prototype.DataOperator = function(newOperator){
	if(newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	}
	else
		return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {IEQ} this
 * else
 *	@return {int} number of samples
 **/
IEQ.prototype.DataSampling = function(numSamples){
	if(numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	}
	else
		return this.dataConfig.sampling;
};
/**
 * Set or get data time criteria start and end.
 * If param defined
 *	@param {Date} newTimeStart // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {IEQ} this
 * If no param defined:
 *	@return {Object} Time object: fields start and end.
 */
IEQ.prototype.DataTime = function(newTimeStart,newTimeEnd, newRange){
	if(newTimeStart || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.start = newTimeStart.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	}
	else
		return {
			start: new Date(this.dataConfig.criteria.time.start),
			end: new Date(this.dataConfig.criteria.time.end),
			range: new Date(this.dataConfig.criteria.time.range)
		};
};
/**
 * Depends on robotIds
 * Set robot criteria.
 *	@param {Array[Int]} robotIds list of robot Ids
 * Get robot criteria.
 *	@return {Array[Int]} list of robot Ids
 */
IEQ.prototype.DataRobotIds = function(robotIds){
	if(robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	}
	else
		return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
IEQ.prototype.DataPlaceIds = function(placeIds){
	if(placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	}
	else
		return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */
IEQ.prototype.getDataByName = function(sensorNames){
	var data=[];
	for(var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};
/**
 * Update data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */
IEQ.prototype.updateData = function(callback, dataConfig){
	var that=this;
	if(dataConfig)
		this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "ieq",
		func: "DataRequest",
		data: {
			type:"splReq",
			dataConfig: that.dataConfig
		}
	}, function(dnId, err, data){
		if(err) {
			Logger.error("["+that.dataConfig.sensors+"] Recv err: "+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n"+JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}

		// console.log(data);
		that._getDataModelFromRecv(data);

		// Logger.log(that.getDataModel());

		callback = callback.bind(that); // bind callback with IEQ
		callback(that.getDataModel()); // callback func
	});
};

IEQ.prototype._isDataModelWithNaN = function() {
	var dataModelNaN=false;
	var sensorNan;
	for(var n in this.dataModel) {
		sensorNan = this.dataModel[n].data.reduce(function(nanPres,d) {
			return nanPres && isNaN(d);
		},false);
		dataModelNaN = dataModelNaN && sensorNan;
		Logger.log(n+" with nan : "+sensorNan+" ("+dataModelNaN+") / "+this.dataModel[n].data.length);
	}
};

IEQ.prototype.getConfinementLevel = function(){
	return this.confinement;
};

IEQ.prototype.getAirQualityLevel = function(){
	return this.airQuality;
};

IEQ.prototype.getEnvQualityLevel = function(){
	return this.envQuality;
};



/**
 * Update internal model with received data
 * @param  data to configure subscription
 * @param  callback called on answers (@param : dataModel)
 */
IEQ.prototype.watch = function(data, callback){
	var that = this;
	// console.log("Request: "+JSON.stringify(dataConfig));

	/// TODO
	data = data || {timeRange: 'hours'};

	var subs = this.selector.subscribe({
		service: "ieq",
		func: "Data",
		data: data
	}, function(dnId, err, data){
		if(err) {
			Logger.error("WatchIEQRecvErr:"+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("WatchIEQ:\n"+JSON.stringify(data.header.dataConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}
		// console.log(data);
		that._getDataModelFromRecv(data);

		callback = callback.bind(that); // bind callback with IEQ
		callback(that.getDataModel()); // callback func
	});

	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
IEQ.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions =[];
};

/**
 * request Data to make CSV file
 */
IEQ.prototype.getCSVData = function(sensorNames,_firstDay,callback){
	var firstDay = new Date(_firstDay);
	var dataConfig = {
		criteria: {
			time: { start: firstDay.getTime(), rangeUnit: 'hour', range: 180}, // 360h -> 15d // 180h -> 7j
			places: [],
			robots: []
		},
		sensors: sensorNames
	};

	this.updateData(callback, dataConfig);
};


/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
IEQ.prototype._getDataModelFromRecv = function(data){
	var dataModel=null;

	if(data.err && data.err.st>0) {
		Logger.error(data.err.msg);
		return null;
	}
	delete data.err;
	if(data && data.header) {
		for (var n in data) {
			if(n != "header" && n != "err") {

				if(data[n].err && data[n].err.st>0) {
					Logger.error(n+" was in error: "+data[n].err.msg);
					continue;
				}

				if(!dataModel)
					dataModel={};

				// Logger.log(n);
				if(!dataModel[n]) {
					dataModel[n]={};
				}
				/* update data absolute range */
				dataModel[n].range=data[n].range;
				/* update data range */
				dataModel[n].timeRange=data[n].timeRange;
				/* update data label */
				dataModel[n].label=data[n].label;
				/* update data unit */
				dataModel[n].unit=data[n].unit;

				/* suggested y display range */
				dataModel[n].zoomRange = [0, 100];

				/* update data indexRange */
				dataModel[n].qualityConfig={
					/* confortRange: data[n].confortRange, */
					indexRange: data[n].indexRange
				};
				dataModel[n].time = this._coder.from(data[n].time,'b64',8);
				dataModel[n].data = (data[n].data?this._coder.from(data[n].data,'b64',4):(data[n].avg?this._coder.from(data[n].avg.d,'b64',4):null));
				dataModel[n].qualityIndex = (data[n].data?this._coder.from(data[n].index,'b64',4):(data[n].avg?this._coder.from(data[n].avg.i,'b64',4):null));
				dataModel[n].robotId = this._coder.from(data[n].robotId,'b64',4);
				if(dataModel[n].robotId) {
					/** dico robotId -> robotName **/
					var dicoRobot = {};
					data.header.robots.forEach(function(el) {
						dicoRobot[el.id]=el.name;
					});
					dataModel[n].robotId = dataModel[n].robotId.map(function(el) {
						return dicoRobot[el];
					});
				}

				dataModel[n].placeId = this._coder.from(data[n].placeId,'b64',4);
				dataModel[n].x = null;
				dataModel[n].y = null;

				if(data[n].avg)
					dataModel[n].avg = {
						d: this._coder.from(data[n].avg.d,'b64',4),
						i: this._coder.from(data[n].avg.i,'b64',4)
					};
				if(data[n].min)
					dataModel[n].min = {
						d: this._coder.from(data[n].min.d,'b64',4),
						i: this._coder.from(data[n].min.i,'b64',4)
					};
				if(data[n].max)
					dataModel[n].max = {
						d: this._coder.from(data[n].max.d,'b64',4),
						i: this._coder.from(data[n].max.i,'b64',4)
					};
				if(data[n].stddev)
					dataModel[n].stddev = {
						d: this._coder.from(data[n].stddev.d,'b64',4),
						i: this._coder.from(data[n].stddev.i,'b64',4)
					};
				if(data[n].stddev)
					dataModel[n].stddev = {
						d: this._coder.from(data[n].stddev.d,'b64',4),
						i: this._coder.from(data[n].stddev.i,'b64',4)
					};
				if(data[n].x)
					dataModel[n].x = this._coder.from(data[n].x,'b64',4);
				if(data[n].y)
					dataModel[n].y = this._coder.from(data[n].y,'b64',4);
				/**
				 * current quality : {'b'ad, 'm'edium, 'g'ood}
				 * evolution : {'u'p, 'd'own, 's'table}
				 * evolution quality : {'b'etter, 'w'orse, 's'ame}
				 */
				/// TODO
				dataModel[n].trend = 'mss';
			}
		}
	}
	else {
		Logger.error("No Data to read or header is missing !");
	}
	/** list robots **/
//	dataModel.robots = [{name: 'D2R2', id:1}];
	this.dataModel=dataModel;
	return dataModel;
};





/** create IEQ service **/
DiyaSelector.prototype.IEQ = function(){
	return new IEQ(this);
};

},{"../../DiyaSelector":17,"../message":22,"util":4}],20:[function(require,module,exports){
EventEmitter = require('node-event-emitter');

function LOG(msg){
	//console.log(msg);
}

/**
 * Constructor
 *
 * @param map {String} map's name
 */
function Maps(peerIds) {


	this._peerIds = JSON.parse(JSON.stringify(peerIds));
	this._subIds = {}; // list of subscription Id (for unsubscription purpose) e.g {peerId0: subId0, ...}

	// list of registered place by Diya
	this._diyas = {};

	// get a list of Diya from selector and sort it
	this.listDiya = this._peerIds;
}
inherits(Maps, EventEmitter);

/////////////////////////////////////////
//// Static functions ///////////////////
/////////////////////////////////////////


/**
 * static function, get current place from diyanode
 *
 * @param selector {RegExp/String/Array<String>} selector of DiyaNode (also robot)
 * @param map {String} map's name
 * @param func {function()} callback function with return peerId, error and data ({ mapId, label, neuronId,  x, y})
 */
DiyaSelector.prototype.getCurrentPlace = function( peerId, func) {
	this.request({
		service: 'maps',
		func: 'GetCurrentPlace',
		obj: [ peerId ]
	}, function(peerId, err, data) {
		func(peerId, err, data);
	});
};

////////////////////∕∕∕∕∕∕/////////////////////////////////////////////∕∕∕∕∕∕///
//// Internal functions ///////////////////////////////////////////////∕∕∕∕∕∕///
////////////////////∕∕∕∕∕∕/////////////////////////////////////////////∕∕∕∕∕∕///

/**
 * round float to six decimals to compare, as the number in js is encoded in
 * IEEE 754 standard ~ around 16 decimal digits precision, we limit to 6 for
 * easier comparision and error due to arithmetic operation
 */
Maps.prototype._round = function (val) {
	// rouding to six decimals
	return Math.round(parseFloat(val) * 1000000) / 1000000;
};

/**
 * check equal with rounding
 */
Maps.prototype._isFloatEqual = function (val1, val2) {
	// rouding to two decimals
	return this._round(val1) === this._round(val2);
};

/**
 * check if map is modified by compare with internal list
 */
Maps.prototype.mapIsModified = function(peerId, map_info) {
	// double check
	map_info.scale = Array.isArray(map_info.scale) ? map_info.scale[0] : map_info.scale

	// ugly code but quick compare to loop
	return !(this._isFloatEqual(this._diyas[peerId].path.scale, map_info.scale) &&
				this._isFloatEqual(this._diyas[peerId].path.rotate, map_info.rotate) &&
				this._isFloatEqual(this._diyas[peerId].path.translate[0], map_info.translate[0]) &&
				this._isFloatEqual(this._diyas[peerId].path.translate[1], map_info.translate[1]) &&
				this._isFloatEqual(this._diyas[peerId].path.ratio, map_info.ratio));
}

/**
 * check if place is modified by compare with internal list
 */
Maps.prototype.placeIsModified = function(peerId, place_info) {
	// ugly code but quick compare to loop
	return !(this._isFloatEqual(this._diyas[peerId].places[place_info.id].x, place_info.x) &&
				this._isFloatEqual(this._diyas[peerId].places[place_info.id].y, place_info.y));
}

// /**
//  * add a Diya when selector changed and had new Diya
//  *
//  * @param peerId {String} peerId of DiyaNode (also robot)
//  * @param color {d3_rgb} d3 color
//  */
// Maps.prototype.addPeer = function(peerId) {
// 	this._diyas[peerId] = {
// 		mapId: null,
// 		path: null, // {translate: [], scale: null, rotate: null},
// 		places: {},
// 		mapIsModified: false,
// 	};
// }

/**
 * remove a Diya when there is a problem in listen map (subscription)
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 */
Maps.prototype.removePeer = function(peerId) {
	if (this._diyas[peerId]) {
		// remove
		delete this._diyas[peerId];
		this.emit("peer-unsubscribed", peerId);
	}

	// neccessary? if diyanode reconnect?
	if (this._subIds[peerId] !== null && !isNaN(this._subIds[peerId])) {
		// existed subscription ??
		// unsubscribe
		d1(peerId).unsubscribe(this._subIds);
		delete this._subIds[peerId];
	}
};

/**
 * connect to service map
 */
Maps.prototype.connect = function() {
	var that = this;
	// options for subscription
	var options = {
		auto: true, // auto resubscribe?
		subIds: [] // in fact, it is a list, but the code in DiyaSelector check for array
	};

	// subscribe for map service
	this.subMap = d1("#self").subscribe({
		service: 'maps',
		func: 'Robots',
		obj: this._peerIds
	}, function(peerId, err, data) {
		if (err || data.error) {
			LOG("Maps: fail to get info from map, error:", err || data.error, "!"); // mostly PeerDisconnected

			// remove that peer
			//that.removePeer(peerId);//...
			return;
		}

		if (data == null) return ;

		peerId = data.peerId;

		if(!peerId){
			LOG("Maps: received info without a peerId");
			return ;
		}

		if (!Array.isArray(data.places)) { // winner, this isn't 1st message
			data.places = [];
		}

		// data.place is current place
		if (data.place !== undefined) {
			data.places.push(data.place); // may be null ...
		}

		var map_info = null, places_info = [];

		if(data.type === 'MapInfo'){
			// data : {id, name, places, rotate, scale, tx, ty, ratio}
			if (that._diyas[peerId] == null) {
				that._diyas[peerId] = {
					path: {
						translate: [data.tx, data.ty],
						scale: data.scale,
						rotate: data.rotate,
						ratio: data.ratio
					},
					places: {}
				};
			} else {
				if (that._diyas[peerId].path == null) {
					that._diyas[peerId].path = {};
				}
				that._diyas[peerId].path.translate = [data.tx, data.ty];
				that._diyas[peerId].path.scale = data.scale;
				that._diyas[peerId].path.rotate = data.rotate;
				that._diyas[peerId].path.ratio = data.ratio;
				if (that._diyas[peerId].places == null) {
					that._diyas[peerId].places = {};
				}
			}
			map_info = {
				id: data.id,
				name: data.name,
				rotate: data.rotate,
				scale: data.scale,
				translate: [data.tx, data.ty],
				ratio: data.ratio
			};
		}

		// save data values
		data.places.map(function(place) {
			if (place) { // null if currentplace isn't init in DiyaNode
				// place { mapId, label, neuronId,  x, y}

				// neuronId (also place 's Id)
				var id = place.neuronId;

				// Update internal list
				// convert from Diya parameter (0..1 km) to diya-map (0..100000)
				place = {
					id: id,
					label: place.label,
					x: place.x,
					y: place.y,
					t: 360 * place.t
				};

				if (that._diyas[peerId].places[id] == null) { // nonexistent place
					// if is null or undefined
					that._diyas[peerId].places[id] = place; // save it
				}

				places_info.push(Object.create(place));// create a copy to send to user

				// save base place (first known place, also first element of places array)
				// useless at the moment
				// if (!that._diyas[peerId].basePlace) that._diyas[peerId].basePlace = place;
			} else { // current place is null
				places_info.push(null);
			}
		});

		if (places_info.length === 0) places_info = null;

		that.emit("peer-subscribed",peerId, map_info, places_info);
	}, options);

	for (var peerId in options.subIds) {
		if (this._subIds[peerId] !== null && !isNaN(this._subIds[peerId])) {
			// existed subscription ??
			d1("#self").unsubscribe(this._subIds)
			delete this._subIds[peerId];
			LOG("Maps: bug: existed subscription ??")
		} else {
			// save subId for later unsubscription
			this._subIds[peerId] = options.subIds[peerId];
		}
	}

	return this;
}

/**
 * disconnect from service map, free everything so it is safe to garbage collecte this service
 */
Maps.prototype.disconnect = function() {
	var that = this;
	if(this.subMap)
		this.subMap.close();
	for(var peerId in this._diyas){
		that.emit("peer-unsubscribed", peerId);
	}
	this._diyas = {};// delete ?
}

/**
 * save map
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param map_info {Object} ({rotate, scale, translate})
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.saveMap = function (targetPeerId, map_info, cb) {
	var _map_info = Object.create(map_info); // create a duplicate of map_info
	var that = this;
	// save map's info
	_map_info.scale = Array.isArray(_map_info.scale) ? _map_info.scale[0] : _map_info.scale

	if (this.mapIsModified(targetPeerId, _map_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdateMap',
			obj: [ targetPeerId ],
			data: {
				scale: _map_info.scale,
				tx: _map_info.translate[0],
				ty: _map_info.translate[1],
				rotate: _map_info.rotate,
				ratio: _map_info.ratio
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[targetPeerId].path.scale = _map_info.scale;
				that._diyas[targetPeerId].path.rotate = _map_info.rotate;
				that._diyas[targetPeerId].path.translate[0] = _map_info.translate[0];
				that._diyas[targetPeerId].path.translate[1] = _map_info.translate[1];
			}
			if (cb) cb(err);
		});
	} else {
		if (cb) cb(new Error("No change to map '" + this._map + "'!"));
	}
}

/**
 * update every places
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param place_info {Object} ({ id, x, y})
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.savePlace = function (targetPeerId, place_info, cb) {
	// save map's info
	var that = this;
	var error = "";

	var _place_info = Object.create(place_info);

	// save place
	if (this.placeIsModified(targetPeerId, _place_info)) {
		d1("#self").request({
			service: 'maps',
			func: 'UpdatePlace',
			obj: [ targetPeerId ],
			data: {
				neuronId: _place_info.id,
				x: _place_info.x,
				y: _place_info.y
			}
		}, function(peerId, err, data) {
			if (err != null) {
				that._diyas[targetPeerId].places[_place_info.id].x = _place_info.x;
				that._diyas[targetPeerId].places[_place_info.id].y = _place_info.y;
			}
			if (cb) cb(err);
		});
	} else {
		if (cb) cb(new Error("No change to place n " + _place_info.id + "!"));
	}
}

/**
 * delete every saved places of Diya (choosen in selector)
 *
 * @param peerId {String} peerId of DiyaNode (also robot)
 * @param cb {Function} callback with error as argument
 */
Maps.prototype.clearPlaces = function(targetPeerId, cb) {
	var that = this;

	d1("#self").request({
		service: 'maps',
		func: 'ClearMap',
		obj: [ targetPeerId ]
	}, function(peerId, err, data) {
		if (err != null) {
			// delete from internal list
			that._diyas[targetPeerId].places = {};
		}
		if (cb) cb(err);
	});
}

// export it as module of DiyaSelector
DiyaSelector.prototype.maps = function(peerIds) {
	var maps = new Maps(peerIds);

	return maps;
}

},{"node-event-emitter":6}],21:[function(require,module,exports){
var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var isBrowser = !(typeof window === 'undefined');
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }


d1.knownPeers = function() {
	return d1("#self").knownPeers();
};
d1.kp = d1.knownPeers;



DiyaSelector.prototype.knownPeers = function(callback) {
	var deferred = Q.defer();
	this.request({service: 'meshNetwork',func: 'ListKnownPeers'}, function(peerId, err, data){
		if(err) return deferred.reject(err);
		var peers = [];
		for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
		return deferred.resolve(peers);
	});
	return deferred.promise;
}



d1.listenMeshNetwork = function(callback) {
	return d1(/.*/).subscribe({ service: 'meshNetwork', func: 'MeshNetwork' }, callback, {auto: true});
};

},{"../../DiyaSelector":17,"q":undefined}],22:[function(require,module,exports){
/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */



function Message(service, func, obj, permanent){

	this.service = service;
	this.func = func;
	this.obj = obj;
	
	this.permanent = permanent; //If this flag is on, the command will stay on the callback list listening for events
}

Message.buildSignature = function(msg){
	return msg.service+'.'+msg.func+'.'+msg.obj;
}


Message.prototype.signature = function(){
	return this.service+'.'+this.func+'.'+this.obj;
}

Message.prototype.exec = function(data){
	return {
		service: this.service,
		func: this.func,
		obj: this.obj,
		data: data
	}
}

module.exports = Message;

},{}],23:[function(require,module,exports){
var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');
var isBrowser = !(typeof window === 'undefined');
if(!isBrowser) { var Q = require('q'); }
else { var Q = window.Q; }

if(typeof INFO === 'undefined') INFO = function(s) { console.log(s);}
if(typeof OK === 'undefined') OK = function(s) { console.log(s);}



/**
* Installs a new DiyaNode device (with address 'ip') into an existing network, by
* contacting an existing DiyaNode device with address 'bootstrap_ip' :
*   1) Contact the new node to get its public key
*   2) Add this public key to the existing node TrustedPeers list
*   3) Add the existing node's public key to the new node's TrustedPeers list
*   4) Ask the new node to join the network by calling @see{d1().join()}
*
* NOTE : This operation requires the given user to have root role on both nodes
*
* @param ip : the IP address of the new device
* @param user : a username with root role on the new device
* @param password : the password for 'user'
* @param bootstrap_ip : the IP address of the bootstrap device
* @param bootstrap_user : a user identifier with root role on the boostrap device
* @param bootstrap_password : the password for 'bootstrap_user'
* @param bootstrap_net : the IP address where the new device will connect to the boostrap one
* @param callback : of the form callback(new_peer_name,bootstrap_peer_name, err, data)
*/
d1.installNodeExt = function(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback) {
	if(typeof ip !== 'string') throw "[installNode] ip should be an IP address";
	if(typeof bootstrap_ip !== 'string') throw "[installNode] bootstrap_ip should be an IP address";
	if(typeof bootstrap_net !== 'string') throw "[installNode] bootstrap_net should be an IP address";


	// Check and Format URI (FQDN)
	if(bootstrap_ip.indexOf("ws://") !== 0 && bootstrap_ip.indexOf("wss://") !== 0) {
		if(d1.isSecured()) bootstrap_ip = "wss://" + bootstrap_ip;
		else bootstrap_ip = "ws://" + bootstrap_ip;
	}
	if(bootstrap_net.indexOf("ws://") !== 0 && bootstrap_net.indexOf("wss://") !== 0) {
		if(d1.isSecured()) bootstrap_net = "wss://" + bootstrap_net;
		else bootstrap_net = "ws://" + bootstrap_net;
	}



	function join(peer, bootstrap_peer) {
		d1("#self").join(bootstrap_net, true, function(peer, err, data){
			if(!err) OK("JOINED !!!");
			return callback(peer, bootstrap_peer, err, data);
		});
	}

	d1.connectAsUser(ip, user, password).then(function(peer, err, data){
		d1("#self").givePublicKey(function(peer, err, data) {
			if(err==='ServiceNotFound') {
				INFO("Peer Authentication disabled ... directly joining");
				join();
				return;
			}
			else if(err) return callback(peer, null, err, null);
			else {
				INFO("Add trusted peer " + peer + "(ip=" + ip + ") to " + bootstrap_ip + " with public key " + data.public_key.slice(0,20));
				d1.connectAsUser(bootstrap_ip, bootstrap_user, bootstrap_password).then(function(){
					d1("#self").addTrustedPeer(peer, data.public_key, function(bootstrap_peer, err, data) {

						if(err) return callback(peer, bootstrap_peer, err, null);
						if(data.alreadyTrusted) INFO(peer + " already trusted by " + bootstrap_peer);
						else INFO(bootstrap_peer + "(ip="+ bootstrap_ip +") added " + peer + "(ip=" + ip + ") as a Trusted Peer");

						INFO("In return, add " + bootstrap_peer + " to " + peer + " as a Trusted Peer with public key " + data.public_key.slice(0,20));
						d1.connectAsUser(ip, user, password).then(function(){
							d1("#self").addTrustedPeer(bootstrap_peer, data.public_key, function(peer, err, data) {
								if(err) callback(peer, bootstrap_peer, err, null);
								else if(data.alreadyTrusted) INFO(bootstrap_peer + " already trusted by " + peer);
								else INFO(peer + "(ip="+ ip +") added " + bootstrap_peer + "(ip="+ bootstrap_ip +") as a Trusted Peer");
								// Once Keys have been exchanged ask to join the network
								OK("KEYS OK ! Now, let "+peer+"(ip="+ip+") join the network via "+bootstrap_peer+"(ip="+bootstrap_net+") ...");
								return join(peer, bootstrap_peer);
							});
						});
					});
				});
			}
		});
	});
}


/** Short version of @see{d1.installNodeExt} */
d1.installNode = function(bootstrap_ip, bootstrap_net, callback) {
		var ip = d1.addr();
		var user = d1.user();
		var password = d1.pass();
		var bootstrap_user = user;
		var bootstrap_password = password;
		return d1.installNodeExt(ip, user, password, bootstrap_ip, bootstrap_user, bootstrap_password, bootstrap_net, callback);
}




/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to contact to join the Network
 * @param bPermanent : if true, permanently add the bootstrap peers as automatic bootstrap peers for the selected nodes.
 *
 */
DiyaSelector.prototype.join = function(bootstrap_ips, bPermanent, callback){
	if(typeof bootstrap_ips === 'string') bootstrap_ips = [ bootstrap_ips ];
	if(bootstrap_ips.constructor !== Array) throw "join() : bootstrap_ips should be an array of peers URIs";
	this.request(
		{service : 'meshNetwork', func: 'Join', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent }},
		function(peerId, err, data) { if(typeof callback === "function") callback(peerId, err, data);}
	);
};


/**
 * Disconnect the selected DiyaNodes from the given bootstrap peers
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to leave
 * @param bPermanent : if true, permanently remove the given peers from the automatic bootstrap peers list
 *
 */
DiyaSelector.prototype.leave = function(bootstrap_ips, bPermanent, callback){
	if(typeof bootstrap_ips === 'string') bootstrap_ips = [ bootstrap_ips ];
	if(bootstrap_ips.constructor !== Array) throw "leave() : bootstrap_ips should be an array of peers URIs";
	this.request(
		{service : 'meshNetwork', func: 'Leave', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent }},
		function(peerId, err, data) { if(typeof callback === "function") callback(peerId, err, data);}
	);
};


/**
 * Ask the selected DiyaNodes for their public keys
 */
DiyaSelector.prototype.givePublicKey = function(callback){
	return this.request(
		{ service: 'peerAuth',	func: 'GivePublicKey',	data: {} },
		function(peerId, err, data){callback(peerId,err,data);
	});
};

/**
 * Add a new trusted peer RSA public key to the selected DiyaNodes
 * NOTE : This operation requires root role
 *
 * @param name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function(name, public_key, callback){
	return this.request({ service: 'peerAuth',	func: 'AddTrustedPeer',	data: { name: name, public_key: public_key }},
		function(peerId,err,data){callback(peerId,err,data);}
	);
};


/**
 * Check if the selected DiyaNodes trust the given peers
 * @param peers : an array of peer names
 */
DiyaSelector.prototype.areTrusted = function(peers, callback){
	return this.request(
		{ service: 'peerAuth',	func: 'AreTrusted',	data: { peers: peers } },
		function(peerId, err, data) {
			var allTrusted = data.trusted;
			if(allTrusted) { OK(peers + " are trusted by " + peerId); callback(peerId, true); }
			else { ERR("Some peers in " + peers + " are untrusted by " + peerId); callback(peerId, false); }
		}
	);
};
DiyaSelector.prototype.isTrusted = function(peer, callback) { return this.areTrusted([peer], callback); }


d1.trustedPeers = function() {
	var deferred = Q.defer();
	d1("#self").request(
		{ service: 'peerAuth',	func: 'GetTrustedPeers' },
		function(peerId, err, data) {
			if(err) return deferred.reject(err);
			var peers = [];
			for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
			return deferred.resolve(peers);
		}
	);
	return deferred.promise;
};
d1.tp = d1.trustedPeers; // Shorthand

d1.blacklistedPeers = function() {
	var deferred = Q.defer();
	d1("#self").request(
		{ service: 'peerAuth',	func: 'GetBlacklistedPeers' },
		function(peerId, err, data) {
			if(err) return deferred.reject(err);
			var peers = [];
			for(var i=0; i<data.peers.length; i++) peers.push(data.peers[i].name);
			return deferred.resolve(peers);
		}
	);
	return deferred.promise;
};
d1.bp = d1.blacklistedPeers; // Shorthand

},{"../../DiyaSelector":17,"q":undefined}],24:[function(require,module,exports){
DiyaSelector = require('../../DiyaSelector').DiyaSelector;
EventEmitter = require('node-event-emitter');
inherits = require('inherits');

require('webrtc-adapter');

/*if(typeof window !== 'undefined'){
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
}*/




/////////////
// CHANNEL //
/////////////

/** Handles a RTC channel (datachannel and/or stream) to a DiyaNode peer
 *  @param dnId : the DiyaNode peerId
 *  @param name : the channel's name
 *  @param datachannel_cb : callback called when a RTC datachannel is open for this channel
 *  @param stream_cb : callback called when a RTC stream is open for this channel
 */
function Channel(dnId, name, datachannel_cb, stream_cb) {
	EventEmitter.call(this);
	this.name = name;
	this.dnId = dnId;

	this.frequency = 20;

	this.channel = undefined;
	this.stream = undefined;
	this.ondatachannel = datachannel_cb;
	this.onstream = stream_cb;
	this.closed = false;
}
inherits(Channel, EventEmitter);

/** Bind an incoming RTC datachannel to this channel */
Channel.prototype.setDataChannel = function(datachannel){
	var that = this;
	this.channel = datachannel;
	this.channel.binaryType = 'arraybuffer';
	console.log("set data channel :"+this.name);
	datachannel.onmessage = function(message){
		// First message carries channel description header
		var view = new DataView(message.data);

		var typeChar = String.fromCharCode(view.getUint8(0));
		if(typeChar === 'O') that.type = 'input'; //Promethe Output = Client Input
		else if(typeChar === 'I') that.type = 'output'; //Promethe Input = Client Output
		else throw "Unrecnognized channel type : " + typeChar;

		var size = view.getInt32(1,true);
		if(!size) throw "Wrong datachannel message size";
		that.size = size;
		that._buffer = new Float32Array(size);

		// Subsequent messages are forwarded to appropriate handlers
		datachannel.onmessage = that._onMessage.bind(that);
		datachannel.onclose = that._onClose.bind(that);

		if(typeof that.ondatachannel === 'function') that.ondatachannel(that.dnId, that);

		console.log('Open datachannel '+that.name);
	}
};

/** Bind an incoming RTC stream to this channel */
Channel.prototype.onAddStream = function(stream) {
	this.stream = stream;
	if(typeof this.onstream === 'function') this.onstream(this.dnId, stream);
	else console.warn("Ignore stream " + stream.id);

	console.log('Open stream '+this.name);
};


/** Close this channel */
Channel.prototype.close = function(){
	this.closed = true;
};

/** Write a scalar value to the given index on the RTC datachannel */
Channel.prototype.write = function(index, value){
	if(index < 0 || index > this.size || isNaN(value)) return false;
	this._buffer[index] = value;
	this._requestSend();
	return true;
};

/** Write an array of values to the RTC datachannel */
Channel.prototype.writeAll = function(values){
	if(!Array.isArray(values) || values.length !== this.size)
        return false;

    for (var i = 0; i<values.length; i++){
        if(isNaN(values[i])) return false;
        this._buffer[i] = values[i];
    }
    this._requestSend();
};

/** Ask to send the internal data buffer through the datachannel at the defined frequency */
Channel.prototype._requestSend = function(){
	var that = this;

	var elapsedTime = new Date().getTime() - this._lastSendTimestamp;
	var period = 1000 / this.frequency;
	if(elapsedTime >= period) doSend();
	else if(!this._sendRequested) {
		this._sendRequested = true;
		setTimeout(doSend, period - elapsedTime);
	}

	function doSend() {
		that._sendRequested = false;
		that._lastSendTimestamp = new Date().getTime();
		var ret = that._send(that._buffer);
		//If autosend is set, automatically send buffer at the given frequency
		if(ret && that.autosend) that._requestSend();
	}
};

/** Actual send the internal data buffer through the RTC datachannel */
Channel.prototype._send = function(msg){
	if(this.closed || !this.channel) return false;
	else if(this.channel.readyState === 'open') {
		try {
			this.channel.send(msg);
		} catch(e) {
			console.log('[rtc.channel.write] exception occured while sending data');
		}
		return true;
	}
	else {
		console.log('[rtc.channel.write] warning : webrtc datachannel state = '+this.channel.readyState);
		return false;
	}
};

/** Called when a message is received from the channel's RTC datachannel */
Channel.prototype._onMessage = function(message) {
	var valArray = new Float32Array(message.data);
	this.emit('value', valArray);
};

/** Called when the channel is closed on the remote side */
Channel.prototype._onClose = function() {
	console.log('Close datachannel '+this.name);
	this.emit('close');
};


//////////////////////////////////////////////////////////////////
///////////////////// RTC Peer implementation ////////////////////
//////////////////////////////////////////////////////////////////

/**
 * An RTC Peer associated to a single (DiyaNode peerId, promId) couple.
 * @param dnId : The DiyaNode peerId
 * @param rtc : The RTC diya-sdk instance
 * @param id : the promId
 * @param channels : an array of RTC channel names to open
 */
function Peer(dnId, rtc, id, channels){
	this.dn = d1(dnId);
	this.dnId = dnId;
	this.id = id;
	this.channels = channels;
	this.rtc = rtc;
	this.peer = null;

	this.streams = [];

	this.connected = false;
	this.closed = false;

	this._connect();
}

/** Initiate a RTC connection to this Peer */
Peer.prototype._connect = function(){
	var that = this;

	this.subscription = this.dn.subscribe({
		service: 'rtc', func: 'Connect', obj: this.channels, data: { promID: this.id }
	}, function(diya, err, data){
		if(data) {
			if(data.eventType === 'TurnInfo') that._turninfo = data.turn;
			else if(data.eventType === 'RemoteOffer') that._createPeer(data);
			else if(data.eventType === 'RemoteICECandidate') that._addRemoteICECandidate(data);
		}
	});

	this._timeoutId = setTimeout(function(){ if(!that.connected && !that.closed) that._reconnect(); }, 40000);
};

/** Reconnects the RTC peer */
Peer.prototype._reconnect = function(){
	this.close();

	this.peer = null;
	this.connected = false;
	this.closed = false;

	this._connect();
};


/** Creates a RTCPeerConnection in response to a RemoteOffer */
Peer.prototype._createPeer = function(data){
	var that = this;

	var iceServers = [];
	if(this._turninfo) {
		iceServers.push({ urls: [ this._turninfo.url ], username: this._turninfo.username, credential: this._turninfo.password });
	} else {
		iceServers.push({urls: [ "stun:stun.l.google.com:19302" ]});
	}
	
	var config = {
		iceServers: iceServers,
		iceTransportPolicy: 'all'	
	};

	var constraints = {
		mandatory: {DtlsSrtpKeyAgreement: true, OfferToReceiveAudio: true, OfferToReceiveVideo:true}
	}
	
	console.log(config);
	console.log(constraints);

	var peer = new RTCPeerConnection(config,  constraints);
	this.peer = peer;

	this.streams.forEach(function(s) {
		peer.addStream(s);
	});

	peer.setRemoteDescription(new RTCSessionDescription({sdp: data.sdp, type: data.type}));

	peer.createAnswer(function(session_description){
		peer.setLocalDescription(session_description);

		that.dn.request({
			service: 'rtc',
			func: 'Answer',
			data: {
				promID: data.promID,
				peerId: data.peerId,
				sdp: session_description.sdp,
				type: session_description.type
			}
		});
	},
	function(err){ console.log(err); },
	{'mandatory': { OfferToReceiveAudio: true, OfferToReceiveVideo: true}});

	peer.oniceconnectionstatechange = function(){
		if(peer.iceConnectionState === 'connected'){
			that.connected = true;
			if(that.subscription) that.subscription.close();
		}
		else if(peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'closed' || peer.iceConnectionState === 'failed'){
			if(!that.closed) that._reconnect();
		}
	};

	peer.onicecandidate = function(evt){
		that.dn.request({
			service: 'rtc',
			func: 'ICECandidate',
			data: {
				peerId: data.peerId,
				promID: that.id,
				candidate: evt.candidate
			}
		});
	};

	peer.ondatachannel = function(evt){
		that.connected = true;
		that.rtc._onDataChannel(that.dnId, evt.channel);
	};

	peer.onaddstream = function(evt) {
		that.connected = true;
		that.rtc._onAddStream(that.dnId, evt.stream);
	};
};


Peer.prototype._addRemoteICECandidate = function(data){
	try {
		//console.log('remote ice :');
		//console.log(data.candidate.candidate);
		var candidate = new RTCIceCandidate(data.candidate);
		this.peer.addIceCandidate(candidate, function(){},function(err){ console.error(err);	});
	} catch(err) { console.error(err); }
};

/** Send the mappings from channel names to stream IDs */
Peer.prototype.sendChannelsStreamsMappings = function() {
	this.dn.request({
		service:"rtc",
		func:"ChannelsStreamsMappings",
		data:{peerId:0, mappings:this.rtc[this.dnId].channelsByStream}
	}, function(peerId, err, data){
		if(err) console.error(err);
	});
};

/** Adds a local stream to this Peer */
Peer.prototype.addStream = function(stream) {
	this.sendChannelsStreamsMappings();
	if(!this.streams.filter(function(s){return stream.id === s;})[0]) this.streams.push(stream);
	this._reconnect();
}

Peer.prototype.removeStream = function(stream) {
	this.streams = this.streams.filter(function(s){return stream.id !== s;});
	if(this.peer) this.peer.removeStream(stream);
}

Peer.prototype.close = function(){
	if(this.subscription) this.subscription.close();
	clearTimeout(this._timeoutId);
	if(this.peer){
		try{
			this.peer.close();
		}catch(e){}
		this.connected = false;
		this.closed = true;
	}
};




//////////////////////////////////////////////////////////////////////////////
/////////////////////////// RTC service implementation ///////////////////////
//////////////////////////////////////////////////////////////////////////////



function RTC(selector){
	var that = this;
	this.selector = selector;

	this.requestedChannels = [];
	this.channelsByStream = [];
}

RTC.prototype.use = function(name_regex, type, ondatachannel_callback, onaddstream_callback){
	this.requestedChannels.push({regex: name_regex, type:type, cb: ondatachannel_callback, stream_cb: onaddstream_callback});
	return this;
};

/** Start listening to Peers connections.
 * A 'Peer' object will be created for each DiyaNode peerId and each promID
 */
RTC.prototype.connect = function(){
	var that = this;


	this.subscription = this.selector.subscribe({
		service: 'rtc',
		func: 'Peers'
	}, function(dnId, err, data){

		if(!that[dnId]) that._createDiyaNode(dnId);

		if(err === 'SubscriptionClosed' || err === 'PeerDisconnected'){
			that._closeDiyaNode(dnId);
			return ;
		}

		if(data && data.eventType && data.promID !== undefined){

			if(data.eventType === 'PeerConnected'){
				if(!that[dnId].peers[data.promID]){
					var channels = that._matchChannels(dnId, data.channels);
					if(channels.length > 0){
						that[dnId].peers[data.promID] = new Peer(dnId, that, data.promID, channels);
					}

					// Autoreconnect declared streams
					that.channelsByStream.forEach(function(cbs) {
						that.addStream(cbs.channel, cbs.mediaStream);
					});
				}
				if(that[dnId].peers[data.promID]) that[dnId].peers[data.promID].sendChannelsStreamsMappings();
			}
			else if(data.eventType === 'PeerClosed') {
				if(that[dnId].peers[data.promID]) {
					that._closePeer(dnId, data.promID);
					if(typeof that.onclose === 'function') that.onclose(dnId);
				}
			}

		}

	}, {auto: true});

	return this;
};

RTC.prototype.disconnect = function(){
	var that = this;

	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		for(var promID in that[dnId].peers){
			that._closePeer(dnId, promID);
		}
	});

	if(this.subscription) this.subscription.close();
	return this;
};


RTC.prototype._createDiyaNode = function(dnId){
	var that = this;

	this[dnId] = {
		dnId: dnId,
		usedChannels: [],
		requestedChannels: [],
		peers: [],
		channelsByStream: []
	}

	this.requestedChannels.forEach(function(c){that[dnId].requestedChannels.push(c)});
};

RTC.prototype._closeDiyaNode = function(dnId){
	for(var promID in this[dnId].peers){
		this._closePeer(dnId, promID);
	}

	delete this[dnId];
};

RTC.prototype._closePeer = function(dnId, promID){
	if(this[dnId].peers[promID]){
		var p = this[dnId].peers[promID];
		p.close();

		for(var i=0;i<p.channels.length; i++){
			delete this[dnId].usedChannels[p.channels[i]];
		}

		delete this[dnId].peers[promID];
	}
};

/** Matches the given receivedChannels proposed by the given DiyaNode peerId
 *  against the requested channels and creates a Channel for each match
 */
RTC.prototype._matchChannels = function(dnId, receivedChannels){
	var that = this;

	var channels = [];

	for(var i = 0; i < receivedChannels.length; i++){
		var name = receivedChannels[i];
		var remoteStreamId = name.split("_;:_")[1];
		name = name.split("_;:_")[0];

		for(var j = 0; j < that[dnId].requestedChannels.length; j++){
			var req = that[dnId].requestedChannels[j];

			if(name && name.match(req.regex) && !that[dnId].usedChannels[name]){
				var channel = new Channel(dnId, name, req.cb, req.stream_cb);
				that[dnId].usedChannels[name] = channel;
				channels.push(name);

				// If a stream id is provided for the channel, register the mapping
				if(remoteStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.stream !== remoteStreamId && cbs.channel !== channel; });
					that[dnId].channelsByStream.push({stream:remoteStreamId, channel:channel});
					channel.streamId = streamId;
				}
				var localStreamId = that.channelsByStream.filter(function(cbs){return cbs.channel === name; })[0];
				if(localStreamId) {
					that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.stream !== localStreamId && cbs.channel !== name; });
					that[dnId].channelsByStream.push({stream:localStreamId, channel:name});
					channel.localStreamId = localStreamId;
				}
			}
		}
	}

	return  channels;
};


/** Called upon RTC datachannels connections */
RTC.prototype._onDataChannel = function(dnId, datachannel){
	if(!this[dnId]) return console.warn("Tried to open a data channel on a closed peer");
	var channel = this[dnId].usedChannels[datachannel.label];

	if(!channel){
		console.log("Datachannel "+datachannel.label+" unmatched, closing !");
		datachannel.close();
		return ;
	}
	channel.setDataChannel(datachannel);
};

/** Called upon RTC stream channel connections */
RTC.prototype._onAddStream = function(dnId, stream) {
	if(!this[dnId]) return console.warn("Tried to open a stream on a closed peer");

	var channel = this[dnId].usedChannels[stream.id];

	if(!channel){
		console.warn("Stream Channel "+ stream.id +" unmatched, closing !");
		stream.close();
		return ;
	}
	channel.onAddStream(stream);
};

/** Add a local stream to be sent through the given RTC channel */
RTC.prototype.addStream = function(channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
 	this.channelsByStream.push({channel:channel, stream:stream.id, mediaStream:stream});

	console.log("Open local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
		that[dnId].channelsByStream.push({channel:channel, stream:stream.id});
		for(var promID in that[dnId].peers){
			that[dnId].peers[promID].addStream(stream);
		}
	});

};

RTC.prototype.removeStream = function(channel, stream) {
	var that = this;

	// Register the channel<->stream mapping
	this.channelsByStream = this.channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });

	console.log("Close local stream " + channel);

	// Send the channel<->stream mapping to all connected Peers
	this.selector.each(function(dnId){
		if(!that[dnId]) return ;
		that[dnId].channelsByStream = that[dnId].channelsByStream.filter(function(cbs){return cbs.channel !== channel && cbs.stream !== stream.id; });
		for(var promID in that[dnId].peers){
			that[dnId].peers[promID].removeStream(stream);
		}
	});
};


////////////////////////

DiyaSelector.prototype.rtc = function(){ return new RTC(this);};

},{"../../DiyaSelector":17,"inherits":5,"node-event-emitter":6,"webrtc-adapter":7}],25:[function(require,module,exports){
/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var util = require('util');


var Message = require('../message');


//////////////////////////////////////////////////////////////
/////////////////// Logging utility methods //////////////////
//////////////////////////////////////////////////////////////

var DEBUG = true;
var Logger = {
	log: function(message){
		if(DEBUG) console.log(message);
	},

	error: function(message){
		if(DEBUG) console.error(message);
	}
};

/**
 *	callback : function called after model updated
 * */
function Status(selector){
	var that = this;
	this.selector = selector;
	this._coder = selector.encode();
	this.subscriptions = [];

	/** model of robot : available parts and status **/
	this.robotModel = [];
	this._robotModelInit = false;

	/*** structure of data config ***
		 criteria :
		   time: all 3 time criteria should not be defined at the same time. (range would be given up)
		     beg: {[null],time} (null means most recent) // stored a UTC in ms (num)
		     end: {[null], time} (null means most oldest) // stored as UTC in ms (num)
		     range: {[null], time} (range of time(positive) ) // in s (num)
		   robot: {ArrayOf ID or ["all"]}
		   place: {ArrayOf ID or ["all"]}
		 operator: {[last], max, moy, sd} -( maybe moy should be default
		 ...

		 parts : {[null] or ArrayOf PartsId} to get errors
		 status : {[null] or ArrayOf StatusName} to get status

		 sampling: {[null] or int}
	*/
	this.dataConfig = {
		criteria: {
			time: {
				beg: null,
				end: null,
				range: null // in s
			},
			robot: null
		},
		operator: 'last',
		parts: null,
		status: null
	};

	return this;
};
/**
 * Get robotModel :
 * {
 *  parts: {
 *		"partXX": {
 * 			 errorsDescr: { encountered errors indexed by errorIds>0 }
 *				> Config of errors :
 *					critLevel: FLOAT, // could be int...
 * 					msg: STRING,
 *					stopServiceId: STRING,
 *					runScript: Sequelize.STRING,
 *					missionMask: Sequelize.INTEGER,
 *					runLevel: Sequelize.INTEGER
 *			error:[FLOAT, ...], // could be int...
 *			time:[FLOAT, ...],
 *			robot:[FLOAT, ...],
 *			/// place:[FLOAT, ...], not implemented yet
 *		},
 *	 	... ("PartYY")
 *  },
 *  status: {
 *		"statusXX": {
 *				data:[FLOAT, ...], // could be int...
 *				time:[FLOAT, ...],
 *				robot:[FLOAT, ...],
 *				/// place:[FLOAT, ...], not implemented yet
 *				range: [FLOAT, FLOAT],
 *				label: string
 *			},
 *	 	... ("StatusYY")
 *  }
 * }
 */
Status.prototype.getRobotModel = function(){
	return this.robotModel;
};

/**
 * @param {Object} dataConfig config for data request
 * if dataConfig is define : set and return this
 *	 @return {Status} this
 * else
 *	 @return {Object} current dataConfig
 */
Status.prototype.DataConfig = function(newDataConfig){
	if(newDataConfig) {
		this.dataConfig=newDataConfig;
		return this;
	}
	else
		return this.dataConfig;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-Status
 * @param  {String}	 newOperator : {[last], max, moy, sd}
 * @return {Status} this - chainable
 * Set operator criteria.
 * Depends on newOperator
 *	@param {String} newOperator
 *	@return this
 * Get operator criteria.
 *	@return {String} operator
 */
Status.prototype.DataOperator = function(newOperator){
	if(newOperator) {
		this.dataConfig.operator = newOperator;
		return this;
	}
	else
		return this.dataConfig.operator;
};
/**
 * Depends on numSamples
 * @param {int} number of samples in dataModel
 * if defined : set number of samples
 *	@return {Status} this
 * else
 *	@return {int} number of samples
 **/
Status.prototype.DataSampling = function(numSamples){
	if(numSamples) {
		this.dataConfig.sampling = numSamples;
		return this;
	}
	else
		return this.dataConfig.sampling;
};
/**
 * Set or get data time criteria beg and end.
 * If param defined
 *	@param {Date} newTimeBeg // may be null
 *	@param {Date} newTimeEnd // may be null
 *	@return {Status} this
 * If no param defined:
 *	@return {Object} Time object: fields beg and end.
 */
Status.prototype.DataTime = function(newTimeBeg,newTimeEnd, newRange){
	if(newTimeBeg || newTimeEnd || newRange) {
		this.dataConfig.criteria.time.beg = newTimeBeg.getTime();
		this.dataConfig.criteria.time.end = newTimeEnd.getTime();
		this.dataConfig.criteria.time.range = newRange;
		return this;
	}
	else
		return {
			beg: new Date(this.dataConfig.criteria.time.beg),
			end: new Date(this.dataConfig.criteria.time.end),
			range: new Date(this.dataConfig.criteria.time.range)
		};
};
/**
 * Depends on robotIds
 * Set robot criteria.
 *	@param {Array[Int]} robotIds list of robot Ids
 * Get robot criteria.
 *	@return {Array[Int]} list of robot Ids
 */
Status.prototype.DataRobotIds = function(robotIds){
	if(robotIds) {
		this.dataConfig.criteria.robot = robotIds;
		return this;
	}
	else
		return this.dataConfig.criteria.robot;
};
/**
 * Depends on placeIds // not relevant?, not implemented yet
 * Set place criteria.
 *	@param {Array[Int]} placeIds list of place Ids
 * Get place criteria.
 *	@return {Array[Int]} list of place Ids
 */
Status.prototype.DataPlaceIds = function(placeIds){
	if(placeIds) {
		this.dataConfig.criteria.placeId = placeIds;
		return this;
	}
	else
		return this.dataConfig.criteria.place;
};
/**
 * Get data by sensor name.
 *	@param {Array[String]} sensorName list of sensors
 */
Status.prototype.getDataByName = function(sensorNames){
	var data=[];
	for(var n in sensorNames) {
		data.push(this.dataModel[sensorNames[n]]);
	}
	return data;
};

/**
 * Subscribe to error/status updates
 */
Status.prototype.watch = function(robotNames, callback){
	var that = this;
	// console.log(robotNames);

	var subs = this.selector.subscribe({
		service: 'status',
		func: 'Status',
		data: robotNames
	}, function (peerId, err, data) {
		// console.log(peerId);
		// console.log(err);
		// console.log(data);
		if (err || (data&&data.err&data.err.st) ) {
			Logger.error( "StatusSubscribe:"+(err?err:"")+"\n"+(data&&data.err?data.err:"") );
		} else {
			if(data && data.header
			   && data.header.type === "init") {
				// initialisation of robot model
				that.robotModelInit = true;
			}
			// console.log(data);
			if(that.robotModelInit) {
				that._getRobotModelFromRecv2(data);
				if(typeof callback === 'function')
					callback(that.robotModel);
			}
			else {
				// Error
				Logger.error("Robot model has not been initialised, cannot be updated");
				/// TODO unsubscribe
			}
		}
	}, { auto: true });
	this.subscriptions.push(subs);
};

/**
 * Close all subscriptions
 */
Status.prototype.closeSubscriptions = function(){
	for(var i in this.subscriptions) {
		this.subscriptions[i].close();
	}
	this.subscriptions =[];
};


/**
 * Get data given dataConfig.
 * @param {func} callback : called after update
 * TODO USE PROMISE
 */
Status.prototype.getData = function(callback, dataConfig){
	var that=this;
	var dataModel = {};
	if(dataConfig)
		this.DataConfig(dataConfig);
	// console.log("Request: "+JSON.stringify(dataConfig));
	this.selector.request({
		service: "status",
		func: "DataRequest",
		data: {
			type:"splReq",
			dataConfig: that.dataConfig
		}
	}, function(dnId, err, data){
		if(err) {
			Logger.error("["+that.dataConfig.sensors+"] Recv err: "+JSON.stringify(err));
			return;
		}
		if(data.header.error) {
			// TODO : check/use err status and adapt behavior accordingly
			Logger.error("UpdateData:\n"+JSON.stringify(data.header.reqConfig));
			Logger.error("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
			return;
		}
		//Logger.log(JSON.stringify(that.dataModel));
		dataModel = that._getDataModelFromRecv(data);

		Logger.log(that.getDataModel());

		callback = callback.bind(that); // bind callback with Status
		callback(dataModel); // callback func
	});
};


/**
 * Update internal robot model with received data (version 2)
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
Status.prototype._getRobotModelFromRecv2 = function(data){
	var robot;
	var dataRobots = data.robots;
	var dataParts = data.partList;

	if(!this.robotModel)
		this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	for(var n in this.robotModel) {
		// console.log(n);
		this.robotModel[n].parts = {}; // reset parts
	}

	for(var n in dataRobots) {
		if(!this.robotModel[n])
			this.robotModel[n]={};
		this.robotModel[n].robot = dataRobots[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if(dataRobots[n] && dataRobots[n].parts) {
			var parts = dataRobots[n].parts;
			this.robotModel[n].parts = {};
			var rParts = this.robotModel[n].parts;
			// for(var q in rParts) {
			// 	/** part[q] was not sent because no error **/
			// 	if(!parts[q]
			// 	   &&rParts[q].evts&&rParts[q].evts.code) {
			// 		rParts[q].evts = {
			// 			code: 0,
			// 			codeRef: 0,
			// 			time: Date.now() /** update **/
			// 		};
			// 	}
			// }
			for (var p in parts) {
				if(!rParts[p]) {
					rParts[p]={};
				}
				if(parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category=dataParts[p].category;
					/* update part name */
					rParts[p].name=dataParts[p].name;
					/* update part label */
					rParts[p].label=dataParts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if(!rParts[p].errorList)
						rParts[p].errorList={};
					for( var el in dataParts[p].errorList )
						if(!rParts[p].errorList[el])
							rParts[p].errorList[el] = dataParts[p].errorList[el];

					rParts[p].evts = {
						code: parts[p].code,
						codeRef: parts[p].codeRef,
						time: parts[p].time
					};
				}
				// console.log(rParts[p].error);
			}
			// console.log('parts, rParts');
			// console.log(parts);
 		// 	console.log(rParts);
		}
		else {
			Logger.error("No parts to read for robot "+data[n].name);
		}
	}
};


/**
 * Update internal robot model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}		[description]
 */
Status.prototype._getRobotModelFromRecv = function(data){
	var robot;

	if(!this.robotModel)
		this.robotModel = [];
	// console.log("_getRobotModelFromRecv");
	// console.log(this.robotModel);

	/** Only one robot is manage at the same time currently **/
	for(var n in data) {
		if(!this.robotModel[n])
			this.robotModel[n]={};
		this.robotModel[n].robot = data[n].robot;

		// if(this.robotModel.length<data.length) {
		// 	this.robotModel.push({robot: data[0].robots});
		// }

		/** extract parts info **/
		if(data[n] && data[n].parts) {
			if(!this.robotModel[n].parts)
				this.robotModel[n].parts = {};
			var parts = data[n].parts;
			var rParts = this.robotModel[n].parts;
			for(var q in rParts) {
				/** part[q] was not sent because no error **/
				if(!parts[q]
				   &&rParts[q].evts&&rParts[q].evts.code) {
					rParts[q].evts = {
						code: [0],
						codeRef: [0],
						time: [Date.now()] /** update **/
					};
				}
			}
			for (var p in parts) {
				if(parts[p]&&parts[p].err && parts[p].err.st>0) {
					Logger.error("Parts "+p+" was in error: "+data[p].err.msg);
					continue;
				}
				if(!rParts[p]) {
					rParts[p]={};
				}
				if(parts[p]) {
					// Logger.log(n);
					/* update part category */
					rParts[p].category=parts[p].category;
					/* update part name */
					rParts[p].name=parts[p].name;
					/* update part label */
					rParts[p].label=parts[p].label;
					/* update error time */
					// console.log(parts[p]);
					// console.log(parts[p].errors.time);
					// console.log(rParts[p].time);
					/* update error */
					// console.log(parts[p].errors.code);

					/** update errorList **/
					if(!rParts[p].errorList)
						rParts[p].errorList={};
					for( var el in parts[p].errorList )
						if(!rParts[p].errorList[el])
							rParts[p].errorList[el] = parts[p].errorList[el];

					rParts[p].evts = {
						code: this._coder.from(parts[p].evts.code),
						codeRef: this._coder.from(parts[p].evts.codeRef),
						time: this._coder.from(parts[p].evts.time)
					};
				}
				// console.log(rParts[p].error);
			}
			// console.log('parts, rParts');
			// console.log(parts);
			// console.log(rParts);
		}
		else {
			Logger.error("No parts to read for robot "+data[n].name);
		}
	}
};

/** create Status service **/
DiyaSelector.prototype.Status = function(){
	return new Status(this);
};

/**
 * Set on status
 * @param robotName to find status to modify
 * @param partName 	to find status to modify
 * @param code		newCode
 * @param source		source
 * @param callback		return callback (<bool>success)
 */
DiyaSelector.prototype.setStatus = function(robotName, partName, code, source, callback) {
	var funcName = "SetStatus_"+partName;
	this.request(
		{service:"status",func:funcName,data: {robotName: robotName, statusCode: code, partName: partName, source: source|1}}, function(peerId, err, data) {
			if(err) {
				if(callback) callback(false);
			}
			else {
				if(callback) callback(true);
			}
		});
};

/**
 * Get one status
 * @param robotName to get status
 * @param partName 	to get status
 * @param callback		return callback(-1 if not found/data otherwise)
 * @param _full 	more data about status
 */
DiyaSelector.prototype.getStatus = function(robotName, partName, callback, _full) {
	var full=_full||false;
	this.request(
		{service:"status",func:"GetStatus",data: {robotName: robotName, partName: partName, full: full}}, function(peerId, err, data) {
			if(err) {
				if(callback) callback(-1);
			}
			else {
				if(callback) callback(data);
			}
		});
};

},{"../../DiyaSelector":17,"../message":22,"util":4}],26:[function(require,module,exports){
/* maya-client
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *	3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

/**
 * Management of channel encoding
 * - base64 coding
 * - none
 * Data format :
 *		t: {'b64','none'}
 *		b: <if b64> {4,8}
 *		d: encoded data {buffer or Array}
 *		s: size
 */


var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var base64 = require('base-64');

/**
 * Default : no encoding
 * Effective for string based channels (like JSON based WS)
 * */
function NoCoding(){
	return this;
};

/**
* Convert buffer coded in base64 and containing numbers coded by
* byteCoding bytes into array
* @param buffer in base64
* @param byteCoding number of bytes for each number (4 or 8)
* @return array of float (32 or 64). null if could not convert.
*/
NoCoding.prototype.from = function(data) {
	return data.d;
};

/**
* Convert array containing numbers coded by byteCoding bytes into buffer coded in base64
* @param 	{Array<Float>} 	array of float (32 or 64 bits)
* @param 	{integer} 	byteCoding number of bytes for each float (4 or 8)
* @return  	{String} 	buffer in base64. null if could not convert.
*/
NoCoding.prototype.to = function(array) {
	return {
		t: 'no', /* type */
		d: array, /* data */
		s: array.length
	};
};




/**
 * Management of base64 encoding
 * Effective for string based channels (like JSON based WS)
 * */
function Base64Coding(){
	return this;
};



////////////////////////////////////////////////////////////////
/////////////////    Utility functions    //////////////////////
////////////////////////////////////////////////////////////////

/*\
 |*|
 |*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
 |*|
 |*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
 |*|
 \*/
/** Decoder un tableau d'octets depuis une chaîne en base64 */
var b64ToUint6 = function(nChr) {
	return nChr > 64 && nChr < 91 ?
		nChr - 65
		: nChr > 96 && nChr < 123 ?
		nChr - 71
		: nChr > 47 && nChr < 58 ?
		nChr + 4
		: nChr === 43 ?
		62
		: nChr === 47 ?
		63
		:	0;
};

/**
 * Decode base64 string to UInt8Array
 * @param  {String} sBase64		base64 coded string
 * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
 * @return {Uint8Array}				tab of decoded bytes
 */
var base64DecToArr = function(sBase64, nBlocksSize) {
	var
	sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
	nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	buffer = new ArrayBuffer(nOutLen), taBytes = new Uint8Array(buffer);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3; /* n mod 4 */
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}
	// console.log("u8int : "+JSON.stringify(taBytes));
	return buffer;
};

////////////////////////////////////////////////////////////////
/////////////////   Interface functions   //////////////////////
////////////////////////////////////////////////////////////////


/**
* Convert buffer coded in base64 and containing numbers coded by
* byteCoding bytes into array
* @param buffer in base64
* @param byteCoding number of bytes for each number (4 or 8)
* @return array of float (32 or 64). null if could not convert.
*/
Base64Coding.prototype.from = function(data) {
	var byteCoding = data.b;

	/* check byte coding */
	if(byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/* decode data to array of byte */
	var buf = base64DecToArr(data.d, data.b);
	/* parse data to float array */
	var fArray=null;
	switch(data.b) {
	case 4:
		fArray = new Float32Array(buf);
		break;
	case 8:
		fArray = new Float64Array(buf);
		break;
	default:
		console.log("Unexpected byteCoding! Should not happen!!");
		return null;
	}
	/* parse fArray into normal array */
	var tab = [].slice.call(fArray);

	if(data.s !== tab.length) {
		console.log("Size mismatch when decoding !");
		return null;
	}
	return tab;
};

/**
* Convert array containing numbers coded by byteCoding bytes into buffer coded in base64
* @param 	{Array<Float>} 	array of float (32 or 64 bits)
* @param 	{integer} 	byteCoding number of bytes for each float (4 or 8)
* @return  	{String} 	buffer in base64. null if could not convert.
*/
Base64Coding.prototype.to = function(array, byteCoding) {
	/* check byte coding */
	if(byteCoding !== 4 && byteCoding !== 8) {
		return null;
	}

	/*** case ArrayBuffer ***/
	var buffer = new ArrayBuffer(array.length*byteCoding);
	switch(byteCoding) {
	case 4:
		var buf32 = new Float32Array(buffer);
		buf32.set(array);
		break;
	case 8:
		var buf64 = new Float64Array(buffer);
		buf64.set(array);
		break;
	}
	var buffChar = new Uint8Array(buffer);
	var buffCharCoded = new Array(buffChar.length);
	for(var n =0; n<buffChar.length; n++) {
		buffCharCoded[n] = String.fromCharCode(buffChar[n]);
	}
	var str = new String(buffCharCoded.join(''));
	var b64Buff = base64.encode(str);
	return {
		t: 'b64', /* type */
		b: byteCoding, /* byteCoding */
		d: b64Buff, /* data */
		s: array.length /* size */
	};
};




/**
 * Management of comm encoding
 * */
function CodingHandler(){
	this.b64 = new Base64Coding();
	this.none = new NoCoding();

	return this;
};


CodingHandler.prototype.from = function(data) {
	if(!data || data===null)
		return null;
	switch(data.t) {
	case 'b64':
		return this.b64.from(data);
	default:
		return this.none.from(data);
	}
};


CodingHandler.prototype.to = function(array, type, byteCoding) {
	if(typeof array === 'number') {
		array=[array];
	}
	if(!Array.isArray(array)){
		console.log("CodingHandler.to only accepts array !");
		return null;
	}

	switch(type) {
	case 'b64':
		return this.b64.to(array, byteCoding);
	case 'no':
	default:
		return this.none.to(array);
	}
};


/** Add base64 handler to DiyaSelector **/
DiyaSelector.prototype.encode = function(){
	return new CodingHandler();
};

},{"../../DiyaSelector":17,"base-64":1}]},{},[18])(18)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9iYXNlLTY0L2Jhc2U2NC5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvbm9kZS1ldmVudC1lbWl0dGVyL2luZGV4LmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2FkYXB0ZXJfY29yZS5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9jaHJvbWUvY2hyb21lX3NoaW0uanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL25vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9lZGdlL2VkZ2Vfc2RwLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZWRnZV9zaGltLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZmlyZWZveF9zaGltLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2ZpcmVmb3gvZ2V0dXNlcm1lZGlhLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9ub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvbm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy91dGlscy5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvc3JjL0RpeWFOb2RlLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvRGl5YVNlbGVjdG9yLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvZGl5YS1zZGsuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9pZXEvaWVxLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvc2VydmljZXMvbWFwcy9tYXBzLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9tZXNzYWdlLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMiLCIvaG9tZS9hbnRvcm9sbC93b3Jrc3BhY2UvZ2l0aHViL2RpeWEtc2RrL3NyYy9zZXJ2aWNlcy9ydGMvcnRjLmpzIiwiL2hvbWUvYW50b3JvbGwvd29ya3NwYWNlL2dpdGh1Yi9kaXlhLXNkay9zcmMvc2VydmljZXMvc3RhdHVzL3N0YXR1cy5qcyIsIi9ob21lL2FudG9yb2xsL3dvcmtzcGFjZS9naXRodWIvZGl5YS1zZGsvc3JjL3V0aWxzL2VuY29kaW5nL2VuY29kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qISBodHRwOi8vbXRocy5iZS9iYXNlNjQgdjAuMS4wIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2AuXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSwgYW5kIHVzZVxuXHQvLyBpdCBhcyBgcm9vdGAuXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIEludmFsaWRDaGFyYWN0ZXJFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9O1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yO1xuXHRJbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuXHR2YXIgZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0Ly8gTm90ZTogdGhlIGVycm9yIG1lc3NhZ2VzIHVzZWQgdGhyb3VnaG91dCB0aGlzIGZpbGUgbWF0Y2ggdGhvc2UgdXNlZCBieVxuXHRcdC8vIHRoZSBuYXRpdmUgYGF0b2JgL2BidG9hYCBpbXBsZW1lbnRhdGlvbiBpbiBDaHJvbWl1bS5cblx0XHR0aHJvdyBuZXcgSW52YWxpZENoYXJhY3RlckVycm9yKG1lc3NhZ2UpO1xuXHR9O1xuXG5cdHZhciBUQUJMRSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC9jb21tb24tbWljcm9zeW50YXhlcy5odG1sI3NwYWNlLWNoYXJhY3RlclxuXHR2YXIgUkVHRVhfU1BBQ0VfQ0hBUkFDVEVSUyA9IC9bXFx0XFxuXFxmXFxyIF0vZztcblxuXHQvLyBgZGVjb2RlYCBpcyBkZXNpZ25lZCB0byBiZSBmdWxseSBjb21wYXRpYmxlIHdpdGggYGF0b2JgIGFzIGRlc2NyaWJlZCBpbiB0aGVcblx0Ly8gSFRNTCBTdGFuZGFyZC4gaHR0cDovL3doYXR3Zy5vcmcvaHRtbC93ZWJhcHBhcGlzLmh0bWwjZG9tLXdpbmRvd2Jhc2U2NC1hdG9iXG5cdC8vIFRoZSBvcHRpbWl6ZWQgYmFzZTY0LWRlY29kaW5nIGFsZ29yaXRobSB1c2VkIGlzIGJhc2VkIG9uIEBhdGvigJlzIGV4Y2VsbGVudFxuXHQvLyBpbXBsZW1lbnRhdGlvbi4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vYXRrLzEwMjAzOTZcblx0dmFyIGRlY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpXG5cdFx0XHQucmVwbGFjZShSRUdFWF9TUEFDRV9DSEFSQUNURVJTLCAnJyk7XG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0XHRpZiAobGVuZ3RoICUgNCA9PSAwKSB7XG5cdFx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UoLz09PyQvLCAnJyk7XG5cdFx0XHRsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGxlbmd0aCAlIDQgPT0gMSB8fFxuXHRcdFx0Ly8gaHR0cDovL3doYXR3Zy5vcmcvQyNhbHBoYW51bWVyaWMtYXNjaWktY2hhcmFjdGVyc1xuXHRcdFx0L1teK2EtekEtWjAtOS9dLy50ZXN0KGlucHV0KVxuXHRcdCkge1xuXHRcdFx0ZXJyb3IoXG5cdFx0XHRcdCdJbnZhbGlkIGNoYXJhY3RlcjogdGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR2YXIgYml0Q291bnRlciA9IDA7XG5cdFx0dmFyIGJpdFN0b3JhZ2U7XG5cdFx0dmFyIGJ1ZmZlcjtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0dmFyIHBvc2l0aW9uID0gLTE7XG5cdFx0d2hpbGUgKCsrcG9zaXRpb24gPCBsZW5ndGgpIHtcblx0XHRcdGJ1ZmZlciA9IFRBQkxFLmluZGV4T2YoaW5wdXQuY2hhckF0KHBvc2l0aW9uKSk7XG5cdFx0XHRiaXRTdG9yYWdlID0gYml0Q291bnRlciAlIDQgPyBiaXRTdG9yYWdlICogNjQgKyBidWZmZXIgOiBidWZmZXI7XG5cdFx0XHQvLyBVbmxlc3MgdGhpcyBpcyB0aGUgZmlyc3Qgb2YgYSBncm91cCBvZiA0IGNoYXJhY3RlcnPigKZcblx0XHRcdGlmIChiaXRDb3VudGVyKysgJSA0KSB7XG5cdFx0XHRcdC8vIOKApmNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBhIHNpbmdsZSBBU0NJSSBjaGFyYWN0ZXIuXG5cdFx0XHRcdG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuXHRcdFx0XHRcdDB4RkYgJiBiaXRTdG9yYWdlID4+ICgtMiAqIGJpdENvdW50ZXIgJiA2KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdC8vIGBlbmNvZGVgIGlzIGRlc2lnbmVkIHRvIGJlIGZ1bGx5IGNvbXBhdGlibGUgd2l0aCBgYnRvYWAgYXMgZGVzY3JpYmVkIGluIHRoZVxuXHQvLyBIVE1MIFN0YW5kYXJkOiBodHRwOi8vd2hhdHdnLm9yZy9odG1sL3dlYmFwcGFwaXMuaHRtbCNkb20td2luZG93YmFzZTY0LWJ0b2Fcblx0dmFyIGVuY29kZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0aW5wdXQgPSBTdHJpbmcoaW5wdXQpO1xuXHRcdGlmICgvW15cXDAtXFx4RkZdLy50ZXN0KGlucHV0KSkge1xuXHRcdFx0Ly8gTm90ZTogbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMgaGVyZSwgYXMgc3Vycm9nYXRlcyBhcmVcblx0XHRcdC8vIG1hdGNoZWQsIGFuZCB0aGUgaW5wdXQgaXMgc3VwcG9zZWQgdG8gb25seSBjb250YWluIEFTQ0lJIGFueXdheS5cblx0XHRcdGVycm9yKFxuXHRcdFx0XHQnVGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3V0c2lkZSBvZiB0aGUgJyArXG5cdFx0XHRcdCdMYXRpbjEgcmFuZ2UuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHBhZGRpbmcgPSBpbnB1dC5sZW5ndGggJSAzO1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHR2YXIgcG9zaXRpb24gPSAtMTtcblx0XHR2YXIgYTtcblx0XHR2YXIgYjtcblx0XHR2YXIgYztcblx0XHR2YXIgZDtcblx0XHR2YXIgYnVmZmVyO1xuXHRcdC8vIE1ha2Ugc3VyZSBhbnkgcGFkZGluZyBpcyBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGxvb3AuXG5cdFx0dmFyIGxlbmd0aCA9IGlucHV0Lmxlbmd0aCAtIHBhZGRpbmc7XG5cblx0XHR3aGlsZSAoKytwb3NpdGlvbiA8IGxlbmd0aCkge1xuXHRcdFx0Ly8gUmVhZCB0aHJlZSBieXRlcywgaS5lLiAyNCBiaXRzLlxuXHRcdFx0YSA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pIDw8IDE2O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbikgPDwgODtcblx0XHRcdGMgPSBpbnB1dC5jaGFyQ29kZUF0KCsrcG9zaXRpb24pO1xuXHRcdFx0YnVmZmVyID0gYSArIGIgKyBjO1xuXHRcdFx0Ly8gVHVybiB0aGUgMjQgYml0cyBpbnRvIGZvdXIgY2h1bmtzIG9mIDYgYml0cyBlYWNoLCBhbmQgYXBwZW5kIHRoZVxuXHRcdFx0Ly8gbWF0Y2hpbmcgY2hhcmFjdGVyIGZvciBlYWNoIG9mIHRoZW0gdG8gdGhlIG91dHB1dC5cblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTggJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTIgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gNiAmIDB4M0YpICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciAmIDB4M0YpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmIChwYWRkaW5nID09IDIpIHtcblx0XHRcdGEgPSBpbnB1dC5jaGFyQ29kZUF0KHBvc2l0aW9uKSA8PCA4O1xuXHRcdFx0YiA9IGlucHV0LmNoYXJDb2RlQXQoKytwb3NpdGlvbik7XG5cdFx0XHRidWZmZXIgPSBhICsgYjtcblx0XHRcdG91dHB1dCArPSAoXG5cdFx0XHRcdFRBQkxFLmNoYXJBdChidWZmZXIgPj4gMTApICtcblx0XHRcdFx0VEFCTEUuY2hhckF0KChidWZmZXIgPj4gNCkgJiAweDNGKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDIpICYgMHgzRikgK1xuXHRcdFx0XHQnPSdcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChwYWRkaW5nID09IDEpIHtcblx0XHRcdGJ1ZmZlciA9IGlucHV0LmNoYXJDb2RlQXQocG9zaXRpb24pO1xuXHRcdFx0b3V0cHV0ICs9IChcblx0XHRcdFx0VEFCTEUuY2hhckF0KGJ1ZmZlciA+PiAyKSArXG5cdFx0XHRcdFRBQkxFLmNoYXJBdCgoYnVmZmVyIDw8IDQpICYgMHgzRikgK1xuXHRcdFx0XHQnPT0nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0dmFyIGJhc2U2NCA9IHtcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J3ZlcnNpb24nOiAnMC4xLjAnXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gYmFzZTY0O1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gYmFzZTY0O1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYmFzZTY0KSB7XG5cdFx0XHRcdGJhc2U2NC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gYmFzZTY0W2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuYmFzZTY0ID0gYmFzZTY0O1xuXHR9XG5cbn0odGhpcykpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpWVhObExUWTBMMkpoYzJVMk5DNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFJU0JvZEhSd09pOHZiWFJvY3k1aVpTOWlZWE5sTmpRZ2RqQXVNUzR3SUdKNUlFQnRZWFJvYVdGeklId2dUVWxVSUd4cFkyVnVjMlVnS2k5Y2Jqc29ablZ1WTNScGIyNG9jbTl2ZENrZ2UxeHVYRzVjZEM4dklFUmxkR1ZqZENCbWNtVmxJSFpoY21saFlteGxjeUJnWlhod2IzSjBjMkF1WEc1Y2RIWmhjaUJtY21WbFJYaHdiM0owY3lBOUlIUjVjR1Z2WmlCbGVIQnZjblJ6SUQwOUlDZHZZbXBsWTNRbklDWW1JR1Y0Y0c5eWRITTdYRzVjYmx4MEx5OGdSR1YwWldOMElHWnlaV1VnZG1GeWFXRmliR1VnWUcxdlpIVnNaV0F1WEc1Y2RIWmhjaUJtY21WbFRXOWtkV3hsSUQwZ2RIbHdaVzltSUcxdlpIVnNaU0E5UFNBbmIySnFaV04wSnlBbUppQnRiMlIxYkdVZ0ppWmNibHgwWEhSdGIyUjFiR1V1Wlhod2IzSjBjeUE5UFNCbWNtVmxSWGh3YjNKMGN5QW1KaUJ0YjJSMWJHVTdYRzVjYmx4MEx5OGdSR1YwWldOMElHWnlaV1VnZG1GeWFXRmliR1VnWUdkc2IySmhiR0FzSUdaeWIyMGdUbTlrWlM1cWN5QnZjaUJDY205M2MyVnlhV1pwWldRZ1kyOWtaU3dnWVc1a0lIVnpaVnh1WEhRdkx5QnBkQ0JoY3lCZ2NtOXZkR0F1WEc1Y2RIWmhjaUJtY21WbFIyeHZZbUZzSUQwZ2RIbHdaVzltSUdkc2IySmhiQ0E5UFNBbmIySnFaV04wSnlBbUppQm5iRzlpWVd3N1hHNWNkR2xtSUNobWNtVmxSMnh2WW1Gc0xtZHNiMkpoYkNBOVBUMGdabkpsWlVkc2IySmhiQ0I4ZkNCbWNtVmxSMnh2WW1Gc0xuZHBibVJ2ZHlBOVBUMGdabkpsWlVkc2IySmhiQ2tnZTF4dVhIUmNkSEp2YjNRZ1BTQm1jbVZsUjJ4dlltRnNPMXh1WEhSOVhHNWNibHgwTHlvdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTb3ZYRzVjYmx4MGRtRnlJRWx1ZG1Gc2FXUkRhR0Z5WVdOMFpYSkZjbkp2Y2lBOUlHWjFibU4wYVc5dUtHMWxjM05oWjJVcElIdGNibHgwWEhSMGFHbHpMbTFsYzNOaFoyVWdQU0J0WlhOellXZGxPMXh1WEhSOU8xeHVYSFJKYm5aaGJHbGtRMmhoY21GamRHVnlSWEp5YjNJdWNISnZkRzkwZVhCbElEMGdibVYzSUVWeWNtOXlPMXh1WEhSSmJuWmhiR2xrUTJoaGNtRmpkR1Z5UlhKeWIzSXVjSEp2ZEc5MGVYQmxMbTVoYldVZ1BTQW5TVzUyWVd4cFpFTm9ZWEpoWTNSbGNrVnljbTl5Snp0Y2JseHVYSFIyWVhJZ1pYSnliM0lnUFNCbWRXNWpkR2x2YmlodFpYTnpZV2RsS1NCN1hHNWNkRngwTHk4Z1RtOTBaVG9nZEdobElHVnljbTl5SUcxbGMzTmhaMlZ6SUhWelpXUWdkR2h5YjNWbmFHOTFkQ0IwYUdseklHWnBiR1VnYldGMFkyZ2dkR2h2YzJVZ2RYTmxaQ0JpZVZ4dVhIUmNkQzh2SUhSb1pTQnVZWFJwZG1VZ1lHRjBiMkpnTDJCaWRHOWhZQ0JwYlhCc1pXMWxiblJoZEdsdmJpQnBiaUJEYUhKdmJXbDFiUzVjYmx4MFhIUjBhSEp2ZHlCdVpYY2dTVzUyWVd4cFpFTm9ZWEpoWTNSbGNrVnljbTl5S0cxbGMzTmhaMlVwTzF4dVhIUjlPMXh1WEc1Y2RIWmhjaUJVUVVKTVJTQTlJQ2RCUWtORVJVWkhTRWxLUzB4TlRrOVFVVkpUVkZWV1YxaFpXbUZpWTJSbFptZG9hV3ByYkcxdWIzQnhjbk4wZFhaM2VIbDZNREV5TXpRMU5qYzRPU3N2Snp0Y2JseDBMeThnYUhSMGNEb3ZMM2RvWVhSM1p5NXZjbWN2YUhSdGJDOWpiMjF0YjI0dGJXbGpjbTl6ZVc1MFlYaGxjeTVvZEcxc0kzTndZV05sTFdOb1lYSmhZM1JsY2x4dVhIUjJZWElnVWtWSFJWaGZVMUJCUTBWZlEwaEJVa0ZEVkVWU1V5QTlJQzliWEZ4MFhGeHVYRnhtWEZ4eUlGMHZaenRjYmx4dVhIUXZMeUJnWkdWamIyUmxZQ0JwY3lCa1pYTnBaMjVsWkNCMGJ5QmlaU0JtZFd4c2VTQmpiMjF3WVhScFlteGxJSGRwZEdnZ1lHRjBiMkpnSUdGeklHUmxjMk55YVdKbFpDQnBiaUIwYUdWY2JseDBMeThnU0ZSTlRDQlRkR0Z1WkdGeVpDNGdhSFIwY0RvdkwzZG9ZWFIzWnk1dmNtY3ZhSFJ0YkM5M1pXSmhjSEJoY0dsekxtaDBiV3dqWkc5dExYZHBibVJ2ZDJKaGMyVTJOQzFoZEc5aVhHNWNkQzh2SUZSb1pTQnZjSFJwYldsNlpXUWdZbUZ6WlRZMExXUmxZMjlrYVc1bklHRnNaMjl5YVhSb2JTQjFjMlZrSUdseklHSmhjMlZrSUc5dUlFQmhkR3ZpZ0pseklHVjRZMlZzYkdWdWRGeHVYSFF2THlCcGJYQnNaVzFsYm5SaGRHbHZiaTRnYUhSMGNITTZMeTluYVhOMExtZHBkR2gxWWk1amIyMHZZWFJyTHpFd01qQXpPVFpjYmx4MGRtRnlJR1JsWTI5a1pTQTlJR1oxYm1OMGFXOXVLR2x1Y0hWMEtTQjdYRzVjZEZ4MGFXNXdkWFFnUFNCVGRISnBibWNvYVc1d2RYUXBYRzVjZEZ4MFhIUXVjbVZ3YkdGalpTaFNSVWRGV0Y5VFVFRkRSVjlEU0VGU1FVTlVSVkpUTENBbkp5azdYRzVjZEZ4MGRtRnlJR3hsYm1kMGFDQTlJR2x1Y0hWMExteGxibWQwYUR0Y2JseDBYSFJwWmlBb2JHVnVaM1JvSUNVZ05DQTlQU0F3S1NCN1hHNWNkRngwWEhScGJuQjFkQ0E5SUdsdWNIVjBMbkpsY0d4aFkyVW9MejA5UHlRdkxDQW5KeWs3WEc1Y2RGeDBYSFJzWlc1bmRHZ2dQU0JwYm5CMWRDNXNaVzVuZEdnN1hHNWNkRngwZlZ4dVhIUmNkR2xtSUNoY2JseDBYSFJjZEd4bGJtZDBhQ0FsSURRZ1BUMGdNU0I4ZkZ4dVhIUmNkRngwTHk4Z2FIUjBjRG92TDNkb1lYUjNaeTV2Y21jdlF5TmhiSEJvWVc1MWJXVnlhV010WVhOamFXa3RZMmhoY21GamRHVnljMXh1WEhSY2RGeDBMMXRlSzJFdGVrRXRXakF0T1M5ZEx5NTBaWE4wS0dsdWNIVjBLVnh1WEhSY2RDa2dlMXh1WEhSY2RGeDBaWEp5YjNJb1hHNWNkRngwWEhSY2RDZEpiblpoYkdsa0lHTm9ZWEpoWTNSbGNqb2dkR2hsSUhOMGNtbHVaeUIwYnlCaVpTQmtaV052WkdWa0lHbHpJRzV2ZENCamIzSnlaV04wYkhrZ1pXNWpiMlJsWkM0blhHNWNkRngwWEhRcE8xeHVYSFJjZEgxY2JseDBYSFIyWVhJZ1ltbDBRMjkxYm5SbGNpQTlJREE3WEc1Y2RGeDBkbUZ5SUdKcGRGTjBiM0poWjJVN1hHNWNkRngwZG1GeUlHSjFabVpsY2p0Y2JseDBYSFIyWVhJZ2IzVjBjSFYwSUQwZ0p5YzdYRzVjZEZ4MGRtRnlJSEJ2YzJsMGFXOXVJRDBnTFRFN1hHNWNkRngwZDJocGJHVWdLQ3NyY0c5emFYUnBiMjRnUENCc1pXNW5kR2dwSUh0Y2JseDBYSFJjZEdKMVptWmxjaUE5SUZSQlFreEZMbWx1WkdWNFQyWW9hVzV3ZFhRdVkyaGhja0YwS0hCdmMybDBhVzl1S1NrN1hHNWNkRngwWEhSaWFYUlRkRzl5WVdkbElEMGdZbWwwUTI5MWJuUmxjaUFsSURRZ1B5QmlhWFJUZEc5eVlXZGxJQ29nTmpRZ0t5QmlkV1ptWlhJZ09pQmlkV1ptWlhJN1hHNWNkRngwWEhRdkx5QlZibXhsYzNNZ2RHaHBjeUJwY3lCMGFHVWdabWx5YzNRZ2IyWWdZU0JuY205MWNDQnZaaUEwSUdOb1lYSmhZM1JsY25QaWdLWmNibHgwWEhSY2RHbG1JQ2hpYVhSRGIzVnVkR1Z5S3lzZ0pTQTBLU0I3WEc1Y2RGeDBYSFJjZEM4dklPS0FwbU52Ym5abGNuUWdkR2hsSUdacGNuTjBJRGdnWW1sMGN5QjBieUJoSUhOcGJtZHNaU0JCVTBOSlNTQmphR0Z5WVdOMFpYSXVYRzVjZEZ4MFhIUmNkRzkxZEhCMWRDQXJQU0JUZEhKcGJtY3Vabkp2YlVOb1lYSkRiMlJsS0Z4dVhIUmNkRngwWEhSY2REQjRSa1lnSmlCaWFYUlRkRzl5WVdkbElENCtJQ2d0TWlBcUlHSnBkRU52ZFc1MFpYSWdKaUEyS1Z4dVhIUmNkRngwWEhRcE8xeHVYSFJjZEZ4MGZWeHVYSFJjZEgxY2JseDBYSFJ5WlhSMWNtNGdiM1YwY0hWME8xeHVYSFI5TzF4dVhHNWNkQzh2SUdCbGJtTnZaR1ZnSUdseklHUmxjMmxuYm1Wa0lIUnZJR0psSUdaMWJHeDVJR052YlhCaGRHbGliR1VnZDJsMGFDQmdZblJ2WVdBZ1lYTWdaR1Z6WTNKcFltVmtJR2x1SUhSb1pWeHVYSFF2THlCSVZFMU1JRk4wWVc1a1lYSmtPaUJvZEhSd09pOHZkMmhoZEhkbkxtOXlaeTlvZEcxc0wzZGxZbUZ3Y0dGd2FYTXVhSFJ0YkNOa2IyMHRkMmx1Wkc5M1ltRnpaVFkwTFdKMGIyRmNibHgwZG1GeUlHVnVZMjlrWlNBOUlHWjFibU4wYVc5dUtHbHVjSFYwS1NCN1hHNWNkRngwYVc1d2RYUWdQU0JUZEhKcGJtY29hVzV3ZFhRcE8xeHVYSFJjZEdsbUlDZ3ZXMTVjWERBdFhGeDRSa1pkTHk1MFpYTjBLR2x1Y0hWMEtTa2dlMXh1WEhSY2RGeDBMeThnVG05MFpUb2dibThnYm1WbFpDQjBieUJ6Y0dWamFXRnNMV05oYzJVZ1lYTjBjbUZzSUhONWJXSnZiSE1nYUdWeVpTd2dZWE1nYzNWeWNtOW5ZWFJsY3lCaGNtVmNibHgwWEhSY2RDOHZJRzFoZEdOb1pXUXNJR0Z1WkNCMGFHVWdhVzV3ZFhRZ2FYTWdjM1Z3Y0c5elpXUWdkRzhnYjI1c2VTQmpiMjUwWVdsdUlFRlRRMGxKSUdGdWVYZGhlUzVjYmx4MFhIUmNkR1Z5Y205eUtGeHVYSFJjZEZ4MFhIUW5WR2hsSUhOMGNtbHVaeUIwYnlCaVpTQmxibU52WkdWa0lHTnZiblJoYVc1eklHTm9ZWEpoWTNSbGNuTWdiM1YwYzJsa1pTQnZaaUIwYUdVZ0p5QXJYRzVjZEZ4MFhIUmNkQ2RNWVhScGJqRWdjbUZ1WjJVdUoxeHVYSFJjZEZ4MEtUdGNibHgwWEhSOVhHNWNkRngwZG1GeUlIQmhaR1JwYm1jZ1BTQnBibkIxZEM1c1pXNW5kR2dnSlNBek8xeHVYSFJjZEhaaGNpQnZkWFJ3ZFhRZ1BTQW5KenRjYmx4MFhIUjJZWElnY0c5emFYUnBiMjRnUFNBdE1UdGNibHgwWEhSMllYSWdZVHRjYmx4MFhIUjJZWElnWWp0Y2JseDBYSFIyWVhJZ1l6dGNibHgwWEhSMllYSWdaRHRjYmx4MFhIUjJZWElnWW5WbVptVnlPMXh1WEhSY2RDOHZJRTFoYTJVZ2MzVnlaU0JoYm5rZ2NHRmtaR2x1WnlCcGN5Qm9ZVzVrYkdWa0lHOTFkSE5wWkdVZ2IyWWdkR2hsSUd4dmIzQXVYRzVjZEZ4MGRtRnlJR3hsYm1kMGFDQTlJR2x1Y0hWMExteGxibWQwYUNBdElIQmhaR1JwYm1jN1hHNWNibHgwWEhSM2FHbHNaU0FvS3l0d2IzTnBkR2x2YmlBOElHeGxibWQwYUNrZ2UxeHVYSFJjZEZ4MEx5OGdVbVZoWkNCMGFISmxaU0JpZVhSbGN5d2dhUzVsTGlBeU5DQmlhWFJ6TGx4dVhIUmNkRngwWVNBOUlHbHVjSFYwTG1Ob1lYSkRiMlJsUVhRb2NHOXphWFJwYjI0cElEdzhJREUyTzF4dVhIUmNkRngwWWlBOUlHbHVjSFYwTG1Ob1lYSkRiMlJsUVhRb0t5dHdiM05wZEdsdmJpa2dQRHdnT0R0Y2JseDBYSFJjZEdNZ1BTQnBibkIxZEM1amFHRnlRMjlrWlVGMEtDc3JjRzl6YVhScGIyNHBPMXh1WEhSY2RGeDBZblZtWm1WeUlEMGdZU0FySUdJZ0t5QmpPMXh1WEhSY2RGeDBMeThnVkhWeWJpQjBhR1VnTWpRZ1ltbDBjeUJwYm5SdklHWnZkWElnWTJoMWJtdHpJRzltSURZZ1ltbDBjeUJsWVdOb0xDQmhibVFnWVhCd1pXNWtJSFJvWlZ4dVhIUmNkRngwTHk4Z2JXRjBZMmhwYm1jZ1kyaGhjbUZqZEdWeUlHWnZjaUJsWVdOb0lHOW1JSFJvWlcwZ2RHOGdkR2hsSUc5MWRIQjFkQzVjYmx4MFhIUmNkRzkxZEhCMWRDQXJQU0FvWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDaGlkV1ptWlhJZ1BqNGdNVGdnSmlBd2VETkdLU0FyWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDaGlkV1ptWlhJZ1BqNGdNVElnSmlBd2VETkdLU0FyWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDaGlkV1ptWlhJZ1BqNGdOaUFtSURCNE0wWXBJQ3RjYmx4MFhIUmNkRngwVkVGQ1RFVXVZMmhoY2tGMEtHSjFabVpsY2lBbUlEQjRNMFlwWEc1Y2RGeDBYSFFwTzF4dVhIUmNkSDFjYmx4dVhIUmNkR2xtSUNod1lXUmthVzVuSUQwOUlESXBJSHRjYmx4MFhIUmNkR0VnUFNCcGJuQjFkQzVqYUdGeVEyOWtaVUYwS0hCdmMybDBhVzl1S1NBOFBDQTRPMXh1WEhSY2RGeDBZaUE5SUdsdWNIVjBMbU5vWVhKRGIyUmxRWFFvS3l0d2IzTnBkR2x2YmlrN1hHNWNkRngwWEhSaWRXWm1aWElnUFNCaElDc2dZanRjYmx4MFhIUmNkRzkxZEhCMWRDQXJQU0FvWEc1Y2RGeDBYSFJjZEZSQlFreEZMbU5vWVhKQmRDaGlkV1ptWlhJZ1BqNGdNVEFwSUN0Y2JseDBYSFJjZEZ4MFZFRkNURVV1WTJoaGNrRjBLQ2hpZFdabVpYSWdQajRnTkNrZ0ppQXdlRE5HS1NBclhHNWNkRngwWEhSY2RGUkJRa3hGTG1Ob1lYSkJkQ2dvWW5WbVptVnlJRHc4SURJcElDWWdNSGd6UmlrZ0sxeHVYSFJjZEZ4MFhIUW5QU2RjYmx4MFhIUmNkQ2s3WEc1Y2RGeDBmU0JsYkhObElHbG1JQ2h3WVdSa2FXNW5JRDA5SURFcElIdGNibHgwWEhSY2RHSjFabVpsY2lBOUlHbHVjSFYwTG1Ob1lYSkRiMlJsUVhRb2NHOXphWFJwYjI0cE8xeHVYSFJjZEZ4MGIzVjBjSFYwSUNzOUlDaGNibHgwWEhSY2RGeDBWRUZDVEVVdVkyaGhja0YwS0dKMVptWmxjaUErUGlBeUtTQXJYRzVjZEZ4MFhIUmNkRlJCUWt4RkxtTm9ZWEpCZENnb1luVm1abVZ5SUR3OElEUXBJQ1lnTUhnelJpa2dLMXh1WEhSY2RGeDBYSFFuUFQwblhHNWNkRngwWEhRcE8xeHVYSFJjZEgxY2JseHVYSFJjZEhKbGRIVnliaUJ2ZFhSd2RYUTdYRzVjZEgwN1hHNWNibHgwZG1GeUlHSmhjMlUyTkNBOUlIdGNibHgwWEhRblpXNWpiMlJsSnpvZ1pXNWpiMlJsTEZ4dVhIUmNkQ2RrWldOdlpHVW5PaUJrWldOdlpHVXNYRzVjZEZ4MEozWmxjbk5wYjI0bk9pQW5NQzR4TGpBblhHNWNkSDA3WEc1Y2JseDBMeThnVTI5dFpTQkJUVVFnWW5WcGJHUWdiM0IwYVcxcGVtVnljeXdnYkdsclpTQnlMbXB6TENCamFHVmpheUJtYjNJZ2MzQmxZMmxtYVdNZ1kyOXVaR2wwYVc5dUlIQmhkSFJsY201elhHNWNkQzh2SUd4cGEyVWdkR2hsSUdadmJHeHZkMmx1WnpwY2JseDBhV1lnS0Z4dVhIUmNkSFI1Y0dWdlppQmtaV1pwYm1VZ1BUMGdKMloxYm1OMGFXOXVKeUFtSmx4dVhIUmNkSFI1Y0dWdlppQmtaV1pwYm1VdVlXMWtJRDA5SUNkdlltcGxZM1FuSUNZbVhHNWNkRngwWkdWbWFXNWxMbUZ0WkZ4dVhIUXBJSHRjYmx4MFhIUmtaV1pwYm1Vb1puVnVZM1JwYjI0b0tTQjdYRzVjZEZ4MFhIUnlaWFIxY200Z1ltRnpaVFkwTzF4dVhIUmNkSDBwTzF4dVhIUjlYSFJsYkhObElHbG1JQ2htY21WbFJYaHdiM0owY3lBbUppQWhabkpsWlVWNGNHOXlkSE11Ym05a1pWUjVjR1VwSUh0Y2JseDBYSFJwWmlBb1puSmxaVTF2WkhWc1pTa2dleUF2THlCcGJpQk9iMlJsTG1weklHOXlJRkpwYm1kdlNsTWdkakF1T0M0d0sxeHVYSFJjZEZ4MFpuSmxaVTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZbUZ6WlRZME8xeHVYSFJjZEgwZ1pXeHpaU0I3SUM4dklHbHVJRTVoY25kb1lXd2diM0lnVW1sdVoyOUtVeUIyTUM0M0xqQXRYRzVjZEZ4MFhIUm1iM0lnS0haaGNpQnJaWGtnYVc0Z1ltRnpaVFkwS1NCN1hHNWNkRngwWEhSY2RHSmhjMlUyTkM1b1lYTlBkMjVRY205d1pYSjBlU2hyWlhrcElDWW1JQ2htY21WbFJYaHdiM0owYzF0clpYbGRJRDBnWW1GelpUWTBXMnRsZVYwcE8xeHVYSFJjZEZ4MGZWeHVYSFJjZEgxY2JseDBmU0JsYkhObElIc2dMeThnYVc0Z1VtaHBibThnYjNJZ1lTQjNaV0lnWW5KdmQzTmxjbHh1WEhSY2RISnZiM1F1WW1GelpUWTBJRDBnWW1GelpUWTBPMXh1WEhSOVhHNWNibjBvZEdocGN5a3BPMXh1SWwxOSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWljbTkzYzJWeWFXWjVMMjV2WkdWZmJXOWtkV3hsY3k5MWRHbHNMM1YwYVd3dWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4dklFTnZjSGx5YVdkb2RDQktiM2xsYm5Rc0lFbHVZeTRnWVc1a0lHOTBhR1Z5SUU1dlpHVWdZMjl1ZEhKcFluVjBiM0p6TGx4dUx5OWNiaTh2SUZCbGNtMXBjM05wYjI0Z2FYTWdhR1Z5WldKNUlHZHlZVzUwWldRc0lHWnlaV1VnYjJZZ1kyaGhjbWRsTENCMGJ5QmhibmtnY0dWeWMyOXVJRzlpZEdGcGJtbHVaeUJoWEc0dkx5QmpiM0I1SUc5bUlIUm9hWE1nYzI5bWRIZGhjbVVnWVc1a0lHRnpjMjlqYVdGMFpXUWdaRzlqZFcxbGJuUmhkR2x2YmlCbWFXeGxjeUFvZEdobFhHNHZMeUJjSWxOdlpuUjNZWEpsWENJcExDQjBieUJrWldGc0lHbHVJSFJvWlNCVGIyWjBkMkZ5WlNCM2FYUm9iM1YwSUhKbGMzUnlhV04wYVc5dUxDQnBibU5zZFdScGJtZGNiaTh2SUhkcGRHaHZkWFFnYkdsdGFYUmhkR2x2YmlCMGFHVWdjbWxuYUhSeklIUnZJSFZ6WlN3Z1kyOXdlU3dnYlc5a2FXWjVMQ0J0WlhKblpTd2djSFZpYkdsemFDeGNiaTh2SUdScGMzUnlhV0oxZEdVc0lITjFZbXhwWTJWdWMyVXNJR0Z1WkM5dmNpQnpaV3hzSUdOdmNHbGxjeUJ2WmlCMGFHVWdVMjltZEhkaGNtVXNJR0Z1WkNCMGJ5QndaWEp0YVhSY2JpOHZJSEJsY25OdmJuTWdkRzhnZDJodmJTQjBhR1VnVTI5bWRIZGhjbVVnYVhNZ1puVnlibWx6YUdWa0lIUnZJR1J2SUhOdkxDQnpkV0pxWldOMElIUnZJSFJvWlZ4dUx5OGdabTlzYkc5M2FXNW5JR052Ym1ScGRHbHZibk02WEc0dkwxeHVMeThnVkdobElHRmliM1psSUdOdmNIbHlhV2RvZENCdWIzUnBZMlVnWVc1a0lIUm9hWE1nY0dWeWJXbHpjMmx2YmlCdWIzUnBZMlVnYzJoaGJHd2dZbVVnYVc1amJIVmtaV1JjYmk4dklHbHVJR0ZzYkNCamIzQnBaWE1nYjNJZ2MzVmljM1JoYm5ScFlXd2djRzl5ZEdsdmJuTWdiMllnZEdobElGTnZablIzWVhKbExseHVMeTljYmk4dklGUklSU0JUVDBaVVYwRlNSU0JKVXlCUVVrOVdTVVJGUkNCY0lrRlRJRWxUWENJc0lGZEpWRWhQVlZRZ1YwRlNVa0ZPVkZrZ1QwWWdRVTVaSUV0SlRrUXNJRVZZVUZKRlUxTmNiaTh2SUU5U0lFbE5VRXhKUlVRc0lFbE9RMHhWUkVsT1J5QkNWVlFnVGs5VUlFeEpUVWxVUlVRZ1ZFOGdWRWhGSUZkQlVsSkJUbFJKUlZNZ1QwWmNiaTh2SUUxRlVrTklRVTVVUVVKSlRFbFVXU3dnUmtsVVRrVlRVeUJHVDFJZ1FTQlFRVkpVU1VOVlRFRlNJRkJWVWxCUFUwVWdRVTVFSUU1UFRrbE9SbEpKVGtkRlRVVk9WQzRnU1U1Y2JpOHZJRTVQSUVWV1JVNVVJRk5JUVV4TUlGUklSU0JCVlZSSVQxSlRJRTlTSUVOUFVGbFNTVWRJVkNCSVQweEVSVkpUSUVKRklFeEpRVUpNUlNCR1QxSWdRVTVaSUVOTVFVbE5MRnh1THk4Z1JFRk5RVWRGVXlCUFVpQlBWRWhGVWlCTVNVRkNTVXhKVkZrc0lGZElSVlJJUlZJZ1NVNGdRVTRnUVVOVVNVOU9JRTlHSUVOUFRsUlNRVU5VTENCVVQxSlVJRTlTWEc0dkx5QlBWRWhGVWxkSlUwVXNJRUZTU1ZOSlRrY2dSbEpQVFN3Z1QxVlVJRTlHSUU5U0lFbE9JRU5QVGs1RlExUkpUMDRnVjBsVVNDQlVTRVVnVTA5R1ZGZEJVa1VnVDFJZ1ZFaEZYRzR2THlCVlUwVWdUMUlnVDFSSVJWSWdSRVZCVEVsT1IxTWdTVTRnVkVoRklGTlBSbFJYUVZKRkxseHVYRzUyWVhJZ1ptOXliV0YwVW1WblJYaHdJRDBnTHlWYmMyUnFKVjB2Wnp0Y2JtVjRjRzl5ZEhNdVptOXliV0YwSUQwZ1puVnVZM1JwYjI0b1ppa2dlMXh1SUNCcFppQW9JV2x6VTNSeWFXNW5LR1lwS1NCN1hHNGdJQ0FnZG1GeUlHOWlhbVZqZEhNZ1BTQmJYVHRjYmlBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ2IySnFaV04wY3k1d2RYTm9LR2x1YzNCbFkzUW9ZWEpuZFcxbGJuUnpXMmxkS1NrN1hHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQnZZbXBsWTNSekxtcHZhVzRvSnlBbktUdGNiaUFnZlZ4dVhHNGdJSFpoY2lCcElEMGdNVHRjYmlBZ2RtRnlJR0Z5WjNNZ1BTQmhjbWQxYldWdWRITTdYRzRnSUhaaGNpQnNaVzRnUFNCaGNtZHpMbXhsYm1kMGFEdGNiaUFnZG1GeUlITjBjaUE5SUZOMGNtbHVaeWhtS1M1eVpYQnNZV05sS0dadmNtMWhkRkpsWjBWNGNDd2dablZ1WTNScGIyNG9lQ2tnZTF4dUlDQWdJR2xtSUNoNElEMDlQU0FuSlNVbktTQnlaWFIxY200Z0p5VW5PMXh1SUNBZ0lHbG1JQ2hwSUQ0OUlHeGxiaWtnY21WMGRYSnVJSGc3WEc0Z0lDQWdjM2RwZEdOb0lDaDRLU0I3WEc0Z0lDQWdJQ0JqWVhObElDY2xjeWM2SUhKbGRIVnliaUJUZEhKcGJtY29ZWEpuYzF0cEt5dGRLVHRjYmlBZ0lDQWdJR05oYzJVZ0p5VmtKem9nY21WMGRYSnVJRTUxYldKbGNpaGhjbWR6VzJrcksxMHBPMXh1SUNBZ0lDQWdZMkZ6WlNBbkpXb25PbHh1SUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQktVMDlPTG5OMGNtbHVaMmxtZVNoaGNtZHpXMmtySzEwcE8xeHVJQ0FnSUNBZ0lDQjlJR05oZEdOb0lDaGZLU0I3WEc0Z0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNkYlEybHlZM1ZzWVhKZEp6dGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdaR1ZtWVhWc2REcGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIZzdYRzRnSUNBZ2ZWeHVJQ0I5S1R0Y2JpQWdabTl5SUNoMllYSWdlQ0E5SUdGeVozTmJhVjA3SUdrZ1BDQnNaVzQ3SUhnZ1BTQmhjbWR6V3lzcmFWMHBJSHRjYmlBZ0lDQnBaaUFvYVhOT2RXeHNLSGdwSUh4OElDRnBjMDlpYW1WamRDaDRLU2tnZTF4dUlDQWdJQ0FnYzNSeUlDczlJQ2NnSnlBcklIZzdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhOMGNpQXJQU0FuSUNjZ0t5QnBibk53WldOMEtIZ3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnlaWFIxY200Z2MzUnlPMXh1ZlR0Y2JseHVYRzR2THlCTllYSnJJSFJvWVhRZ1lTQnRaWFJvYjJRZ2MyaHZkV3hrSUc1dmRDQmlaU0IxYzJWa0xseHVMeThnVW1WMGRYSnVjeUJoSUcxdlpHbG1hV1ZrSUdaMWJtTjBhVzl1SUhkb2FXTm9JSGRoY201eklHOXVZMlVnWW5rZ1pHVm1ZWFZzZEM1Y2JpOHZJRWxtSUMwdGJtOHRaR1Z3Y21WallYUnBiMjRnYVhNZ2MyVjBMQ0IwYUdWdUlHbDBJR2x6SUdFZ2JtOHRiM0F1WEc1bGVIQnZjblJ6TG1SbGNISmxZMkYwWlNBOUlHWjFibU4wYVc5dUtHWnVMQ0J0YzJjcElIdGNiaUFnTHk4Z1FXeHNiM2NnWm05eUlHUmxjSEpsWTJGMGFXNW5JSFJvYVc1bmN5QnBiaUIwYUdVZ2NISnZZMlZ6Y3lCdlppQnpkR0Z5ZEdsdVp5QjFjQzVjYmlBZ2FXWWdLR2x6Vlc1a1pXWnBibVZrS0dkc2IySmhiQzV3Y205alpYTnpLU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmxlSEJ2Y25SekxtUmxjSEpsWTJGMFpTaG1iaXdnYlhObktTNWhjSEJzZVNoMGFHbHpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJSDA3WEc0Z0lIMWNibHh1SUNCcFppQW9jSEp2WTJWemN5NXViMFJsY0hKbFkyRjBhVzl1SUQwOVBTQjBjblZsS1NCN1hHNGdJQ0FnY21WMGRYSnVJR1p1TzF4dUlDQjlYRzVjYmlBZ2RtRnlJSGRoY201bFpDQTlJR1poYkhObE8xeHVJQ0JtZFc1amRHbHZiaUJrWlhCeVpXTmhkR1ZrS0NrZ2UxeHVJQ0FnSUdsbUlDZ2hkMkZ5Ym1Wa0tTQjdYRzRnSUNBZ0lDQnBaaUFvY0hKdlkyVnpjeTUwYUhKdmQwUmxjSEpsWTJGMGFXOXVLU0I3WEc0Z0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWh0YzJjcE8xeHVJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUlDaHdjbTlqWlhOekxuUnlZV05sUkdWd2NtVmpZWFJwYjI0cElIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNTBjbUZqWlNodGMyY3BPMXh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdZMjl1YzI5c1pTNWxjbkp2Y2lodGMyY3BPMXh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdkMkZ5Ym1Wa0lEMGdkSEoxWlR0Y2JpQWdJQ0I5WEc0Z0lDQWdjbVYwZFhKdUlHWnVMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozVnRaVzUwY3lrN1hHNGdJSDFjYmx4dUlDQnlaWFIxY200Z1pHVndjbVZqWVhSbFpEdGNibjA3WEc1Y2JseHVkbUZ5SUdSbFluVm5jeUE5SUh0OU8xeHVkbUZ5SUdSbFluVm5SVzUyYVhKdmJqdGNibVY0Y0c5eWRITXVaR1ZpZFdkc2IyY2dQU0JtZFc1amRHbHZiaWh6WlhRcElIdGNiaUFnYVdZZ0tHbHpWVzVrWldacGJtVmtLR1JsWW5WblJXNTJhWEp2YmlrcFhHNGdJQ0FnWkdWaWRXZEZiblpwY205dUlEMGdjSEp2WTJWemN5NWxibll1VGs5RVJWOUVSVUpWUnlCOGZDQW5KenRjYmlBZ2MyVjBJRDBnYzJWMExuUnZWWEJ3WlhKRFlYTmxLQ2s3WEc0Z0lHbG1JQ2doWkdWaWRXZHpXM05sZEYwcElIdGNiaUFnSUNCcFppQW9ibVYzSUZKbFowVjRjQ2duWEZ4Y1hHSW5JQ3NnYzJWMElDc2dKMXhjWEZ4aUp5d2dKMmtuS1M1MFpYTjBLR1JsWW5WblJXNTJhWEp2YmlrcElIdGNiaUFnSUNBZ0lIWmhjaUJ3YVdRZ1BTQndjbTlqWlhOekxuQnBaRHRjYmlBZ0lDQWdJR1JsWW5WbmMxdHpaWFJkSUQwZ1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCdGMyY2dQU0JsZUhCdmNuUnpMbVp2Y20xaGRDNWhjSEJzZVNobGVIQnZjblJ6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0NjbGN5QWxaRG9nSlhNbkxDQnpaWFFzSUhCcFpDd2diWE5uS1R0Y2JpQWdJQ0FnSUgwN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJR1JsWW5WbmMxdHpaWFJkSUQwZ1puVnVZM1JwYjI0b0tTQjdmVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlHUmxZblZuYzF0elpYUmRPMXh1ZlR0Y2JseHVYRzR2S2lwY2JpQXFJRVZqYUc5eklIUm9aU0IyWVd4MVpTQnZaaUJoSUhaaGJIVmxMaUJVY25seklIUnZJSEJ5YVc1MElIUm9aU0IyWVd4MVpTQnZkWFJjYmlBcUlHbHVJSFJvWlNCaVpYTjBJSGRoZVNCd2IzTnphV0pzWlNCbmFYWmxiaUIwYUdVZ1pHbG1abVZ5Wlc1MElIUjVjR1Z6TGx4dUlDcGNiaUFxSUVCd1lYSmhiU0I3VDJKcVpXTjBmU0J2WW1vZ1ZHaGxJRzlpYW1WamRDQjBieUJ3Y21sdWRDQnZkWFF1WEc0Z0tpQkFjR0Z5WVcwZ2UwOWlhbVZqZEgwZ2IzQjBjeUJQY0hScGIyNWhiQ0J2Y0hScGIyNXpJRzlpYW1WamRDQjBhR0YwSUdGc2RHVnljeUIwYUdVZ2IzVjBjSFYwTGx4dUlDb3ZYRzR2S2lCc1pXZGhZM2s2SUc5aWFpd2djMmh2ZDBocFpHUmxiaXdnWkdWd2RHZ3NJR052Ykc5eWN5b3ZYRzVtZFc1amRHbHZiaUJwYm5Od1pXTjBLRzlpYWl3Z2IzQjBjeWtnZTF4dUlDQXZMeUJrWldaaGRXeDBJRzl3ZEdsdmJuTmNiaUFnZG1GeUlHTjBlQ0E5SUh0Y2JpQWdJQ0J6WldWdU9pQmJYU3hjYmlBZ0lDQnpkSGxzYVhwbE9pQnpkSGxzYVhwbFRtOURiMnh2Y2x4dUlDQjlPMXh1SUNBdkx5QnNaV2RoWTNrdUxpNWNiaUFnYVdZZ0tHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BqMGdNeWtnWTNSNExtUmxjSFJvSUQwZ1lYSm5kVzFsYm5Seld6SmRPMXh1SUNCcFppQW9ZWEpuZFcxbGJuUnpMbXhsYm1kMGFDQStQU0EwS1NCamRIZ3VZMjlzYjNKeklEMGdZWEpuZFcxbGJuUnpXek5kTzF4dUlDQnBaaUFvYVhOQ2IyOXNaV0Z1S0c5d2RITXBLU0I3WEc0Z0lDQWdMeThnYkdWbllXTjVMaTR1WEc0Z0lDQWdZM1I0TG5Ob2IzZElhV1JrWlc0Z1BTQnZjSFJ6TzF4dUlDQjlJR1ZzYzJVZ2FXWWdLRzl3ZEhNcElIdGNiaUFnSUNBdkx5Qm5iM1FnWVc0Z1hDSnZjSFJwYjI1elhDSWdiMkpxWldOMFhHNGdJQ0FnWlhod2IzSjBjeTVmWlhoMFpXNWtLR04wZUN3Z2IzQjBjeWs3WEc0Z0lIMWNiaUFnTHk4Z2MyVjBJR1JsWm1GMWJIUWdiM0IwYVc5dWMxeHVJQ0JwWmlBb2FYTlZibVJsWm1sdVpXUW9ZM1I0TG5Ob2IzZElhV1JrWlc0cEtTQmpkSGd1YzJodmQwaHBaR1JsYmlBOUlHWmhiSE5sTzF4dUlDQnBaaUFvYVhOVmJtUmxabWx1WldRb1kzUjRMbVJsY0hSb0tTa2dZM1I0TG1SbGNIUm9JRDBnTWp0Y2JpQWdhV1lnS0dselZXNWtaV1pwYm1Wa0tHTjBlQzVqYjJ4dmNuTXBLU0JqZEhndVkyOXNiM0p6SUQwZ1ptRnNjMlU3WEc0Z0lHbG1JQ2hwYzFWdVpHVm1hVzVsWkNoamRIZ3VZM1Z6ZEc5dFNXNXpjR1ZqZENrcElHTjBlQzVqZFhOMGIyMUpibk53WldOMElEMGdkSEoxWlR0Y2JpQWdhV1lnS0dOMGVDNWpiMnh2Y25NcElHTjBlQzV6ZEhsc2FYcGxJRDBnYzNSNWJHbDZaVmRwZEdoRGIyeHZjanRjYmlBZ2NtVjBkWEp1SUdadmNtMWhkRlpoYkhWbEtHTjBlQ3dnYjJKcUxDQmpkSGd1WkdWd2RHZ3BPMXh1ZlZ4dVpYaHdiM0owY3k1cGJuTndaV04wSUQwZ2FXNXpjR1ZqZER0Y2JseHVYRzR2THlCb2RIUndPaTh2Wlc0dWQybHJhWEJsWkdsaExtOXlaeTkzYVd0cEwwRk9VMGxmWlhOallYQmxYMk52WkdValozSmhjR2hwWTNOY2JtbHVjM0JsWTNRdVkyOXNiM0p6SUQwZ2UxeHVJQ0FuWW05c1pDY2dPaUJiTVN3Z01qSmRMRnh1SUNBbmFYUmhiR2xqSnlBNklGc3pMQ0F5TTEwc1hHNGdJQ2QxYm1SbGNteHBibVVuSURvZ1d6UXNJREkwWFN4Y2JpQWdKMmx1ZG1WeWMyVW5JRG9nV3pjc0lESTNYU3hjYmlBZ0ozZG9hWFJsSnlBNklGc3pOeXdnTXpsZExGeHVJQ0FuWjNKbGVTY2dPaUJiT1RBc0lETTVYU3hjYmlBZ0oySnNZV05ySnlBNklGc3pNQ3dnTXpsZExGeHVJQ0FuWW14MVpTY2dPaUJiTXpRc0lETTVYU3hjYmlBZ0oyTjVZVzRuSURvZ1d6TTJMQ0F6T1Ywc1hHNGdJQ2RuY21WbGJpY2dPaUJiTXpJc0lETTVYU3hjYmlBZ0oyMWhaMlZ1ZEdFbklEb2dXek0xTENBek9WMHNYRzRnSUNkeVpXUW5JRG9nV3pNeExDQXpPVjBzWEc0Z0lDZDVaV3hzYjNjbklEb2dXek16TENBek9WMWNibjA3WEc1Y2JpOHZJRVJ2YmlkMElIVnpaU0FuWW14MVpTY2dibTkwSUhacGMybGliR1VnYjI0Z1kyMWtMbVY0WlZ4dWFXNXpjR1ZqZEM1emRIbHNaWE1nUFNCN1hHNGdJQ2R6Y0dWamFXRnNKem9nSjJONVlXNG5MRnh1SUNBbmJuVnRZbVZ5SnpvZ0ozbGxiR3h2ZHljc1hHNGdJQ2RpYjI5c1pXRnVKem9nSjNsbGJHeHZkeWNzWEc0Z0lDZDFibVJsWm1sdVpXUW5PaUFuWjNKbGVTY3NYRzRnSUNkdWRXeHNKem9nSjJKdmJHUW5MRnh1SUNBbmMzUnlhVzVuSnpvZ0oyZHlaV1Z1Snl4Y2JpQWdKMlJoZEdVbk9pQW5iV0ZuWlc1MFlTY3NYRzRnSUM4dklGd2libUZ0WlZ3aU9pQnBiblJsYm5ScGIyNWhiR3g1SUc1dmRDQnpkSGxzYVc1blhHNGdJQ2R5WldkbGVIQW5PaUFuY21Wa0oxeHVmVHRjYmx4dVhHNW1kVzVqZEdsdmJpQnpkSGxzYVhwbFYybDBhRU52Ykc5eUtITjBjaXdnYzNSNWJHVlVlWEJsS1NCN1hHNGdJSFpoY2lCemRIbHNaU0E5SUdsdWMzQmxZM1F1YzNSNWJHVnpXM04wZVd4bFZIbHdaVjA3WEc1Y2JpQWdhV1lnS0hOMGVXeGxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlDZGNYSFV3TURGaVd5Y2dLeUJwYm5Od1pXTjBMbU52Ykc5eWMxdHpkSGxzWlYxYk1GMGdLeUFuYlNjZ0t5QnpkSElnSzF4dUlDQWdJQ0FnSUNBZ0lDQW5YRngxTURBeFlsc25JQ3NnYVc1emNHVmpkQzVqYjJ4dmNuTmJjM1I1YkdWZFd6RmRJQ3NnSjIwbk8xeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lISmxkSFZ5YmlCemRISTdYRzRnSUgxY2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCemRIbHNhWHBsVG05RGIyeHZjaWh6ZEhJc0lITjBlV3hsVkhsd1pTa2dlMXh1SUNCeVpYUjFjbTRnYzNSeU8xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHRnljbUY1Vkc5SVlYTm9LR0Z5Y21GNUtTQjdYRzRnSUhaaGNpQm9ZWE5vSUQwZ2UzMDdYRzVjYmlBZ1lYSnlZWGt1Wm05eVJXRmphQ2htZFc1amRHbHZiaWgyWVd3c0lHbGtlQ2tnZTF4dUlDQWdJR2hoYzJoYmRtRnNYU0E5SUhSeWRXVTdYRzRnSUgwcE8xeHVYRzRnSUhKbGRIVnliaUJvWVhOb08xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEZaaGJIVmxLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5a2dlMXh1SUNBdkx5QlFjbTkyYVdSbElHRWdhRzl2YXlCbWIzSWdkWE5sY2kxemNHVmphV1pwWldRZ2FXNXpjR1ZqZENCbWRXNWpkR2x2Ym5NdVhHNGdJQzh2SUVOb1pXTnJJSFJvWVhRZ2RtRnNkV1VnYVhNZ1lXNGdiMkpxWldOMElIZHBkR2dnWVc0Z2FXNXpjR1ZqZENCbWRXNWpkR2x2YmlCdmJpQnBkRnh1SUNCcFppQW9ZM1I0TG1OMWMzUnZiVWx1YzNCbFkzUWdKaVpjYmlBZ0lDQWdJSFpoYkhWbElDWW1YRzRnSUNBZ0lDQnBjMFoxYm1OMGFXOXVLSFpoYkhWbExtbHVjM0JsWTNRcElDWW1YRzRnSUNBZ0lDQXZMeUJHYVd4MFpYSWdiM1YwSUhSb1pTQjFkR2xzSUcxdlpIVnNaU3dnYVhRbmN5QnBibk53WldOMElHWjFibU4wYVc5dUlHbHpJSE53WldOcFlXeGNiaUFnSUNBZ0lIWmhiSFZsTG1sdWMzQmxZM1FnSVQwOUlHVjRjRzl5ZEhNdWFXNXpjR1ZqZENBbUpseHVJQ0FnSUNBZ0x5OGdRV3h6YnlCbWFXeDBaWElnYjNWMElHRnVlU0J3Y205MGIzUjVjR1VnYjJKcVpXTjBjeUIxYzJsdVp5QjBhR1VnWTJseVkzVnNZWElnWTJobFkyc3VYRzRnSUNBZ0lDQWhLSFpoYkhWbExtTnZibk4wY25WamRHOXlJQ1ltSUhaaGJIVmxMbU52Ym5OMGNuVmpkRzl5TG5CeWIzUnZkSGx3WlNBOVBUMGdkbUZzZFdVcEtTQjdYRzRnSUNBZ2RtRnlJSEpsZENBOUlIWmhiSFZsTG1sdWMzQmxZM1FvY21WamRYSnpaVlJwYldWekxDQmpkSGdwTzF4dUlDQWdJR2xtSUNnaGFYTlRkSEpwYm1jb2NtVjBLU2tnZTF4dUlDQWdJQ0FnY21WMElEMGdabTl5YldGMFZtRnNkV1VvWTNSNExDQnlaWFFzSUhKbFkzVnljMlZVYVcxbGN5azdYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJ5WlhRN1hHNGdJSDFjYmx4dUlDQXZMeUJRY21sdGFYUnBkbVVnZEhsd1pYTWdZMkZ1Ym05MElHaGhkbVVnY0hKdmNHVnlkR2xsYzF4dUlDQjJZWElnY0hKcGJXbDBhWFpsSUQwZ1ptOXliV0YwVUhKcGJXbDBhWFpsS0dOMGVDd2dkbUZzZFdVcE8xeHVJQ0JwWmlBb2NISnBiV2wwYVhabEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhCeWFXMXBkR2wyWlR0Y2JpQWdmVnh1WEc0Z0lDOHZJRXh2YjJzZ2RYQWdkR2hsSUd0bGVYTWdiMllnZEdobElHOWlhbVZqZEM1Y2JpQWdkbUZ5SUd0bGVYTWdQU0JQWW1wbFkzUXVhMlY1Y3loMllXeDFaU2s3WEc0Z0lIWmhjaUIyYVhOcFlteGxTMlY1Y3lBOUlHRnljbUY1Vkc5SVlYTm9LR3RsZVhNcE8xeHVYRzRnSUdsbUlDaGpkSGd1YzJodmQwaHBaR1JsYmlrZ2UxeHVJQ0FnSUd0bGVYTWdQU0JQWW1wbFkzUXVaMlYwVDNkdVVISnZjR1Z5ZEhsT1lXMWxjeWgyWVd4MVpTazdYRzRnSUgxY2JseHVJQ0F2THlCSlJTQmtiMlZ6YmlkMElHMWhhMlVnWlhKeWIzSWdabWxsYkdSeklHNXZiaTFsYm5WdFpYSmhZbXhsWEc0Z0lDOHZJR2gwZEhBNkx5OXRjMlJ1TG0xcFkzSnZjMjltZEM1amIyMHZaVzR0ZFhNdmJHbGljbUZ5ZVM5cFpTOWtkM2MxTW5OaWRDaDJQWFp6TGprMEtTNWhjM0I0WEc0Z0lHbG1JQ2hwYzBWeWNtOXlLSFpoYkhWbEtWeHVJQ0FnSUNBZ0ppWWdLR3RsZVhNdWFXNWtaWGhQWmlnbmJXVnpjMkZuWlNjcElENDlJREFnZkh3Z2EyVjVjeTVwYm1SbGVFOW1LQ2RrWlhOamNtbHdkR2x2YmljcElENDlJREFwS1NCN1hHNGdJQ0FnY21WMGRYSnVJR1p2Y20xaGRFVnljbTl5S0haaGJIVmxLVHRjYmlBZ2ZWeHVYRzRnSUM4dklGTnZiV1VnZEhsd1pTQnZaaUJ2WW1wbFkzUWdkMmwwYUc5MWRDQndjbTl3WlhKMGFXVnpJR05oYmlCaVpTQnphRzl5ZEdOMWRIUmxaQzVjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdhV1lnS0dselJuVnVZM1JwYjI0b2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNCMllYSWdibUZ0WlNBOUlIWmhiSFZsTG01aGJXVWdQeUFuT2lBbklDc2dkbUZzZFdVdWJtRnRaU0E2SUNjbk8xeHVJQ0FnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtDZGJSblZ1WTNScGIyNG5JQ3NnYm1GdFpTQXJJQ2RkSnl3Z0ozTndaV05wWVd3bktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpVbVZuUlhod0tIWmhiSFZsS1NrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdOMGVDNXpkSGxzYVhwbEtGSmxaMFY0Y0M1d2NtOTBiM1I1Y0dVdWRHOVRkSEpwYm1jdVkyRnNiQ2gyWVd4MVpTa3NJQ2R5WldkbGVIQW5LVHRjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR2x6UkdGMFpTaDJZV3gxWlNrcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTaEVZWFJsTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLSFpoYkhWbEtTd2dKMlJoZEdVbktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHbHpSWEp5YjNJb2RtRnNkV1VwS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnWm05eWJXRjBSWEp5YjNJb2RtRnNkV1VwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUhaaGNpQmlZWE5sSUQwZ0p5Y3NJR0Z5Y21GNUlEMGdabUZzYzJVc0lHSnlZV05sY3lBOUlGc25leWNzSUNkOUoxMDdYRzVjYmlBZ0x5OGdUV0ZyWlNCQmNuSmhlU0J6WVhrZ2RHaGhkQ0IwYUdWNUlHRnlaU0JCY25KaGVWeHVJQ0JwWmlBb2FYTkJjbkpoZVNoMllXeDFaU2twSUh0Y2JpQWdJQ0JoY25KaGVTQTlJSFJ5ZFdVN1hHNGdJQ0FnWW5KaFkyVnpJRDBnV3lkYkp5d2dKMTBuWFR0Y2JpQWdmVnh1WEc0Z0lDOHZJRTFoYTJVZ1puVnVZM1JwYjI1eklITmhlU0IwYUdGMElIUm9aWGtnWVhKbElHWjFibU4wYVc5dWMxeHVJQ0JwWmlBb2FYTkdkVzVqZEdsdmJpaDJZV3gxWlNrcElIdGNiaUFnSUNCMllYSWdiaUE5SUhaaGJIVmxMbTVoYldVZ1B5QW5PaUFuSUNzZ2RtRnNkV1V1Ym1GdFpTQTZJQ2NuTzF4dUlDQWdJR0poYzJVZ1BTQW5JRnRHZFc1amRHbHZiaWNnS3lCdUlDc2dKMTBuTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCU1pXZEZlSEJ6SUhOaGVTQjBhR0YwSUhSb1pYa2dZWEpsSUZKbFowVjRjSE5jYmlBZ2FXWWdLR2x6VW1WblJYaHdLSFpoYkhWbEtTa2dlMXh1SUNBZ0lHSmhjMlVnUFNBbklDY2dLeUJTWldkRmVIQXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ0x5OGdUV0ZyWlNCa1lYUmxjeUIzYVhSb0lIQnliM0JsY25ScFpYTWdabWx5YzNRZ2MyRjVJSFJvWlNCa1lYUmxYRzRnSUdsbUlDaHBjMFJoZEdVb2RtRnNkV1VwS1NCN1hHNGdJQ0FnWW1GelpTQTlJQ2NnSnlBcklFUmhkR1V1Y0hKdmRHOTBlWEJsTG5SdlZWUkRVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBPMXh1SUNCOVhHNWNiaUFnTHk4Z1RXRnJaU0JsY25KdmNpQjNhWFJvSUcxbGMzTmhaMlVnWm1seWMzUWdjMkY1SUhSb1pTQmxjbkp2Y2x4dUlDQnBaaUFvYVhORmNuSnZjaWgyWVd4MVpTa3BJSHRjYmlBZ0lDQmlZWE5sSUQwZ0p5QW5JQ3NnWm05eWJXRjBSWEp5YjNJb2RtRnNkV1VwTzF4dUlDQjlYRzVjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdJQ1ltSUNnaFlYSnlZWGtnZkh3Z2RtRnNkV1V1YkdWdVozUm9JRDA5SURBcEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUdKeVlXTmxjMXN3WFNBcklHSmhjMlVnS3lCaWNtRmpaWE5iTVYwN1hHNGdJSDFjYmx4dUlDQnBaaUFvY21WamRYSnpaVlJwYldWeklEd2dNQ2tnZTF4dUlDQWdJR2xtSUNocGMxSmxaMFY0Y0NoMllXeDFaU2twSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNoU1pXZEZlSEF1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kbUZzZFdVcExDQW5jbVZuWlhod0p5azdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqZEhndWMzUjViR2w2WlNnblcwOWlhbVZqZEYwbkxDQW5jM0JsWTJsaGJDY3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJR04wZUM1elpXVnVMbkIxYzJnb2RtRnNkV1VwTzF4dVhHNGdJSFpoY2lCdmRYUndkWFE3WEc0Z0lHbG1JQ2hoY25KaGVTa2dlMXh1SUNBZ0lHOTFkSEIxZENBOUlHWnZjbTFoZEVGeWNtRjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVYTXBPMXh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJRzkxZEhCMWRDQTlJR3RsZVhNdWJXRndLR1oxYm1OMGFXOXVLR3RsZVNrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdadmNtMWhkRkJ5YjNCbGNuUjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVTd2dZWEp5WVhrcE8xeHVJQ0FnSUgwcE8xeHVJQ0I5WEc1Y2JpQWdZM1I0TG5ObFpXNHVjRzl3S0NrN1hHNWNiaUFnY21WMGRYSnVJSEpsWkhWalpWUnZVMmx1WjJ4bFUzUnlhVzVuS0c5MWRIQjFkQ3dnWW1GelpTd2dZbkpoWTJWektUdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQm1iM0p0WVhSUWNtbHRhWFJwZG1Vb1kzUjRMQ0IyWVd4MVpTa2dlMXh1SUNCcFppQW9hWE5WYm1SbFptbHVaV1FvZG1Gc2RXVXBLVnh1SUNBZ0lISmxkSFZ5YmlCamRIZ3VjM1I1YkdsNlpTZ25kVzVrWldacGJtVmtKeXdnSjNWdVpHVm1hVzVsWkNjcE8xeHVJQ0JwWmlBb2FYTlRkSEpwYm1jb2RtRnNkV1VwS1NCN1hHNGdJQ0FnZG1GeUlITnBiWEJzWlNBOUlDZGNYQ2NuSUNzZ1NsTlBUaTV6ZEhKcGJtZHBabmtvZG1Gc2RXVXBMbkpsY0d4aFkyVW9MMTVjSW54Y0lpUXZaeXdnSnljcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXVjbVZ3YkdGalpTZ3ZKeTluTENCY0lseGNYRnduWENJcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXVjbVZ3YkdGalpTZ3ZYRnhjWEZ3aUwyY3NJQ2RjSWljcElDc2dKMXhjSnljN1hHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0hOcGJYQnNaU3dnSjNOMGNtbHVaeWNwTzF4dUlDQjlYRzRnSUdsbUlDaHBjMDUxYldKbGNpaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NjbklDc2dkbUZzZFdVc0lDZHVkVzFpWlhJbktUdGNiaUFnYVdZZ0tHbHpRbTl2YkdWaGJpaDJZV3gxWlNrcFhHNGdJQ0FnY21WMGRYSnVJR04wZUM1emRIbHNhWHBsS0NjbklDc2dkbUZzZFdVc0lDZGliMjlzWldGdUp5azdYRzRnSUM4dklFWnZjaUJ6YjIxbElISmxZWE52YmlCMGVYQmxiMllnYm5Wc2JDQnBjeUJjSW05aWFtVmpkRndpTENCemJ5QnpjR1ZqYVdGc0lHTmhjMlVnYUdWeVpTNWNiaUFnYVdZZ0tHbHpUblZzYkNoMllXeDFaU2twWEc0Z0lDQWdjbVYwZFhKdUlHTjBlQzV6ZEhsc2FYcGxLQ2R1ZFd4c0p5d2dKMjUxYkd3bktUdGNibjFjYmx4dVhHNW1kVzVqZEdsdmJpQm1iM0p0WVhSRmNuSnZjaWgyWVd4MVpTa2dlMXh1SUNCeVpYUjFjbTRnSjFzbklDc2dSWEp5YjNJdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZG1Gc2RXVXBJQ3NnSjEwbk8xeHVmVnh1WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEVGeWNtRjVLR04wZUN3Z2RtRnNkV1VzSUhKbFkzVnljMlZVYVcxbGN5d2dkbWx6YVdKc1pVdGxlWE1zSUd0bGVYTXBJSHRjYmlBZ2RtRnlJRzkxZEhCMWRDQTlJRnRkTzF4dUlDQm1iM0lnS0haaGNpQnBJRDBnTUN3Z2JDQTlJSFpoYkhWbExteGxibWQwYURzZ2FTQThJR3c3SUNzcmFTa2dlMXh1SUNBZ0lHbG1JQ2hvWVhOUGQyNVFjbTl3WlhKMGVTaDJZV3gxWlN3Z1UzUnlhVzVuS0drcEtTa2dlMXh1SUNBZ0lDQWdiM1YwY0hWMExuQjFjMmdvWm05eWJXRjBVSEp2Y0dWeWRIa29ZM1I0TENCMllXeDFaU3dnY21WamRYSnpaVlJwYldWekxDQjJhWE5wWW14bFMyVjVjeXhjYmlBZ0lDQWdJQ0FnSUNCVGRISnBibWNvYVNrc0lIUnlkV1VwS1R0Y2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdiM1YwY0hWMExuQjFjMmdvSnljcE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCclpYbHpMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9hMlY1S1NCN1hHNGdJQ0FnYVdZZ0tDRnJaWGt1YldGMFkyZ29MMTVjWEdRckpDOHBLU0I3WEc0Z0lDQWdJQ0J2ZFhSd2RYUXVjSFZ6YUNobWIzSnRZWFJRY205d1pYSjBlU2hqZEhnc0lIWmhiSFZsTENCeVpXTjFjbk5sVkdsdFpYTXNJSFpwYzJsaWJHVkxaWGx6TEZ4dUlDQWdJQ0FnSUNBZ0lHdGxlU3dnZEhKMVpTa3BPMXh1SUNBZ0lIMWNiaUFnZlNrN1hHNGdJSEpsZEhWeWJpQnZkWFJ3ZFhRN1hHNTlYRzVjYmx4dVpuVnVZM1JwYjI0Z1ptOXliV0YwVUhKdmNHVnlkSGtvWTNSNExDQjJZV3gxWlN3Z2NtVmpkWEp6WlZScGJXVnpMQ0IyYVhOcFlteGxTMlY1Y3l3Z2EyVjVMQ0JoY25KaGVTa2dlMXh1SUNCMllYSWdibUZ0WlN3Z2MzUnlMQ0JrWlhOak8xeHVJQ0JrWlhOaklEMGdUMkpxWldOMExtZGxkRTkzYmxCeWIzQmxjblI1UkdWelkzSnBjSFJ2Y2loMllXeDFaU3dnYTJWNUtTQjhmQ0I3SUhaaGJIVmxPaUIyWVd4MVpWdHJaWGxkSUgwN1hHNGdJR2xtSUNoa1pYTmpMbWRsZENrZ2UxeHVJQ0FnSUdsbUlDaGtaWE5qTG5ObGRDa2dlMXh1SUNBZ0lDQWdjM1J5SUQwZ1kzUjRMbk4wZVd4cGVtVW9KMXRIWlhSMFpYSXZVMlYwZEdWeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lITjBjaUE5SUdOMGVDNXpkSGxzYVhwbEtDZGJSMlYwZEdWeVhTY3NJQ2R6Y0dWamFXRnNKeWs3WEc0Z0lDQWdmVnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJR2xtSUNoa1pYTmpMbk5sZENrZ2UxeHVJQ0FnSUNBZ2MzUnlJRDBnWTNSNExuTjBlV3hwZW1Vb0oxdFRaWFIwWlhKZEp5d2dKM053WldOcFlXd25LVHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdhV1lnS0NGb1lYTlBkMjVRY205d1pYSjBlU2gyYVhOcFlteGxTMlY1Y3l3Z2EyVjVLU2tnZTF4dUlDQWdJRzVoYldVZ1BTQW5XeWNnS3lCclpYa2dLeUFuWFNjN1hHNGdJSDFjYmlBZ2FXWWdLQ0Z6ZEhJcElIdGNiaUFnSUNCcFppQW9ZM1I0TG5ObFpXNHVhVzVrWlhoUFppaGtaWE5qTG5aaGJIVmxLU0E4SURBcElIdGNiaUFnSUNBZ0lHbG1JQ2hwYzA1MWJHd29jbVZqZFhKelpWUnBiV1Z6S1NrZ2UxeHVJQ0FnSUNBZ0lDQnpkSElnUFNCbWIzSnRZWFJXWVd4MVpTaGpkSGdzSUdSbGMyTXVkbUZzZFdVc0lHNTFiR3dwTzF4dUlDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnYzNSeUlEMGdabTl5YldGMFZtRnNkV1VvWTNSNExDQmtaWE5qTG5aaGJIVmxMQ0J5WldOMWNuTmxWR2x0WlhNZ0xTQXhLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR2xtSUNoemRISXVhVzVrWlhoUFppZ25YRnh1SnlrZ1BpQXRNU2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9ZWEp5WVhrcElIdGNiaUFnSUNBZ0lDQWdJQ0J6ZEhJZ1BTQnpkSEl1YzNCc2FYUW9KMXhjYmljcExtMWhjQ2htZFc1amRHbHZiaWhzYVc1bEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnSnlBZ0p5QXJJR3hwYm1VN1hHNGdJQ0FnSUNBZ0lDQWdmU2t1YW05cGJpZ25YRnh1SnlrdWMzVmljM1J5S0RJcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJSE4wY2lBOUlDZGNYRzRuSUNzZ2MzUnlMbk53YkdsMEtDZGNYRzRuS1M1dFlYQW9ablZ1WTNScGIyNG9iR2x1WlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2NnSUNBbklDc2diR2x1WlR0Y2JpQWdJQ0FnSUNBZ0lDQjlLUzVxYjJsdUtDZGNYRzRuS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0J6ZEhJZ1BTQmpkSGd1YzNSNWJHbDZaU2duVzBOcGNtTjFiR0Z5WFNjc0lDZHpjR1ZqYVdGc0p5azdYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lHbG1JQ2hwYzFWdVpHVm1hVzVsWkNodVlXMWxLU2tnZTF4dUlDQWdJR2xtSUNoaGNuSmhlU0FtSmlCclpYa3ViV0YwWTJnb0wxNWNYR1FySkM4cEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2MzUnlPMXh1SUNBZ0lIMWNiaUFnSUNCdVlXMWxJRDBnU2xOUFRpNXpkSEpwYm1kcFpua29KeWNnS3lCclpYa3BPMXh1SUNBZ0lHbG1JQ2h1WVcxbExtMWhkR05vS0M5ZVhDSW9XMkV0ZWtFdFdsOWRXMkV0ZWtFdFdsOHdMVGxkS2lsY0lpUXZLU2tnZTF4dUlDQWdJQ0FnYm1GdFpTQTlJRzVoYldVdWMzVmljM1J5S0RFc0lHNWhiV1V1YkdWdVozUm9JQzBnTWlrN1hHNGdJQ0FnSUNCdVlXMWxJRDBnWTNSNExuTjBlV3hwZW1Vb2JtRnRaU3dnSjI1aGJXVW5LVHRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2JtRnRaU0E5SUc1aGJXVXVjbVZ3YkdGalpTZ3ZKeTluTENCY0lseGNYRnduWENJcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDNXlaWEJzWVdObEtDOWNYRnhjWENJdlp5d2dKMXdpSnlsY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xuSmxjR3hoWTJVb0x5aGVYQ0o4WENJa0tTOW5MQ0JjSWlkY0lpazdYRzRnSUNBZ0lDQnVZVzFsSUQwZ1kzUjRMbk4wZVd4cGVtVW9ibUZ0WlN3Z0ozTjBjbWx1WnljcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCdVlXMWxJQ3NnSnpvZ0p5QXJJSE4wY2p0Y2JuMWNibHh1WEc1bWRXNWpkR2x2YmlCeVpXUjFZMlZVYjFOcGJtZHNaVk4wY21sdVp5aHZkWFJ3ZFhRc0lHSmhjMlVzSUdKeVlXTmxjeWtnZTF4dUlDQjJZWElnYm5WdFRHbHVaWE5GYzNRZ1BTQXdPMXh1SUNCMllYSWdiR1Z1WjNSb0lEMGdiM1YwY0hWMExuSmxaSFZqWlNobWRXNWpkR2x2Ymlod2NtVjJMQ0JqZFhJcElIdGNiaUFnSUNCdWRXMU1hVzVsYzBWemRDc3JPMXh1SUNBZ0lHbG1JQ2hqZFhJdWFXNWtaWGhQWmlnblhGeHVKeWtnUGowZ01Da2diblZ0VEdsdVpYTkZjM1FyS3p0Y2JpQWdJQ0J5WlhSMWNtNGdjSEpsZGlBcklHTjFjaTV5WlhCc1lXTmxLQzljWEhVd01ERmlYRnhiWEZ4a1hGeGtQMjB2Wnl3Z0p5Y3BMbXhsYm1kMGFDQXJJREU3WEc0Z0lIMHNJREFwTzF4dVhHNGdJR2xtSUNoc1pXNW5kR2dnUGlBMk1Da2dlMXh1SUNBZ0lISmxkSFZ5YmlCaWNtRmpaWE5iTUYwZ0sxeHVJQ0FnSUNBZ0lDQWdJQ0FvWW1GelpTQTlQVDBnSnljZ1B5QW5KeUE2SUdKaGMyVWdLeUFuWEZ4dUlDY3BJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0p5QW5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ2IzVjBjSFYwTG1wdmFXNG9KeXhjWEc0Z0lDY3BJQ3RjYmlBZ0lDQWdJQ0FnSUNBZ0p5QW5JQ3RjYmlBZ0lDQWdJQ0FnSUNBZ1luSmhZMlZ6V3pGZE8xeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlHSnlZV05sYzFzd1hTQXJJR0poYzJVZ0t5QW5JQ2NnS3lCdmRYUndkWFF1YW05cGJpZ25MQ0FuS1NBcklDY2dKeUFySUdKeVlXTmxjMXN4WFR0Y2JuMWNibHh1WEc0dkx5Qk9UMVJGT2lCVWFHVnpaU0IwZVhCbElHTm9aV05yYVc1bklHWjFibU4wYVc5dWN5QnBiblJsYm5ScGIyNWhiR3g1SUdSdmJpZDBJSFZ6WlNCZ2FXNXpkR0Z1WTJWdlptQmNiaTh2SUdKbFkyRjFjMlVnYVhRZ2FYTWdabkpoWjJsc1pTQmhibVFnWTJGdUlHSmxJR1ZoYzJsc2VTQm1ZV3RsWkNCM2FYUm9JR0JQWW1wbFkzUXVZM0psWVhSbEtDbGdMbHh1Wm5WdVkzUnBiMjRnYVhOQmNuSmhlU2hoY2lrZ2UxeHVJQ0J5WlhSMWNtNGdRWEp5WVhrdWFYTkJjbkpoZVNoaGNpazdYRzU5WEc1bGVIQnZjblJ6TG1selFYSnlZWGtnUFNCcGMwRnljbUY1TzF4dVhHNW1kVzVqZEdsdmJpQnBjMEp2YjJ4bFlXNG9ZWEpuS1NCN1hHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ1lYSm5JRDA5UFNBblltOXZiR1ZoYmljN1hHNTlYRzVsZUhCdmNuUnpMbWx6UW05dmJHVmhiaUE5SUdselFtOXZiR1ZoYmp0Y2JseHVablZ1WTNScGIyNGdhWE5PZFd4c0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5UFNCdWRXeHNPMXh1ZlZ4dVpYaHdiM0owY3k1cGMwNTFiR3dnUFNCcGMwNTFiR3c3WEc1Y2JtWjFibU4wYVc5dUlHbHpUblZzYkU5eVZXNWtaV1pwYm1Wa0tHRnlaeWtnZTF4dUlDQnlaWFIxY200Z1lYSm5JRDA5SUc1MWJHdzdYRzU5WEc1bGVIQnZjblJ6TG1selRuVnNiRTl5Vlc1a1pXWnBibVZrSUQwZ2FYTk9kV3hzVDNKVmJtUmxabWx1WldRN1hHNWNibVoxYm1OMGFXOXVJR2x6VG5WdFltVnlLR0Z5WnlrZ2UxeHVJQ0J5WlhSMWNtNGdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0oyNTFiV0psY2ljN1hHNTlYRzVsZUhCdmNuUnpMbWx6VG5WdFltVnlJRDBnYVhOT2RXMWlaWEk3WEc1Y2JtWjFibU4wYVc5dUlHbHpVM1J5YVc1bktHRnlaeWtnZTF4dUlDQnlaWFIxY200Z2RIbHdaVzltSUdGeVp5QTlQVDBnSjNOMGNtbHVaeWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpVM1J5YVc1bklEMGdhWE5UZEhKcGJtYzdYRzVjYm1aMWJtTjBhVzl1SUdselUzbHRZbTlzS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM041YldKdmJDYzdYRzU5WEc1bGVIQnZjblJ6TG1selUzbHRZbTlzSUQwZ2FYTlRlVzFpYjJ3N1hHNWNibVoxYm1OMGFXOXVJR2x6Vlc1a1pXWnBibVZrS0dGeVp5a2dlMXh1SUNCeVpYUjFjbTRnWVhKbklEMDlQU0IyYjJsa0lEQTdYRzU5WEc1bGVIQnZjblJ6TG1selZXNWtaV1pwYm1Wa0lEMGdhWE5WYm1SbFptbHVaV1E3WEc1Y2JtWjFibU4wYVc5dUlHbHpVbVZuUlhod0tISmxLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZENoeVpTa2dKaVlnYjJKcVpXTjBWRzlUZEhKcGJtY29jbVVwSUQwOVBTQW5XMjlpYW1WamRDQlNaV2RGZUhCZEp6dGNibjFjYm1WNGNHOXlkSE11YVhOU1pXZEZlSEFnUFNCcGMxSmxaMFY0Y0R0Y2JseHVablZ1WTNScGIyNGdhWE5QWW1wbFkzUW9ZWEpuS1NCN1hHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ1lYSm5JRDA5UFNBbmIySnFaV04wSnlBbUppQmhjbWNnSVQwOUlHNTFiR3c3WEc1OVhHNWxlSEJ2Y25SekxtbHpUMkpxWldOMElEMGdhWE5QWW1wbFkzUTdYRzVjYm1aMWJtTjBhVzl1SUdselJHRjBaU2hrS1NCN1hHNGdJSEpsZEhWeWJpQnBjMDlpYW1WamRDaGtLU0FtSmlCdlltcGxZM1JVYjFOMGNtbHVaeWhrS1NBOVBUMGdKMXR2WW1wbFkzUWdSR0YwWlYwbk8xeHVmVnh1Wlhod2IzSjBjeTVwYzBSaGRHVWdQU0JwYzBSaGRHVTdYRzVjYm1aMWJtTjBhVzl1SUdselJYSnliM0lvWlNrZ2UxeHVJQ0J5WlhSMWNtNGdhWE5QWW1wbFkzUW9aU2tnSmlaY2JpQWdJQ0FnSUNodlltcGxZM1JVYjFOMGNtbHVaeWhsS1NBOVBUMGdKMXR2WW1wbFkzUWdSWEp5YjNKZEp5QjhmQ0JsSUdsdWMzUmhibU5sYjJZZ1JYSnliM0lwTzF4dWZWeHVaWGh3YjNKMGN5NXBjMFZ5Y205eUlEMGdhWE5GY25KdmNqdGNibHh1Wm5WdVkzUnBiMjRnYVhOR2RXNWpkR2x2YmloaGNtY3BJSHRjYmlBZ2NtVjBkWEp1SUhSNWNHVnZaaUJoY21jZ1BUMDlJQ2RtZFc1amRHbHZiaWM3WEc1OVhHNWxlSEJ2Y25SekxtbHpSblZ1WTNScGIyNGdQU0JwYzBaMWJtTjBhVzl1TzF4dVhHNW1kVzVqZEdsdmJpQnBjMUJ5YVcxcGRHbDJaU2hoY21jcElIdGNiaUFnY21WMGRYSnVJR0Z5WnlBOVBUMGdiblZzYkNCOGZGeHVJQ0FnSUNBZ0lDQWdkSGx3Wlc5bUlHRnlaeUE5UFQwZ0oySnZiMnhsWVc0bklIeDhYRzRnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdZWEpuSUQwOVBTQW5iblZ0WW1WeUp5QjhmRnh1SUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5WnlBOVBUMGdKM04wY21sdVp5Y2dmSHhjYmlBZ0lDQWdJQ0FnSUhSNWNHVnZaaUJoY21jZ1BUMDlJQ2R6ZVcxaWIyd25JSHg4SUNBdkx5QkZVellnYzNsdFltOXNYRzRnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdZWEpuSUQwOVBTQW5kVzVrWldacGJtVmtKenRjYm4xY2JtVjRjRzl5ZEhNdWFYTlFjbWx0YVhScGRtVWdQU0JwYzFCeWFXMXBkR2wyWlR0Y2JseHVaWGh3YjNKMGN5NXBjMEoxWm1abGNpQTlJSEpsY1hWcGNtVW9KeTR2YzNWd2NHOXlkQzlwYzBKMVptWmxjaWNwTzF4dVhHNW1kVzVqZEdsdmJpQnZZbXBsWTNSVWIxTjBjbWx1WnlodktTQjdYRzRnSUhKbGRIVnliaUJQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2J5azdYRzU5WEc1Y2JseHVablZ1WTNScGIyNGdjR0ZrS0c0cElIdGNiaUFnY21WMGRYSnVJRzRnUENBeE1DQS9JQ2N3SnlBcklHNHVkRzlUZEhKcGJtY29NVEFwSURvZ2JpNTBiMU4wY21sdVp5Z3hNQ2s3WEc1OVhHNWNibHh1ZG1GeUlHMXZiblJvY3lBOUlGc25TbUZ1Snl3Z0owWmxZaWNzSUNkTllYSW5MQ0FuUVhCeUp5d2dKMDFoZVNjc0lDZEtkVzRuTENBblNuVnNKeXdnSjBGMVp5Y3NJQ2RUWlhBbkxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBblQyTjBKeXdnSjA1dmRpY3NJQ2RFWldNblhUdGNibHh1THk4Z01qWWdSbVZpSURFMk9qRTVPak0wWEc1bWRXNWpkR2x2YmlCMGFXMWxjM1JoYlhBb0tTQjdYRzRnSUhaaGNpQmtJRDBnYm1WM0lFUmhkR1VvS1R0Y2JpQWdkbUZ5SUhScGJXVWdQU0JiY0dGa0tHUXVaMlYwU0c5MWNuTW9LU2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEJoWkNoa0xtZGxkRTFwYm5WMFpYTW9LU2tzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEJoWkNoa0xtZGxkRk5sWTI5dVpITW9LU2xkTG1wdmFXNG9Kem9uS1R0Y2JpQWdjbVYwZFhKdUlGdGtMbWRsZEVSaGRHVW9LU3dnYlc5dWRHaHpXMlF1WjJWMFRXOXVkR2dvS1Ywc0lIUnBiV1ZkTG1wdmFXNG9KeUFuS1R0Y2JuMWNibHh1WEc0dkx5QnNiMmNnYVhNZ2FuVnpkQ0JoSUhSb2FXNGdkM0poY0hCbGNpQjBieUJqYjI1emIyeGxMbXh2WnlCMGFHRjBJSEJ5WlhCbGJtUnpJR0VnZEdsdFpYTjBZVzF3WEc1bGVIQnZjblJ6TG14dlp5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQmpiMjV6YjJ4bExteHZaeWduSlhNZ0xTQWxjeWNzSUhScGJXVnpkR0Z0Y0NncExDQmxlSEJ2Y25SekxtWnZjbTFoZEM1aGNIQnNlU2hsZUhCdmNuUnpMQ0JoY21kMWJXVnVkSE1wS1R0Y2JuMDdYRzVjYmx4dUx5b3FYRzRnS2lCSmJtaGxjbWwwSUhSb1pTQndjbTkwYjNSNWNHVWdiV1YwYUc5a2N5Qm1jbTl0SUc5dVpTQmpiMjV6ZEhKMVkzUnZjaUJwYm5SdklHRnViM1JvWlhJdVhHNGdLbHh1SUNvZ1ZHaGxJRVoxYm1OMGFXOXVMbkJ5YjNSdmRIbHdaUzVwYm1obGNtbDBjeUJtY205dElHeGhibWN1YW5NZ2NtVjNjbWwwZEdWdUlHRnpJR0VnYzNSaGJtUmhiRzl1WlZ4dUlDb2dablZ1WTNScGIyNGdLRzV2ZENCdmJpQkdkVzVqZEdsdmJpNXdjbTkwYjNSNWNHVXBMaUJPVDFSRk9pQkpaaUIwYUdseklHWnBiR1VnYVhNZ2RHOGdZbVVnYkc5aFpHVmtYRzRnS2lCa2RYSnBibWNnWW05dmRITjBjbUZ3Y0dsdVp5QjBhR2x6SUdaMWJtTjBhVzl1SUc1bFpXUnpJSFJ2SUdKbElISmxkM0pwZEhSbGJpQjFjMmx1WnlCemIyMWxJRzVoZEdsMlpWeHVJQ29nWm5WdVkzUnBiMjV6SUdGeklIQnliM1J2ZEhsd1pTQnpaWFIxY0NCMWMybHVaeUJ1YjNKdFlXd2dTbUYyWVZOamNtbHdkQ0JrYjJWeklHNXZkQ0IzYjNKcklHRnpYRzRnS2lCbGVIQmxZM1JsWkNCa2RYSnBibWNnWW05dmRITjBjbUZ3Y0dsdVp5QW9jMlZsSUcxcGNuSnZjaTVxY3lCcGJpQnlNVEUwT1RBektTNWNiaUFxWEc0Z0tpQkFjR0Z5WVcwZ2UyWjFibU4wYVc5dWZTQmpkRzl5SUVOdmJuTjBjblZqZEc5eUlHWjFibU4wYVc5dUlIZG9hV05vSUc1bFpXUnpJSFJ2SUdsdWFHVnlhWFFnZEdobFhHNGdLaUFnSUNBZ2NISnZkRzkwZVhCbExseHVJQ29nUUhCaGNtRnRJSHRtZFc1amRHbHZibjBnYzNWd1pYSkRkRzl5SUVOdmJuTjBjblZqZEc5eUlHWjFibU4wYVc5dUlIUnZJR2x1YUdWeWFYUWdjSEp2ZEc5MGVYQmxJR1p5YjIwdVhHNGdLaTljYm1WNGNHOXlkSE11YVc1b1pYSnBkSE1nUFNCeVpYRjFhWEpsS0NkcGJtaGxjbWwwY3ljcE8xeHVYRzVsZUhCdmNuUnpMbDlsZUhSbGJtUWdQU0JtZFc1amRHbHZiaWh2Y21sbmFXNHNJR0ZrWkNrZ2UxeHVJQ0F2THlCRWIyNG5kQ0JrYnlCaGJubDBhR2x1WnlCcFppQmhaR1FnYVhOdUozUWdZVzRnYjJKcVpXTjBYRzRnSUdsbUlDZ2hZV1JrSUh4OElDRnBjMDlpYW1WamRDaGhaR1FwS1NCeVpYUjFjbTRnYjNKcFoybHVPMXh1WEc0Z0lIWmhjaUJyWlhseklEMGdUMkpxWldOMExtdGxlWE1vWVdSa0tUdGNiaUFnZG1GeUlHa2dQU0JyWlhsekxteGxibWQwYUR0Y2JpQWdkMmhwYkdVZ0tHa3RMU2tnZTF4dUlDQWdJRzl5YVdkcGJsdHJaWGx6VzJsZFhTQTlJR0ZrWkZ0clpYbHpXMmxkWFR0Y2JpQWdmVnh1SUNCeVpYUjFjbTRnYjNKcFoybHVPMXh1ZlR0Y2JseHVablZ1WTNScGIyNGdhR0Z6VDNkdVVISnZjR1Z5ZEhrb2IySnFMQ0J3Y205d0tTQjdYRzRnSUhKbGRIVnliaUJQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMbWhoYzA5M2JsQnliM0JsY25SNUxtTmhiR3dvYjJKcUxDQndjbTl3S1R0Y2JuMWNiaUpkZlE9PSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uc1xuICovXG5cbnZhciB1dGlsID0ge307XG5cbnV0aWwuaXNPYmplY3QgPSBmdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxudXRpbC5pc051bWJlciA9IGZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbnV0aWwuaXNVbmRlZmluZWQgPSBmdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuXG51dGlsLmlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZyl7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5cbi8qKlxuICogRXZlbnRFbWl0dGVyIGNsYXNzXG4gKi9cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59O1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghdXRpbC5pc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InICYmICF0aGlzLl9ldmVudHMuZXJyb3IpIHtcbiAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmICh1dGlsLmlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodXRpbC5pc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAodXRpbC5pc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG5cbiAgICAgIGlmICh1dGlsLmlzRnVuY3Rpb24oY29uc29sZS5lcnJvcikpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICBpZiAodXRpbC5pc0Z1bmN0aW9uKGNvbnNvbGUudHJhY2UpKVxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAodXRpbC5pc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShsaXN0ZW5lcnMpKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKHV0aWwuaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmICh1dGlsLmlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTaGltbWluZyBzdGFydHMgaGVyZS5cbihmdW5jdGlvbigpIHtcbiAgLy8gVXRpbHMuXG4gIHZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi91dGlscycpLmxvZztcbiAgdmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICBtb2R1bGUuZXhwb3J0cy5icm93c2VyRGV0YWlscyA9IGJyb3dzZXJEZXRhaWxzO1xuICBtb2R1bGUuZXhwb3J0cy5leHRyYWN0VmVyc2lvbiA9IHJlcXVpcmUoJy4vdXRpbHMnKS5leHRyYWN0VmVyc2lvbjtcbiAgbW9kdWxlLmV4cG9ydHMuZGlzYWJsZUxvZyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nO1xuXG4gIC8vIENvbW1lbnQgb3V0IHRoZSBsaW5lIGJlbG93IGlmIHlvdSB3YW50IGxvZ2dpbmcgdG8gb2NjdXIsIGluY2x1ZGluZyBsb2dnaW5nXG4gIC8vIGZvciB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvdy4gQ2FuIGFsc28gYmUgdHVybmVkIG9uIGluIHRoZSBicm93c2VyIHZpYVxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcbiAgLy8gd2lsbCBub3QgYXBwZWFyLlxuICByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZyh0cnVlKTtcblxuICAvLyBCcm93c2VyIHNoaW1zLlxuICB2YXIgY2hyb21lU2hpbSA9IHJlcXVpcmUoJy4vY2hyb21lL2Nocm9tZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGVkZ2VTaGltID0gcmVxdWlyZSgnLi9lZGdlL2VkZ2Vfc2hpbScpIHx8IG51bGw7XG4gIHZhciBmaXJlZm94U2hpbSA9IHJlcXVpcmUoJy4vZmlyZWZveC9maXJlZm94X3NoaW0nKSB8fCBudWxsO1xuICB2YXIgc2FmYXJpU2hpbSA9IHJlcXVpcmUoJy4vc2FmYXJpL3NhZmFyaV9zaGltJykgfHwgbnVsbDtcblxuICAvLyBTaGltIGJyb3dzZXIgaWYgZm91bmQuXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xuICAgIGNhc2UgJ29wZXJhJzogLy8gZmFsbHRocm91Z2ggYXMgaXQgdXNlcyBjaHJvbWUgc2hpbXNcbiAgICBjYXNlICdjaHJvbWUnOlxuICAgICAgaWYgKCFjaHJvbWVTaGltIHx8ICFjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdDaHJvbWUgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgY2hyb21lLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gY2hyb21lU2hpbTtcblxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QoKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmaXJlZm94JzpcbiAgICAgIGlmICghZmlyZWZveFNoaW0gfHwgIWZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdGaXJlZm94IHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGZpcmVmb3guJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBmaXJlZm94U2hpbTtcblxuICAgICAgZmlyZWZveFNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltT25UcmFjaygpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZWRnZSc6XG4gICAgICBpZiAoIWVkZ2VTaGltIHx8ICFlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnTVMgZWRnZSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBlZGdlLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gZWRnZVNoaW07XG5cbiAgICAgIGVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2FmYXJpJzpcbiAgICAgIGlmICghc2FmYXJpU2hpbSkge1xuICAgICAgICBsb2dnaW5nKCdTYWZhcmkgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgc2FmYXJpLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gc2FmYXJpU2hpbTtcblxuICAgICAgc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbG9nZ2luZygnVW5zdXBwb3J0ZWQgYnJvd3NlciEnKTtcbiAgfVxufSkoKTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBjaHJvbWVTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayA9IGYpO1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAvLyBvbmFkZHN0cmVhbSBkb2VzIG5vdCBmaXJlIHdoZW4gYSB0cmFjayBpcyBhZGRlZCB0byBhbiBleGlzdGluZ1xuICAgICAgICAgICAgLy8gc3RyZWFtLiBCdXQgc3RyZWFtLm9uYWRkdHJhY2sgaXMgaW1wbGVtZW50ZWQgc28gd2UgdXNlIHRoYXQuXG4gICAgICAgICAgICBlLnN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdhZGR0cmFjaycsIGZ1bmN0aW9uKHRlKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0ZS50cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRlLnRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAvLyBVc2UgX3NyY09iamVjdCBhcyBhIHByaXZhdGUgcHJvcGVydHkgZm9yIHRoaXMgc2hpbVxuICAgICAgICAgICAgdGhpcy5fc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3JjKSB7XG4gICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zcmMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXN0cmVhbSkge1xuICAgICAgICAgICAgICB0aGlzLnNyYyA9ICcnO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gcmVjcmVhdGUgdGhlIGJsb2IgdXJsIHdoZW4gYSB0cmFjayBpcyBhZGRlZCBvclxuICAgICAgICAgICAgLy8gcmVtb3ZlZC4gRG9pbmcgaXQgbWFudWFsbHkgc2luY2Ugd2Ugd2FudCB0byBhdm9pZCBhIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdhZGR0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ3JlbW92ZXRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAvLyBUcmFuc2xhdGUgaWNlVHJhbnNwb3J0UG9saWN5IHRvIGljZVRyYW5zcG9ydHMsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD00ODY5XG4gICAgICBsb2dnaW5nKCdQZWVyQ29ubmVjdGlvbicpO1xuICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBwY0NvbmZpZy5pY2VUcmFuc3BvcnRzID0gcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgfVxuXG4gICAgICB2YXIgcGMgPSBuZXcgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xuICAgICAgdmFyIG9yaWdHZXRTdGF0cyA9IHBjLmdldFN0YXRzLmJpbmQocGMpO1xuICAgICAgcGMuZ2V0U3RhdHMgPSBmdW5jdGlvbihzZWxlY3Rvciwgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgLy8gSWYgc2VsZWN0b3IgaXMgYSBmdW5jdGlvbiB0aGVuIHdlIGFyZSBpbiB0aGUgb2xkIHN0eWxlIHN0YXRzIHNvIGp1c3RcbiAgICAgICAgLy8gcGFzcyBiYWNrIHRoZSBvcmlnaW5hbCBnZXRTdGF0cyBmb3JtYXQgdG8gYXZvaWQgYnJlYWtpbmcgb2xkIHVzZXJzLlxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdHZXRTdGF0cyhzZWxlY3Rvciwgc3VjY2Vzc0NhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXhDaHJvbWVTdGF0c18gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIHZhciBzdGFuZGFyZFJlcG9ydCA9IHt9O1xuICAgICAgICAgIHZhciByZXBvcnRzID0gcmVzcG9uc2UucmVzdWx0KCk7XG4gICAgICAgICAgcmVwb3J0cy5mb3JFYWNoKGZ1bmN0aW9uKHJlcG9ydCkge1xuICAgICAgICAgICAgdmFyIHN0YW5kYXJkU3RhdHMgPSB7XG4gICAgICAgICAgICAgIGlkOiByZXBvcnQuaWQsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogcmVwb3J0LnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgdHlwZTogcmVwb3J0LnR5cGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXBvcnQubmFtZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgICAgc3RhbmRhcmRTdGF0c1tuYW1lXSA9IHJlcG9ydC5zdGF0KG5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGFuZGFyZFJlcG9ydFtzdGFuZGFyZFN0YXRzLmlkXSA9IHN0YW5kYXJkU3RhdHM7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gc3RhbmRhcmRSZXBvcnQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgIHZhciBzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBhcmdzWzFdKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzWzBdXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9taXNlLXN1cHBvcnRcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZixcbiAgICAgICAgICAgICAgICBbZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUuYXBwbHkobnVsbCwgW2ZpeENocm9tZVN0YXRzXyhyZXNwb25zZSldKTtcbiAgICAgICAgICAgICAgICB9LCByZWplY3RdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHBjO1xuICAgIH07XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcblxuICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgaWYgKHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBhZGQgcHJvbWlzZSBzdXBwb3J0XG4gICAgWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEgfHwgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMF0pID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3QsIG9wdHNdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBhcmdzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJyk/XG4gICAgICAgICAgICAgICAgUlRDSWNlQ2FuZGlkYXRlIDogUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmdzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFthcmdzWzBdLFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICBhcmdzWzJdLmFwcGx5KG51bGwsIFtlcnJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIH0sXG5cbiAgLy8gQXR0YWNoIGEgbWVkaWEgc3RyZWFtIHRvIGFuIGVsZW1lbnQuXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbihlbGVtZW50LCBzdHJlYW0pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCBhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSA0Mykge1xuICAgICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZWxlbWVudC5zcmMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBlbGVtZW50LnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2luZygnRXJyb3IgYXR0YWNoaW5nIHN0cmVhbSB0byBlbGVtZW50LicpO1xuICAgIH1cbiAgfSxcblxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIHJlYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gNDMpIHtcbiAgICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0by5zcmMgPSBmcm9tLnNyYztcbiAgICB9XG4gIH1cbn07XG5cblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1PblRyYWNrOiBjaHJvbWVTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJyksXG4gIGF0dGFjaE1lZGlhU3RyZWFtOiBjaHJvbWVTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBjaHJvbWVTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb25zdHJhaW50c1RvQ2hyb21lXyA9IGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMubWFuZGF0b3J5IHx8IGMub3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICB2YXIgY2MgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHIgPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID8gY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgci5taW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICB9XG4gICAgICB2YXIgb2xkbmFtZV8gPSBmdW5jdGlvbihwcmVmaXgsIG5hbWUpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5hbWUgPT09ICdkZXZpY2VJZCcpID8gJ3NvdXJjZUlkJyA6IG5hbWU7XG4gICAgICB9O1xuICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYy5vcHRpb25hbCA9IGNjLm9wdGlvbmFsIHx8IFtdO1xuICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtaW4nLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgICAgb2MgPSB7fTtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWF4Jywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgIT09ICdudW1iZXInKSB7XG4gICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuZXhhY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBbJ21pbicsICdtYXgnXS5mb3JFYWNoKGZ1bmN0aW9uKG1peCkge1xuICAgICAgICAgIGlmIChyW21peF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKG1peCwga2V5KV0gPSByW21peF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYy5hZHZhbmNlZCkge1xuICAgICAgY2Mub3B0aW9uYWwgPSAoY2Mub3B0aW9uYWwgfHwgW10pLmNvbmNhdChjLmFkdmFuY2VkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNjO1xuICB9O1xuXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgfVxuICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgfVxuICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgcmV0dXJuIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtcbiAgICAgIGdldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBlbnVtZXJhdGVEZXZpY2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICB2YXIga2luZHMgPSB7YXVkaW86ICdhdWRpb2lucHV0JywgdmlkZW86ICd2aWRlb2lucHV0J307XG4gICAgICAgICAgcmV0dXJuIE1lZGlhU3RyZWFtVHJhY2suZ2V0U291cmNlcyhmdW5jdGlvbihkZXZpY2VzKSB7XG4gICAgICAgICAgICByZXNvbHZlKGRldmljZXMubWFwKGZ1bmN0aW9uKGRldmljZSkge1xuICAgICAgICAgICAgICByZXR1cm4ge2xhYmVsOiBkZXZpY2UubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAga2luZDoga2luZHNbZGV2aWNlLmtpbmRdLFxuICAgICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZDogJyd9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQSBzaGltIGZvciBnZXRVc2VyTWVkaWEgbWV0aG9kIG9uIHRoZSBtZWRpYURldmljZXMgb2JqZWN0LlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhUHJvbWlzZV8oY29uc3RyYWludHMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gRXZlbiB0aG91Z2ggQ2hyb21lIDQ1IGhhcyBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzIGFuZCBhIGdldFVzZXJNZWRpYVxuICAgIC8vIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBQcm9taXNlLCBpdCBkb2VzIG5vdCBhY2NlcHQgc3BlYy1zdHlsZVxuICAgIC8vIGNvbnN0cmFpbnRzLlxuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAoYykge1xuICAgICAgICBsb2dnaW5nKCdzcGVjOiAgICcgKyBKU09OLnN0cmluZ2lmeShjKSk7IC8vIHdoaXRlc3BhY2UgZm9yIGFsaWdubWVudFxuICAgICAgICBjLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oYy5hdWRpbyk7XG4gICAgICAgIGMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjLnZpZGVvKTtcbiAgICAgICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoYykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLy8gRHVtbXkgZGV2aWNlY2hhbmdlIGV2ZW50IG1ldGhvZHMuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNEUCBoZWxwZXJzLlxudmFyIFNEUFV0aWxzID0ge307XG5cbi8vIEdlbmVyYXRlIGFuIGFscGhhbnVtZXJpYyBpZGVudGlmaWVyIGZvciBjbmFtZSBvciBtaWRzLlxuLy8gVE9ETzogdXNlIFVVSURzIGluc3RlYWQ/IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODNcblNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDEwKTtcbn07XG5cbi8vIFRoZSBSVENQIENOQU1FIHVzZWQgYnkgYWxsIHBlZXJjb25uZWN0aW9ucyBmcm9tIHRoZSBzYW1lIEpTLlxuU0RQVXRpbHMubG9jYWxDTmFtZSA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4vLyBTcGxpdHMgU0RQIGludG8gbGluZXMsIGRlYWxpbmcgd2l0aCBib3RoIENSTEYgYW5kIExGLlxuU0RQVXRpbHMuc3BsaXRMaW5lcyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgcmV0dXJuIGJsb2IudHJpbSgpLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLnRyaW0oKTtcbiAgfSk7XG59O1xuLy8gU3BsaXRzIFNEUCBpbnRvIHNlc3Npb25wYXJ0IGFuZCBtZWRpYXNlY3Rpb25zLiBFbnN1cmVzIENSTEYuXG5TRFBVdGlscy5zcGxpdFNlY3Rpb25zID0gZnVuY3Rpb24oYmxvYikge1xuICB2YXIgcGFydHMgPSBibG9iLnNwbGl0KCdcXG5tPScpO1xuICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQsIGluZGV4KSB7XG4gICAgcmV0dXJuIChpbmRleCA+IDAgPyAnbT0nICsgcGFydCA6IHBhcnQpLnRyaW0oKSArICdcXHJcXG4nO1xuICB9KTtcbn07XG5cbi8vIFJldHVybnMgbGluZXMgdGhhdCBzdGFydCB3aXRoIGEgY2VydGFpbiBwcmVmaXguXG5TRFBVdGlscy5tYXRjaFByZWZpeCA9IGZ1bmN0aW9uKGJsb2IsIHByZWZpeCkge1xuICByZXR1cm4gU0RQVXRpbHMuc3BsaXRMaW5lcyhibG9iKS5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLmluZGV4T2YocHJlZml4KSA9PT0gMDtcbiAgfSk7XG59O1xuXG4vLyBQYXJzZXMgYW4gSUNFIGNhbmRpZGF0ZSBsaW5lLiBTYW1wbGUgaW5wdXQ6XG4vLyBjYW5kaWRhdGU6NzAyNzg2MzUwIDIgdWRwIDQxODE5OTAyIDguOC44LjggNjA3NjkgdHlwIHJlbGF5IHJhZGRyIDguOC44Ljhcbi8vIHJwb3J0IDU1OTk2XCJcblNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHM7XG4gIC8vIFBhcnNlIGJvdGggdmFyaWFudHMuXG4gIGlmIChsaW5lLmluZGV4T2YoJ2E9Y2FuZGlkYXRlOicpID09PSAwKSB7XG4gICAgcGFydHMgPSBsaW5lLnN1YnN0cmluZygxMikuc3BsaXQoJyAnKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEwKS5zcGxpdCgnICcpO1xuICB9XG5cbiAgdmFyIGNhbmRpZGF0ZSA9IHtcbiAgICBmb3VuZGF0aW9uOiBwYXJ0c1swXSxcbiAgICBjb21wb25lbnQ6IHBhcnRzWzFdLFxuICAgIHByb3RvY29sOiBwYXJ0c1syXS50b0xvd2VyQ2FzZSgpLFxuICAgIHByaW9yaXR5OiBwYXJzZUludChwYXJ0c1szXSwgMTApLFxuICAgIGlwOiBwYXJ0c1s0XSxcbiAgICBwb3J0OiBwYXJzZUludChwYXJ0c1s1XSwgMTApLFxuICAgIC8vIHNraXAgcGFydHNbNl0gPT0gJ3R5cCdcbiAgICB0eXBlOiBwYXJ0c1s3XVxuICB9O1xuXG4gIGZvciAodmFyIGkgPSA4OyBpIDwgcGFydHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBzd2l0Y2ggKHBhcnRzW2ldKSB7XG4gICAgICBjYXNlICdyYWRkcic6XG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyA9IHBhcnRzW2kgKyAxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdycG9ydCc6XG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCA9IHBhcnNlSW50KHBhcnRzW2kgKyAxXSwgMTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RjcHR5cGUnOlxuICAgICAgICBjYW5kaWRhdGUudGNwVHlwZSA9IHBhcnRzW2kgKyAxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyBVbmtub3duIGV4dGVuc2lvbnMgYXJlIHNpbGVudGx5IGlnbm9yZWQuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlO1xufTtcblxuLy8gVHJhbnNsYXRlcyBhIGNhbmRpZGF0ZSBvYmplY3QgaW50byBTRFAgY2FuZGlkYXRlIGF0dHJpYnV0ZS5cblNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gIHZhciBzZHAgPSBbXTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmZvdW5kYXRpb24pO1xuICBzZHAucHVzaChjYW5kaWRhdGUuY29tcG9uZW50KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByb3RvY29sLnRvVXBwZXJDYXNlKCkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJpb3JpdHkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUuaXApO1xuICBzZHAucHVzaChjYW5kaWRhdGUucG9ydCk7XG5cbiAgdmFyIHR5cGUgPSBjYW5kaWRhdGUudHlwZTtcbiAgc2RwLnB1c2goJ3R5cCcpO1xuICBzZHAucHVzaCh0eXBlKTtcbiAgaWYgKHR5cGUgIT09ICdob3N0JyAmJiBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgJiZcbiAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCkge1xuICAgIHNkcC5wdXNoKCdyYWRkcicpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyk7IC8vIHdhczogcmVsQWRkclxuICAgIHNkcC5wdXNoKCdycG9ydCcpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCk7IC8vIHdhczogcmVsUG9ydFxuICB9XG4gIGlmIChjYW5kaWRhdGUudGNwVHlwZSAmJiBjYW5kaWRhdGUucHJvdG9jb2wudG9Mb3dlckNhc2UoKSA9PT0gJ3RjcCcpIHtcbiAgICBzZHAucHVzaCgndGNwdHlwZScpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS50Y3BUeXBlKTtcbiAgfVxuICByZXR1cm4gJ2NhbmRpZGF0ZTonICsgc2RwLmpvaW4oJyAnKTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydHBtYXAgbGluZSwgcmV0dXJucyBSVENSdHBDb2RkZWNQYXJhbWV0ZXJzLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXG5TRFBVdGlscy5wYXJzZVJ0cE1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgdmFyIHBhcnNlZCA9IHtcbiAgICBwYXlsb2FkVHlwZTogcGFyc2VJbnQocGFydHMuc2hpZnQoKSwgMTApIC8vIHdhczogaWRcbiAgfTtcblxuICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcvJyk7XG5cbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcbiAgcGFyc2VkLmNsb2NrUmF0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7IC8vIHdhczogY2xvY2tyYXRlXG4gIC8vIHdhczogY2hhbm5lbHNcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZSBhbiBhPXJ0cG1hcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yXG4vLyBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgcmV0dXJuICdhPXJ0cG1hcDonICsgcHQgKyAnICcgKyBjb2RlYy5uYW1lICsgJy8nICsgY29kZWMuY2xvY2tSYXRlICtcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWV4dG1hcDoyIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcblNEUFV0aWxzLnBhcnNlRXh0bWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIGlkOiBwYXJzZUludChwYXJ0c1swXSwgMTApLFxuICAgIHVyaTogcGFydHNbMV1cbiAgfTtcbn07XG5cbi8vIEdlbmVyYXRlcyBhPWV4dG1hcCBsaW5lIGZyb20gUlRDUnRwSGVhZGVyRXh0ZW5zaW9uUGFyYW1ldGVycyBvclxuLy8gUlRDUnRwSGVhZGVyRXh0ZW5zaW9uLlxuU0RQVXRpbHMud3JpdGVFeHRtYXAgPSBmdW5jdGlvbihoZWFkZXJFeHRlbnNpb24pIHtcbiAgcmV0dXJuICdhPWV4dG1hcDonICsgKGhlYWRlckV4dGVuc2lvbi5pZCB8fCBoZWFkZXJFeHRlbnNpb24ucHJlZmVycmVkSWQpICtcbiAgICAgICAnICcgKyBoZWFkZXJFeHRlbnNpb24udXJpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gZnRtcCBsaW5lLCByZXR1cm5zIGRpY3Rpb25hcnkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9Zm10cDo5NiB2YnI9b247Y25nPW9uXG4vLyBBbHNvIGRlYWxzIHdpdGggdmJyPW9uOyBjbmc9b25cblNEUFV0aWxzLnBhcnNlRm10cCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga3Y7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKGxpbmUuaW5kZXhPZignICcpICsgMSkuc3BsaXQoJzsnKTtcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJ0cy5sZW5ndGg7IGorKykge1xuICAgIGt2ID0gcGFydHNbal0udHJpbSgpLnNwbGl0KCc9Jyk7XG4gICAgcGFyc2VkW2t2WzBdLnRyaW0oKV0gPSBrdlsxXTtcbiAgfVxuICByZXR1cm4gcGFyc2VkO1xufTtcblxuLy8gR2VuZXJhdGVzIGFuIGE9ZnRtcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlRm10cCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lID0gJyc7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgaWYgKGNvZGVjLnBhcmFtZXRlcnMgJiYgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykubGVuZ3RoKSB7XG4gICAgdmFyIHBhcmFtcyA9IFtdO1xuICAgIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmZvckVhY2goZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgIHBhcmFtcy5wdXNoKHBhcmFtICsgJz0nICsgY29kZWMucGFyYW1ldGVyc1twYXJhbV0pO1xuICAgIH0pO1xuICAgIGxpbmUgKz0gJ2E9Zm10cDonICsgcHQgKyAnICcgKyBwYXJhbXMuam9pbignOycpICsgJ1xcclxcbic7XG4gIH1cbiAgcmV0dXJuIGxpbmU7XG59O1xuXG4vLyBQYXJzZXMgYW4gcnRjcC1mYiBsaW5lLCByZXR1cm5zIFJUQ1BSdGNwRmVlZGJhY2sgb2JqZWN0LiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0Y3AtZmI6OTggbmFjayBycHNpXG5TRFBVdGlscy5wYXJzZVJ0Y3BGYiA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHBhcnRzLnNoaWZ0KCksXG4gICAgcGFyYW1ldGVyOiBwYXJ0cy5qb2luKCcgJylcbiAgfTtcbn07XG4vLyBHZW5lcmF0ZSBhPXJ0Y3AtZmIgbGluZXMgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVSdGNwRmIgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgbGluZXMgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucnRjcEZlZWRiYWNrICYmIGNvZGVjLnJ0Y3BGZWVkYmFjay5sZW5ndGgpIHtcbiAgICAvLyBGSVhNRTogc3BlY2lhbCBoYW5kbGluZyBmb3IgdHJyLWludD9cbiAgICBjb2RlYy5ydGNwRmVlZGJhY2suZm9yRWFjaChmdW5jdGlvbihmYikge1xuICAgICAgbGluZXMgKz0gJ2E9cnRjcC1mYjonICsgcHQgKyAnICcgKyBmYi50eXBlICsgJyAnICsgZmIucGFyYW1ldGVyICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyBQYXJzZXMgYW4gUkZDIDU1NzYgc3NyYyBtZWRpYSBhdHRyaWJ1dGUuIFNhbXBsZSBpbnB1dDpcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xuU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBzcCA9IGxpbmUuaW5kZXhPZignICcpO1xuICB2YXIgcGFydHMgPSB7XG4gICAgc3NyYzogcGFyc2VJbnQobGluZS5zdWJzdHIoNywgc3AgLSA3KSwgMTApXG4gIH07XG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcbiAgaWYgKGNvbG9uID4gLTEpIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEsIGNvbG9uIC0gc3AgLSAxKTtcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxKTtcbiAgfVxuICByZXR1cm4gcGFydHM7XG59O1xuXG4vLyBFeHRyYWN0cyBEVExTIHBhcmFtZXRlcnMgZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGZpbmdlcnByaW50IGxpbmUgYXMgaW5wdXQuIFNlZSBhbHNvIGdldEljZVBhcmFtZXRlcnMuXG5TRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAvLyBTZWFyY2ggaW4gc2Vzc2lvbiBwYXJ0LCB0b28uXG4gIGxpbmVzID0gbGluZXMuY29uY2F0KFNEUFV0aWxzLnNwbGl0TGluZXMoc2Vzc2lvbnBhcnQpKTtcbiAgdmFyIGZwTGluZSA9IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1maW5nZXJwcmludDonKSA9PT0gMDtcbiAgfSlbMF0uc3Vic3RyKDE0KTtcbiAgLy8gTm90ZTogYT1zZXR1cCBsaW5lIGlzIGlnbm9yZWQgc2luY2Ugd2UgdXNlIHRoZSAnYXV0bycgcm9sZS5cbiAgdmFyIGR0bHNQYXJhbWV0ZXJzID0ge1xuICAgIHJvbGU6ICdhdXRvJyxcbiAgICBmaW5nZXJwcmludHM6IFt7XG4gICAgICBhbGdvcml0aG06IGZwTGluZS5zcGxpdCgnICcpWzBdLFxuICAgICAgdmFsdWU6IGZwTGluZS5zcGxpdCgnICcpWzFdXG4gICAgfV1cbiAgfTtcbiAgcmV0dXJuIGR0bHNQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dXBUeXBlKSB7XG4gIHZhciBzZHAgPSAnYT1zZXR1cDonICsgc2V0dXBUeXBlICsgJ1xcclxcbic7XG4gIHBhcmFtcy5maW5nZXJwcmludHMuZm9yRWFjaChmdW5jdGlvbihmcCkge1xuICAgIHNkcCArPSAnYT1maW5nZXJwcmludDonICsgZnAuYWxnb3JpdGhtICsgJyAnICsgZnAudmFsdWUgKyAnXFxyXFxuJztcbiAgfSk7XG4gIHJldHVybiBzZHA7XG59O1xuLy8gUGFyc2VzIElDRSBpbmZvcm1hdGlvbiBmcm9tIFNEUCBtZWRpYSBzZWN0aW9uIG9yIHNlc3Npb25wYXJ0LlxuLy8gRklYTUU6IGZvciBjb25zaXN0ZW5jeSB3aXRoIG90aGVyIGZ1bmN0aW9ucyB0aGlzIHNob3VsZCBvbmx5XG4vLyAgIGdldCB0aGUgaWNlLXVmcmFnIGFuZCBpY2UtcHdkIGxpbmVzIGFzIGlucHV0LlxuU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAvLyBTZWFyY2ggaW4gc2Vzc2lvbiBwYXJ0LCB0b28uXG4gIGxpbmVzID0gbGluZXMuY29uY2F0KFNEUFV0aWxzLnNwbGl0TGluZXMoc2Vzc2lvbnBhcnQpKTtcbiAgdmFyIGljZVBhcmFtZXRlcnMgPSB7XG4gICAgdXNlcm5hbWVGcmFnbWVudDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXVmcmFnOicpID09PSAwO1xuICAgIH0pWzBdLnN1YnN0cigxMiksXG4gICAgcGFzc3dvcmQ6IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS1wd2Q6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEwKVxuICB9O1xuICByZXR1cm4gaWNlUGFyYW1ldGVycztcbn07XG5cbi8vIFNlcmlhbGl6ZXMgSUNFIHBhcmFtZXRlcnMgdG8gU0RQLlxuU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gIHJldHVybiAnYT1pY2UtdWZyYWc6JyArIHBhcmFtcy51c2VybmFtZUZyYWdtZW50ICsgJ1xcclxcbicgK1xuICAgICAgJ2E9aWNlLXB3ZDonICsgcGFyYW1zLnBhc3N3b3JkICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGFuZCByZXR1cm5zIFJUQ1J0cFBhcmFtZXRlcnMuXG5TRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGRlc2NyaXB0aW9uID0ge1xuICAgIGNvZGVjczogW10sXG4gICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXG4gICAgZmVjTWVjaGFuaXNtczogW10sXG4gICAgcnRjcDogW11cbiAgfTtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICB2YXIgbWxpbmUgPSBsaW5lc1swXS5zcGxpdCgnICcpO1xuICBmb3IgKHZhciBpID0gMzsgaSA8IG1saW5lLmxlbmd0aDsgaSsrKSB7IC8vIGZpbmQgYWxsIGNvZGVjcyBmcm9tIG1saW5lWzMuLl1cbiAgICB2YXIgcHQgPSBtbGluZVtpXTtcbiAgICB2YXIgcnRwbWFwbGluZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICBtZWRpYVNlY3Rpb24sICdhPXJ0cG1hcDonICsgcHQgKyAnICcpWzBdO1xuICAgIGlmIChydHBtYXBsaW5lKSB7XG4gICAgICB2YXIgY29kZWMgPSBTRFBVdGlscy5wYXJzZVJ0cE1hcChydHBtYXBsaW5lKTtcbiAgICAgIHZhciBmbXRwcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9Zm10cDonICsgcHQgKyAnICcpO1xuICAgICAgLy8gT25seSB0aGUgZmlyc3QgYT1mbXRwOjxwdD4gaXMgY29uc2lkZXJlZC5cbiAgICAgIGNvZGVjLnBhcmFtZXRlcnMgPSBmbXRwcy5sZW5ndGggPyBTRFBVdGlscy5wYXJzZUZtdHAoZm10cHNbMF0pIDoge307XG4gICAgICBjb2RlYy5ydGNwRmVlZGJhY2sgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgICBtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtZmI6JyArIHB0ICsgJyAnKVxuICAgICAgICAubWFwKFNEUFV0aWxzLnBhcnNlUnRjcEZiKTtcbiAgICAgIGRlc2NyaXB0aW9uLmNvZGVjcy5wdXNoKGNvZGVjKTtcbiAgICAgIC8vIHBhcnNlIEZFQyBtZWNoYW5pc21zIGZyb20gcnRwbWFwIGxpbmVzLlxuICAgICAgc3dpdGNoIChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnUkVEJzpcbiAgICAgICAgY2FzZSAnVUxQRkVDJzpcbiAgICAgICAgICBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLnB1c2goY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogLy8gb25seSBSRUQgYW5kIFVMUEZFQyBhcmUgcmVjb2duaXplZCBhcyBGRUMgbWVjaGFuaXNtcy5cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1leHRtYXA6JykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgZGVzY3JpcHRpb24uaGVhZGVyRXh0ZW5zaW9ucy5wdXNoKFNEUFV0aWxzLnBhcnNlRXh0bWFwKGxpbmUpKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiBwYXJzZSBydGNwLlxuICByZXR1cm4gZGVzY3JpcHRpb247XG59O1xuXG4vLyBHZW5lcmF0ZXMgcGFydHMgb2YgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGRlc2NyaWJpbmcgdGhlIGNhcGFiaWxpdGllcyAvXG4vLyBwYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVSdHBEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGtpbmQsIGNhcHMpIHtcbiAgdmFyIHNkcCA9ICcnO1xuXG4gIC8vIEJ1aWxkIHRoZSBtbGluZS5cbiAgc2RwICs9ICdtPScgKyBraW5kICsgJyAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubGVuZ3RoID4gMCA/ICc5JyA6ICcwJzsgLy8gcmVqZWN0IGlmIG5vIGNvZGVjcy5cbiAgc2RwICs9ICcgVURQL1RMUy9SVFAvU0FWUEYgJztcbiAgc2RwICs9IGNhcHMuY29kZWNzLm1hcChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gICAgfVxuICAgIHJldHVybiBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgfSkuam9pbignICcpICsgJ1xcclxcbic7XG5cbiAgc2RwICs9ICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJztcbiAgc2RwICs9ICdhPXJ0Y3A6OSBJTiBJUDQgMC4wLjAuMFxcclxcbic7XG5cbiAgLy8gQWRkIGE9cnRwbWFwIGxpbmVzIGZvciBlYWNoIGNvZGVjLiBBbHNvIGZtdHAgYW5kIHJ0Y3AtZmIuXG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVSdHBNYXAoY29kZWMpO1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZUZtdHAoY29kZWMpO1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0Y3BGYihjb2RlYyk7XG4gIH0pO1xuICAvLyBGSVhNRTogYWRkIGhlYWRlckV4dGVuc2lvbnMsIGZlY01lY2hhbmlzbcWfIGFuZCBydGNwLlxuICBzZHAgKz0gJ2E9cnRjcC1tdXhcXHJcXG4nO1xuICByZXR1cm4gc2RwO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBhbiBhcnJheSBvZlxuLy8gUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGVuY29kaW5nUGFyYW1ldGVycyA9IFtdO1xuICB2YXIgZGVzY3JpcHRpb24gPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIGhhc1JlZCA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignUkVEJykgIT09IC0xO1xuICB2YXIgaGFzVWxwZmVjID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdVTFBGRUMnKSAhPT0gLTE7XG5cbiAgLy8gZmlsdGVyIGE9c3NyYzouLi4gY25hbWU6LCBpZ25vcmUgUGxhbkItbXNpZFxuICB2YXIgc3NyY3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgfSk7XG4gIHZhciBwcmltYXJ5U3NyYyA9IHNzcmNzLmxlbmd0aCA+IDAgJiYgc3NyY3NbMF0uc3NyYztcbiAgdmFyIHNlY29uZGFyeVNzcmM7XG5cbiAgdmFyIGZsb3dzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjLWdyb3VwOkZJRCcpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICBwYXJ0cy5zaGlmdCgpO1xuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBhcnQsIDEwKTtcbiAgICB9KTtcbiAgfSk7XG4gIGlmIChmbG93cy5sZW5ndGggPiAwICYmIGZsb3dzWzBdLmxlbmd0aCA+IDEgJiYgZmxvd3NbMF1bMF0gPT09IHByaW1hcnlTc3JjKSB7XG4gICAgc2Vjb25kYXJ5U3NyYyA9IGZsb3dzWzBdWzFdO1xuICB9XG5cbiAgZGVzY3JpcHRpb24uY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnUlRYJyAmJiBjb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xuICAgICAgdmFyIGVuY1BhcmFtID0ge1xuICAgICAgICBzc3JjOiBwcmltYXJ5U3NyYyxcbiAgICAgICAgY29kZWNQYXlsb2FkVHlwZTogcGFyc2VJbnQoY29kZWMucGFyYW1ldGVycy5hcHQsIDEwKSxcbiAgICAgICAgcnR4OiB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyY1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgaWYgKGhhc1JlZCkge1xuICAgICAgICBlbmNQYXJhbSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZW5jUGFyYW0pKTtcbiAgICAgICAgZW5jUGFyYW0uZmVjID0ge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmMsXG4gICAgICAgICAgbWVjaGFuaXNtOiBoYXNVbHBmZWMgPyAncmVkK3VscGZlYycgOiAncmVkJ1xuICAgICAgICB9O1xuICAgICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGggPT09IDAgJiYgcHJpbWFyeVNzcmMpIHtcbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaCh7XG4gICAgICBzc3JjOiBwcmltYXJ5U3NyY1xuICAgIH0pO1xuICB9XG5cbiAgLy8gd2Ugc3VwcG9ydCBib3RoIGI9QVMgYW5kIGI9VElBUyBidXQgaW50ZXJwcmV0IEFTIGFzIFRJQVMuXG4gIHZhciBiYW5kd2lkdGggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdiPScpO1xuICBpZiAoYmFuZHdpZHRoLmxlbmd0aCkge1xuICAgIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1USUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDcpLCAxMCk7XG4gICAgfSBlbHNlIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1BUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig1KSwgMTApO1xuICAgIH1cbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHBhcmFtcy5tYXhCaXRyYXRlID0gYmFuZHdpZHRoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBlbmNvZGluZ1BhcmFtZXRlcnM7XG59O1xuXG5TRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBGSVhNRTogc2Vzcy1pZCBzaG91bGQgYmUgYW4gTlRQIHRpbWVzdGFtcC5cbiAgcmV0dXJuICd2PTBcXHJcXG4nICtcbiAgICAgICdvPXRoaXNpc2FkYXB0ZXJvcnRjIDgxNjk2Mzk5MTU2NDY5NDMxMzcgMiBJTiBJUDQgMTI3LjAuMC4xXFxyXFxuJyArXG4gICAgICAncz0tXFxyXFxuJyArXG4gICAgICAndD0wIDBcXHJcXG4nO1xufTtcblxuU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24gPSBmdW5jdGlvbih0cmFuc2NlaXZlciwgY2FwcywgdHlwZSwgc3RyZWFtKSB7XG4gIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uKHRyYW5zY2VpdmVyLmtpbmQsIGNhcHMpO1xuXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuZ2V0TG9jYWxQYXJhbWV0ZXJzKCkpO1xuXG4gIC8vIE1hcCBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXG4gICAgICB0eXBlID09PSAnb2ZmZXInID8gJ2FjdHBhc3MnIDogJ2FjdGl2ZScpO1xuXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHNkcCArPSAnYT1zZW5kb25seVxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9cmVjdm9ubHlcXHJcXG4nO1xuICB9IGVsc2Uge1xuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XG4gIH1cblxuICAvLyBGSVhNRTogZm9yIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZSBTU1JDcy4gTm90IGltcGxlbWVudGVkIGluIEVkZ2UgeWV0LlxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgdmFyIG1zaWQgPSAnbXNpZDonICsgc3RyZWFtLmlkICsgJyAnICtcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnRyYWNrLmlkICsgJ1xcclxcbic7XG4gICAgc2RwICs9ICdhPScgKyBtc2lkO1xuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgICAnICcgKyBtc2lkO1xuICB9XG4gIC8vIEZJWE1FOiB0aGlzIHNob3VsZCBiZSB3cml0dGVuIGJ5IHdyaXRlUnRwRGVzY3JpcHRpb24uXG4gIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xuICByZXR1cm4gc2RwO1xufTtcblxuLy8gR2V0cyB0aGUgZGlyZWN0aW9uIGZyb20gdGhlIG1lZGlhU2VjdGlvbiBvciB0aGUgc2Vzc2lvbnBhcnQuXG5TRFBVdGlscy5nZXREaXJlY3Rpb24gPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIC8vIExvb2sgZm9yIHNlbmRyZWN2LCBzZW5kb25seSwgcmVjdm9ubHksIGluYWN0aXZlLCBkZWZhdWx0IHRvIHNlbmRyZWN2LlxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKGxpbmVzW2ldKSB7XG4gICAgICBjYXNlICdhPXNlbmRyZWN2JzpcbiAgICAgIGNhc2UgJ2E9c2VuZG9ubHknOlxuICAgICAgY2FzZSAnYT1yZWN2b25seSc6XG4gICAgICBjYXNlICdhPWluYWN0aXZlJzpcbiAgICAgICAgcmV0dXJuIGxpbmVzW2ldLnN1YnN0cigyKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEZJWE1FOiBXaGF0IHNob3VsZCBoYXBwZW4gaGVyZT9cbiAgICB9XG4gIH1cbiAgaWYgKHNlc3Npb25wYXJ0KSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLmdldERpcmVjdGlvbihzZXNzaW9ucGFydCk7XG4gIH1cbiAgcmV0dXJuICdzZW5kcmVjdic7XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IFNEUFV0aWxzO1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJy4vZWRnZV9zZHAnKTtcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG5cbnZhciBlZGdlU2hpbSA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAod2luZG93LlJUQ0ljZUdhdGhlcmVyKSB7XG4gICAgICAvLyBPUlRDIGRlZmluZXMgYW4gUlRDSWNlQ2FuZGlkYXRlIG9iamVjdCBidXQgbm8gY29uc3RydWN0b3IuXG4gICAgICAvLyBOb3QgaW1wbGVtZW50ZWQgaW4gRWRnZS5cbiAgICAgIGlmICghd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSkge1xuICAgICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gT1JUQyBkb2VzIG5vdCBoYXZlIGEgc2Vzc2lvbiBkZXNjcmlwdGlvbiBvYmplY3QgYnV0XG4gICAgICAvLyBvdGhlciBicm93c2VycyAoaS5lLiBDaHJvbWUpIHRoYXQgd2lsbCBzdXBwb3J0IGJvdGggUEMgYW5kIE9SVENcbiAgICAgIC8vIGluIHRoZSBmdXR1cmUgbWlnaHQgaGF2ZSB0aGlzIGRlZmluZWQgYWxyZWFkeS5cbiAgICAgIGlmICghd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbikge1xuICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgIHJldHVybiBhcmdzO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgX2V2ZW50VGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgWydhZGRFdmVudExpc3RlbmVyJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZGlzcGF0Y2hFdmVudCddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBzZWxmW21ldGhvZF0gPSBfZXZlbnRUYXJnZXRbbWV0aG9kXS5iaW5kKF9ldmVudFRhcmdldCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBudWxsO1xuICAgICAgdGhpcy5vbmFkZHN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9udHJhY2sgPSBudWxsO1xuICAgICAgdGhpcy5vbnJlbW92ZXN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBudWxsO1xuICAgICAgdGhpcy5vbmRhdGFjaGFubmVsID0gbnVsbDtcblxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYubG9jYWxTdHJlYW1zO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZ2V0UmVtb3RlU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5yZW1vdGVTdHJlYW1zO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9ICdzdGFibGUnO1xuICAgICAgdGhpcy5pY2VDb25uZWN0aW9uU3RhdGUgPSAnbmV3JztcbiAgICAgIHRoaXMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnbmV3JztcblxuICAgICAgdGhpcy5pY2VPcHRpb25zID0ge1xuICAgICAgICBnYXRoZXJQb2xpY3k6ICdhbGwnLFxuICAgICAgICBpY2VTZXJ2ZXJzOiBbXVxuICAgICAgfTtcbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgICBjYXNlICdhbGwnOlxuICAgICAgICAgIGNhc2UgJ3JlbGF5JzpcbiAgICAgICAgICAgIHRoaXMuaWNlT3B0aW9ucy5nYXRoZXJQb2xpY3kgPSBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVtb3ZlIG9uY2UgaW1wbGVtZW50YXRpb24gYW5kIHNwZWMgaGF2ZSBhZGRlZCB0aGlzLlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaWNlVHJhbnNwb3J0UG9saWN5IFwibm9uZVwiIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gZG9uJ3Qgc2V0IGljZVRyYW5zcG9ydFBvbGljeS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5pY2VTZXJ2ZXJzKSB7XG4gICAgICAgIC8vIEVkZ2UgZG9lcyBub3QgbGlrZVxuICAgICAgICAvLyAxKSBzdHVuOlxuICAgICAgICAvLyAyKSB0dXJuOiB0aGF0IGRvZXMgbm90IGhhdmUgYWxsIG9mIHR1cm46aG9zdDpwb3J0P3RyYW5zcG9ydD11ZHBcbiAgICAgICAgdGhpcy5pY2VPcHRpb25zLmljZVNlcnZlcnMgPSBjb25maWcuaWNlU2VydmVycy5maWx0ZXIoZnVuY3Rpb24oc2VydmVyKSB7XG4gICAgICAgICAgaWYgKHNlcnZlciAmJiBzZXJ2ZXIudXJscykge1xuICAgICAgICAgICAgc2VydmVyLnVybHMgPSBzZXJ2ZXIudXJscy5maWx0ZXIoZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1cmwuaW5kZXhPZigndHVybjonKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3RyYW5zcG9ydD11ZHAnKSAhPT0gLTE7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIHJldHVybiAhIXNlcnZlci51cmxzO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBwZXItdHJhY2sgaWNlR2F0aGVycywgaWNlVHJhbnNwb3J0cywgZHRsc1RyYW5zcG9ydHMsIHJ0cFNlbmRlcnMsIC4uLlxuICAgICAgLy8gZXZlcnl0aGluZyB0aGF0IGlzIG5lZWRlZCB0byBkZXNjcmliZSBhIFNEUCBtLWxpbmUuXG4gICAgICB0aGlzLnRyYW5zY2VpdmVycyA9IFtdO1xuXG4gICAgICAvLyBzaW5jZSB0aGUgaWNlR2F0aGVyZXIgaXMgY3VycmVudGx5IGNyZWF0ZWQgaW4gY3JlYXRlT2ZmZXIgYnV0IHdlXG4gICAgICAvLyBtdXN0IG5vdCBlbWl0IGNhbmRpZGF0ZXMgdW50aWwgYWZ0ZXIgc2V0TG9jYWxEZXNjcmlwdGlvbiB3ZSBidWZmZXJcbiAgICAgIC8vIHRoZW0gaW4gdGhpcyBhcnJheS5cbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgLy8gRklYTUU6IG5lZWQgdG8gYXBwbHkgaWNlIGNhbmRpZGF0ZXMgaW4gYSB3YXkgd2hpY2ggaXMgYXN5bmMgYnV0XG4gICAgICAvLyBpbi1vcmRlclxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGVuZCA9ICFldmVudC5jYW5kaWRhdGUgfHwgT2JqZWN0LmtleXMoZXZlbnQuY2FuZGlkYXRlKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHNlY3Rpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnNbal0uaW5kZXhPZignXFxyXFxuYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbicpID09PSAtMSkge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tqXSArPSAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUuaW5kZXhPZigndHlwIGVuZE9mQ2FuZGlkYXRlcycpXG4gICAgICAgICAgICA9PT0gLTEpIHtcbiAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICdhPScgKyBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlICsgJ1xcclxcbic7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXZlbnQuY2FuZGlkYXRlICYmIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyICYmXG4gICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlciA9IFtdO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgLy8gQ2xvbmUgaXMgbmVjZXNzYXJ5IGZvciBsb2NhbCBkZW1vcyBtb3N0bHksIGF0dGFjaGluZyBkaXJlY3RseVxuICAgICAgLy8gdG8gdHdvIGRpZmZlcmVudCBzZW5kZXJzIGRvZXMgbm90IHdvcmsgKGJ1aWxkIDEwNTQ3KS5cbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtLmNsb25lKCkpO1xuICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBpZHggPSB0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG4gICAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIERldGVybWluZXMgdGhlIGludGVyc2VjdGlvbiBvZiBsb2NhbCBhbmQgcmVtb3RlIGNhcGFiaWxpdGllcy5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9nZXRDb21tb25DYXBhYmlsaXRpZXMgPVxuICAgICAgICBmdW5jdGlvbihsb2NhbENhcGFiaWxpdGllcywgcmVtb3RlQ2FwYWJpbGl0aWVzKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgICAgIGNvZGVjczogW10sXG4gICAgICAgICAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICAgICAgICAgIGZlY01lY2hhbmlzbXM6IFtdXG4gICAgICAgICAgfTtcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihsQ29kZWMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgckNvZGVjID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjc1tpXTtcbiAgICAgICAgICAgICAgaWYgKGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICAgIGxDb2RlYy5jbG9ja1JhdGUgPT09IHJDb2RlYy5jbG9ja1JhdGUgJiZcbiAgICAgICAgICAgICAgICAgIGxDb2RlYy5udW1DaGFubmVscyA9PT0gckNvZGVjLm51bUNoYW5uZWxzKSB7XG4gICAgICAgICAgICAgICAgLy8gcHVzaCByQ29kZWMgc28gd2UgcmVwbHkgd2l0aCBvZmZlcmVyIHBheWxvYWQgdHlwZVxuICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5jb2RlY3MucHVzaChyQ29kZWMpO1xuXG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFsc28gbmVlZCB0byBkZXRlcm1pbmUgaW50ZXJzZWN0aW9uIGJldHdlZW5cbiAgICAgICAgICAgICAgICAvLyAucnRjcEZlZWRiYWNrIGFuZCAucGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zXG4gICAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGxIZWFkZXJFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgIGkrKykge1xuICAgICAgICAgICAgICAgICAgdmFyIHJIZWFkZXJFeHRlbnNpb24gPSByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgIGlmIChsSGVhZGVyRXh0ZW5zaW9uLnVyaSA9PT0gckhlYWRlckV4dGVuc2lvbi51cmkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMucHVzaChySGVhZGVyRXh0ZW5zaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEZJWE1FOiBmZWNNZWNoYW5pc21zXG4gICAgICAgICAgcmV0dXJuIGNvbW1vbkNhcGFiaWxpdGllcztcbiAgICAgICAgfTtcblxuICAgIC8vIENyZWF0ZSBJQ0UgZ2F0aGVyZXIsIElDRSB0cmFuc3BvcnQgYW5kIERUTFMgdHJhbnNwb3J0LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzID1cbiAgICAgICAgZnVuY3Rpb24obWlkLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBpY2VHYXRoZXJlciA9IG5ldyBSVENJY2VHYXRoZXJlcihzZWxmLmljZU9wdGlvbnMpO1xuICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSBuZXcgUlRDSWNlVHJhbnNwb3J0KGljZUdhdGhlcmVyKTtcbiAgICAgICAgICBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpO1xuICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlID0ge3NkcE1pZDogbWlkLCBzZHBNTGluZUluZGV4OiBzZHBNTGluZUluZGV4fTtcblxuICAgICAgICAgICAgdmFyIGNhbmQgPSBldnQuY2FuZGlkYXRlO1xuICAgICAgICAgICAgdmFyIGVuZCA9ICFjYW5kIHx8IE9iamVjdC5rZXlzKGNhbmQpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIC8vIEVkZ2UgZW1pdHMgYW4gZW1wdHkgb2JqZWN0IGZvciBSVENJY2VDYW5kaWRhdGVDb21wbGV0ZeKApVxuICAgICAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgICAgICAvLyBwb2x5ZmlsbCBzaW5jZSBSVENJY2VHYXRoZXJlci5zdGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgICAgICAgICAgLy8gRWRnZSAxMDU0NyB5ZXQuXG4gICAgICAgICAgICAgIGlmIChpY2VHYXRoZXJlci5zdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXIuc3RhdGUgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEVtaXQgYSBjYW5kaWRhdGUgd2l0aCB0eXBlIGVuZE9mQ2FuZGlkYXRlcyB0byBtYWtlIHRoZSBzYW1wbGVzXG4gICAgICAgICAgICAgIC8vIHdvcmsuIEVkZ2UgcmVxdWlyZXMgYWRkSWNlQ2FuZGlkYXRlIHdpdGggdGhpcyBlbXB0eSBjYW5kaWRhdGVcbiAgICAgICAgICAgICAgLy8gdG8gc3RhcnQgY2hlY2tpbmcuIFRoZSByZWFsIHNvbHV0aW9uIGlzIHRvIHNpZ25hbFxuICAgICAgICAgICAgICAvLyBlbmQtb2YtY2FuZGlkYXRlcyB0byB0aGUgb3RoZXIgc2lkZSB3aGVuIGdldHRpbmcgdGhlIG51bGxcbiAgICAgICAgICAgICAgLy8gY2FuZGlkYXRlIGJ1dCBzb21lIGFwcHMgKGxpa2UgdGhlIHNhbXBsZXMpIGRvbid0IGRvIHRoYXQuXG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPVxuICAgICAgICAgICAgICAgICAgJ2NhbmRpZGF0ZToxIDEgdWRwIDEgMC4wLjAuMCA5IHR5cCBlbmRPZkNhbmRpZGF0ZXMnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlIGRvZXNuJ3QgaGF2ZSBhIGNvbXBvbmVudCwgbmVlZHMgdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgY2FuZC5jb21wb25lbnQgPSBpY2VUcmFuc3BvcnQuY29tcG9uZW50ID09PSAnUlRDUCcgPyAyIDogMTtcbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9IFNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBFbWl0IGNhbmRpZGF0ZSBpZiBsb2NhbERlc2NyaXB0aW9uIGlzIHNldC5cbiAgICAgICAgICAgIC8vIEFsc28gZW1pdHMgbnVsbCBjYW5kaWRhdGUgd2hlbiBhbGwgZ2F0aGVyZXJzIGFyZSBjb21wbGV0ZS5cbiAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kICYmIGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2dhdGhlcmluZyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbi4uLiBjdXJyZW50bHkhXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG5vLW9wLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWNlVHJhbnNwb3J0Lm9uaWNlc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IG5ldyBSVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmR0bHNzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG9uZXJyb3IgZG9lcyBub3Qgc2V0IHN0YXRlIHRvIGZhaWxlZCBieSBpdHNlbGYuXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGljZUdhdGhlcmVyOiBpY2VHYXRoZXJlcixcbiAgICAgICAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogZHRsc1RyYW5zcG9ydFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAvLyBTdGFydCB0aGUgUlRQIFNlbmRlciBhbmQgUmVjZWl2ZXIgZm9yIGEgdHJhbnNjZWl2ZXIuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdHJhbnNjZWl2ZSA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICBzZW5kLCByZWN2KSB7XG4gICAgICB2YXIgcGFyYW1zID0gdGhpcy5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG4gICAgICBpZiAoc2VuZCAmJiB0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiBTRFBVdGlscy5sb2NhbENOYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnNlbmQocGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWN2ICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYXJhbXMucnRjcCA9IHtcbiAgICAgICAgICBjbmFtZTogdHJhbnNjZWl2ZXIuY25hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5yZWNlaXZlKHBhcmFtcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0TG9jYWxEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzZWN0aW9ucztcbiAgICAgICAgICB2YXIgc2Vzc2lvbnBhcnQ7XG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBXaGF0IHdhcyB0aGUgcHVycG9zZSBvZiB0aGlzIGVtcHR5IGlmIHN0YXRlbWVudD9cbiAgICAgICAgICAgIC8vIGlmICghdGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICAgICAgICAvLyBWRVJZIGxpbWl0ZWQgc3VwcG9ydCBmb3IgU0RQIG11bmdpbmcuIExpbWl0ZWQgdG86XG4gICAgICAgICAgICAgIC8vICogY2hhbmdpbmcgdGhlIG9yZGVyIG9mIGNvZGVjc1xuICAgICAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBjYXBzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICAgICAgc2VsZi5fcGVuZGluZ09mZmVyW3NkcE1MaW5lSW5kZXhdLmxvY2FsQ2FwYWJpbGl0aWVzID0gY2FwcztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fcGVuZGluZ09mZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicpIHtcbiAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1lZGlhU2VjdGlvbi5zcGxpdCgnXFxuJywgMSlbMF1cbiAgICAgICAgICAgICAgICAgIC5zcGxpdCgnICcsIDIpWzFdID09PSAnMCc7XG5cbiAgICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAnY29udHJvbGxlZCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBTZW5kZXIuIFRoZSBSVENSdHBSZWNlaXZlciBmb3IgdGhpc1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zY2VpdmVyIGhhcyBhbHJlYWR5IGJlZW4gc3RhcnRlZCBpbiBzZXRSZW1vdGVEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY29kZWNzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtbG9jYWwtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIGEgc3VjY2VzcyBjYWxsYmFjayB3YXMgcHJvdmlkZWQsIGVtaXQgSUNFIGNhbmRpZGF0ZXMgYWZ0ZXIgaXRcbiAgICAgICAgICAvLyBoYXMgYmVlbiBleGVjdXRlZC4gT3RoZXJ3aXNlLCBlbWl0IGNhbGxiYWNrIGFmdGVyIHRoZSBQcm9taXNlIGlzXG4gICAgICAgICAgLy8gcmVzb2x2ZWQuXG4gICAgICAgICAgdmFyIGhhc0NhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2IgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgIHAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFVzdWFsbHkgY2FuZGlkYXRlcyB3aWxsIGJlIGVtaXR0ZWQgZWFybGllci5cbiAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcy5iaW5kKHNlbGYpLCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICB2YXIgcmVjZWl2ZXJMaXN0ID0gW107XG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgIHZhciBtbGluZSA9IGxpbmVzWzBdLnN1YnN0cigyKS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdmFyIGtpbmQgPSBtbGluZVswXTtcbiAgICAgICAgICAgIHZhciByZWplY3RlZCA9IG1saW5lWzFdID09PSAnMCc7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgdmFyIHRyYWNrO1xuICAgICAgICAgICAgLy8gRklYTUU6IGVuc3VyZSB0aGUgbWVkaWFTZWN0aW9uIGhhcyBydGNwLW11eCBzZXQuXG4gICAgICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycztcbiAgICAgICAgICAgIGlmICghcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKTtcbiAgICAgICAgICAgIGlmIChtaWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1pZCA9IG1pZFswXS5zdWJzdHIoNik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNuYW1lO1xuICAgICAgICAgICAgLy8gR2V0cyB0aGUgZmlyc3QgU1NSQy4gTm90ZSB0aGF0IHdpdGggUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gICAgICAgICAgICAvLyBTU1JDcy5cbiAgICAgICAgICAgIHZhciByZW1vdGVTc3JjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gICAgICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAocmVtb3RlU3NyYykge1xuICAgICAgICAgICAgICBjbmFtZSA9IHJlbW90ZVNzcmMudmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpc0NvbXBsZXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzJykubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIHZhciBjYW5kcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9Y2FuZGlkYXRlOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjYW5kLmNvbXBvbmVudCA9PT0gJzEnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLFxuICAgICAgICAgICAgICAgICAgc2RwTUxpbmVJbmRleCk7XG4gICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMikgKiAxMDAxXG4gICAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG5cbiAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAvLyBGSVhNRTogbm90IGNvcnJlY3Qgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgc3RyZWFtcyBidXQgdGhhdCBpc1xuICAgICAgICAgICAgICAvLyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiB0aGlzIHNoaW0uXG4gICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG5cbiAgICAgICAgICAgICAgLy8gRklYTUU6IGxvb2sgYXQgZGlyZWN0aW9uLlxuICAgICAgICAgICAgICBpZiAoc2VsZi5sb2NhbFN0cmVhbXMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkubGVuZ3RoID49IHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgbW9yZSBjb21wbGljYXRlZCwgbmVlZHMgdG8gbWF0Y2ggdHlwZXMgZXRjXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsdHJhY2sgPSBzZWxmLmxvY2FsU3RyZWFtc1swXVxuICAgICAgICAgICAgICAgICAgICAuZ2V0VHJhY2tzKClbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcihsb2NhbHRyYWNrLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogcmVtb3RlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgICAgICAgIGNuYW1lOiBjbmFtZSxcbiAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFJlY2VpdmVyIG5vdy4gVGhlIFJUUFNlbmRlciBpcyBzdGFydGVkIGluXG4gICAgICAgICAgICAgIC8vIHNldExvY2FsRGVzY3JpcHRpb24uXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUoc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0sXG4gICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgcnRwU2VuZGVyID0gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlbW90ZUNhcGFiaWxpdGllcyA9XG4gICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmNuYW1lID0gY25hbWU7XG5cbiAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgJ2NvbnRyb2xsaW5nJyk7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAncmVjdm9ubHknLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG5cbiAgICAgICAgICAgICAgaWYgKHJ0cFJlY2VpdmVyICYmXG4gICAgICAgICAgICAgICAgICAoZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5JykpIHtcbiAgICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXJdKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSB0aGUgcmVjZWl2ZXIgc2hvdWxkIGJlIGNyZWF0ZWQgbGF0ZXIuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtcmVtb3RlLW9mZmVyJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5zd2VyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArXG4gICAgICAgICAgICAgICAgICAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0cmVhbS5nZXRUcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3RlU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdhZGRzdHJlYW0nKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5vbmFkZHN0cmVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmFkZHN0cmVhbShldmVudCk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrID0gaXRlbVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcmVjZWl2ZXIgPSBpdGVtWzFdO1xuICAgICAgICAgICAgICAgIHZhciB0cmFja0V2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnJlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5zdHJlYW1zID0gW3N0cmVhbV07XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbnRyYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbnRyYWNrKHRyYWNrRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAvKiBub3QgeWV0XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gRklYTUU6IGNsZWFuIHVwIHRyYWNrcywgbG9jYWwgc3RyZWFtcywgcmVtb3RlIHN0cmVhbXMsIGV0Y1xuICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2Nsb3NlZCcpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNpZ25hbGluZyBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVTaWduYWxpbmdTdGF0ZSA9XG4gICAgICAgIGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnc2lnbmFsaW5nc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gZmlyZSB0aGUgbmVnb3RpYXRpb25uZWVkZWQgZXZlbnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQgPVxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBGaXJlIGF3YXkgKGZvciBub3cpLlxuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnbmVnb3RpYXRpb25uZWVkZWQnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZChldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBjb25uZWN0aW9uIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG5ld1N0YXRlO1xuICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgJ25ldyc6IDAsXG4gICAgICAgIGNsb3NlZDogMCxcbiAgICAgICAgY29ubmVjdGluZzogMCxcbiAgICAgICAgY2hlY2tpbmc6IDAsXG4gICAgICAgIGNvbm5lY3RlZDogMCxcbiAgICAgICAgY29tcGxldGVkOiAwLFxuICAgICAgICBmYWlsZWQ6IDBcbiAgICAgIH07XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgfSk7XG4gICAgICAvLyBJQ0VUcmFuc3BvcnQuY29tcGxldGVkIGFuZCBjb25uZWN0ZWQgYXJlIHRoZSBzYW1lIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgICBzdGF0ZXMuY29ubmVjdGVkICs9IHN0YXRlcy5jb21wbGV0ZWQ7XG5cbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICBpZiAoc3RhdGVzLmZhaWxlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZmFpbGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RpbmcgPiAwIHx8IHN0YXRlcy5jaGVja2luZyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGluZyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5uZXcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwIHx8IHN0YXRlcy5jb21wbGV0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdTdGF0ZSAhPT0gc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZU9mZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlT2ZmZXIgY2FsbGVkIHdoaWxlIHRoZXJlIGlzIGEgcGVuZGluZyBvZmZlci4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBvZmZlck9wdGlvbnM7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG5cbiAgICAgIHZhciB0cmFja3MgPSBbXTtcbiAgICAgIHZhciBudW1BdWRpb1RyYWNrcyA9IDA7XG4gICAgICB2YXIgbnVtVmlkZW9UcmFja3MgPSAwO1xuICAgICAgLy8gRGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgbnVtQXVkaW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgICAgbnVtVmlkZW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIC8vIERldGVybWluZSBudW1iZXIgb2YgYXVkaW8gYW5kIHZpZGVvIHRyYWNrcyB3ZSBuZWVkIHRvIHNlbmQvcmVjdi5cbiAgICAgIGlmIChvZmZlck9wdGlvbnMpIHtcbiAgICAgICAgLy8gUmVqZWN0IENocm9tZSBsZWdhY3kgY29uc3RyYWludHMuXG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMubWFuZGF0b3J5IHx8IG9mZmVyT3B0aW9ucy5vcHRpb25hbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICdMZWdhY3kgbWFuZGF0b3J5L29wdGlvbmFsIGNvbnN0cmFpbnRzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICAvLyBQdXNoIGxvY2FsIHN0cmVhbXMuXG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiB0cmFjay5raW5kLFxuICAgICAgICAgICAgdHJhY2s6IHRyYWNrLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRyYWNrLmtpbmQgPT09ICdhdWRpbycgP1xuICAgICAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID4gMCA6IG51bVZpZGVvVHJhY2tzID4gMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0cmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHJhY2sua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8gQ3JlYXRlIE0tbGluZXMgZm9yIHJlY3Zvbmx5IHN0cmVhbXMuXG4gICAgICB3aGlsZSAobnVtQXVkaW9UcmFja3MgPiAwIHx8IG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICBpZiAobnVtQXVkaW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ2F1ZGlvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ3ZpZGVvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUoKTtcbiAgICAgIHZhciB0cmFuc2NlaXZlcnMgPSBbXTtcbiAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKG1saW5lLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgIC8vIEZvciBlYWNoIHRyYWNrLCBjcmVhdGUgYW4gaWNlIGdhdGhlcmVyLCBpY2UgdHJhbnNwb3J0LFxuICAgICAgICAvLyBkdGxzIHRyYW5zcG9ydCwgcG90ZW50aWFsbHkgcnRwc2VuZGVyIGFuZCBydHByZWNlaXZlci5cbiAgICAgICAgdmFyIHRyYWNrID0gbWxpbmUudHJhY2s7XG4gICAgICAgIHZhciBraW5kID0gbWxpbmUua2luZDtcbiAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4gICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLCBzZHBNTGluZUluZGV4KTtcblxuICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSBSVENSdHBTZW5kZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICB2YXIgcnRwUmVjZWl2ZXI7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgYW4gc3NyYyBub3csIHRvIGJlIHVzZWQgbGF0ZXIgaW4gcnRwU2VuZGVyLnNlbmRcbiAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBbe1xuICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDEpICogMTAwMVxuICAgICAgICB9XTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcih0cmFjaywgdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtbGluZS53YW50UmVjZWl2ZSkge1xuICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogbnVsbCxcbiAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcywgJ29mZmVyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BlbmRpbmdPZmZlciA9IHRyYW5zY2VpdmVycztcbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdvZmZlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIGNvbW1vbkNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICdhbnN3ZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ2Fuc3dlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gICAgICB2YXIgbUxpbmVJbmRleCA9IGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4O1xuICAgICAgaWYgKGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLnRyYW5zY2VpdmVyc1tpXS5taWQgPT09IGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgICAgIG1MaW5lSW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0aGlzLnRyYW5zY2VpdmVyc1ttTGluZUluZGV4XTtcbiAgICAgIGlmICh0cmFuc2NlaXZlcikge1xuICAgICAgICB2YXIgY2FuZCA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZS5jYW5kaWRhdGUpLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZGlkYXRlLmNhbmRpZGF0ZSkgOiB7fTtcbiAgICAgICAgLy8gSWdub3JlIENocm9tZSdzIGludmFsaWQgY2FuZGlkYXRlcyBzaW5jZSBFZGdlIGRvZXMgbm90IGxpa2UgdGhlbS5cbiAgICAgICAgaWYgKGNhbmQucHJvdG9jb2wgPT09ICd0Y3AnICYmIGNhbmQucG9ydCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZ25vcmUgUlRDUCBjYW5kaWRhdGVzLCB3ZSBhc3N1bWUgUlRDUC1NVVguXG4gICAgICAgIGlmIChjYW5kLmNvbXBvbmVudCAhPT0gJzEnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEEgZGlydHkgaGFjayB0byBtYWtlIHNhbXBsZXMgd29yay5cbiAgICAgICAgaWYgKGNhbmQudHlwZSA9PT0gJ2VuZE9mQ2FuZGlkYXRlcycpIHtcbiAgICAgICAgICBjYW5kID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZShjYW5kKTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHRoaXMucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgc2VjdGlvbnNbbUxpbmVJbmRleCArIDFdICs9IChjYW5kLnR5cGUgPyBjYW5kaWRhdGUuY2FuZGlkYXRlLnRyaW0oKVxuICAgICAgICAgICAgOiAnYT1lbmQtb2YtY2FuZGlkYXRlcycpICsgJ1xcclxcbic7XG4gICAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgWydydHBTZW5kZXInLCAncnRwUmVjZWl2ZXInLCAnaWNlR2F0aGVyZXInLCAnaWNlVHJhbnNwb3J0JyxcbiAgICAgICAgICAgICdkdGxzVHJhbnNwb3J0J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgICAgaWYgKHRyYW5zY2VpdmVyW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zY2VpdmVyW21ldGhvZF0uZ2V0U3RhdHMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgYXJndW1lbnRzWzFdO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0c1tpZF0gPSByZXN1bHRbaWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYiwgMCwgcmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvLyBBdHRhY2ggYSBtZWRpYSBzdHJlYW0gdG8gYW4gZWxlbWVudC5cbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkge1xuICAgIGxvZ2dpbmcoJ0RFUFJFQ0FURUQsIGF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIGVsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xuICB9LFxuXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgcmVhdHRhY2hNZWRpYVN0cmVhbSB3aWxsIHNvb24gYmUgcmVtb3ZlZC4nKTtcbiAgICB0by5zcmNPYmplY3QgPSBmcm9tLnNyY09iamVjdDtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBhdHRhY2hNZWRpYVN0cmVhbTogZWRnZVNoaW0uYXR0YWNoTWVkaWFTdHJlYW0sXG4gIHJlYXR0YWNoTWVkaWFTdHJlYW06IGVkZ2VTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBmaXJlZm94U2hpbSA9IHtcbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayA9IGYpO1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBzaGltU291cmNlT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICAvLyBGaXJlZm94IGhhcyBzdXBwb3J0ZWQgbW96U3JjT2JqZWN0IHNpbmNlIEZGMjIsIHVucHJlZml4ZWQgaW4gNDIuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3pTcmNPYmplY3Q7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhpcy5tb3pTcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxuICAgIGlmICghd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICAgICAgLy8gLnVybHMgaXMgbm90IHN1cHBvcnRlZCBpbiBGRiA8IDM4LlxuICAgICAgICAgIC8vIGNyZWF0ZSBSVENJY2VTZXJ2ZXJzIHdpdGggYSBzaW5nbGUgdXJsLlxuICAgICAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VTZXJ2ZXJzKSB7XG4gICAgICAgICAgICB2YXIgbmV3SWNlU2VydmVycyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwY0NvbmZpZy5pY2VTZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldO1xuICAgICAgICAgICAgICBpZiAoc2VydmVyLmhhc093blByb3BlcnR5KCd1cmxzJykpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNlcnZlci51cmxzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgbmV3U2VydmVyID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZlci51cmxzW2pdXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlci51cmxzW2pdLmluZGV4T2YoJ3R1cm4nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIudXNlcm5hbWUgPSBzZXJ2ZXIudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci5jcmVkZW50aWFsID0gc2VydmVyLmNyZWRlbnRpYWw7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gobmV3U2VydmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKHBjQ29uZmlnLmljZVNlcnZlcnNbaV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwY0NvbmZpZy5pY2VTZXJ2ZXJzID0gbmV3SWNlU2VydmVycztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBtb3pSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB9O1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSA9IG1velJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcblxuICAgICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICAgIGlmIChtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gbW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xuICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IG1velJUQ0ljZUNhbmRpZGF0ZTtcbiAgICB9XG5cbiAgICAvLyBzaGltIGF3YXkgbmVlZCBmb3Igb2Jzb2xldGUgUlRDSWNlQ2FuZGlkYXRlL1JUQ1Nlc3Npb25EZXNjcmlwdGlvbi5cbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICAgIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcmd1bWVudHNbMF0gPSBuZXcgKChtZXRob2QgPT09ICdhZGRJY2VDYW5kaWRhdGUnKT9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gIH0sXG5cbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgLy8gZ2V0VXNlck1lZGlhIGNvbnN0cmFpbnRzIHNoaW0uXG4gICAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xuICAgICAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMucmVxdWlyZSkge1xuICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXF1aXJlID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fFxuICAgICAgICAgICAgICBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cbiAgICAgICAgICAgICAgY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXF1aXJlLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjW2tleV0gPSByLmV4YWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjLmFkdmFuY2VkLnB1c2gob2MpO1xuICAgICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xuICAgICAgICAgICAgICBkZWxldGUgY1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9O1xuICAgICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XG4gICAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dpbmcoJ2ZmMzc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gICAgfTtcblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gICAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYShjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gICAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge2dldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfVxuICAgICAgfTtcbiAgICB9XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICB2YXIgaW5mb3MgPSBbXG4gICAgICAgICAgICAgIHtraW5kOiAnYXVkaW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9LFxuICAgICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHJlc29sdmUoaW5mb3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0MSkge1xuICAgICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgICB2YXIgb3JnRW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzLmJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG9yZ0VudW1lcmF0ZURldmljZXMoKS50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIC8vIEF0dGFjaCBhIG1lZGlhIHN0cmVhbSB0byBhbiBlbGVtZW50LlxuICBhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24oZWxlbWVudCwgc3RyZWFtKSB7XG4gICAgbG9nZ2luZygnREVQUkVDQVRFRCwgYXR0YWNoTWVkaWFTdHJlYW0gd2lsbCBzb29uIGJlIHJlbW92ZWQuJyk7XG4gICAgZWxlbWVudC5zcmNPYmplY3QgPSBzdHJlYW07XG4gIH0sXG5cbiAgcmVhdHRhY2hNZWRpYVN0cmVhbTogZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICBsb2dnaW5nKCdERVBSRUNBVEVELCByZWF0dGFjaE1lZGlhU3RyZWFtIHdpbGwgc29vbiBiZSByZW1vdmVkLicpO1xuICAgIHRvLnNyY09iamVjdCA9IGZyb20uc3JjT2JqZWN0O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU9uVHJhY2s6IGZpcmVmb3hTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0LFxuICBzaGltUGVlckNvbm5lY3Rpb246IGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcbiAgYXR0YWNoTWVkaWFTdHJlYW06IGZpcmVmb3hTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICByZWF0dGFjaE1lZGlhU3RyZWFtOiBmaXJlZm94U2hpbS5yZWF0dGFjaE1lZGlhU3RyZWFtXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICB9O1xuXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hpbSBmb3IgbWVkaWFEZXZpY2VzIG9uIG9sZGVyIHZlcnNpb25zLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge2dldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfSxcbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XG4gICAgfTtcbiAgfVxuICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHZhciBpbmZvcyA9IFtcbiAgICAgICAgICAgIHtraW5kOiAnYXVkaW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9LFxuICAgICAgICAgICAge2tpbmQ6ICd2aWRlb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ31cbiAgICAgICAgICBdO1xuICAgICAgICAgIHJlc29sdmUoaW5mb3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0MSkge1xuICAgIC8vIFdvcmsgYXJvdW5kIGh0dHA6Ly9idWd6aWwubGEvMTE2OTY2NVxuICAgIHZhciBvcmdFbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzLmJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gb3JnRW51bWVyYXRlRGV2aWNlcygpLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIHNhZmFyaVNoaW0gPSB7XG4gIC8vIFRPRE86IERyQWxleCwgc2hvdWxkIGJlIGhlcmUsIGRvdWJsZSBjaGVjayBhZ2FpbnN0IExheW91dFRlc3RzXG4gIC8vIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHsgfSxcblxuICAvLyBUT0RPOiBEckFsZXhcbiAgLy8gYXR0YWNoTWVkaWFTdHJlYW06IGZ1bmN0aW9uKGVsZW1lbnQsIHN0cmVhbSkgeyB9LFxuICAvLyByZWF0dGFjaE1lZGlhU3RyZWFtOiBmdW5jdGlvbih0bywgZnJvbSkgeyB9LFxuXG4gIC8vIFRPRE86IG9uY2UgdGhlIGJhY2stZW5kIGZvciB0aGUgbWFjIHBvcnQgaXMgZG9uZSwgYWRkLlxuICAvLyBUT0RPOiBjaGVjayBmb3Igd2Via2l0R1RLK1xuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIHNoaW1HZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKCkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhO1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbUdldFVzZXJNZWRpYTogc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhXG4gIC8vIFRPRE9cbiAgLy8gc2hpbU9uVHJhY2s6IHNhZmFyaVNoaW0uc2hpbU9uVHJhY2ssXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogc2FmYXJpU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIC8vIGF0dGFjaE1lZGlhU3RyZWFtOiBzYWZhcmlTaGltLmF0dGFjaE1lZGlhU3RyZWFtLFxuICAvLyByZWF0dGFjaE1lZGlhU3RyZWFtOiBzYWZhcmlTaGltLnJlYXR0YWNoTWVkaWFTdHJlYW1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ0Rpc2FibGVkXyA9IGZhbHNlO1xuXG4vLyBVdGlsaXR5IG1ldGhvZHMuXG52YXIgdXRpbHMgPSB7XG4gIGRpc2FibGVMb2c6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcbiAgICAgICAgICAnLiBQbGVhc2UgdXNlIGEgYm9vbGVhbi4nKTtcbiAgICB9XG4gICAgbG9nRGlzYWJsZWRfID0gYm9vbDtcbiAgICByZXR1cm4gKGJvb2wpID8gJ2FkYXB0ZXIuanMgbG9nZ2luZyBkaXNhYmxlZCcgOlxuICAgICAgICAnYWRhcHRlci5qcyBsb2dnaW5nIGVuYWJsZWQnO1xuICB9LFxuXG4gIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAobG9nRGlzYWJsZWRfKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IGJyb3dzZXIgdmVyc2lvbiBvdXQgb2YgdGhlIHByb3ZpZGVkIHVzZXIgYWdlbnQgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVhc3RyaW5nIHVzZXJBZ2VudCBzdHJpbmcuXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gZXhwciBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCBhcyBtYXRjaCBjcml0ZXJpYS5cbiAgICogQHBhcmFtIHshbnVtYmVyfSBwb3MgcG9zaXRpb24gaW4gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJuIHshbnVtYmVyfSBicm93c2VyIHZlcnNpb24uXG4gICAqL1xuICBleHRyYWN0VmVyc2lvbjogZnVuY3Rpb24odWFzdHJpbmcsIGV4cHIsIHBvcykge1xuICAgIHZhciBtYXRjaCA9IHVhc3RyaW5nLm1hdGNoKGV4cHIpO1xuICAgIHJldHVybiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPj0gcG9zICYmIHBhcnNlSW50KG1hdGNoW3Bvc10sIDEwKTtcbiAgfSxcblxuICAvKipcbiAgICogQnJvd3NlciBkZXRlY3Rvci5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSByZXN1bHQgY29udGFpbmluZyBicm93c2VyLCB2ZXJzaW9uIGFuZCBtaW5WZXJzaW9uXG4gICAqICAgICBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgZGV0ZWN0QnJvd3NlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gUmV0dXJuZWQgcmVzdWx0IG9iamVjdC5cbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgcmVzdWx0LmJyb3dzZXIgPSBudWxsO1xuICAgIHJlc3VsdC52ZXJzaW9uID0gbnVsbDtcbiAgICByZXN1bHQubWluVmVyc2lvbiA9IG51bGw7XG5cbiAgICAvLyBGYWlsIGVhcmx5IGlmIGl0J3Mgbm90IGEgYnJvd3NlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhd2luZG93Lm5hdmlnYXRvcikge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94LlxuICAgIGlmIChuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9GaXJlZm94XFwvKFswLTldKylcXC4vLCAxKTtcbiAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gMzE7XG5cbiAgICAvLyBhbGwgd2Via2l0LWJhc2VkIGJyb3dzZXJzXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKSB7XG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYSwgYWxsIHVzZSB0aGUgY2hyb21lIHNoaW0gZm9yIG5vd1xuICAgICAgaWYgKHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vLCAyKTtcbiAgICAgICAgcmVzdWx0Lm1pblZlcnNpb24gPSAzODtcblxuICAgICAgLy8gU2FmYXJpIG9yIHVua25vd24gd2Via2l0LWJhc2VkXG4gICAgICAvLyBmb3IgdGhlIHRpbWUgYmVpbmcgU2FmYXJpIGhhcyBzdXBwb3J0IGZvciBNZWRpYVN0cmVhbXMgYnV0IG5vdCB3ZWJSVENcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNhZmFyaSBVQSBzdWJzdHJpbmdzIG9mIGludGVyZXN0IGZvciByZWZlcmVuY2U6XG4gICAgICAgIC8vIC0gd2Via2l0IHZlcnNpb246ICAgICAgICAgICBBcHBsZVdlYktpdC82MDIuMS4yNSAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB2ZXJzaW9uOiAgICAgICAgVmVyc2lvbi85LjAuMyAodW5pcXVlIHRvIFNhZmFyaSlcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb246IFNhZmFyaS82MDEuNC40IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIHRoZSB3ZWJraXQgdmVyc2lvbiBhbmQgc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9ucyBhcmUgZXF1YWxzLFxuICAgICAgICAvLyAuLi4gdGhpcyBpcyBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBvbmx5IHRoZSBpbnRlcm5hbCB3ZWJraXQgdmVyc2lvbiBpcyBpbXBvcnRhbnQgdG9kYXkgdG8ga25vdyBpZlxuICAgICAgICAvLyBtZWRpYSBzdHJlYW1zIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oXFxkKykuKFxcZCspLykpIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdzYWZhcmknO1xuICAgICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgL0FwcGxlV2ViS2l0XFwvKFswLTldKylcXC4vLCAxKTtcbiAgICAgICAgICByZXN1bHQubWluVmVyc2lvbiA9IDYwMjtcblxuICAgICAgICAvLyB1bmtub3duIHdlYmtpdC1iYXNlZCBicm93c2VyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnVW5zdXBwb3J0ZWQgd2Via2l0LWJhc2VkIGJyb3dzZXIgJyArXG4gICAgICAgICAgICAgICd3aXRoIEdVTSBzdXBwb3J0IGJ1dCBubyBXZWJSVEMgc3VwcG9ydC4nO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEVkZ2UuXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8pKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdlZGdlJztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcbiAgICAgIHJlc3VsdC5taW5WZXJzaW9uID0gMTA1NDc7XG5cbiAgICAvLyBEZWZhdWx0IGZhbGx0aHJvdWdoOiBub3Qgc3VwcG9ydGVkLlxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdOb3QgYSBzdXBwb3J0ZWQgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBXYXJuIGlmIHZlcnNpb24gaXMgbGVzcyB0aGFuIG1pblZlcnNpb24uXG4gICAgaWYgKHJlc3VsdC52ZXJzaW9uIDwgcmVzdWx0Lm1pblZlcnNpb24pIHtcbiAgICAgIHV0aWxzLmxvZygnQnJvd3NlcjogJyArIHJlc3VsdC5icm93c2VyICsgJyBWZXJzaW9uOiAnICsgcmVzdWx0LnZlcnNpb24gK1xuICAgICAgICAgICcgPCBtaW5pbXVtIHN1cHBvcnRlZCB2ZXJzaW9uOiAnICsgcmVzdWx0Lm1pblZlcnNpb24gK1xuICAgICAgICAgICdcXG4gc29tZSB0aGluZ3MgbWlnaHQgbm90IHdvcmshJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufTtcblxuLy8gRXhwb3J0LlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZzogdXRpbHMubG9nLFxuICBkaXNhYmxlTG9nOiB1dGlscy5kaXNhYmxlTG9nLFxuICBicm93c2VyRGV0YWlsczogdXRpbHMuZGV0ZWN0QnJvd3NlcigpLFxuICBleHRyYWN0VmVyc2lvbjogdXRpbHMuZXh0cmFjdFZlcnNpb25cbn07XG4iLCJ2YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnbm9kZS1ldmVudC1lbWl0dGVyJyk7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLyBMb2dnaW5nIHV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBERUJVRyA9IGZhbHNlO1xudmFyIExvZ2dlciA9IHtcblx0bG9nOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5sb2cobWVzc2FnZSk7XG5cdH0sXG5cblx0ZXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdGlmKERFQlVHKSBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gRGl5YU5vZGUoKXtcblx0RXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cblx0dGhpcy5fdXNlciA9IG51bGw7XG5cdHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBudWxsO1xuXHR0aGlzLl9wYXNzID0gbnVsbDtcblxuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2VkJztcblx0dGhpcy5fYWRkciA9IG51bGw7XG5cdHRoaXMuX3NvY2tldCA9IG51bGw7XG5cdHRoaXMuX25leHRJZCA9IDA7XG5cdHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCA9IG51bGw7XG5cdHRoaXMuX3BlbmRpbmdNZXNzYWdlcyA9IFtdO1xuXHR0aGlzLl9wZWVycyA9IFtdO1xuXHR0aGlzLl9yZWNvbm5lY3RUaW1lb3V0ID0gMTAwMDtcblx0dGhpcy5fY29ubmVjdFRpbWVvdXQgPSA1MDAwO1xufVxuaW5oZXJpdHMoRGl5YU5vZGUsIEV2ZW50RW1pdHRlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLyBQdWJsaWMgQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLnVzZXIgPSBmdW5jdGlvbih1c2VyKSB7IFxuXHRpZih1c2VyKSB0aGlzLl91c2VyID0gdXNlcjtcblx0ZWxzZSByZXR1cm4gdGhpcy5fdXNlcjsgXG59O1xuRGl5YU5vZGUucHJvdG90eXBlLmF1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbihhdXRoZW50aWNhdGVkKSB7IFxuXHRpZihhdXRoZW50aWNhdGVkICE9PSB1bmRlZmluZWQpIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBhdXRoZW50aWNhdGVkO1xuXHRlbHNlIHJldHVybiB0aGlzLl9hdXRoZW50aWNhdGVkOyBcbn07XG5EaXlhTm9kZS5wcm90b3R5cGUucGFzcyA9IGZ1bmN0aW9uKHBhc3MpIHsgXG5cdGlmKHBhc3MgIT09IHVuZGVmaW5lZCkgdGhpcy5fcGFzcyA9IHBhc3M7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3Bhc3M7IFxufTtcbkRpeWFOb2RlLnByb3RvdHlwZS5hZGRyID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9hZGRyOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnBlZXJzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuX3BlZXJzOyB9O1xuRGl5YU5vZGUucHJvdG90eXBlLnNlbGYgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NlbGY7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0U2VjdXJlZCA9IGZ1bmN0aW9uKGJTZWN1cmVkKSB7IHRoaXMuX3NlY3VyZWQgPSBiU2VjdXJlZCAhPT0gZmFsc2U7IH07XG5EaXlhTm9kZS5wcm90b3R5cGUuc2V0V1NvY2tldCA9IGZ1bmN0aW9uKFdTb2NrZXQpIHt0aGlzLl9XU29ja2V0ID0gV1NvY2tldDt9XG5cblxuXG4vKiogQHJldHVybiB7UHJvbWlzZTxTdHJpbmc+fSB0aGUgY29ubmVjdGVkIHBlZXIgbmFtZSAqL1xuRGl5YU5vZGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmJEb250UmVjb25uZWN0ID0gZmFsc2U7XG5cblx0aWYoV1NvY2tldCkgdGhpcy5fV1NvY2tldCA9IFdTb2NrZXQ7XG5cdGVsc2UgaWYoIXRoaXMuX1dTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXHRXU29ja2V0ID0gdGhpcy5fV1NvY2tldDtcblxuXHQvLyBDaGVjayBhbmQgRm9ybWF0IFVSSSAoRlFETilcblx0aWYoYWRkci5pbmRleE9mKFwid3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCkgcmV0dXJuIFEucmVqZWN0KFwiUGxlYXNlIHVzZSBhIHNlY3VyZWQgY29ubmVjdGlvbiAoXCIgKyBhZGRyICsgXCIpXCIpO1xuXHRpZihhZGRyLmluZGV4T2YoXCJ3c3M6Ly9cIikgPT09IDAgJiYgdGhpcy5fc2VjdXJlZCA9PT0gZmFsc2UpIHJldHVybiBRLnJlamVjdChcIlBsZWFzZSB1c2UgYSBub24tc2VjdXJlZCBjb25uZWN0aW9uIChcIiArIGFkZHIgKyBcIilcIik7XG5cdGlmKGFkZHIuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGFkZHIuaW5kZXhPZihcIndzczovL1wiKSAhPT0gMCkge1xuXHRcdGlmKHRoaXMuX3NlY3VyZWQpIGFkZHIgPSBcIndzczovL1wiICsgYWRkcjtcblx0XHRlbHNlIGFkZHIgPSBcIndzOi8vXCIgKyBhZGRyO1xuXHR9XG5cblxuXHRpZih0aGlzLl9hZGRyID09PSBhZGRyKXtcblx0XHRpZih0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnKVxuXHRcdFx0cmV0dXJuIFEodGhpcy5zZWxmKCkpO1xuXHRcdGVsc2UgaWYodGhpcy5fY29ubmVjdGlvbkRlZmVycmVkICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlICYmIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlLmlzUGVuZGluZygpKVxuXHRcdFx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25EZWZlcnJlZC5wcm9taXNlO1xuXHR9XG5cblx0cmV0dXJuIHRoaXMuY2xvc2UoKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0dGhhdC5fYWRkciA9IGFkZHI7XG5cdFx0dGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRcdExvZ2dlci5sb2coJ2QxOiBjb25uZWN0IHRvICcgKyB0aGF0Ll9hZGRyKTtcblx0XHR2YXIgc29jayA9IG5ldyBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIHRoYXQuX2FkZHIsIHRoYXQuX2Nvbm5lY3RUaW1lb3V0KTtcblxuXHRcdGlmKCF0aGF0Ll9zb2NrZXRIYW5kbGVyKSB0aGF0Ll9zb2NrZXRIYW5kbGVyID0gc29jaztcblxuXHRcdHRoYXQuX29ub3BlbmluZygpO1xuXG5cdFx0c29jay5vbignb3BlbicsIGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiW2QxXSBXZWJzb2NrZXQgcmVzcG9uZGVkIGJ1dCBhbHJlYWR5IGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCBvbmVcIik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBzb2NrO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ29wZW5lZCc7XG5cdFx0XHR0aGF0Ll9zZXR1cFBpbmdSZXNwb25zZSgpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbignY2xvc2luZycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhhdC5fc29ja2V0SGFuZGxlciAhPT0gc29jaykgcmV0dXJuIDtcblx0XHRcdHRoYXQuX29uY2xvc2luZygpO1xuXHRcdH0pO1xuXG5cdFx0c29jay5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHR0aGF0Ll9zdG9wUGluZ1Jlc3BvbnNlKCk7XG5cdFx0XHR0aGF0Ll9vbmNsb3NlKCk7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSk7XG5cblx0XHRzb2NrLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRpZih0aGF0Ll9zb2NrZXRIYW5kbGVyICE9PSBzb2NrKSByZXR1cm47XG5cdFx0XHR0aGF0Ll9vbmVycm9yKGVycm9yKTtcblx0XHR9KTtcblxuXHRcdHNvY2sub24oJ3RpbWVvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKHRoYXQuX3NvY2tldEhhbmRsZXIgIT09IHNvY2spIHJldHVybjtcblx0XHRcdHRoYXQuX3NvY2tldEhhbmRsZXIgPSBudWxsO1xuXHRcdFx0dGhhdC5fc3RhdHVzID0gJ2Nsb3NlZCc7XG5cdFx0XHRpZih0aGF0Ll9jb25uZWN0aW9uRGVmZXJyZWQpIHsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnJlamVjdChcImNsb3NlZFwiKTsgdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDt9XG5cdFx0fSlcblxuXHRcdHNvY2sub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7IHRoYXQuX29ubWVzc2FnZShtZXNzYWdlKTsgfSk7XG5cblx0XHRyZXR1cm4gdGhhdC5fY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2U7XG5cdH0pO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5iRG9udFJlY29ubmVjdCA9IHRydWU7XG5cdHJldHVybiB0aGlzLmNsb3NlKCk7XG59O1xuXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuX3N0b3BQaW5nUmVzcG9uc2UoKTtcblx0aWYodGhpcy5fc29ja2V0SGFuZGxlcikgcmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIuY2xvc2UoKTtcblx0ZWxzZSByZXR1cm4gUSgpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuICh0aGlzLl9zb2NrZXRIYW5kbGVyICYmIHRoaXMuX3NvY2tldEhhbmRsZXIuaXNDb25uZWN0ZWQoKSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQsIG9wdGlvbnMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRSZXF1ZXN0Jztcblx0XHRwYXJhbXMgPSB7c2VydmljZTpfcGFyYW1zWzBdLCBmdW5jOl9wYXJhbXNbMV19O1xuXHR9XG5cblx0aWYoIXBhcmFtcy5zZXJ2aWNlKSB7XG5cdFx0TG9nZ2VyLmVycm9yKCdObyBzZXJ2aWNlIGRlZmluZWQgZm9yIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiUmVxdWVzdFwiKTtcblx0dGhpcy5fYXBwZW5kTWVzc2FnZShtZXNzYWdlLCBjYWxsYmFjayk7XG5cdGlmKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsID0gb3B0aW9ucy5jYWxsYmFja19wYXJ0aWFsO1xuXHRtZXNzYWdlLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdGlmKCFpc05hTih0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCl7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGhhbmRsZXIgPSB0aGF0Ll9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0aWYoaGFuZGxlcikgdGhhdC5fbm90aWZ5TGlzdGVuZXIoaGFuZGxlciwgJ1RpbWVvdXQgZXhjZWVkZWQgKCcrdGltZW91dCsnbXMpICEnKTtcblx0XHR9LCB0aW1lb3V0KTtcblx0fVxuXG5cdGlmKCF0aGlzLl9zZW5kKG1lc3NhZ2UpKXtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBzZW5kIHJlcXVlc3QgIScpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2spe1xuXHRpZihwYXJhbXMuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuXHRcdHZhciBfcGFyYW1zID0gcGFyYW1zLnNwbGl0KFwiLlwiKTtcblx0XHRpZihfcGFyYW1zLmxlbmd0aCE9MikgdGhyb3cgJ01hbGZvcm1lZFJlcXVlc3QnO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRpZighcGFyYW1zLnNlcnZpY2Upe1xuXHRcdExvZ2dlci5lcnJvcignTm8gc2VydmljZSBkZWZpbmVkIGZvciBzdWJzY3JpcHRpb24gIScpO1xuXHRcdHJldHVybiAtMTtcblx0fVxuXG5cdHZhciBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShwYXJhbXMsIFwiU3Vic2NyaXB0aW9uXCIpO1xuXHR0aGlzLl9hcHBlbmRNZXNzYWdlKG1lc3NhZ2UsIGNhbGxiYWNrKTtcblxuXHRpZighdGhpcy5fc2VuZChtZXNzYWdlKSl7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHRMb2dnZXIuZXJyb3IoJ0Nhbm5vdCBzZW5kIHN1YnNjcmlwdGlvbiAhJyk7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0cmV0dXJuIG1lc3NhZ2UuaWQ7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJJZCl7XG5cdGlmKHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tzdWJJZF0gJiYgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW3N1YklkXS50eXBlID09PSBcIlN1YnNjcmlwdGlvblwiKXtcblx0XHR2YXIgc3Vic2NyaXB0aW9uID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShzdWJJZCk7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2Uoe1xuXHRcdFx0dGFyZ2V0OiBzdWJzY3JpcHRpb24udGFyZ2V0LFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRzdWJJZDogc3ViSWRcblx0XHRcdH1cblx0XHR9LCBcIlVuc3Vic2NyaWJlXCIpO1xuXG5cdFx0aWYoIXRoaXMuX3NlbmQobWVzc2FnZSkpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKCdDYW5ub3Qgc2VuZCB1bnN1YnNjcmliZSAhJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLyBJbnRlcm5hbCBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YU5vZGUucHJvdG90eXBlLl9hcHBlbmRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgY2FsbGJhY2spe1xuXHR0aGlzLl9wZW5kaW5nTWVzc2FnZXNbbWVzc2FnZS5pZF0gPSB7XG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrLFxuXHRcdHR5cGU6IG1lc3NhZ2UudHlwZSxcblx0XHR0YXJnZXQ6IG1lc3NhZ2UudGFyZ2V0XG5cdH07XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3JlbW92ZU1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRpZihoYW5kbGVyKXtcblx0XHRkZWxldGUgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2VJZF07XG5cdFx0cmV0dXJuIGhhbmRsZXI7XG5cdH1lbHNle1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NsZWFyTWVzc2FnZXMgPSBmdW5jdGlvbihlcnIsIGRhdGEpe1xuXHRmb3IodmFyIG1lc3NhZ2VJZCBpbiB0aGlzLl9wZW5kaW5nTWVzc2FnZXMpe1xuXHRcdHZhciBoYW5kbGVyID0gdGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlSWQpO1xuXHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsIGVyciwgZGF0YSk7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fY2xlYXJQZWVycyA9IGZ1bmN0aW9uKCl7XG5cdHdoaWxlKHRoaXMuX3BlZXJzLmxlbmd0aCkgdGhpcy5lbWl0KCdwZWVyLWRpc2Nvbm5lY3RlZCcsIHRoaXMuX3BlZXJzLnBvcCgpKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fZ2V0TWVzc2FnZUhhbmRsZXIgPSBmdW5jdGlvbihtZXNzYWdlSWQpe1xuXHR2YXIgaGFuZGxlciA9IHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlSWRdO1xuXHRyZXR1cm4gaGFuZGxlciA/IGhhbmRsZXIgOiBudWxsO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9ub3RpZnlMaXN0ZW5lciA9IGZ1bmN0aW9uKGhhbmRsZXIsIGVycm9yLCBkYXRhKXtcblx0aWYoaGFuZGxlciAmJiB0eXBlb2YgaGFuZGxlci5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGVycm9yID0gZXJyb3IgPyBlcnJvciA6IG51bGw7XG5cdFx0ZGF0YSA9IGRhdGEgPyBkYXRhIDogbnVsbDtcblx0XHR0cnkge1xuXHRcdFx0aGFuZGxlci5jYWxsYmFjayhlcnJvciwgZGF0YSk7XG5cdFx0fSBjYXRjaChlKSB7IGNvbnNvbGUubG9nKCdbRXJyb3IgaW4gUmVxdWVzdCBjYWxsYmFja10gJyArIGUuc3RhY2sgPyBlLnN0YWNrIDogZSk7fVxuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0cmV0dXJuIHRoaXMuX3NvY2tldEhhbmRsZXIgJiYgdGhpcy5fc29ja2V0SGFuZGxlci5zZW5kKG1lc3NhZ2UpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zZXR1cFBpbmdSZXNwb25zZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzLl9waW5nVGltZW91dCA9IDE1MDAwO1xuXHR0aGlzLl9sYXN0UGluZyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG5cdGZ1bmN0aW9uIGNoZWNrUGluZygpe1xuXHRcdHZhciBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0aWYoY3VyVGltZSAtIHRoYXQuX2xhc3RQaW5nID4gdGhhdC5fcGluZ1RpbWVvdXQpe1xuXHRcdFx0dGhhdC5fZm9yY2VDbG9zZSgpO1xuXHRcdFx0TG9nZ2VyLmxvZyhcImQxOiAgdGltZWQgb3V0ICFcIik7XG5cdFx0fWVsc2V7XG5cdFx0XHRMb2dnZXIubG9nKFwiZDE6IGxhc3QgcGluZyBva1wiKTtcblx0XHRcdHRoYXQuX3BpbmdTZXRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGNoZWNrUGluZywgTWF0aC5yb3VuZCh0aGF0Ll9waW5nVGltZW91dCAvIDIuMSkpO1xuXHRcdH1cblx0fVxuXG5cdGNoZWNrUGluZygpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9zdG9wUGluZ1Jlc3BvbnNlID0gZnVuY3Rpb24oKXtcblx0Y2xlYXJUaW1lb3V0KHRoaXMuX3BpbmdTZXRUaW1lb3V0SWQpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9mb3JjZUNsb3NlID0gZnVuY3Rpb24oKXtcblx0dGhpcy5fc29ja2V0SGFuZGxlci5jbG9zZSgpO1xuXHR0aGlzLl9vbmNsb3NlKCk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8gU29ja2V0IGV2ZW50IGhhbmRsZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0aWYoaXNOYU4obWVzc2FnZS5pZCkpIHJldHVybiB0aGlzLl9oYW5kbGVJbnRlcm5hbE1lc3NhZ2UobWVzc2FnZSk7XG5cdHZhciBoYW5kbGVyID0gdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIobWVzc2FnZS5pZCk7XG5cdGlmKCFoYW5kbGVyKSByZXR1cm47XG5cdHN3aXRjaChoYW5kbGVyLnR5cGUpe1xuXHRcdGNhc2UgXCJSZXF1ZXN0XCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVSZXF1ZXN0KGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlN1YnNjcmlwdGlvblwiOlxuXHRcdFx0dGhpcy5faGFuZGxlU3Vic2NyaXB0aW9uKGhhbmRsZXIsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5fb25vcGVuaW5nID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZW1pdCgnb3BlbmluZycsIHRoaXMpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbmVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcblx0dGhpcy5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcihlcnJvcikpO1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9vbmNsb3NpbmcgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5lbWl0KCdjbG9zaW5nJywgdGhpcyk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX29uY2xvc2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5fY2xlYXJNZXNzYWdlcygnUGVlckRpc2Nvbm5lY3RlZCcpO1xuXHR0aGlzLl9jbGVhclBlZXJzKCk7XG5cblx0aWYoIXRoaXMuYkRvbnRSZWNvbm5lY3QpIHtcblx0XHRMb2dnZXIubG9nKCdkMTogY29ubmVjdGlvbiBsb3N0LCB0cnkgcmVjb25uZWN0aW5nJyk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dGhhdC5jb25uZWN0KHRoYXQuX2FkZHIsIHRoYXQuX1dTb2NrZXQpLmNhdGNoKGZ1bmN0aW9uKGVycil7fSk7XG5cdFx0fSwgdGhhdC5fcmVjb25uZWN0VGltZW91dCk7XG5cdH1cdFxuXHR0aGlzLmVtaXQoJ2Nsb3NlJywgdGhpcy5fYWRkcik7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8gUHJvdG9jb2wgZXZlbnQgaGFuZGxlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlSW50ZXJuYWxNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSl7XG5cdHN3aXRjaChtZXNzYWdlLnR5cGUpe1xuXHRcdGNhc2UgXCJQZWVyQ29ubmVjdGVkXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVQZWVyQ29ubmVjdGVkKG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlBlZXJEaXNjb25uZWN0ZWRcIjpcblx0XHRcdHRoaXMuX2hhbmRsZVBlZXJEaXNjb25uZWN0ZWQobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiSGFuZHNoYWtlXCI6XG5cdFx0XHR0aGlzLl9oYW5kbGVIYW5kc2hha2UobWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiUGluZ1wiOlxuXHRcdFx0dGhpcy5faGFuZGxlUGluZyhtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVBpbmcgPSBmdW5jdGlvbihtZXNzYWdlKXtcblx0bWVzc2FnZS50eXBlID0gXCJQb25nXCI7XG5cdHRoaXMuX2xhc3RQaW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHRoaXMuX3NlbmQobWVzc2FnZSk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZUhhbmRzaGFrZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXG5cdGlmKG1lc3NhZ2UucGVlcnMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWVzc2FnZS5zZWxmICE9PSAnc3RyaW5nJyl7XG5cdFx0TG9nZ2VyLmVycm9yKFwiTWlzc2luZyBhcmd1bWVudHMgZm9yIEhhbmRzaGFrZSBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblxuXHR0aGlzLl9zZWxmID0gbWVzc2FnZS5zZWxmO1xuXG5cdGZvcih2YXIgaT0wO2k8bWVzc2FnZS5wZWVycy5sZW5ndGg7IGkrKyl7XG5cdFx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJzW2ldKTtcblx0XHR0aGlzLmVtaXQoJ3BlZXItY29ubmVjdGVkJywgbWVzc2FnZS5wZWVyc1tpXSk7XG5cdH1cblxuXHR0aGlzLl9jb25uZWN0aW9uRGVmZXJyZWQucmVzb2x2ZSh0aGlzLnNlbGYoKSk7XG5cdHRoaXMuZW1pdCgnb3BlbicsIHRoaXMuX2FkZHIpO1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5fY29ubmVjdGlvbkRlZmVycmVkID0gbnVsbDtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckNvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckNvbm5lY3RlZCBtZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9BZGQgcGVlciB0byB0aGUgbGlzdCBvZiByZWFjaGFibGUgcGVlcnNcblx0dGhpcy5fcGVlcnMucHVzaChtZXNzYWdlLnBlZXJJZCk7XG5cblx0dGhpcy5lbWl0KCdwZWVyLWNvbm5lY3RlZCcsIG1lc3NhZ2UucGVlcklkKTtcbn07XG5cbkRpeWFOb2RlLnByb3RvdHlwZS5faGFuZGxlUGVlckRpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRpZihtZXNzYWdlLnBlZXJJZCA9PT0gdW5kZWZpbmVkKXtcblx0XHRMb2dnZXIuZXJyb3IoXCJNaXNzaW5nIGFyZ3VtZW50cyBmb3IgUGVlckRpc2Nvbm5lY3RlZCBNZXNzYWdlLCBkcm9wcGluZy4uLlwiKTtcblx0XHRyZXR1cm4gO1xuXHR9XG5cblx0Ly9HbyB0aHJvdWdoIGFsbCBwZW5kaW5nIG1lc3NhZ2VzIGFuZCBub3RpZnkgdGhlIG9uZXMgdGhhdCBhcmUgdGFyZ2V0ZWRcblx0Ly9hdCB0aGUgZGlzY29ubmVjdGVkIHBlZXIgdGhhdCBpdCBkaXNjb25uZWN0ZWQgYW5kIHRoZXJlZm9yZSB0aGUgY29tbWFuZFxuXHQvL2Nhbm5vdCBiZSBmdWxmaWxsZWRcblx0Zm9yKHZhciBtZXNzYWdlSWQgaW4gdGhpcy5fcGVuZGluZ01lc3NhZ2VzKXtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKG1lc3NhZ2VJZCk7XG5cdFx0aWYoaGFuZGxlciAmJiBoYW5kbGVyLnRhcmdldCA9PT0gbWVzc2FnZS5wZWVySWQpIHtcblx0XHRcdHRoaXMuX3JlbW92ZU1lc3NhZ2UobWVzc2FnZUlkKTtcblx0XHRcdHRoaXMuX25vdGlmeUxpc3RlbmVyKGhhbmRsZXIsICdQZWVyRGlzY29ubmVjdGVkJywgbnVsbCk7XG5cdFx0fVxuXHR9XG5cblx0Ly9SZW1vdmUgcGVlciBmcm9tIGxpc3Qgb2YgcmVhY2hhYmxlIHBlZXJzXG5cdGZvcih2YXIgaT10aGlzLl9wZWVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG5cdFx0aWYodGhpcy5fcGVlcnNbaV0gPT09IG1lc3NhZ2UucGVlcklkKXtcblx0XHRcdHRoaXMuX3BlZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuZW1pdCgncGVlci1kaXNjb25uZWN0ZWQnLCBtZXNzYWdlLnBlZXJJZCk7XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVJlcXVlc3QgPSBmdW5jdGlvbihoYW5kbGVyLCBtZXNzYWdlKXtcblx0aWYobWVzc2FnZS50eXBlID09PSAnUGFydGlhbEFuc3dlcicpIHtcblx0XHRpZih0eXBlb2YgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW21lc3NhZ2UuaWRdLmNhbGxiYWNrX3BhcnRpYWwgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBlcnJvciA9IG1lc3NhZ2UuZXJyb3IgPyBtZXNzYWdlLmVycm9yIDogbnVsbDtcblx0XHRcdHZhciBkYXRhID0gbWVzc2FnZS5kYXRhID8gbWVzc2FnZS5kYXRhIDogbnVsbDtcblx0XHRcdHRoaXMuX3BlbmRpbmdNZXNzYWdlc1ttZXNzYWdlLmlkXS5jYWxsYmFja19wYXJ0aWFsKGVycm9yLCBkYXRhKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5fcmVtb3ZlTWVzc2FnZShtZXNzYWdlLmlkKTtcblx0XHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEpO1xuXHR9XG59O1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2hhbmRsZVN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKGhhbmRsZXIsIG1lc3NhZ2Upe1xuXHQvL3JlbW92ZSBzdWJzY3JpcHRpb24gaWYgaXQgd2FzIGNsb3NlZCBmcm9tIG5vZGVcblx0aWYobWVzc2FnZS5yZXN1bHQgPT09IFwiY2xvc2VkXCIpIHtcblx0XHR0aGlzLl9yZW1vdmVNZXNzYWdlKG1lc3NhZ2UuaWQpO1xuXHRcdG1lc3NhZ2UuZXJyb3IgPSAnU3Vic2NyaXB0aW9uQ2xvc2VkJztcblx0fVxuXHR0aGlzLl9ub3RpZnlMaXN0ZW5lcihoYW5kbGVyLCBtZXNzYWdlLmVycm9yLCBtZXNzYWdlLmRhdGEgPyBtZXNzYWdlLmRhdGEgOiBudWxsKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU29ja2V0SGFuZGxlciAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBTb2NrZXRIYW5kbGVyKFdTb2NrZXQsIGFkZHIsIHRpbWVvdXQpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmFkZHIgPSBhZGRyO1xuXG5cdGlmKFdTb2NrZXQpIHRoaXMuX1dTb2NrZXQgPSBXU29ja2V0O1xuXHRlbHNlIGlmKCF0aGlzLl9XU29ja2V0KSB0aGlzLl9XU29ja2V0ID0gd2luZG93LldlYlNvY2tldDtcblx0V1NvY2tldCA9IHRoaXMuX1dTb2NrZXQ7XG5cblx0dGhpcy5fc3RhdHVzID0gJ29wZW5pbmcnO1xuXG5cdHRyeSB7XG5cdFx0dGhpcy5fc29ja2V0ID0gYWRkci5pbmRleE9mKFwid3NzOi8vXCIpPT09MCA/IG5ldyBXU29ja2V0KGFkZHIsIHVuZGVmaW5lZCwge3JlamVjdFVuYXV0aG9yaXplZDpmYWxzZX0pIDogbmV3IFdTb2NrZXQoYWRkcik7XG5cblx0XHR0aGlzLl9zb2NrZXRPcGVuQ2FsbGJhY2sgPSB0aGlzLl9vbm9wZW4uYmluZCh0aGlzKTtcblx0XHR0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrID0gdGhpcy5fb25jbG9zZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayA9IHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX3NvY2tldEVycm9yQ2FsbGJhY2sgPSB0aGlzLl9vbmVycm9yLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJyx0aGlzLl9zb2NrZXRDbG9zZUNhbGxiYWNrKTtcblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX3NvY2tldE1lc3NhZ2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fc29ja2V0RXJyb3JDYWxsYmFjayk7XG5cblx0XHR0aGlzLl9zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBlcnJvciA6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0dGhhdC5fc29ja2V0LmNsb3NlKCk7XG5cdFx0fSk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgPT09ICdvcGVuZWQnKSByZXR1cm47XG5cdFx0XHRpZih0aGF0Ll9zdGF0dXMgIT09ICdjbG9zZWQnKXtcblx0XHRcdFx0TG9nZ2VyLmxvZygnZDE6ICcgKyB0aGF0LmFkZHIgKyAnIHRpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nJyk7XG5cdFx0XHRcdHRoYXQuY2xvc2UoKTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lb3V0JywgdGhhdC5fc29ja2V0KTtcblx0XHRcdH1cblx0XHR9LCB0aW1lb3V0KTtcblxuXHR9IGNhdGNoKGUpIHtcblx0XHRMb2dnZXIuZXJyb3IoZS5zdGFjayk7XG5cdFx0dGhhdC5jbG9zZSgpO1xuXHRcdHRocm93IGU7XG5cdH1cbn07XG5pbmhlcml0cyhTb2NrZXRIYW5kbGVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRpZih0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQgJiYgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnByb21pc2UpIHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcblx0dGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkID0gUS5kZWZlcigpO1xuXHR0aGlzLl9zdGF0dXMgPSAnY2xvc2luZyc7XG5cdHRoaXMuZW1pdCgnY2xvc2luZycsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX3NvY2tldCkgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG5cdHJldHVybiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHRyeSB7XG5cdFx0dmFyIGRhdGEgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcblx0fSBjYXRjaChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3Qgc2VyaWFsaXplIG1lc3NhZ2UnKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR0cnkge1xuXHRcdHRoaXMuX3NvY2tldC5zZW5kKGRhdGEpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHNlbmQgbWVzc2FnZScpO1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuaXNDb25uZWN0ZWQgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMuX3NvY2tldC5yZWFkeVN0YXRlID09IHRoaXMuX1dTb2NrZXQuT1BFTiAmJiB0aGlzLl9zdGF0dXMgPT09ICdvcGVuZWQnO1xufTtcblxuU29ja2V0SGFuZGxlci5wcm90b3R5cGUuX29ub3BlbiA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9zdGF0dXMgPSAnb3BlbmVkJztcblx0dGhpcy5lbWl0KCdvcGVuJywgdGhpcy5fc29ja2V0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdHRoaXMuX3N0YXR1cyA9ICdjbG9zZWQnO1xuXHR0aGlzLnVucmVnaXN0ZXJDYWxsYmFja3MoKTtcblx0dGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX3NvY2tldCk7XG5cdGlmKHRoaXMuX2Rpc2Nvbm5lY3Rpb25EZWZlcnJlZCAmJiB0aGlzLl9kaXNjb25uZWN0aW9uRGVmZXJyZWQucHJvbWlzZSkgdGhpcy5fZGlzY29ubmVjdGlvbkRlZmVycmVkLnJlc29sdmUoKTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLl9vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcblx0dHJ5IHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpO1xuXHRcdHRoaXMuZW1pdCgnbWVzc2FnZScsIG1lc3NhZ2UpO1xuXHR9IGNhdGNoKGVycil7XG5cdFx0TG9nZ2VyLmVycm9yKFwiW1dTXSBjYW5ub3QgcGFyc2UgbWVzc2FnZSwgZHJvcHBpbmcuLi5cIik7XG5cdFx0dGhyb3cgZXJyO1xuXHR9XG59O1xuXG5Tb2NrZXRIYW5kbGVyLnByb3RvdHlwZS5fb25lcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuXHR0aGlzLmVtaXQoJ2Vycm9yJywgZXZ0KTtcbn07XG5cblNvY2tldEhhbmRsZXIucHJvdG90eXBlLnVucmVnaXN0ZXJDYWxsYmFja3MgPSBmdW5jdGlvbigpIHtcblx0aWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpKXtcblx0XHR0aGlzLl9zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX3NvY2tldE9wZW5DYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5fc29ja2V0Q2xvc2VDYWxsYmFjayk7XG5cdFx0dGhpcy5fc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9zb2NrZXRNZXNzYWdlQ2FsbGJhY2spO1xuXHR9IGVsc2UgaWYodGhpcy5fc29ja2V0ICYmICh0eXBlb2YgdGhpcy5fc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykpe1xuXHRcdHRoaXMuX3NvY2tldC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFV0aWxpdHkgbWV0aG9kcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhTm9kZS5wcm90b3R5cGUuX2NyZWF0ZU1lc3NhZ2UgPSBmdW5jdGlvbihwYXJhbXMsIHR5cGUpe1xuXHRpZighcGFyYW1zIHx8ICF0eXBlIHx8ICh0eXBlICE9PSBcIlJlcXVlc3RcIiAmJiB0eXBlICE9PSBcIlN1YnNjcmlwdGlvblwiICYmIHR5cGUgIT09IFwiVW5zdWJzY3JpYmVcIikpe1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiB0eXBlLFxuXHRcdGlkOiB0aGlzLl9nZW5lcmF0ZUlkKCksXG5cdFx0c2VydmljZTogcGFyYW1zLnNlcnZpY2UsXG5cdFx0dGFyZ2V0OiBwYXJhbXMudGFyZ2V0LFxuXHRcdGZ1bmM6IHBhcmFtcy5mdW5jLFxuXHRcdG9iajogcGFyYW1zLm9iaixcblx0XHRkYXRhOiBwYXJhbXMuZGF0YVxuXHR9O1xufTtcblxuRGl5YU5vZGUucHJvdG90eXBlLl9nZW5lcmF0ZUlkID0gZnVuY3Rpb24oKXtcblx0dmFyIGlkID0gdGhpcy5fbmV4dElkO1xuXHR0aGlzLl9uZXh0SWQrKztcblx0cmV0dXJuIGlkO1xufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRGl5YU5vZGU7XG4iLCJ2YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ25vZGUtZXZlbnQtZW1pdHRlcicpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxudmFyIERpeWFOb2RlID0gcmVxdWlyZSgnLi9EaXlhTm9kZScpO1xuXG52YXIgSVBfUkVHRVggPSAvXigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pXFwuKDI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4oMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLigyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pJC87XG5cbi8vLy8vLy8vLy8vLy8vXG4vLyAgRDEgQVBJICAvL1xuLy8vLy8vLy8vLy8vLy9cblxuXG5cbmZ1bmN0aW9uIG5ld0luc3RhbmNlICgpIHtcblx0XG5cdHZhciBjb25uZWN0aW9uID0gbmV3IERpeWFOb2RlKCk7XHRcblxuXHR2YXIgZDFpbnN0ID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cdFx0cmV0dXJuIG5ldyBEaXlhU2VsZWN0b3Ioc2VsZWN0b3IsIGNvbm5lY3Rpb24pO1xuXHR9XG5cblx0ZDFpbnN0LkRpeWFOb2RlID0gRGl5YU5vZGU7XG5cdGQxaW5zdC5EaXlhU2VsZWN0b3IgPSBEaXlhU2VsZWN0b3I7XG5cblx0ZDFpbnN0LmNvbm5lY3QgPSBmdW5jdGlvbihhZGRyLCBXU29ja2V0KXtcblx0XHRyZXR1cm4gY29ubmVjdGlvbi5jb25uZWN0KGFkZHIsIFdTb2NrZXQpO1xuXHR9O1xuXG5cdGQxaW5zdC5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gY29ubmVjdGlvbi5kaXNjb25uZWN0KCk7XG5cdH07XG5cblx0ZDFpbnN0LmlzQ29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XHRyZXR1cm4gY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpO307XG5cdGQxaW5zdC5wZWVycyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5wZWVycygpO307XG5cdGQxaW5zdC5zZWxmID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnNlbGYoKTsgfTtcblx0ZDFpbnN0LmFkZHIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvbm5lY3Rpb24uYWRkcigpOyB9O1xuXHRkMWluc3QudXNlciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi51c2VyKCk7IH07XG5cdGQxaW5zdC5wYXNzID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb25uZWN0aW9uLnBhc3MoKTsgfTtcblx0ZDFpbnN0LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKCk7IH07XG5cblx0ZDFpbnN0LnBhcnNlUGVlciA9IGZ1bmN0aW9uKGFkZHJTdHIpIHtcblx0XHR2YXIgcGVlciA9IHt9O1xuXG5cdFx0Ly8gPG5vdGhpbmc+IC0+IHdzczovL2xvY2FsaG9zdC9hcGlcblx0XHRpZighYWRkclN0ciB8fCBhZGRyU3RyID09PSBcIlwiKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL2xvY2FsaG9zdC9hcGlcIjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vbG9jYWxob3N0L25ldFwiO1xuXHRcdH1cblx0XHQvLyAxMjM0IC0+IHdzOi8vbG9jYWxob3N0OjEyMzRcblx0XHRlbHNlIGlmKC9eWzAtOV0qJC8udGVzdChhZGRyU3RyKSkge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3czovL2xvY2FsaG9zdDpcIithZGRyU3RyO1xuXHRcdH1cblx0XHQvLyAxMC40Mi4wLjEgLT4gd3NzOi8vMTAuNDIuMC4xL2FwaVxuXHRcdC8vICAgICAgICAgIC0+IHdzczovLzEwLjI0LjAuMS9uZXRcblx0XHRlbHNlIGlmIChJUF9SRUdFWC50ZXN0KGFkZHJTdHIpKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzczovL1wiK2FkZHJTdHIrXCIvYXBpXCI7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL1wiK2FkZHJTdHIrXCIvbmV0XCI7XG5cdFx0fVxuXHRcdC8vIDEwLjQyLjAuMToxMjM0IC0+IHdzOi8vMTAuNDIuMC4xOjEyMzRcblx0ICAgICAgIFx0ZWxzZSBpZiAoSVBfUkVHRVgudGVzdChhZGRyU3RyLnNwbGl0KCc6JylbMF0pICYmIC9eWzAtOV0qJC8udGVzdChhZGRyU3RyLnNwbGl0KCc6JylbMV0pKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBcIndzOi8vXCIrYWRkclN0cjtcblx0XHR9XG5cdFx0Ly8gd3NzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmIC0+IHdzczovL3NvbWVhZGRyZXNzLmNvbS9zdHVmZlxuXHRcdC8vIHdzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmIC0+IHdzOi8vc29tZWFkZHJlc3MuY29tL3N0dWZmXG5cdFx0ZWxzZSBpZiAoYWRkclN0ci5pbmRleE9mKFwid3NzOi8vXCIpID09PSAwIHx8IGFkZHJTdHIuaW5kZXhPZihcIndzOi8vXCIpID09PSAwKSB7XG5cdFx0XHRwZWVyLmFkZHIgPSBhZGRyU3RyO1xuXHRcdH0gXG5cdFx0Ly8gc29tZWRvbWFpbi9zb21lc2l0ZSAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvYXBpXG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvbmV0XG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2UgaWYoYWRkclN0ci5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9cIiArIGFkZHJTdHIgKyAnL2FwaSc7XG5cdFx0XHRwZWVyLmFkZHJOZXQgPSBcIndzczovL1wiICsgYWRkclN0ciArICcvbmV0JzsgXG5cdFx0XHRwZWVyLm5hbWUgPSBhZGRyU3RyLnNwbGl0KCcvJylbMV07XG5cdFx0fSBcblx0XHQvLyBzb21lZG9tYWluL3NvbWVzaXRlL2FwaSAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvYXBpXCJcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgICAtPiBcIndzczovL3NvbWVkb21haW4vc29tZXNpdGUvbmV0XCJcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2UgaWYoYWRkclN0ci5zcGxpdCgnLycpLmxlbmd0aCA9PT0gMyAmJiBhZGRyU3RyLnNwbGl0KCcvJylbMl0gPT09IFwiYXBpXCIpIHtcblx0XHRcdHBlZXIuYWRkciA9IFwid3NzOi8vXCIrYWRkclN0cjtcblx0XHRcdHBlZXIuYWRkck5ldCA9IFwid3NzOi8vXCIrYWRkclN0ci5zdWJzdHIoMCwgYWRkclN0ci5sZW5ndGggLSA0KTtcblx0XHRcdHBlZXIubmFtZSA9IGFkZHJTdHIuc3BsaXQoJy8nKVsxXTtcblx0XHR9XG5cdFx0Ly8gc29tZXNpdGUgLT4gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9zb21lc2l0ZS9hcGlcIlxuXHRcdC8vICAgICAgICAgIC0+IFwid3NzOi8vcGFydG5lcmluZy1jbG91ZC5jb20vc29tZXNpdGUvbmV0XCJcblx0XHQvLyAgICAgICAgICAtPiBzb21lc2l0ZVxuXHRcdGVsc2Uge1xuXHRcdFx0cGVlci5hZGRyID0gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9cIithZGRyU3RyK1wiL2FwaVwiO1xuXHRcdFx0cGVlci5hZGRyTmV0ID0gXCJ3c3M6Ly9wYXJ0bmVyaW5nLWNsb3VkLmNvbS9cIithZGRyU3RyK1wiL25ldFwiO1xuXHRcdFx0cGVlci5uYW1lID0gYWRkclN0cjtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGVlcjtcblx0fTtcblxuXG5cdC8qKiBUcnkgdG8gY29ubmVjdCB0byB0aGUgZ2l2ZW4gc2VydmVycyBsaXN0IGluIHRoZSBsaXN0IG9yZGVyLCB1bnRpbCBmaW5kaW5nIGFuIGF2YWlsYWJsZSBvbmUgKi9cblx0ZDFpbnN0LnRyeUNvbm5lY3QgPSBmdW5jdGlvbihzZXJ2ZXJzLCBXU29ja2V0KXtcblx0XHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdFx0ZnVuY3Rpb24gdGMoaSkge1xuXHRcdFx0ZDFpbnN0LmNvbm5lY3Qoc2VydmVyc1tpXSwgV1NvY2tldCkudGhlbihmdW5jdGlvbihlKXtcblx0XHRcdFx0cmV0dXJuIGRlZmVycmVkLnJlc29sdmUoc2VydmVyc1tpXSk7XG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbihlKXtcblx0XHRcdFx0ZDFpbnN0LmRpc2Nvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGkrKztcblx0XHRcdFx0XHRpZihpPHNlcnZlcnMubGVuZ3RoKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge3RjKGkpO30sIDEwMCk7XG5cdFx0XHRcdFx0ZWxzZSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KFwiVGltZW91dFwiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGMoMCk7XG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRkMWluc3QuY3VycmVudFNlcnZlciA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGNvbm5lY3Rpb24uX2FkZHI7XG5cdH07XG5cblx0ZDFpbnN0Lm9uID0gZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKXtcblx0XHRjb25uZWN0aW9uLm9uKGV2ZW50LCBjYWxsYmFjayk7XG5cdFx0cmV0dXJuIGQxaW5zdDtcblx0fTtcblxuXHRkMWluc3QucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spe1xuXHRcdGNvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcblx0XHRyZXR1cm4gZDFpbnN0O1xuXHR9O1xuXG5cdC8qKiBTaG9ydGhhbmQgZnVuY3Rpb24gdG8gY29ubmVjdCBhbmQgbG9naW4gd2l0aCB0aGUgZ2l2ZW4gKHVzZXIscGFzc3dvcmQpICovXG5cdGQxaW5zdC5jb25uZWN0QXNVc2VyID0gZnVuY3Rpb24oaXAsIHVzZXIsIHBhc3N3b3JkLCBXU29ja2V0KSB7XG5cdFx0cmV0dXJuIGQxaW5zdC5jb25uZWN0KGlwLCBXU29ja2V0KS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXR1cm4gZDFpbnN0KFwiI3NlbGZcIikuYXV0aCh1c2VyLCBwYXNzd29yZCk7XG5cdFx0fSk7XG5cdH07XG5cblx0ZDFpbnN0LmRlYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKXsgY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKGZhbHNlKTsgY29ubmVjdGlvbi51c2VyKG51bGwpOyBjb25uZWN0aW9uLnBhc3MobnVsbCk7fTtcblx0ZDFpbnN0LnNldFNlY3VyZWQgPSBmdW5jdGlvbihiU2VjdXJlZCkgeyBjb25uZWN0aW9uLnNldFNlY3VyZWQoYlNlY3VyZWQpOyB9O1xuXHRkMWluc3QuaXNTZWN1cmVkID0gZnVuY3Rpb24oKSB7cmV0dXJuIGNvbm5lY3Rpb24uX3NlY3VyZWQ7IH1cblx0ZDFpbnN0LnNldFdTb2NrZXQgPSBmdW5jdGlvbihXU29ja2V0KSB7IGNvbm5lY3Rpb24uc2V0V1NvY2tldChXU29ja2V0KTsgfVxuXG5cblx0LyoqIFNlbGYtYXV0aGVudGljYXRlIHRoZSBsb2NhbCBEaXlhTm9kZSBib3VuZCB0byBwb3J0IDxwb3J0PiwgdXNpbmcgaXRzIFJTQSBzaWduYXR1cmUgKi9cblx0ZDFpbnN0LnNlbGZDb25uZWN0ID0gZnVuY3Rpb24ocG9ydCwgc2lnbmF0dXJlLCBXU29ja2V0KSB7XG5cdFx0cmV0dXJuIGQxaW5zdC5jb25uZWN0KCd3czovL2xvY2FsaG9zdDonICsgcG9ydCwgV1NvY2tldClcblx0XHQudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0XHRcdGQxaW5zdChcIiNzZWxmXCIpLnJlcXVlc3Qoe1xuXHRcdFx0XHRzZXJ2aWNlOiAncGVlckF1dGgnLFxuXHRcdFx0XHRmdW5jOiAnU2VsZkF1dGhlbnRpY2F0ZScsXG5cdFx0XHRcdGRhdGE6IHtcdHNpZ25hdHVyZTogc2lnbmF0dXJlIH1cblx0XHRcdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHRcdGlmKGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkKXtcblx0XHRcdFx0XHRjb25uZWN0aW9uLmF1dGhlbnRpY2F0ZWQodHJ1ZSk7XG5cdFx0XHRcdFx0Y29ubmVjdGlvbi51c2VyKFwiI0RpeWFOb2RlI1wiK3BlZXJJZCk7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbm5lY3Rpb24uYXV0aGVudGljYXRlZChmYWxzZSk7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KCdBY2Nlc3NEZW5pZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBkMWluc3Q7XG59XG5cbnZhciBkMSA9IG5ld0luc3RhbmNlKCk7XG5kMS5uZXdJbnN0YW5jZSA9IG5ld0luc3RhbmNlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBEaXlhU2VsZWN0b3IgLy9cbi8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBEaXlhU2VsZWN0b3Ioc2VsZWN0b3IsIGNvbm5lY3Rpb24pe1xuXHRFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuXHR0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcblx0dGhpcy5fc2VsZWN0b3IgPSBzZWxlY3Rvcjtcblx0dGhpcy5fbGlzdGVuZXJDb3VudCA9IDA7XG5cdHRoaXMuX2xpc3RlbkNhbGxiYWNrID0gbnVsbDtcblx0dGhpcy5fY2FsbGJhY2tBdHRhY2hlZCA9IGZhbHNlO1xufVxuaW5oZXJpdHMoRGl5YVNlbGVjdG9yLCBFdmVudEVtaXR0ZXIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gUHVibGljIEFQSSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NlbGVjdCgpOyB9O1xuXG5cblxuLyoqXG4gKiBBcHBseSBjYWxsYmFjayBjYiB0byBlYWNoIHNlbGVjdGVkIHBlZXIuIFBlZXJzIGFyZSBzZWxlY3RlZFxuICogYWNjb3JkaW5nIHRvIHRoZSBydWxlICdzZWxlY3RvcicgZ2l2ZW4gdG8gY29uc3RydWN0b3IuIFNlbGVjdG9yIGNhblxuICogYmUgYSBwZWVySWQsIGEgcmVnRXggZm9yIHBlZXJJZHMgb2YgYW4gYXJyYXkgb2YgcGVlcklkcy5cbiAqIEBwYXJhbXMgXHRjYlx0XHRjYWxsYmFjayB0byBiZSBhcHBsaWVkXG4gKiBAcmV0dXJuIFx0dGhpcyBcdDxEaXlhU2VsZWN0b3I+XG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGNiKXtcblx0dmFyIHBlZXJzID0gdGhpcy5fc2VsZWN0KCk7XG5cdGZvcih2YXIgaT0wOyBpPHBlZXJzLmxlbmd0aDsgaSsrKSBjYi5iaW5kKHRoaXMpKHBlZXJzW2ldKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgcmVxdWVzdCB0byBzZWxlY3RlZCBwZWVycyAoIHNlZSBlYWNoKCkgKSB0aHJvdWdoIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gKERpeWFOb2RlKS5cbiAqIEBwYXJhbSB7U3RyaW5nIHwgT2JqZWN0fSBwYXJhbXMgOiBjYW4gYmUgc2VydmljZS5mdW5jdGlvbiBvciB7c2VydmljZTpzZXJ2aWNlLCBmdW5jOmZ1bmN0aW9uLCAuLi59XG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKHBhcmFtcywgY2FsbGJhY2ssIHRpbWVvdXQsIG9wdGlvbnMpe1xuXHRpZighdGhpcy5fY29ubmVjdGlvbikgcmV0dXJuIHRoaXM7XG5cdGlmKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cdGlmKHBhcmFtcy5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG5cdFx0dmFyIF9wYXJhbXMgPSBwYXJhbXMuc3BsaXQoXCIuXCIpO1xuXHRcdGlmKF9wYXJhbXMubGVuZ3RoIT0yKSB0aHJvdyAnTWFsZm9ybWVkUmVxdWVzdCc7XG5cdFx0cGFyYW1zID0ge3NlcnZpY2U6X3BhcmFtc1swXSwgZnVuYzpfcGFyYW1zWzFdfTtcblx0fVxuXG5cdHZhciBuYkFuc3dlcnMgPSAwO1xuXHR2YXIgbmJFeHBlY3RlZCA9IHRoaXMuX3NlbGVjdCgpLmxlbmd0aDtcblx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihwZWVySWQpe1xuXHRcdHBhcmFtcy50YXJnZXQgPSBwZWVySWQ7XG5cblx0XHR2YXIgb3B0cyA9IHt9O1xuXHRcdGZvcih2YXIgaSBpbiBvcHRpb25zKSBvcHRzW2ldID0gb3B0aW9uc1tpXTtcblx0XHRpZih0eXBlb2Ygb3B0cy5jYWxsYmFja19wYXJ0aWFsID09PSAnZnVuY3Rpb24nKSBvcHRzLmNhbGxiYWNrX3BhcnRpYWwgPSBmdW5jdGlvbihlcnIsIGRhdGEpeyBvcHRpb25zLmNhbGxiYWNrX3BhcnRpYWwocGVlcklkLCBlcnIsIGRhdGEpO31cblxuXHRcdHRoaXMuX2Nvbm5lY3Rpb24ucmVxdWVzdChwYXJhbXMsIGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTtcblx0XHRcdG5iQW5zd2VycysrO1xuXHRcdFx0aWYobmJBbnN3ZXJzID09IG5iRXhwZWN0ZWQgJiYgb3B0aW9ucy5iTm90aWZ5V2hlbkZpbmlzaGVkKSBjYWxsYmFjayhudWxsLCBlcnIsIFwiIyNFTkQjI1wiKTsgLy8gVE9ETyA6IEZpbmQgYSBiZXR0ZXIgd2F5IHRvIG5vdGlmeSByZXF1ZXN0IEVORCAhIVxuXHRcdH0sIHRpbWVvdXQsIG9wdHMpO1xuXHR9KTtcbn07XG5cblxuLy8gSU1QT1JUQU5UICEhISBCeSAzMC8xMS8xNSwgdGhpcyBtZXRob2QgZG9lc24ndCByZXR1cm4gJ3RoaXMnIGFueW1vcmUsIGJ1dCBhIFN1YnNjcmlwdGlvbiBvYmplY3QgaW5zdGVhZFxuLyogQHBhcmFtIHtTdHJpbmcgfCBPYmplY3R9IHBhcmFtcyA6IGNhbiBiZSAnc2VydmljZS5mdW5jdGlvbicgb3Ige3NlcnZpY2U6c2VydmljZSwgZnVuYzpmdW5jdGlvbiwgLi4ufSAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbihwYXJhbXMsIGNhbGxiYWNrLCBvcHRpb25zKXtcblx0aWYocGFyYW1zLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpIHtcblx0XHR2YXIgX3BhcmFtcyA9IHBhcmFtcy5zcGxpdChcIi5cIik7XG5cdFx0aWYoX3BhcmFtcy5sZW5ndGghPTIpIHRocm93ICdNYWxmb3JtZWRTdWJzY3JpcHRpb24nO1xuXHRcdHBhcmFtcyA9IHtzZXJ2aWNlOl9wYXJhbXNbMF0sIGZ1bmM6X3BhcmFtc1sxXX07XG5cdH1cblxuXHRyZXR1cm4gbmV3IFN1YnNjcmlwdGlvbih0aGlzLCBwYXJhbXMsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn07XG5cblxuLy8gSU1QT1JUQU5UICEhISBCWSAzMC8xMS8xNSwgdGhpcyBtZXRob2QgZG9lc24ndCB0YWtlIHN1YklkcyBhcyBpbnB1dCBhbnltb3JlLlxuLy8gUGxlYXNlIHByb3ZpZGUgYSBzdWJzY3JpcHRpb24gaW5zdGVhZCAhXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uKXtcblx0aWYoQXJyYXkuaXNBcnJheShzdWJzY3JpcHRpb24pIHx8ICFzdWJzY3JpcHRpb24uY2xvc2UpIHJldHVybiB0aGlzLl9fb2xkX2RlcHJlY2F0ZWRfdW5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uKTtcblx0cmV0dXJuIHN1YnNjcmlwdGlvbi5jbG9zZSgpO1xufTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzc3dvcmQsIGNhbGxiYWNrLCB0aW1lb3V0KXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGlzKTtcblxuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cblx0dGhpcy5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnYXV0aCcsXG5cdFx0ZnVuYzogJ0F1dGhlbnRpY2F0ZScsXG5cdFx0ZGF0YToge1xuXHRcdFx0dXNlcjogdXNlcixcblx0XHRcdHBhc3N3b3JkOiBwYXNzd29yZFxuXHRcdH1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpe1xuXG5cdFx0aWYoZXJyID09PSAnU2VydmljZU5vdEZvdW5kJyl7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdChlcnIpO1xuXHRcdFx0cmV0dXJuIDtcblx0XHR9XG5cblx0XHRpZighZXJyICYmIGRhdGEgJiYgZGF0YS5hdXRoZW50aWNhdGVkKXtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24uYXV0aGVudGljYXRlZCh0cnVlKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24udXNlcih1c2VyKTtcblx0XHRcdHRoYXQuX2Nvbm5lY3Rpb24ucGFzcyhwYXNzd29yZCk7XG5cdFx0XHRpZih0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHBlZXJJZCwgdHJ1ZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhhdC5fY29ubmVjdGlvbi5hdXRoZW50aWNhdGVkKGZhbHNlKTtcblx0XHRcdGlmKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2socGVlcklkLCBmYWxzZSk7XG5cdFx0XHRlbHNlIGRlZmVycmVkLnJlamVjdCgnQWNjZXNzRGVuaWVkJyk7XG5cdFx0fVxuXG5cdH0sIHRpbWVvdXQpO1xuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuXG5cbi8vIFByaXZhdGVzXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3NlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yRnVuY3Rpb24pe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0aWYoIXRoaXMuX2Nvbm5lY3Rpb24pIHJldHVybiBbXTtcblx0cmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24ucGVlcnMoKS5maWx0ZXIoZnVuY3Rpb24ocGVlcklkKXtcblx0XHRyZXR1cm4gdGhhdC5fbWF0Y2godGhhdC5fc2VsZWN0b3IsIHBlZXJJZCk7XG5cdH0pO1xufTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fbWF0Y2ggPSBmdW5jdGlvbihzZWxlY3Rvciwgc3RyKXtcblx0aWYoIXNlbGVjdG9yKSByZXR1cm4gZmFsc2U7XG5cdGlmKHNlbGVjdG9yID09PSBcIiNzZWxmXCIpIHsgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24gJiYgc3RyID09PSB0aGlzLl9jb25uZWN0aW9uLnNlbGYoKTsgfVxuXHRlbHNlIGlmKHNlbGVjdG9yLm5vdCkgcmV0dXJuICF0aGlzLl9tYXRjaChzZWxlY3Rvci5ub3QsIHN0cik7XG5cdGVsc2UgaWYoc2VsZWN0b3IuY29uc3RydWN0b3IubmFtZSA9PT0gJ1N0cmluZycpe1xuXHRcdHJldHVybiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKTtcblx0fSBlbHNlIGlmKHNlbGVjdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdSZWdFeHAnKXtcblx0XHRyZXR1cm4gbWF0Y2hSZWdFeHAoc2VsZWN0b3IsIHN0cik7XG5cdH0gZWxzZSBpZihBcnJheS5pc0FycmF5KHNlbGVjdG9yKSl7XG5cdFx0cmV0dXJuIG1hdGNoQXJyYXkoc2VsZWN0b3IsIHN0cik7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBtYXRjaFN0cmluZyhzZWxlY3Rvciwgc3RyKXtcblx0cmV0dXJuIHNlbGVjdG9yID09PSBzdHI7XG59XG5cbmZ1bmN0aW9uIG1hdGNoUmVnRXhwKHNlbGVjdG9yLCBzdHIpe1xuXHRyZXR1cm4gc3RyLm1hdGNoKHNlbGVjdG9yKTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hBcnJheShzZWxlY3Rvciwgc3RyKXtcblx0Zm9yKHZhciBpPTA7aTxzZWxlY3Rvci5sZW5ndGg7IGkrKyl7XG5cdFx0aWYoc2VsZWN0b3JbaV0gPT09IHN0cikgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG4vLyBPdmVycmlkZXMgRXZlbnRFbWl0dGVyJ3MgYmVoYXZpb3IgdG8gcHJveHkgYW5kIGZpbHRlciBldmVudHMgZnJvbSB0aGUgY29ubmVjdGlvblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fb24gPSBEaXlhU2VsZWN0b3IucHJvdG90eXBlLm9uO1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHRjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0XHRpZih0aGF0Ll9tYXRjaCh0aGF0Ll9zZWxlY3RvciwgcGVlcklkKSkgdGhhdC5lbWl0KHR5cGUsIHBlZXJJZCk7XG5cdH07XG5cdHRoaXMuX2Nvbm5lY3Rpb24ub24odHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dmFyIHJldCA9IHRoaXMuX29uKHR5cGUsIGNhbGxiYWNrKTtcblxuXHQvLyBIYW5kbGUgdGhlIHNwZWNpZmljIGNhc2Ugb2YgXCJwZWVyLWNvbm5lY3RlZFwiIGV2ZW50cywgaS5lLiwgbm90aWZ5IG9mIGFscmVhZHkgY29ubmVjdGVkIHBlZXJzXG5cdGlmKHR5cGUgPT09ICdwZWVyLWNvbm5lY3RlZCcgJiYgdGhpcy5fY29ubmVjdGlvbi5pc0Nvbm5lY3RlZCgpKSB7XG5cdFx0dmFyIHBlZXJzID0gdGhpcy5fY29ubmVjdGlvbi5wZWVycygpO1xuXHRcdGZvcih2YXIgaT0wO2k8cGVlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKHRoaXMuX21hdGNoKHRoaXMuX3NlbGVjdG9yLCBwZWVyc1tpXSkpIGNhbGxiYWNrKHBlZXJzW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJldDtcbn07XG5cblxuLy8gT3ZlcnJpZGVzIEV2ZW50RW1pdHRlcidzIGJlaGF2aW9yIHRvIHByb3h5IGFuZCBmaWx0ZXIgZXZlbnRzIGZyb20gdGhlIGNvbm5lY3Rpb25cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuX3JlbW92ZUxpc3RlbmVyID0gRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaykge1xuXHRpZihjYWxsYmFjay5fX19EaXlhU2VsZWN0b3JfaGlkZGVuX3dyYXBwZXIpIHRoaXMuX2Nvbm5lY3Rpb24ucmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2suX19fRGl5YVNlbGVjdG9yX2hpZGRlbl93cmFwcGVyKTtcblx0dGhpcy5fcmVtb3ZlTGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gU1VCU0NSSVBUSU9OIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4vKipcbiogSGFuZGxlcyBhIHN1YnNjcmlwdGlvbiB0byBzb21lIERpeWFOb2RlIHNlcnZpY2UgZm9yIG11bHRpcGxlIG5vZGVzXG4qIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gc2VsZWN0b3JcbiovXG5mdW5jdGlvbiBTdWJzY3JpcHRpb24oc2VsZWN0b3IsIHBhcmFtcywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHRcdHRoaXMucGFyYW1zID0gcGFyYW1zO1xuXHRcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuc3ViSWRzID0gW107XG5cblx0XHR0aGlzLmRvU3Vic2NyaWJlID0gZnVuY3Rpb24ocGVlcklkKSB7XG5cdFx0XHR0aGF0LnN1Yklkcy5wdXNoKHRoYXQuX2FkZFN1YnNjcmlwdGlvbihwZWVySWQpKTtcblx0XHRcdHRoYXQuc3RhdGUgPSBcIm9wZW5cIjtcblx0XHR9O1xuXG5cdFx0aWYodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hdXRvKSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLm9uKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLmVhY2godGhpcy5kb1N1YnNjcmliZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG59O1xuXG5TdWJzY3JpcHRpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdGZvcih2YXIgaSA9IDA7IGk8dGhpcy5zdWJJZHMubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLnNlbGVjdG9yLl9jb25uZWN0aW9uLnVuc3Vic2NyaWJlKHRoaXMuc3ViSWRzW2ldKTtcblx0fVxuXHR0aGlzLnN1YklkcyA9IFtdO1xuXHR0aGlzLnNlbGVjdG9yLnJlbW92ZUxpc3RlbmVyKCdwZWVyLWNvbm5lY3RlZCcsIHRoaXMuZG9TdWJzY3JpYmUpO1xuXHR0aGlzLnN0YXRlID0gXCJjbG9zZWRcIjtcbn07XG5cblN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2FkZFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uKHBlZXJJZCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHBhcmFtcyA9IHt9O1xuXHRmb3IodmFyIGsgaW4gdGhpcy5wYXJhbXMpIHBhcmFtc1trXSA9IHRoaXMucGFyYW1zW2tdO1xuXHRwYXJhbXMudGFyZ2V0ID0gcGVlcklkO1xuXHR2YXIgc3ViSWQgPSB0aGlzLnNlbGVjdG9yLl9jb25uZWN0aW9uLnN1YnNjcmliZShwYXJhbXMsIGZ1bmN0aW9uKGVyciwgZGF0YSl7XG5cdFx0dGhhdC5jYWxsYmFjayhwZWVySWQsIGVyciwgZGF0YSk7XG5cdH0pO1xuXHRpZih0aGlzLm9wdGlvbnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuc3ViSWRzKSlcblx0XHR0aGlzLm9wdGlvbnMuc3ViSWRzW3BlZXJJZF0gPSBzdWJJZDtcblx0cmV0dXJuIHN1YklkO1xufTtcblxuXG5cblxuXG4vLyBMZWdhY3kgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4vKiogQGRlcHJlY2F0ZWQgICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uKCl7fTtcblxuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5fX29sZF9kZXByZWNhdGVkX3Vuc3Vic2NyaWJlID0gZnVuY3Rpb24oc3ViSWRzKSB7XG5cdHRoaXMuZWFjaChmdW5jdGlvbihwZWVySWQpe1xuXHRcdHZhciBzdWJJZCA9IHN1Yklkc1twZWVySWRdO1xuXHRcdGlmKHN1YklkKSB0aGlzLl9jb25uZWN0aW9uLnVuc3Vic2NyaWJlKHN1YklkKTtcblx0fSk7XG5cdHJldHVybiB0aGlzO1xufVxuXG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBkMTtcbiIsInZhciBkMSA9IHJlcXVpcmUoJy4vRGl5YVNlbGVjdG9yLmpzJyk7XG5cbi8vIHJlcXVpcmUoJy4vc2VydmljZXMvdGltZXIvdGltZXIuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvcnRjL3J0Yy5qcycpO1xuLy9yZXF1aXJlKCcuL3NlcnZpY2VzL2V4cGxvcmVyL2V4cGxvcmVyLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvcGljby9waWNvLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvdmlld2VyX2V4cGxvcmVyL3ZpZXdlcl9leHBsb3Jlci5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9pZXEvaWVxLmpzJyk7XG4vL3JlcXVpcmUoJy4vc2VydmljZXMvbmV0d29ya0lkL05ldHdvcmtJZC5qcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9tYXBzL21hcHMuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvcGVlckF1dGgvUGVlckF1dGguanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvbWVzaE5ldHdvcmsvTWVzaE5ldHdvcmsuanMnKTtcbi8vcmVxdWlyZSgnLi9zZXJ2aWNlcy92ZXJib3NlL1ZlcmJvc2UuanMnKTtcbnJlcXVpcmUoJy4vdXRpbHMvZW5jb2RpbmcvZW5jb2RpbmcuanMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMvc3RhdHVzL3N0YXR1cy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGQxO1xuIiwiLyogbWF5YS1jbGllbnRcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqXHQzLjAgb2YgdGhlIExpY2Vuc2UuIFRoaXMgbGlicmFyeSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZVxuICogdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW5cbiAqIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UuIFNlZSB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBsaWJyYXJ5LlxuICovXG5cbi8qKlxuICAgVG9kbyA6XG4gICBjaGVjayBlcnIgZm9yIGVhY2ggZGF0YVxuICAgaW1wcm92ZSBBUEkgOiBnZXREYXRhKHNlbnNvck5hbWUsIGRhdGFDb25maWcpXG4gICByZXR1cm4gYWRhcHRlZCB2ZWN0b3IgZm9yIGRpc3BsYXkgd2l0aCBEMyB0byByZWR1Y2UgY29kZSBpbiBJSE0gP1xuICAgdXBkYXRlRGF0YShzZW5zb3JOYW1lLCBkYXRhQ29uZmlnKVxuICAgc2V0IGFuZCBnZXQgZm9yIHRoZSBkaWZmZXJlbnQgZGF0YUNvbmZpZyBwYXJhbXNcblxuKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIElFUShzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLmRhdGFNb2RlbD17fTtcblx0dGhpcy5fY29kZXIgPSBzZWxlY3Rvci5lbmNvZGUoKTtcblx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG5cblxuXHQvKioqIHN0cnVjdHVyZSBvZiBkYXRhIGNvbmZpZyAqKipcblx0XHQgY3JpdGVyaWEgOlxuXHRcdCAgIHRpbWU6IGFsbCAzIHRpbWUgY3JpdGVyaWEgc2hvdWxkIG5vdCBiZSBkZWZpbmVkIGF0IHRoZSBzYW1lIHRpbWUuIChyYW5nZSB3b3VsZCBiZSBnaXZlbiB1cClcblx0XHQgICAgIHN0YXJ0OiB7W251bGxdLHRpbWV9IChudWxsIG1lYW5zIG1vc3QgcmVjZW50KSAvLyBzdG9yZWQgYSBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIGVuZDoge1tudWxsXSwgdGltZX0gKG51bGwgbWVhbnMgbW9zdCBvbGRlc3QpIC8vIHN0b3JlZCBhcyBVVEMgaW4gbXMgKG51bSlcblx0XHQgICAgIHJhbmdlOiB7W251bGxdLCB0aW1lfSAocmFuZ2Ugb2YgdGltZShwb3NpdGl2ZSkgKSAvLyBpbiBzIChudW0pXG5cdFx0ICAgcm9ib3Q6IHtBcnJheU9mIElEIG9yIFtcImFsbFwiXX1cblx0XHQgICBwbGFjZToge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCBvcGVyYXRvcjoge1tsYXN0XSwgbWF4LCBtb3ksIHNkfSAtKCBtYXliZSBtb3kgc2hvdWxkIGJlIGRlZmF1bHRcblx0XHQgLi4uXG5cblx0XHQgc2Vuc29ycyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTZW5zb3JOYW1lfVxuXG5cdFx0IHNhbXBsaW5nOiB7W251bGxdIG9yIGludH1cblx0Ki9cblx0dGhpcy5kYXRhQ29uZmlnID0ge1xuXHRcdGNyaXRlcmlhOiB7XG5cdFx0XHR0aW1lOiB7XG5cdFx0XHRcdHN0YXJ0OiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbCxcblx0XHRcdHBsYWNlOiBudWxsXG5cdFx0fSxcblx0XHRvcGVyYXRvcjogJ2xhc3QnLFxuXHRcdHNlbnNvcnM6IG51bGwsXG5cdFx0c2FtcGxpbmc6IG51bGwgLy9zYW1wbGluZ1xuXHR9O1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgZGF0YU1vZGVsIDpcbiAqIHtcbiAqXHRcInNlbnNldXJYWFwiOiB7XG4gKlx0XHRcdGRhdGE6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRwbGFjZTpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHF1YWxpdHlJbmRleDpbRkxPQVQsIC4uLl0sXG4gKlx0XHRcdHJhbmdlOiBbRkxPQVQsIEZMT0FUXSxcbiAqXHRcdFx0dW5pdDogc3RyaW5nLFxuICpcdFx0bGFiZWw6IHN0cmluZ1xuICpcdFx0fSxcbiAqXHQgLi4uIChcInNlbnNldXJzWVlcIilcbiAqIH1cbiAqL1xuSUVRLnByb3RvdHlwZS5nZXREYXRhTW9kZWwgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWw7XG59O1xuSUVRLnByb3RvdHlwZS5nZXREYXRhUmFuZ2UgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhTW9kZWwucmFuZ2U7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tSUVRXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtJRVF9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuSUVRLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBzdGFydCBhbmQgZW5kLlxuICogSWYgcGFyYW0gZGVmaW5lZFxuICpcdEBwYXJhbSB7RGF0ZX0gbmV3VGltZVN0YXJ0IC8vIG1heSBiZSBudWxsXG4gKlx0QHBhcmFtIHtEYXRlfSBuZXdUaW1lRW5kIC8vIG1heSBiZSBudWxsXG4gKlx0QHJldHVybiB7SUVRfSB0aGlzXG4gKiBJZiBubyBwYXJhbSBkZWZpbmVkOlxuICpcdEByZXR1cm4ge09iamVjdH0gVGltZSBvYmplY3Q6IGZpZWxkcyBzdGFydCBhbmQgZW5kLlxuICovXG5JRVEucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZVN0YXJ0LG5ld1RpbWVFbmQsIG5ld1JhbmdlKXtcblx0aWYobmV3VGltZVN0YXJ0IHx8IG5ld1RpbWVFbmQgfHwgbmV3UmFuZ2UpIHtcblx0XHR0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCA9IG5ld1RpbWVTdGFydC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUuZW5kID0gbmV3VGltZUVuZC5nZXRUaW1lKCk7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UgPSBuZXdSYW5nZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXJ0OiBuZXcgRGF0ZSh0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEudGltZS5zdGFydCksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuSUVRLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzXG4gKiBTZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHBhcmFtIHtBcnJheVtJbnRdfSBwbGFjZUlkcyBsaXN0IG9mIHBsYWNlIElkc1xuICogR2V0IHBsYWNlIGNyaXRlcmlhLlxuICpcdEByZXR1cm4ge0FycmF5W0ludF19IGxpc3Qgb2YgcGxhY2UgSWRzXG4gKi9cbklFUS5wcm90b3R5cGUuRGF0YVBsYWNlSWRzID0gZnVuY3Rpb24ocGxhY2VJZHMpe1xuXHRpZihwbGFjZUlkcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZUlkID0gcGxhY2VJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucGxhY2U7XG59O1xuLyoqXG4gKiBHZXQgZGF0YSBieSBzZW5zb3IgbmFtZS5cbiAqXHRAcGFyYW0ge0FycmF5W1N0cmluZ119IHNlbnNvck5hbWUgbGlzdCBvZiBzZW5zb3JzXG4gKi9cbklFUS5wcm90b3R5cGUuZ2V0RGF0YUJ5TmFtZSA9IGZ1bmN0aW9uKHNlbnNvck5hbWVzKXtcblx0dmFyIGRhdGE9W107XG5cdGZvcih2YXIgbiBpbiBzZW5zb3JOYW1lcykge1xuXHRcdGRhdGEucHVzaCh0aGlzLmRhdGFNb2RlbFtzZW5zb3JOYW1lc1tuXV0pO1xuXHR9XG5cdHJldHVybiBkYXRhO1xufTtcbi8qKlxuICogVXBkYXRlIGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cbklFUS5wcm90b3R5cGUudXBkYXRlRGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0aWYoZGF0YUNvbmZpZylcblx0XHR0aGlzLkRhdGFDb25maWcoZGF0YUNvbmZpZyk7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXHR0aGlzLnNlbGVjdG9yLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhUmVxdWVzdFwiLFxuXHRcdGRhdGE6IHtcblx0XHRcdHR5cGU6XCJzcGxSZXFcIixcblx0XHRcdGRhdGFDb25maWc6IHRoYXQuZGF0YUNvbmZpZ1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZG5JZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIHtcblx0XHRcdExvZ2dlci5lcnJvcihcIltcIit0aGF0LmRhdGFDb25maWcuc2Vuc29ycytcIl0gUmVjdiBlcnI6IFwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiVXBkYXRlRGF0YTpcXG5cIitKU09OLnN0cmluZ2lmeShkYXRhLmhlYWRlci5kYXRhQ29uZmlnKSk7XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJEYXRhIHJlcXVlc3QgZmFpbGVkIChcIitkYXRhLmhlYWRlci5lcnJvci5zdCtcIik6IFwiK2RhdGEuaGVhZGVyLmVycm9yLm1zZyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gY29uc29sZS5sb2coZGF0YSk7XG5cdFx0dGhhdC5fZ2V0RGF0YU1vZGVsRnJvbVJlY3YoZGF0YSk7XG5cblx0XHQvLyBMb2dnZXIubG9nKHRoYXQuZ2V0RGF0YU1vZGVsKCkpO1xuXG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoYXQpOyAvLyBiaW5kIGNhbGxiYWNrIHdpdGggSUVRXG5cdFx0Y2FsbGJhY2sodGhhdC5nZXREYXRhTW9kZWwoKSk7IC8vIGNhbGxiYWNrIGZ1bmNcblx0fSk7XG59O1xuXG5JRVEucHJvdG90eXBlLl9pc0RhdGFNb2RlbFdpdGhOYU4gPSBmdW5jdGlvbigpIHtcblx0dmFyIGRhdGFNb2RlbE5hTj1mYWxzZTtcblx0dmFyIHNlbnNvck5hbjtcblx0Zm9yKHZhciBuIGluIHRoaXMuZGF0YU1vZGVsKSB7XG5cdFx0c2Vuc29yTmFuID0gdGhpcy5kYXRhTW9kZWxbbl0uZGF0YS5yZWR1Y2UoZnVuY3Rpb24obmFuUHJlcyxkKSB7XG5cdFx0XHRyZXR1cm4gbmFuUHJlcyAmJiBpc05hTihkKTtcblx0XHR9LGZhbHNlKTtcblx0XHRkYXRhTW9kZWxOYU4gPSBkYXRhTW9kZWxOYU4gJiYgc2Vuc29yTmFuO1xuXHRcdExvZ2dlci5sb2cobitcIiB3aXRoIG5hbiA6IFwiK3NlbnNvck5hbitcIiAoXCIrZGF0YU1vZGVsTmFOK1wiKSAvIFwiK3RoaXMuZGF0YU1vZGVsW25dLmRhdGEubGVuZ3RoKTtcblx0fVxufTtcblxuSUVRLnByb3RvdHlwZS5nZXRDb25maW5lbWVudExldmVsID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuY29uZmluZW1lbnQ7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEFpclF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmFpclF1YWxpdHk7XG59O1xuXG5JRVEucHJvdG90eXBlLmdldEVudlF1YWxpdHlMZXZlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmVudlF1YWxpdHk7XG59O1xuXG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIGRhdGEgdG8gY29uZmlndXJlIHN1YnNjcmlwdGlvblxuICogQHBhcmFtICBjYWxsYmFjayBjYWxsZWQgb24gYW5zd2VycyAoQHBhcmFtIDogZGF0YU1vZGVsKVxuICovXG5JRVEucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKFwiUmVxdWVzdDogXCIrSlNPTi5zdHJpbmdpZnkoZGF0YUNvbmZpZykpO1xuXG5cdC8vLyBUT0RPXG5cdGRhdGEgPSBkYXRhIHx8IHt0aW1lUmFuZ2U6ICdob3Vycyd9O1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6IFwiaWVxXCIsXG5cdFx0ZnVuYzogXCJEYXRhXCIsXG5cdFx0ZGF0YTogZGF0YVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiV2F0Y2hJRVFSZWN2RXJyOlwiK0pTT04uc3RyaW5naWZ5KGVycikpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZihkYXRhLmhlYWRlci5lcnJvcikge1xuXHRcdFx0Ly8gVE9ETyA6IGNoZWNrL3VzZSBlcnIgc3RhdHVzIGFuZCBhZGFwdCBiZWhhdmlvciBhY2NvcmRpbmdseVxuXHRcdFx0TG9nZ2VyLmVycm9yKFwiV2F0Y2hJRVE6XFxuXCIrSlNPTi5zdHJpbmdpZnkoZGF0YS5oZWFkZXIuZGF0YUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHR0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGF0KTsgLy8gYmluZCBjYWxsYmFjayB3aXRoIElFUVxuXHRcdGNhbGxiYWNrKHRoYXQuZ2V0RGF0YU1vZGVsKCkpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnMpO1xufTtcblxuLyoqXG4gKiBDbG9zZSBhbGwgc3Vic2NyaXB0aW9uc1xuICovXG5JRVEucHJvdG90eXBlLmNsb3NlU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCl7XG5cdGZvcih2YXIgaSBpbiB0aGlzLnN1YnNjcmlwdGlvbnMpIHtcblx0XHR0aGlzLnN1YnNjcmlwdGlvbnNbaV0uY2xvc2UoKTtcblx0fVxuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPVtdO1xufTtcblxuLyoqXG4gKiByZXF1ZXN0IERhdGEgdG8gbWFrZSBDU1YgZmlsZVxuICovXG5JRVEucHJvdG90eXBlLmdldENTVkRhdGEgPSBmdW5jdGlvbihzZW5zb3JOYW1lcyxfZmlyc3REYXksY2FsbGJhY2spe1xuXHR2YXIgZmlyc3REYXkgPSBuZXcgRGF0ZShfZmlyc3REYXkpO1xuXHR2YXIgZGF0YUNvbmZpZyA9IHtcblx0XHRjcml0ZXJpYToge1xuXHRcdFx0dGltZTogeyBzdGFydDogZmlyc3REYXkuZ2V0VGltZSgpLCByYW5nZVVuaXQ6ICdob3VyJywgcmFuZ2U6IDE4MH0sIC8vIDM2MGggLT4gMTVkIC8vIDE4MGggLT4gN2pcblx0XHRcdHBsYWNlczogW10sXG5cdFx0XHRyb2JvdHM6IFtdXG5cdFx0fSxcblx0XHRzZW5zb3JzOiBzZW5zb3JOYW1lc1xuXHR9O1xuXG5cdHRoaXMudXBkYXRlRGF0YShjYWxsYmFjaywgZGF0YUNvbmZpZyk7XG59O1xuXG5cbi8qKlxuICogVXBkYXRlIGludGVybmFsIG1vZGVsIHdpdGggcmVjZWl2ZWQgZGF0YVxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgcmVjZWl2ZWQgZnJvbSBEaXlhTm9kZSBieSB3ZWJzb2NrZXRcbiAqIEByZXR1cm4ge1t0eXBlXX1cdFx0W2Rlc2NyaXB0aW9uXVxuICovXG5JRVEucHJvdG90eXBlLl9nZXREYXRhTW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgZGF0YU1vZGVsPW51bGw7XG5cblx0aWYoZGF0YS5lcnIgJiYgZGF0YS5lcnIuc3Q+MCkge1xuXHRcdExvZ2dlci5lcnJvcihkYXRhLmVyci5tc2cpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdGRlbGV0ZSBkYXRhLmVycjtcblx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlcikge1xuXHRcdGZvciAodmFyIG4gaW4gZGF0YSkge1xuXHRcdFx0aWYobiAhPSBcImhlYWRlclwiICYmIG4gIT0gXCJlcnJcIikge1xuXG5cdFx0XHRcdGlmKGRhdGFbbl0uZXJyICYmIGRhdGFbbl0uZXJyLnN0PjApIHtcblx0XHRcdFx0XHRMb2dnZXIuZXJyb3IobitcIiB3YXMgaW4gZXJyb3I6IFwiK2RhdGFbbl0uZXJyLm1zZyk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZGF0YU1vZGVsKVxuXHRcdFx0XHRcdGRhdGFNb2RlbD17fTtcblxuXHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRpZighZGF0YU1vZGVsW25dKSB7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIHVwZGF0ZSBkYXRhIGFic29sdXRlIHJhbmdlICovXG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yYW5nZT1kYXRhW25dLnJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udGltZVJhbmdlPWRhdGFbbl0udGltZVJhbmdlO1xuXHRcdFx0XHQvKiB1cGRhdGUgZGF0YSBsYWJlbCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ubGFiZWw9ZGF0YVtuXS5sYWJlbDtcblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgdW5pdCAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0udW5pdD1kYXRhW25dLnVuaXQ7XG5cblx0XHRcdFx0Lyogc3VnZ2VzdGVkIHkgZGlzcGxheSByYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0uem9vbVJhbmdlID0gWzAsIDEwMF07XG5cblx0XHRcdFx0LyogdXBkYXRlIGRhdGEgaW5kZXhSYW5nZSAqL1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucXVhbGl0eUNvbmZpZz17XG5cdFx0XHRcdFx0LyogY29uZm9ydFJhbmdlOiBkYXRhW25dLmNvbmZvcnRSYW5nZSwgKi9cblx0XHRcdFx0XHRpbmRleFJhbmdlOiBkYXRhW25dLmluZGV4UmFuZ2Vcblx0XHRcdFx0fTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnRpbWUgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0udGltZSwnYjY0Jyw4KTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLmRhdGEgPSAoZGF0YVtuXS5kYXRhP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5kYXRhLCdiNjQnLDQpOihkYXRhW25dLmF2Zz90aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uYXZnLmQsJ2I2NCcsNCk6bnVsbCkpO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ucXVhbGl0eUluZGV4ID0gKGRhdGFbbl0uZGF0YT90aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uaW5kZXgsJ2I2NCcsNCk6KGRhdGFbbl0uYXZnP3RoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuaSwnYjY0Jyw0KTpudWxsKSk7XG5cdFx0XHRcdGRhdGFNb2RlbFtuXS5yb2JvdElkID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnJvYm90SWQsJ2I2NCcsNCk7XG5cdFx0XHRcdGlmKGRhdGFNb2RlbFtuXS5yb2JvdElkKSB7XG5cdFx0XHRcdFx0LyoqIGRpY28gcm9ib3RJZCAtPiByb2JvdE5hbWUgKiovXG5cdFx0XHRcdFx0dmFyIGRpY29Sb2JvdCA9IHt9O1xuXHRcdFx0XHRcdGRhdGEuaGVhZGVyLnJvYm90cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG5cdFx0XHRcdFx0XHRkaWNvUm9ib3RbZWwuaWRdPWVsLm5hbWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnJvYm90SWQgPSBkYXRhTW9kZWxbbl0ucm9ib3RJZC5tYXAoZnVuY3Rpb24oZWwpIHtcblx0XHRcdFx0XHRcdHJldHVybiBkaWNvUm9ib3RbZWxdO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnBsYWNlSWQgPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ucGxhY2VJZCwnYjY0Jyw0KTtcblx0XHRcdFx0ZGF0YU1vZGVsW25dLnggPSBudWxsO1xuXHRcdFx0XHRkYXRhTW9kZWxbbl0ueSA9IG51bGw7XG5cblx0XHRcdFx0aWYoZGF0YVtuXS5hdmcpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLmF2ZyA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5hdmcuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0ubWluKVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5taW4gPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWluLmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ubWluLmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLm1heClcblx0XHRcdFx0XHRkYXRhTW9kZWxbbl0ubWF4ID0ge1xuXHRcdFx0XHRcdFx0ZDogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLm1heC5kLCdiNjQnLDQpLFxuXHRcdFx0XHRcdFx0aTogdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLm1heC5pLCdiNjQnLDQpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0aWYoZGF0YVtuXS5zdGRkZXYpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnN0ZGRldiA9IHtcblx0XHRcdFx0XHRcdGQ6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuZCwnYjY0Jyw0KSxcblx0XHRcdFx0XHRcdGk6IHRoaXMuX2NvZGVyLmZyb20oZGF0YVtuXS5zdGRkZXYuaSwnYjY0Jyw0KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGlmKGRhdGFbbl0uc3RkZGV2KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS5zdGRkZXYgPSB7XG5cdFx0XHRcdFx0XHRkOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uc3RkZGV2LmQsJ2I2NCcsNCksXG5cdFx0XHRcdFx0XHRpOiB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0uc3RkZGV2LmksJ2I2NCcsNClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRpZihkYXRhW25dLngpXG5cdFx0XHRcdFx0ZGF0YU1vZGVsW25dLnggPSB0aGlzLl9jb2Rlci5mcm9tKGRhdGFbbl0ueCwnYjY0Jyw0KTtcblx0XHRcdFx0aWYoZGF0YVtuXS55KVxuXHRcdFx0XHRcdGRhdGFNb2RlbFtuXS55ID0gdGhpcy5fY29kZXIuZnJvbShkYXRhW25dLnksJ2I2NCcsNCk7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBjdXJyZW50IHF1YWxpdHkgOiB7J2InYWQsICdtJ2VkaXVtLCAnZydvb2R9XG5cdFx0XHRcdCAqIGV2b2x1dGlvbiA6IHsndSdwLCAnZCdvd24sICdzJ3RhYmxlfVxuXHRcdFx0XHQgKiBldm9sdXRpb24gcXVhbGl0eSA6IHsnYidldHRlciwgJ3cnb3JzZSwgJ3MnYW1lfVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Ly8vIFRPRE9cblx0XHRcdFx0ZGF0YU1vZGVsW25dLnRyZW5kID0gJ21zcyc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2Uge1xuXHRcdExvZ2dlci5lcnJvcihcIk5vIERhdGEgdG8gcmVhZCBvciBoZWFkZXIgaXMgbWlzc2luZyAhXCIpO1xuXHR9XG5cdC8qKiBsaXN0IHJvYm90cyAqKi9cbi8vXHRkYXRhTW9kZWwucm9ib3RzID0gW3tuYW1lOiAnRDJSMicsIGlkOjF9XTtcblx0dGhpcy5kYXRhTW9kZWw9ZGF0YU1vZGVsO1xuXHRyZXR1cm4gZGF0YU1vZGVsO1xufTtcblxuXG5cblxuXG4vKiogY3JlYXRlIElFUSBzZXJ2aWNlICoqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5JRVEgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gbmV3IElFUSh0aGlzKTtcbn07XG4iLCJFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcblxuZnVuY3Rpb24gTE9HKG1zZyl7XG5cdC8vY29uc29sZS5sb2cobXNnKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSBtYXAge1N0cmluZ30gbWFwJ3MgbmFtZVxuICovXG5mdW5jdGlvbiBNYXBzKHBlZXJJZHMpIHtcblxuXG5cdHRoaXMuX3BlZXJJZHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBlZXJJZHMpKTtcblx0dGhpcy5fc3ViSWRzID0ge307IC8vIGxpc3Qgb2Ygc3Vic2NyaXB0aW9uIElkIChmb3IgdW5zdWJzY3JpcHRpb24gcHVycG9zZSkgZS5nIHtwZWVySWQwOiBzdWJJZDAsIC4uLn1cblxuXHQvLyBsaXN0IG9mIHJlZ2lzdGVyZWQgcGxhY2UgYnkgRGl5YVxuXHR0aGlzLl9kaXlhcyA9IHt9O1xuXG5cdC8vIGdldCBhIGxpc3Qgb2YgRGl5YSBmcm9tIHNlbGVjdG9yIGFuZCBzb3J0IGl0XG5cdHRoaXMubGlzdERpeWEgPSB0aGlzLl9wZWVySWRzO1xufVxuaW5oZXJpdHMoTWFwcywgRXZlbnRFbWl0dGVyKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8gU3RhdGljIGZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8qKlxuICogc3RhdGljIGZ1bmN0aW9uLCBnZXQgY3VycmVudCBwbGFjZSBmcm9tIGRpeWFub2RlXG4gKlxuICogQHBhcmFtIHNlbGVjdG9yIHtSZWdFeHAvU3RyaW5nL0FycmF5PFN0cmluZz59IHNlbGVjdG9yIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIG1hcCB7U3RyaW5nfSBtYXAncyBuYW1lXG4gKiBAcGFyYW0gZnVuYyB7ZnVuY3Rpb24oKX0gY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCByZXR1cm4gcGVlcklkLCBlcnJvciBhbmQgZGF0YSAoeyBtYXBJZCwgbGFiZWwsIG5ldXJvbklkLCAgeCwgeX0pXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2V0Q3VycmVudFBsYWNlID0gZnVuY3Rpb24oIHBlZXJJZCwgZnVuYykge1xuXHR0aGlzLnJlcXVlc3Qoe1xuXHRcdHNlcnZpY2U6ICdtYXBzJyxcblx0XHRmdW5jOiAnR2V0Q3VycmVudFBsYWNlJyxcblx0XHRvYmo6IFsgcGVlcklkIF1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRmdW5jKHBlZXJJZCwgZXJyLCBkYXRhKTtcblx0fSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL+KIleKIleKIleKIleKIleKIlS8vL1xuLy8vLyBJbnRlcm5hbCBmdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy/iiJXiiJXiiJXiiJXiiJXiiJUvLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8v4oiV4oiV4oiV4oiV4oiV4oiVLy8vXG5cbi8qKlxuICogcm91bmQgZmxvYXQgdG8gc2l4IGRlY2ltYWxzIHRvIGNvbXBhcmUsIGFzIHRoZSBudW1iZXIgaW4ganMgaXMgZW5jb2RlZCBpblxuICogSUVFRSA3NTQgc3RhbmRhcmQgfiBhcm91bmQgMTYgZGVjaW1hbCBkaWdpdHMgcHJlY2lzaW9uLCB3ZSBsaW1pdCB0byA2IGZvclxuICogZWFzaWVyIGNvbXBhcmlzaW9uIGFuZCBlcnJvciBkdWUgdG8gYXJpdGhtZXRpYyBvcGVyYXRpb25cbiAqL1xuTWFwcy5wcm90b3R5cGUuX3JvdW5kID0gZnVuY3Rpb24gKHZhbCkge1xuXHQvLyByb3VkaW5nIHRvIHNpeCBkZWNpbWFsc1xuXHRyZXR1cm4gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHZhbCkgKiAxMDAwMDAwKSAvIDEwMDAwMDA7XG59O1xuXG4vKipcbiAqIGNoZWNrIGVxdWFsIHdpdGggcm91bmRpbmdcbiAqL1xuTWFwcy5wcm90b3R5cGUuX2lzRmxvYXRFcXVhbCA9IGZ1bmN0aW9uICh2YWwxLCB2YWwyKSB7XG5cdC8vIHJvdWRpbmcgdG8gdHdvIGRlY2ltYWxzXG5cdHJldHVybiB0aGlzLl9yb3VuZCh2YWwxKSA9PT0gdGhpcy5fcm91bmQodmFsMik7XG59O1xuXG4vKipcbiAqIGNoZWNrIGlmIG1hcCBpcyBtb2RpZmllZCBieSBjb21wYXJlIHdpdGggaW50ZXJuYWwgbGlzdFxuICovXG5NYXBzLnByb3RvdHlwZS5tYXBJc01vZGlmaWVkID0gZnVuY3Rpb24ocGVlcklkLCBtYXBfaW5mbykge1xuXHQvLyBkb3VibGUgY2hlY2tcblx0bWFwX2luZm8uc2NhbGUgPSBBcnJheS5pc0FycmF5KG1hcF9pbmZvLnNjYWxlKSA/IG1hcF9pbmZvLnNjYWxlWzBdIDogbWFwX2luZm8uc2NhbGVcblxuXHQvLyB1Z2x5IGNvZGUgYnV0IHF1aWNrIGNvbXBhcmUgdG8gbG9vcFxuXHRyZXR1cm4gISh0aGlzLl9pc0Zsb2F0RXF1YWwodGhpcy5fZGl5YXNbcGVlcklkXS5wYXRoLnNjYWxlLCBtYXBfaW5mby5zY2FsZSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC5yb3RhdGUsIG1hcF9pbmZvLnJvdGF0ZSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGVbMF0sIG1hcF9pbmZvLnRyYW5zbGF0ZVswXSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC50cmFuc2xhdGVbMV0sIG1hcF9pbmZvLnRyYW5zbGF0ZVsxXSkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGF0aC5yYXRpbywgbWFwX2luZm8ucmF0aW8pKTtcbn1cblxuLyoqXG4gKiBjaGVjayBpZiBwbGFjZSBpcyBtb2RpZmllZCBieSBjb21wYXJlIHdpdGggaW50ZXJuYWwgbGlzdFxuICovXG5NYXBzLnByb3RvdHlwZS5wbGFjZUlzTW9kaWZpZWQgPSBmdW5jdGlvbihwZWVySWQsIHBsYWNlX2luZm8pIHtcblx0Ly8gdWdseSBjb2RlIGJ1dCBxdWljayBjb21wYXJlIHRvIGxvb3Bcblx0cmV0dXJuICEodGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW3BsYWNlX2luZm8uaWRdLngsIHBsYWNlX2luZm8ueCkgJiZcblx0XHRcdFx0dGhpcy5faXNGbG9hdEVxdWFsKHRoaXMuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW3BsYWNlX2luZm8uaWRdLnksIHBsYWNlX2luZm8ueSkpO1xufVxuXG4vLyAvKipcbi8vICAqIGFkZCBhIERpeWEgd2hlbiBzZWxlY3RvciBjaGFuZ2VkIGFuZCBoYWQgbmV3IERpeWFcbi8vICAqXG4vLyAgKiBAcGFyYW0gcGVlcklkIHtTdHJpbmd9IHBlZXJJZCBvZiBEaXlhTm9kZSAoYWxzbyByb2JvdClcbi8vICAqIEBwYXJhbSBjb2xvciB7ZDNfcmdifSBkMyBjb2xvclxuLy8gICovXG4vLyBNYXBzLnByb3RvdHlwZS5hZGRQZWVyID0gZnVuY3Rpb24ocGVlcklkKSB7XG4vLyBcdHRoaXMuX2RpeWFzW3BlZXJJZF0gPSB7XG4vLyBcdFx0bWFwSWQ6IG51bGwsXG4vLyBcdFx0cGF0aDogbnVsbCwgLy8ge3RyYW5zbGF0ZTogW10sIHNjYWxlOiBudWxsLCByb3RhdGU6IG51bGx9LFxuLy8gXHRcdHBsYWNlczoge30sXG4vLyBcdFx0bWFwSXNNb2RpZmllZDogZmFsc2UsXG4vLyBcdH07XG4vLyB9XG5cbi8qKlxuICogcmVtb3ZlIGEgRGl5YSB3aGVuIHRoZXJlIGlzIGEgcHJvYmxlbSBpbiBsaXN0ZW4gbWFwIChzdWJzY3JpcHRpb24pXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKi9cbk1hcHMucHJvdG90eXBlLnJlbW92ZVBlZXIgPSBmdW5jdGlvbihwZWVySWQpIHtcblx0aWYgKHRoaXMuX2RpeWFzW3BlZXJJZF0pIHtcblx0XHQvLyByZW1vdmVcblx0XHRkZWxldGUgdGhpcy5fZGl5YXNbcGVlcklkXTtcblx0XHR0aGlzLmVtaXQoXCJwZWVyLXVuc3Vic2NyaWJlZFwiLCBwZWVySWQpO1xuXHR9XG5cblx0Ly8gbmVjY2Vzc2FyeT8gaWYgZGl5YW5vZGUgcmVjb25uZWN0P1xuXHRpZiAodGhpcy5fc3ViSWRzW3BlZXJJZF0gIT09IG51bGwgJiYgIWlzTmFOKHRoaXMuX3N1Yklkc1twZWVySWRdKSkge1xuXHRcdC8vIGV4aXN0ZWQgc3Vic2NyaXB0aW9uID8/XG5cdFx0Ly8gdW5zdWJzY3JpYmVcblx0XHRkMShwZWVySWQpLnVuc3Vic2NyaWJlKHRoaXMuX3N1Yklkcyk7XG5cdFx0ZGVsZXRlIHRoaXMuX3N1Yklkc1twZWVySWRdO1xuXHR9XG59O1xuXG4vKipcbiAqIGNvbm5lY3QgdG8gc2VydmljZSBtYXBcbiAqL1xuTWFwcy5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIG9wdGlvbnMgZm9yIHN1YnNjcmlwdGlvblxuXHR2YXIgb3B0aW9ucyA9IHtcblx0XHRhdXRvOiB0cnVlLCAvLyBhdXRvIHJlc3Vic2NyaWJlP1xuXHRcdHN1YklkczogW10gLy8gaW4gZmFjdCwgaXQgaXMgYSBsaXN0LCBidXQgdGhlIGNvZGUgaW4gRGl5YVNlbGVjdG9yIGNoZWNrIGZvciBhcnJheVxuXHR9O1xuXG5cdC8vIHN1YnNjcmliZSBmb3IgbWFwIHNlcnZpY2Vcblx0dGhpcy5zdWJNYXAgPSBkMShcIiNzZWxmXCIpLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ21hcHMnLFxuXHRcdGZ1bmM6ICdSb2JvdHMnLFxuXHRcdG9iajogdGhpcy5fcGVlcklkc1xuXHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdGlmIChlcnIgfHwgZGF0YS5lcnJvcikge1xuXHRcdFx0TE9HKFwiTWFwczogZmFpbCB0byBnZXQgaW5mbyBmcm9tIG1hcCwgZXJyb3I6XCIsIGVyciB8fCBkYXRhLmVycm9yLCBcIiFcIik7IC8vIG1vc3RseSBQZWVyRGlzY29ubmVjdGVkXG5cblx0XHRcdC8vIHJlbW92ZSB0aGF0IHBlZXJcblx0XHRcdC8vdGhhdC5yZW1vdmVQZWVyKHBlZXJJZCk7Ly8uLi5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZGF0YSA9PSBudWxsKSByZXR1cm4gO1xuXG5cdFx0cGVlcklkID0gZGF0YS5wZWVySWQ7XG5cblx0XHRpZighcGVlcklkKXtcblx0XHRcdExPRyhcIk1hcHM6IHJlY2VpdmVkIGluZm8gd2l0aG91dCBhIHBlZXJJZFwiKTtcblx0XHRcdHJldHVybiA7XG5cdFx0fVxuXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGRhdGEucGxhY2VzKSkgeyAvLyB3aW5uZXIsIHRoaXMgaXNuJ3QgMXN0IG1lc3NhZ2Vcblx0XHRcdGRhdGEucGxhY2VzID0gW107XG5cdFx0fVxuXG5cdFx0Ly8gZGF0YS5wbGFjZSBpcyBjdXJyZW50IHBsYWNlXG5cdFx0aWYgKGRhdGEucGxhY2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0ZGF0YS5wbGFjZXMucHVzaChkYXRhLnBsYWNlKTsgLy8gbWF5IGJlIG51bGwgLi4uXG5cdFx0fVxuXG5cdFx0dmFyIG1hcF9pbmZvID0gbnVsbCwgcGxhY2VzX2luZm8gPSBbXTtcblxuXHRcdGlmKGRhdGEudHlwZSA9PT0gJ01hcEluZm8nKXtcblx0XHRcdC8vIGRhdGEgOiB7aWQsIG5hbWUsIHBsYWNlcywgcm90YXRlLCBzY2FsZSwgdHgsIHR5LCByYXRpb31cblx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdID09IG51bGwpIHtcblx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXSA9IHtcblx0XHRcdFx0XHRwYXRoOiB7XG5cdFx0XHRcdFx0XHR0cmFuc2xhdGU6IFtkYXRhLnR4LCBkYXRhLnR5XSxcblx0XHRcdFx0XHRcdHNjYWxlOiBkYXRhLnNjYWxlLFxuXHRcdFx0XHRcdFx0cm90YXRlOiBkYXRhLnJvdGF0ZSxcblx0XHRcdFx0XHRcdHJhdGlvOiBkYXRhLnJhdGlvXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwbGFjZXM6IHt9XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodGhhdC5fZGl5YXNbcGVlcklkXS5wYXRoID09IG51bGwpIHtcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGggPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgudHJhbnNsYXRlID0gW2RhdGEudHgsIGRhdGEudHldO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGguc2NhbGUgPSBkYXRhLnNjYWxlO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBhdGgucm90YXRlID0gZGF0YS5yb3RhdGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3BlZXJJZF0ucGF0aC5yYXRpbyA9IGRhdGEucmF0aW87XG5cdFx0XHRcdGlmICh0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlcyA9PSBudWxsKSB7XG5cdFx0XHRcdFx0dGhhdC5fZGl5YXNbcGVlcklkXS5wbGFjZXMgPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bWFwX2luZm8gPSB7XG5cdFx0XHRcdGlkOiBkYXRhLmlkLFxuXHRcdFx0XHRuYW1lOiBkYXRhLm5hbWUsXG5cdFx0XHRcdHJvdGF0ZTogZGF0YS5yb3RhdGUsXG5cdFx0XHRcdHNjYWxlOiBkYXRhLnNjYWxlLFxuXHRcdFx0XHR0cmFuc2xhdGU6IFtkYXRhLnR4LCBkYXRhLnR5XSxcblx0XHRcdFx0cmF0aW86IGRhdGEucmF0aW9cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gc2F2ZSBkYXRhIHZhbHVlc1xuXHRcdGRhdGEucGxhY2VzLm1hcChmdW5jdGlvbihwbGFjZSkge1xuXHRcdFx0aWYgKHBsYWNlKSB7IC8vIG51bGwgaWYgY3VycmVudHBsYWNlIGlzbid0IGluaXQgaW4gRGl5YU5vZGVcblx0XHRcdFx0Ly8gcGxhY2UgeyBtYXBJZCwgbGFiZWwsIG5ldXJvbklkLCAgeCwgeX1cblxuXHRcdFx0XHQvLyBuZXVyb25JZCAoYWxzbyBwbGFjZSAncyBJZClcblx0XHRcdFx0dmFyIGlkID0gcGxhY2UubmV1cm9uSWQ7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIGludGVybmFsIGxpc3Rcblx0XHRcdFx0Ly8gY29udmVydCBmcm9tIERpeWEgcGFyYW1ldGVyICgwLi4xIGttKSB0byBkaXlhLW1hcCAoMC4uMTAwMDAwKVxuXHRcdFx0XHRwbGFjZSA9IHtcblx0XHRcdFx0XHRpZDogaWQsXG5cdFx0XHRcdFx0bGFiZWw6IHBsYWNlLmxhYmVsLFxuXHRcdFx0XHRcdHg6IHBsYWNlLngsXG5cdFx0XHRcdFx0eTogcGxhY2UueSxcblx0XHRcdFx0XHR0OiAzNjAgKiBwbGFjZS50XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHRoYXQuX2RpeWFzW3BlZXJJZF0ucGxhY2VzW2lkXSA9PSBudWxsKSB7IC8vIG5vbmV4aXN0ZW50IHBsYWNlXG5cdFx0XHRcdFx0Ly8gaWYgaXMgbnVsbCBvciB1bmRlZmluZWRcblx0XHRcdFx0XHR0aGF0Ll9kaXlhc1twZWVySWRdLnBsYWNlc1tpZF0gPSBwbGFjZTsgLy8gc2F2ZSBpdFxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGxhY2VzX2luZm8ucHVzaChPYmplY3QuY3JlYXRlKHBsYWNlKSk7Ly8gY3JlYXRlIGEgY29weSB0byBzZW5kIHRvIHVzZXJcblxuXHRcdFx0XHQvLyBzYXZlIGJhc2UgcGxhY2UgKGZpcnN0IGtub3duIHBsYWNlLCBhbHNvIGZpcnN0IGVsZW1lbnQgb2YgcGxhY2VzIGFycmF5KVxuXHRcdFx0XHQvLyB1c2VsZXNzIGF0IHRoZSBtb21lbnRcblx0XHRcdFx0Ly8gaWYgKCF0aGF0Ll9kaXlhc1twZWVySWRdLmJhc2VQbGFjZSkgdGhhdC5fZGl5YXNbcGVlcklkXS5iYXNlUGxhY2UgPSBwbGFjZTtcblx0XHRcdH0gZWxzZSB7IC8vIGN1cnJlbnQgcGxhY2UgaXMgbnVsbFxuXHRcdFx0XHRwbGFjZXNfaW5mby5wdXNoKG51bGwpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKHBsYWNlc19pbmZvLmxlbmd0aCA9PT0gMCkgcGxhY2VzX2luZm8gPSBudWxsO1xuXG5cdFx0dGhhdC5lbWl0KFwicGVlci1zdWJzY3JpYmVkXCIscGVlcklkLCBtYXBfaW5mbywgcGxhY2VzX2luZm8pO1xuXHR9LCBvcHRpb25zKTtcblxuXHRmb3IgKHZhciBwZWVySWQgaW4gb3B0aW9ucy5zdWJJZHMpIHtcblx0XHRpZiAodGhpcy5fc3ViSWRzW3BlZXJJZF0gIT09IG51bGwgJiYgIWlzTmFOKHRoaXMuX3N1Yklkc1twZWVySWRdKSkge1xuXHRcdFx0Ly8gZXhpc3RlZCBzdWJzY3JpcHRpb24gPz9cblx0XHRcdGQxKFwiI3NlbGZcIikudW5zdWJzY3JpYmUodGhpcy5fc3ViSWRzKVxuXHRcdFx0ZGVsZXRlIHRoaXMuX3N1Yklkc1twZWVySWRdO1xuXHRcdFx0TE9HKFwiTWFwczogYnVnOiBleGlzdGVkIHN1YnNjcmlwdGlvbiA/P1wiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBzYXZlIHN1YklkIGZvciBsYXRlciB1bnN1YnNjcmlwdGlvblxuXHRcdFx0dGhpcy5fc3ViSWRzW3BlZXJJZF0gPSBvcHRpb25zLnN1Yklkc1twZWVySWRdO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIGRpc2Nvbm5lY3QgZnJvbSBzZXJ2aWNlIG1hcCwgZnJlZSBldmVyeXRoaW5nIHNvIGl0IGlzIHNhZmUgdG8gZ2FyYmFnZSBjb2xsZWN0ZSB0aGlzIHNlcnZpY2VcbiAqL1xuTWFwcy5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdGlmKHRoaXMuc3ViTWFwKVxuXHRcdHRoaXMuc3ViTWFwLmNsb3NlKCk7XG5cdGZvcih2YXIgcGVlcklkIGluIHRoaXMuX2RpeWFzKXtcblx0XHR0aGF0LmVtaXQoXCJwZWVyLXVuc3Vic2NyaWJlZFwiLCBwZWVySWQpO1xuXHR9XG5cdHRoaXMuX2RpeWFzID0ge307Ly8gZGVsZXRlID9cbn1cblxuLyoqXG4gKiBzYXZlIG1hcFxuICpcbiAqIEBwYXJhbSBwZWVySWQge1N0cmluZ30gcGVlcklkIG9mIERpeWFOb2RlIChhbHNvIHJvYm90KVxuICogQHBhcmFtIG1hcF9pbmZvIHtPYmplY3R9ICh7cm90YXRlLCBzY2FsZSwgdHJhbnNsYXRlfSlcbiAqIEBwYXJhbSBjYiB7RnVuY3Rpb259IGNhbGxiYWNrIHdpdGggZXJyb3IgYXMgYXJndW1lbnRcbiAqL1xuTWFwcy5wcm90b3R5cGUuc2F2ZU1hcCA9IGZ1bmN0aW9uICh0YXJnZXRQZWVySWQsIG1hcF9pbmZvLCBjYikge1xuXHR2YXIgX21hcF9pbmZvID0gT2JqZWN0LmNyZWF0ZShtYXBfaW5mbyk7IC8vIGNyZWF0ZSBhIGR1cGxpY2F0ZSBvZiBtYXBfaW5mb1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIHNhdmUgbWFwJ3MgaW5mb1xuXHRfbWFwX2luZm8uc2NhbGUgPSBBcnJheS5pc0FycmF5KF9tYXBfaW5mby5zY2FsZSkgPyBfbWFwX2luZm8uc2NhbGVbMF0gOiBfbWFwX2luZm8uc2NhbGVcblxuXHRpZiAodGhpcy5tYXBJc01vZGlmaWVkKHRhcmdldFBlZXJJZCwgX21hcF9pbmZvKSkge1xuXHRcdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0XHRmdW5jOiAnVXBkYXRlTWFwJyxcblx0XHRcdG9iajogWyB0YXJnZXRQZWVySWQgXSxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c2NhbGU6IF9tYXBfaW5mby5zY2FsZSxcblx0XHRcdFx0dHg6IF9tYXBfaW5mby50cmFuc2xhdGVbMF0sXG5cdFx0XHRcdHR5OiBfbWFwX2luZm8udHJhbnNsYXRlWzFdLFxuXHRcdFx0XHRyb3RhdGU6IF9tYXBfaW5mby5yb3RhdGUsXG5cdFx0XHRcdHJhdGlvOiBfbWFwX2luZm8ucmF0aW9cblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC5zY2FsZSA9IF9tYXBfaW5mby5zY2FsZTtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wYXRoLnJvdGF0ZSA9IF9tYXBfaW5mby5yb3RhdGU7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGF0aC50cmFuc2xhdGVbMF0gPSBfbWFwX2luZm8udHJhbnNsYXRlWzBdO1xuXHRcdFx0XHR0aGF0Ll9kaXlhc1t0YXJnZXRQZWVySWRdLnBhdGgudHJhbnNsYXRlWzFdID0gX21hcF9pbmZvLnRyYW5zbGF0ZVsxXTtcblx0XHRcdH1cblx0XHRcdGlmIChjYikgY2IoZXJyKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY2IpIGNiKG5ldyBFcnJvcihcIk5vIGNoYW5nZSB0byBtYXAgJ1wiICsgdGhpcy5fbWFwICsgXCInIVwiKSk7XG5cdH1cbn1cblxuLyoqXG4gKiB1cGRhdGUgZXZlcnkgcGxhY2VzXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gcGxhY2VfaW5mbyB7T2JqZWN0fSAoeyBpZCwgeCwgeX0pXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLnNhdmVQbGFjZSA9IGZ1bmN0aW9uICh0YXJnZXRQZWVySWQsIHBsYWNlX2luZm8sIGNiKSB7XG5cdC8vIHNhdmUgbWFwJ3MgaW5mb1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHZhciBlcnJvciA9IFwiXCI7XG5cblx0dmFyIF9wbGFjZV9pbmZvID0gT2JqZWN0LmNyZWF0ZShwbGFjZV9pbmZvKTtcblxuXHQvLyBzYXZlIHBsYWNlXG5cdGlmICh0aGlzLnBsYWNlSXNNb2RpZmllZCh0YXJnZXRQZWVySWQsIF9wbGFjZV9pbmZvKSkge1xuXHRcdGQxKFwiI3NlbGZcIikucmVxdWVzdCh7XG5cdFx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0XHRmdW5jOiAnVXBkYXRlUGxhY2UnLFxuXHRcdFx0b2JqOiBbIHRhcmdldFBlZXJJZCBdLFxuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRuZXVyb25JZDogX3BsYWNlX2luZm8uaWQsXG5cdFx0XHRcdHg6IF9wbGFjZV9pbmZvLngsXG5cdFx0XHRcdHk6IF9wbGFjZV9pbmZvLnlcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYgKGVyciAhPSBudWxsKSB7XG5cdFx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzW19wbGFjZV9pbmZvLmlkXS54ID0gX3BsYWNlX2luZm8ueDtcblx0XHRcdFx0dGhhdC5fZGl5YXNbdGFyZ2V0UGVlcklkXS5wbGFjZXNbX3BsYWNlX2luZm8uaWRdLnkgPSBfcGxhY2VfaW5mby55O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNiKSBjYihlcnIpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChjYikgY2IobmV3IEVycm9yKFwiTm8gY2hhbmdlIHRvIHBsYWNlIG4gXCIgKyBfcGxhY2VfaW5mby5pZCArIFwiIVwiKSk7XG5cdH1cbn1cblxuLyoqXG4gKiBkZWxldGUgZXZlcnkgc2F2ZWQgcGxhY2VzIG9mIERpeWEgKGNob29zZW4gaW4gc2VsZWN0b3IpXG4gKlxuICogQHBhcmFtIHBlZXJJZCB7U3RyaW5nfSBwZWVySWQgb2YgRGl5YU5vZGUgKGFsc28gcm9ib3QpXG4gKiBAcGFyYW0gY2Ige0Z1bmN0aW9ufSBjYWxsYmFjayB3aXRoIGVycm9yIGFzIGFyZ3VtZW50XG4gKi9cbk1hcHMucHJvdG90eXBlLmNsZWFyUGxhY2VzID0gZnVuY3Rpb24odGFyZ2V0UGVlcklkLCBjYikge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0ZDEoXCIjc2VsZlwiKS5yZXF1ZXN0KHtcblx0XHRzZXJ2aWNlOiAnbWFwcycsXG5cdFx0ZnVuYzogJ0NsZWFyTWFwJyxcblx0XHRvYmo6IFsgdGFyZ2V0UGVlcklkIF1cblx0fSwgZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRpZiAoZXJyICE9IG51bGwpIHtcblx0XHRcdC8vIGRlbGV0ZSBmcm9tIGludGVybmFsIGxpc3Rcblx0XHRcdHRoYXQuX2RpeWFzW3RhcmdldFBlZXJJZF0ucGxhY2VzID0ge307XG5cdFx0fVxuXHRcdGlmIChjYikgY2IoZXJyKTtcblx0fSk7XG59XG5cbi8vIGV4cG9ydCBpdCBhcyBtb2R1bGUgb2YgRGl5YVNlbGVjdG9yXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLm1hcHMgPSBmdW5jdGlvbihwZWVySWRzKSB7XG5cdHZhciBtYXBzID0gbmV3IE1hcHMocGVlcklkcyk7XG5cblx0cmV0dXJuIG1hcHM7XG59XG4iLCJ2YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGQxID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJyk7XG52YXIgaXNCcm93c2VyID0gISh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyk7XG5pZighaXNCcm93c2VyKSB7IHZhciBRID0gcmVxdWlyZSgncScpOyB9XG5lbHNlIHsgdmFyIFEgPSB3aW5kb3cuUTsgfVxuXG5cbmQxLmtub3duUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIGQxKFwiI3NlbGZcIikua25vd25QZWVycygpO1xufTtcbmQxLmtwID0gZDEua25vd25QZWVycztcblxuXG5cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUua25vd25QZWVycyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblx0dGhpcy5yZXF1ZXN0KHtzZXJ2aWNlOiAnbWVzaE5ldHdvcmsnLGZ1bmM6ICdMaXN0S25vd25QZWVycyd9LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSl7XG5cdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0dmFyIHBlZXJzID0gW107XG5cdFx0Zm9yKHZhciBpPTA7IGk8ZGF0YS5wZWVycy5sZW5ndGg7IGkrKykgcGVlcnMucHVzaChkYXRhLnBlZXJzW2ldLm5hbWUpO1xuXHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0fSk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5cblxuZDEubGlzdGVuTWVzaE5ldHdvcmsgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRyZXR1cm4gZDEoLy4qLykuc3Vic2NyaWJlKHsgc2VydmljZTogJ21lc2hOZXR3b3JrJywgZnVuYzogJ01lc2hOZXR3b3JrJyB9LCBjYWxsYmFjaywge2F1dG86IHRydWV9KTtcbn07XG4iLCIvKiBtYXlhLWNsaWVudFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgUGFydG5lcmluZyBSb2JvdGljcywgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgbGlicmFyeSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3JcbiAqIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IHZlcnNpb25cbiAqICAzLjAgb2YgdGhlIExpY2Vuc2UgVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxuXG5cbmZ1bmN0aW9uIE1lc3NhZ2Uoc2VydmljZSwgZnVuYywgb2JqLCBwZXJtYW5lbnQpe1xuXG5cdHRoaXMuc2VydmljZSA9IHNlcnZpY2U7XG5cdHRoaXMuZnVuYyA9IGZ1bmM7XG5cdHRoaXMub2JqID0gb2JqO1xuXHRcblx0dGhpcy5wZXJtYW5lbnQgPSBwZXJtYW5lbnQ7IC8vSWYgdGhpcyBmbGFnIGlzIG9uLCB0aGUgY29tbWFuZCB3aWxsIHN0YXkgb24gdGhlIGNhbGxiYWNrIGxpc3QgbGlzdGVuaW5nIGZvciBldmVudHNcbn1cblxuTWVzc2FnZS5idWlsZFNpZ25hdHVyZSA9IGZ1bmN0aW9uKG1zZyl7XG5cdHJldHVybiBtc2cuc2VydmljZSsnLicrbXNnLmZ1bmMrJy4nK21zZy5vYmo7XG59XG5cblxuTWVzc2FnZS5wcm90b3R5cGUuc2lnbmF0dXJlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXMuc2VydmljZSsnLicrdGhpcy5mdW5jKycuJyt0aGlzLm9iajtcbn1cblxuTWVzc2FnZS5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uKGRhdGEpe1xuXHRyZXR1cm4ge1xuXHRcdHNlcnZpY2U6IHRoaXMuc2VydmljZSxcblx0XHRmdW5jOiB0aGlzLmZ1bmMsXG5cdFx0b2JqOiB0aGlzLm9iaixcblx0XHRkYXRhOiBkYXRhXG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlO1xuIiwidmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciBkMSA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpO1xudmFyIGlzQnJvd3NlciA9ICEodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpO1xuaWYoIWlzQnJvd3NlcikgeyB2YXIgUSA9IHJlcXVpcmUoJ3EnKTsgfVxuZWxzZSB7IHZhciBRID0gd2luZG93LlE7IH1cblxuaWYodHlwZW9mIElORk8gPT09ICd1bmRlZmluZWQnKSBJTkZPID0gZnVuY3Rpb24ocykgeyBjb25zb2xlLmxvZyhzKTt9XG5pZih0eXBlb2YgT0sgPT09ICd1bmRlZmluZWQnKSBPSyA9IGZ1bmN0aW9uKHMpIHsgY29uc29sZS5sb2cocyk7fVxuXG5cblxuLyoqXG4qIEluc3RhbGxzIGEgbmV3IERpeWFOb2RlIGRldmljZSAod2l0aCBhZGRyZXNzICdpcCcpIGludG8gYW4gZXhpc3RpbmcgbmV0d29yaywgYnlcbiogY29udGFjdGluZyBhbiBleGlzdGluZyBEaXlhTm9kZSBkZXZpY2Ugd2l0aCBhZGRyZXNzICdib290c3RyYXBfaXAnIDpcbiogICAxKSBDb250YWN0IHRoZSBuZXcgbm9kZSB0byBnZXQgaXRzIHB1YmxpYyBrZXlcbiogICAyKSBBZGQgdGhpcyBwdWJsaWMga2V5IHRvIHRoZSBleGlzdGluZyBub2RlIFRydXN0ZWRQZWVycyBsaXN0XG4qICAgMykgQWRkIHRoZSBleGlzdGluZyBub2RlJ3MgcHVibGljIGtleSB0byB0aGUgbmV3IG5vZGUncyBUcnVzdGVkUGVlcnMgbGlzdFxuKiAgIDQpIEFzayB0aGUgbmV3IG5vZGUgdG8gam9pbiB0aGUgbmV0d29yayBieSBjYWxsaW5nIEBzZWV7ZDEoKS5qb2luKCl9XG4qXG4qIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyB0aGUgZ2l2ZW4gdXNlciB0byBoYXZlIHJvb3Qgcm9sZSBvbiBib3RoIG5vZGVzXG4qXG4qIEBwYXJhbSBpcCA6IHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBuZXcgZGV2aWNlXG4qIEBwYXJhbSB1c2VyIDogYSB1c2VybmFtZSB3aXRoIHJvb3Qgcm9sZSBvbiB0aGUgbmV3IGRldmljZVxuKiBAcGFyYW0gcGFzc3dvcmQgOiB0aGUgcGFzc3dvcmQgZm9yICd1c2VyJ1xuKiBAcGFyYW0gYm9vdHN0cmFwX2lwIDogdGhlIElQIGFkZHJlc3Mgb2YgdGhlIGJvb3RzdHJhcCBkZXZpY2VcbiogQHBhcmFtIGJvb3RzdHJhcF91c2VyIDogYSB1c2VyIGlkZW50aWZpZXIgd2l0aCByb290IHJvbGUgb24gdGhlIGJvb3N0cmFwIGRldmljZVxuKiBAcGFyYW0gYm9vdHN0cmFwX3Bhc3N3b3JkIDogdGhlIHBhc3N3b3JkIGZvciAnYm9vdHN0cmFwX3VzZXInXG4qIEBwYXJhbSBib290c3RyYXBfbmV0IDogdGhlIElQIGFkZHJlc3Mgd2hlcmUgdGhlIG5ldyBkZXZpY2Ugd2lsbCBjb25uZWN0IHRvIHRoZSBib29zdHJhcCBvbmVcbiogQHBhcmFtIGNhbGxiYWNrIDogb2YgdGhlIGZvcm0gY2FsbGJhY2sobmV3X3BlZXJfbmFtZSxib290c3RyYXBfcGVlcl9uYW1lLCBlcnIsIGRhdGEpXG4qL1xuZDEuaW5zdGFsbE5vZGVFeHQgPSBmdW5jdGlvbihpcCwgdXNlciwgcGFzc3dvcmQsIGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCwgYm9vdHN0cmFwX25ldCwgY2FsbGJhY2spIHtcblx0aWYodHlwZW9mIGlwICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGlwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXAgIT09ICdzdHJpbmcnKSB0aHJvdyBcIltpbnN0YWxsTm9kZV0gYm9vdHN0cmFwX2lwIHNob3VsZCBiZSBhbiBJUCBhZGRyZXNzXCI7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfbmV0ICE9PSAnc3RyaW5nJykgdGhyb3cgXCJbaW5zdGFsbE5vZGVdIGJvb3RzdHJhcF9uZXQgc2hvdWxkIGJlIGFuIElQIGFkZHJlc3NcIjtcblxuXG5cdC8vIENoZWNrIGFuZCBGb3JtYXQgVVJJIChGUUROKVxuXHRpZihib290c3RyYXBfaXAuaW5kZXhPZihcIndzOi8vXCIpICE9PSAwICYmIGJvb3RzdHJhcF9pcC5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYoZDEuaXNTZWN1cmVkKCkpIGJvb3RzdHJhcF9pcCA9IFwid3NzOi8vXCIgKyBib290c3RyYXBfaXA7XG5cdFx0ZWxzZSBib290c3RyYXBfaXAgPSBcIndzOi8vXCIgKyBib290c3RyYXBfaXA7XG5cdH1cblx0aWYoYm9vdHN0cmFwX25ldC5pbmRleE9mKFwid3M6Ly9cIikgIT09IDAgJiYgYm9vdHN0cmFwX25ldC5pbmRleE9mKFwid3NzOi8vXCIpICE9PSAwKSB7XG5cdFx0aWYoZDEuaXNTZWN1cmVkKCkpIGJvb3RzdHJhcF9uZXQgPSBcIndzczovL1wiICsgYm9vdHN0cmFwX25ldDtcblx0XHRlbHNlIGJvb3RzdHJhcF9uZXQgPSBcIndzOi8vXCIgKyBib290c3RyYXBfbmV0O1xuXHR9XG5cblxuXG5cdGZ1bmN0aW9uIGpvaW4ocGVlciwgYm9vdHN0cmFwX3BlZXIpIHtcblx0XHRkMShcIiNzZWxmXCIpLmpvaW4oYm9vdHN0cmFwX25ldCwgdHJ1ZSwgZnVuY3Rpb24ocGVlciwgZXJyLCBkYXRhKXtcblx0XHRcdGlmKCFlcnIpIE9LKFwiSk9JTkVEICEhIVwiKTtcblx0XHRcdHJldHVybiBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBkYXRhKTtcblx0XHR9KTtcblx0fVxuXG5cdGQxLmNvbm5lY3RBc1VzZXIoaXAsIHVzZXIsIHBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSl7XG5cdFx0ZDEoXCIjc2VsZlwiKS5naXZlUHVibGljS2V5KGZ1bmN0aW9uKHBlZXIsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyPT09J1NlcnZpY2VOb3RGb3VuZCcpIHtcblx0XHRcdFx0SU5GTyhcIlBlZXIgQXV0aGVudGljYXRpb24gZGlzYWJsZWQgLi4uIGRpcmVjdGx5IGpvaW5pbmdcIik7XG5cdFx0XHRcdGpvaW4oKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZihlcnIpIHJldHVybiBjYWxsYmFjayhwZWVyLCBudWxsLCBlcnIsIG51bGwpO1xuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdElORk8oXCJBZGQgdHJ1c3RlZCBwZWVyIFwiICsgcGVlciArIFwiKGlwPVwiICsgaXAgKyBcIikgdG8gXCIgKyBib290c3RyYXBfaXAgKyBcIiB3aXRoIHB1YmxpYyBrZXkgXCIgKyBkYXRhLnB1YmxpY19rZXkuc2xpY2UoMCwyMCkpO1xuXHRcdFx0XHRkMS5jb25uZWN0QXNVc2VyKGJvb3RzdHJhcF9pcCwgYm9vdHN0cmFwX3VzZXIsIGJvb3RzdHJhcF9wYXNzd29yZCkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGQxKFwiI3NlbGZcIikuYWRkVHJ1c3RlZFBlZXIocGVlciwgZGF0YS5wdWJsaWNfa2V5LCBmdW5jdGlvbihib290c3RyYXBfcGVlciwgZXJyLCBkYXRhKSB7XG5cblx0XHRcdFx0XHRcdGlmKGVycikgcmV0dXJuIGNhbGxiYWNrKHBlZXIsIGJvb3RzdHJhcF9wZWVyLCBlcnIsIG51bGwpO1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5hbHJlYWR5VHJ1c3RlZCkgSU5GTyhwZWVyICsgXCIgYWxyZWFkeSB0cnVzdGVkIGJ5IFwiICsgYm9vdHN0cmFwX3BlZXIpO1xuXHRcdFx0XHRcdFx0ZWxzZSBJTkZPKGJvb3RzdHJhcF9wZWVyICsgXCIoaXA9XCIrIGJvb3RzdHJhcF9pcCArXCIpIGFkZGVkIFwiICsgcGVlciArIFwiKGlwPVwiICsgaXAgKyBcIikgYXMgYSBUcnVzdGVkIFBlZXJcIik7XG5cblx0XHRcdFx0XHRcdElORk8oXCJJbiByZXR1cm4sIGFkZCBcIiArIGJvb3RzdHJhcF9wZWVyICsgXCIgdG8gXCIgKyBwZWVyICsgXCIgYXMgYSBUcnVzdGVkIFBlZXIgd2l0aCBwdWJsaWMga2V5IFwiICsgZGF0YS5wdWJsaWNfa2V5LnNsaWNlKDAsMjApKTtcblx0XHRcdFx0XHRcdGQxLmNvbm5lY3RBc1VzZXIoaXAsIHVzZXIsIHBhc3N3b3JkKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdGQxKFwiI3NlbGZcIikuYWRkVHJ1c3RlZFBlZXIoYm9vdHN0cmFwX3BlZXIsIGRhdGEucHVibGljX2tleSwgZnVuY3Rpb24ocGVlciwgZXJyLCBkYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoZXJyKSBjYWxsYmFjayhwZWVyLCBib290c3RyYXBfcGVlciwgZXJyLCBudWxsKTtcblx0XHRcdFx0XHRcdFx0XHRlbHNlIGlmKGRhdGEuYWxyZWFkeVRydXN0ZWQpIElORk8oYm9vdHN0cmFwX3BlZXIgKyBcIiBhbHJlYWR5IHRydXN0ZWQgYnkgXCIgKyBwZWVyKTtcblx0XHRcdFx0XHRcdFx0XHRlbHNlIElORk8ocGVlciArIFwiKGlwPVwiKyBpcCArXCIpIGFkZGVkIFwiICsgYm9vdHN0cmFwX3BlZXIgKyBcIihpcD1cIisgYm9vdHN0cmFwX2lwICtcIikgYXMgYSBUcnVzdGVkIFBlZXJcIik7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25jZSBLZXlzIGhhdmUgYmVlbiBleGNoYW5nZWQgYXNrIHRvIGpvaW4gdGhlIG5ldHdvcmtcblx0XHRcdFx0XHRcdFx0XHRPSyhcIktFWVMgT0sgISBOb3csIGxldCBcIitwZWVyK1wiKGlwPVwiK2lwK1wiKSBqb2luIHRoZSBuZXR3b3JrIHZpYSBcIitib290c3RyYXBfcGVlcitcIihpcD1cIitib290c3RyYXBfbmV0K1wiKSAuLi5cIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGpvaW4ocGVlciwgYm9vdHN0cmFwX3BlZXIpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cblxuLyoqIFNob3J0IHZlcnNpb24gb2YgQHNlZXtkMS5pbnN0YWxsTm9kZUV4dH0gKi9cbmQxLmluc3RhbGxOb2RlID0gZnVuY3Rpb24oYm9vdHN0cmFwX2lwLCBib290c3RyYXBfbmV0LCBjYWxsYmFjaykge1xuXHRcdHZhciBpcCA9IGQxLmFkZHIoKTtcblx0XHR2YXIgdXNlciA9IGQxLnVzZXIoKTtcblx0XHR2YXIgcGFzc3dvcmQgPSBkMS5wYXNzKCk7XG5cdFx0dmFyIGJvb3RzdHJhcF91c2VyID0gdXNlcjtcblx0XHR2YXIgYm9vdHN0cmFwX3Bhc3N3b3JkID0gcGFzc3dvcmQ7XG5cdFx0cmV0dXJuIGQxLmluc3RhbGxOb2RlRXh0KGlwLCB1c2VyLCBwYXNzd29yZCwgYm9vdHN0cmFwX2lwLCBib290c3RyYXBfdXNlciwgYm9vdHN0cmFwX3Bhc3N3b3JkLCBib290c3RyYXBfbmV0LCBjYWxsYmFjayk7XG59XG5cblxuXG5cbi8qKlxuICogTWFrZSB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGpvaW4gYW4gZXhpc3RpbmcgRGl5YU5vZGVzIE1lc2ggTmV0d29yayBieSBjb250YWN0aW5nXG4gKiB0aGUgZ2l2ZW4gYm9vdHN0cmFwIHBlZXJzLlxuICpcbiAqIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyByb290IHJvbGVcbiAqXG4gKiBAcGFyYW0gYm9vdHN0cmFwX2lwcyA6IGFuIGFycmF5IG9mIGJvb3RzdHJhcCBJUCBhZGRyZXNzZXMgdG8gY29udGFjdCB0byBqb2luIHRoZSBOZXR3b3JrXG4gKiBAcGFyYW0gYlBlcm1hbmVudCA6IGlmIHRydWUsIHBlcm1hbmVudGx5IGFkZCB0aGUgYm9vdHN0cmFwIHBlZXJzIGFzIGF1dG9tYXRpYyBib290c3RyYXAgcGVlcnMgZm9yIHRoZSBzZWxlY3RlZCBub2Rlcy5cbiAqXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uKGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQsIGNhbGxiYWNrKXtcblx0aWYodHlwZW9mIGJvb3RzdHJhcF9pcHMgPT09ICdzdHJpbmcnKSBib290c3RyYXBfaXBzID0gWyBib290c3RyYXBfaXBzIF07XG5cdGlmKGJvb3RzdHJhcF9pcHMuY29uc3RydWN0b3IgIT09IEFycmF5KSB0aHJvdyBcImpvaW4oKSA6IGJvb3RzdHJhcF9pcHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIHBlZXJzIFVSSXNcIjtcblx0dGhpcy5yZXF1ZXN0KFxuXHRcdHtzZXJ2aWNlIDogJ21lc2hOZXR3b3JrJywgZnVuYzogJ0pvaW4nLCBkYXRhOiB7IGJvb3RzdHJhcF9pcHM6IGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQ6IGJQZXJtYW5lbnQgfX0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHsgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogRGlzY29ubmVjdCB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzIGZyb20gdGhlIGdpdmVuIGJvb3RzdHJhcCBwZWVyc1xuICpcbiAqIE5PVEUgOiBUaGlzIG9wZXJhdGlvbiByZXF1aXJlcyByb290IHJvbGVcbiAqXG4gKiBAcGFyYW0gYm9vdHN0cmFwX2lwcyA6IGFuIGFycmF5IG9mIGJvb3RzdHJhcCBJUCBhZGRyZXNzZXMgdG8gbGVhdmVcbiAqIEBwYXJhbSBiUGVybWFuZW50IDogaWYgdHJ1ZSwgcGVybWFuZW50bHkgcmVtb3ZlIHRoZSBnaXZlbiBwZWVycyBmcm9tIHRoZSBhdXRvbWF0aWMgYm9vdHN0cmFwIHBlZXJzIGxpc3RcbiAqXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbihib290c3RyYXBfaXBzLCBiUGVybWFuZW50LCBjYWxsYmFjayl7XG5cdGlmKHR5cGVvZiBib290c3RyYXBfaXBzID09PSAnc3RyaW5nJykgYm9vdHN0cmFwX2lwcyA9IFsgYm9vdHN0cmFwX2lwcyBdO1xuXHRpZihib290c3RyYXBfaXBzLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgdGhyb3cgXCJsZWF2ZSgpIDogYm9vdHN0cmFwX2lwcyBzaG91bGQgYmUgYW4gYXJyYXkgb2YgcGVlcnMgVVJJc1wiO1xuXHR0aGlzLnJlcXVlc3QoXG5cdFx0e3NlcnZpY2UgOiAnbWVzaE5ldHdvcmsnLCBmdW5jOiAnTGVhdmUnLCBkYXRhOiB7IGJvb3RzdHJhcF9pcHM6IGJvb3RzdHJhcF9pcHMsIGJQZXJtYW5lbnQ6IGJQZXJtYW5lbnQgfX0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHsgaWYodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKHBlZXJJZCwgZXJyLCBkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogQXNrIHRoZSBzZWxlY3RlZCBEaXlhTm9kZXMgZm9yIHRoZWlyIHB1YmxpYyBrZXlzXG4gKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZ2l2ZVB1YmxpY0tleSA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnR2l2ZVB1YmxpY0tleScsXHRkYXRhOiB7fSB9LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtjYWxsYmFjayhwZWVySWQsZXJyLGRhdGEpO1xuXHR9KTtcbn07XG5cbi8qKlxuICogQWRkIGEgbmV3IHRydXN0ZWQgcGVlciBSU0EgcHVibGljIGtleSB0byB0aGUgc2VsZWN0ZWQgRGl5YU5vZGVzXG4gKiBOT1RFIDogVGhpcyBvcGVyYXRpb24gcmVxdWlyZXMgcm9vdCByb2xlXG4gKlxuICogQHBhcmFtIG5hbWUgOiB0aGUgbmFtZSBvZiB0aGUgbmV3IHRydXN0ZWQgRGl5YU5vZGUgcGVlclxuICogQHBhcmFtIHB1YmxpY19rZXkgOiB0aGUgUlNBIHB1YmxpYyBrZXkgb2YgdGhlIG5ldyB0cnVzdGVkIERpeWFOb2RlIHBlZXJcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hZGRUcnVzdGVkUGVlciA9IGZ1bmN0aW9uKG5hbWUsIHB1YmxpY19rZXksIGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdCh7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnQWRkVHJ1c3RlZFBlZXInLFx0ZGF0YTogeyBuYW1lOiBuYW1lLCBwdWJsaWNfa2V5OiBwdWJsaWNfa2V5IH19LFxuXHRcdGZ1bmN0aW9uKHBlZXJJZCxlcnIsZGF0YSl7Y2FsbGJhY2socGVlcklkLGVycixkYXRhKTt9XG5cdCk7XG59O1xuXG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIERpeWFOb2RlcyB0cnVzdCB0aGUgZ2l2ZW4gcGVlcnNcbiAqIEBwYXJhbSBwZWVycyA6IGFuIGFycmF5IG9mIHBlZXIgbmFtZXNcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5hcmVUcnVzdGVkID0gZnVuY3Rpb24ocGVlcnMsIGNhbGxiYWNrKXtcblx0cmV0dXJuIHRoaXMucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnQXJlVHJ1c3RlZCcsXHRkYXRhOiB7IHBlZXJzOiBwZWVycyB9IH0sXG5cdFx0ZnVuY3Rpb24ocGVlcklkLCBlcnIsIGRhdGEpIHtcblx0XHRcdHZhciBhbGxUcnVzdGVkID0gZGF0YS50cnVzdGVkO1xuXHRcdFx0aWYoYWxsVHJ1c3RlZCkgeyBPSyhwZWVycyArIFwiIGFyZSB0cnVzdGVkIGJ5IFwiICsgcGVlcklkKTsgY2FsbGJhY2socGVlcklkLCB0cnVlKTsgfVxuXHRcdFx0ZWxzZSB7IEVSUihcIlNvbWUgcGVlcnMgaW4gXCIgKyBwZWVycyArIFwiIGFyZSB1bnRydXN0ZWQgYnkgXCIgKyBwZWVySWQpOyBjYWxsYmFjayhwZWVySWQsIGZhbHNlKTsgfVxuXHRcdH1cblx0KTtcbn07XG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmlzVHJ1c3RlZCA9IGZ1bmN0aW9uKHBlZXIsIGNhbGxiYWNrKSB7IHJldHVybiB0aGlzLmFyZVRydXN0ZWQoW3BlZXJdLCBjYWxsYmFjayk7IH1cblxuXG5kMS50cnVzdGVkUGVlcnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXHRkMShcIiNzZWxmXCIpLnJlcXVlc3QoXG5cdFx0eyBzZXJ2aWNlOiAncGVlckF1dGgnLFx0ZnVuYzogJ0dldFRydXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLnRwID0gZDEudHJ1c3RlZFBlZXJzOyAvLyBTaG9ydGhhbmRcblxuZDEuYmxhY2tsaXN0ZWRQZWVycyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cdGQxKFwiI3NlbGZcIikucmVxdWVzdChcblx0XHR7IHNlcnZpY2U6ICdwZWVyQXV0aCcsXHRmdW5jOiAnR2V0QmxhY2tsaXN0ZWRQZWVycycgfSxcblx0XHRmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGVycik7XG5cdFx0XHR2YXIgcGVlcnMgPSBbXTtcblx0XHRcdGZvcih2YXIgaT0wOyBpPGRhdGEucGVlcnMubGVuZ3RoOyBpKyspIHBlZXJzLnB1c2goZGF0YS5wZWVyc1tpXS5uYW1lKTtcblx0XHRcdHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKHBlZXJzKTtcblx0XHR9XG5cdCk7XG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcbmQxLmJwID0gZDEuYmxhY2tsaXN0ZWRQZWVyczsgLy8gU2hvcnRoYW5kXG4iLCJEaXlhU2VsZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9EaXlhU2VsZWN0b3InKS5EaXlhU2VsZWN0b3I7XG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdub2RlLWV2ZW50LWVtaXR0ZXInKTtcbmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxucmVxdWlyZSgnd2VicnRjLWFkYXB0ZXInKTtcblxuLyppZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyl7XG5cdHZhciBSVENQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xuXHR2YXIgUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCB3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy53ZWJraXRSVENJY2VDYW5kaWRhdGU7XG5cdHZhciBSVENTZXNzaW9uRGVzY3JpcHRpb24gPSB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy5tb3pSVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93LndlYmtpdFJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbn0qL1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vXG4vLyBDSEFOTkVMIC8vXG4vLy8vLy8vLy8vLy8vXG5cbi8qKiBIYW5kbGVzIGEgUlRDIGNoYW5uZWwgKGRhdGFjaGFubmVsIGFuZC9vciBzdHJlYW0pIHRvIGEgRGl5YU5vZGUgcGVlclxuICogIEBwYXJhbSBkbklkIDogdGhlIERpeWFOb2RlIHBlZXJJZFxuICogIEBwYXJhbSBuYW1lIDogdGhlIGNoYW5uZWwncyBuYW1lXG4gKiAgQHBhcmFtIGRhdGFjaGFubmVsX2NiIDogY2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBSVEMgZGF0YWNoYW5uZWwgaXMgb3BlbiBmb3IgdGhpcyBjaGFubmVsXG4gKiAgQHBhcmFtIHN0cmVhbV9jYiA6IGNhbGxiYWNrIGNhbGxlZCB3aGVuIGEgUlRDIHN0cmVhbSBpcyBvcGVuIGZvciB0aGlzIGNoYW5uZWxcbiAqL1xuZnVuY3Rpb24gQ2hhbm5lbChkbklkLCBuYW1lLCBkYXRhY2hhbm5lbF9jYiwgc3RyZWFtX2NiKSB7XG5cdEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXHR0aGlzLm5hbWUgPSBuYW1lO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXG5cdHRoaXMuZnJlcXVlbmN5ID0gMjA7XG5cblx0dGhpcy5jaGFubmVsID0gdW5kZWZpbmVkO1xuXHR0aGlzLnN0cmVhbSA9IHVuZGVmaW5lZDtcblx0dGhpcy5vbmRhdGFjaGFubmVsID0gZGF0YWNoYW5uZWxfY2I7XG5cdHRoaXMub25zdHJlYW0gPSBzdHJlYW1fY2I7XG5cdHRoaXMuY2xvc2VkID0gZmFsc2U7XG59XG5pbmhlcml0cyhDaGFubmVsLCBFdmVudEVtaXR0ZXIpO1xuXG4vKiogQmluZCBhbiBpbmNvbWluZyBSVEMgZGF0YWNoYW5uZWwgdG8gdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5zZXREYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRhdGFjaGFubmVsKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmNoYW5uZWwgPSBkYXRhY2hhbm5lbDtcblx0dGhpcy5jaGFubmVsLmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXHRjb25zb2xlLmxvZyhcInNldCBkYXRhIGNoYW5uZWwgOlwiK3RoaXMubmFtZSk7XG5cdGRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2Upe1xuXHRcdC8vIEZpcnN0IG1lc3NhZ2UgY2FycmllcyBjaGFubmVsIGRlc2NyaXB0aW9uIGhlYWRlclxuXHRcdHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KG1lc3NhZ2UuZGF0YSk7XG5cblx0XHR2YXIgdHlwZUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXcuZ2V0VWludDgoMCkpO1xuXHRcdGlmKHR5cGVDaGFyID09PSAnTycpIHRoYXQudHlwZSA9ICdpbnB1dCc7IC8vUHJvbWV0aGUgT3V0cHV0ID0gQ2xpZW50IElucHV0XG5cdFx0ZWxzZSBpZih0eXBlQ2hhciA9PT0gJ0knKSB0aGF0LnR5cGUgPSAnb3V0cHV0JzsgLy9Qcm9tZXRoZSBJbnB1dCA9IENsaWVudCBPdXRwdXRcblx0XHRlbHNlIHRocm93IFwiVW5yZWNub2duaXplZCBjaGFubmVsIHR5cGUgOiBcIiArIHR5cGVDaGFyO1xuXG5cdFx0dmFyIHNpemUgPSB2aWV3LmdldEludDMyKDEsdHJ1ZSk7XG5cdFx0aWYoIXNpemUpIHRocm93IFwiV3JvbmcgZGF0YWNoYW5uZWwgbWVzc2FnZSBzaXplXCI7XG5cdFx0dGhhdC5zaXplID0gc2l6ZTtcblx0XHR0aGF0Ll9idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuXG5cdFx0Ly8gU3Vic2VxdWVudCBtZXNzYWdlcyBhcmUgZm9yd2FyZGVkIHRvIGFwcHJvcHJpYXRlIGhhbmRsZXJzXG5cdFx0ZGF0YWNoYW5uZWwub25tZXNzYWdlID0gdGhhdC5fb25NZXNzYWdlLmJpbmQodGhhdCk7XG5cdFx0ZGF0YWNoYW5uZWwub25jbG9zZSA9IHRoYXQuX29uQ2xvc2UuYmluZCh0aGF0KTtcblxuXHRcdGlmKHR5cGVvZiB0aGF0Lm9uZGF0YWNoYW5uZWwgPT09ICdmdW5jdGlvbicpIHRoYXQub25kYXRhY2hhbm5lbCh0aGF0LmRuSWQsIHRoYXQpO1xuXG5cdFx0Y29uc29sZS5sb2coJ09wZW4gZGF0YWNoYW5uZWwgJyt0aGF0Lm5hbWUpO1xuXHR9XG59O1xuXG4vKiogQmluZCBhbiBpbmNvbWluZyBSVEMgc3RyZWFtIHRvIHRoaXMgY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUub25BZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcblx0dGhpcy5zdHJlYW0gPSBzdHJlYW07XG5cdGlmKHR5cGVvZiB0aGlzLm9uc3RyZWFtID09PSAnZnVuY3Rpb24nKSB0aGlzLm9uc3RyZWFtKHRoaXMuZG5JZCwgc3RyZWFtKTtcblx0ZWxzZSBjb25zb2xlLndhcm4oXCJJZ25vcmUgc3RyZWFtIFwiICsgc3RyZWFtLmlkKTtcblxuXHRjb25zb2xlLmxvZygnT3BlbiBzdHJlYW0gJyt0aGlzLm5hbWUpO1xufTtcblxuXG4vKiogQ2xvc2UgdGhpcyBjaGFubmVsICovXG5DaGFubmVsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuY2xvc2VkID0gdHJ1ZTtcbn07XG5cbi8qKiBXcml0ZSBhIHNjYWxhciB2YWx1ZSB0byB0aGUgZ2l2ZW4gaW5kZXggb24gdGhlIFJUQyBkYXRhY2hhbm5lbCAqL1xuQ2hhbm5lbC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpe1xuXHRpZihpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLnNpemUgfHwgaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdHRoaXMuX2J1ZmZlcltpbmRleF0gPSB2YWx1ZTtcblx0dGhpcy5fcmVxdWVzdFNlbmQoKTtcblx0cmV0dXJuIHRydWU7XG59O1xuXG4vKiogV3JpdGUgYW4gYXJyYXkgb2YgdmFsdWVzIHRvIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLndyaXRlQWxsID0gZnVuY3Rpb24odmFsdWVzKXtcblx0aWYoIUFycmF5LmlzQXJyYXkodmFsdWVzKSB8fCB2YWx1ZXMubGVuZ3RoICE9PSB0aGlzLnNpemUpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpPHZhbHVlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGlmKGlzTmFOKHZhbHVlc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5fYnVmZmVyW2ldID0gdmFsdWVzW2ldO1xuICAgIH1cbiAgICB0aGlzLl9yZXF1ZXN0U2VuZCgpO1xufTtcblxuLyoqIEFzayB0byBzZW5kIHRoZSBpbnRlcm5hbCBkYXRhIGJ1ZmZlciB0aHJvdWdoIHRoZSBkYXRhY2hhbm5lbCBhdCB0aGUgZGVmaW5lZCBmcmVxdWVuY3kgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9yZXF1ZXN0U2VuZCA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR2YXIgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RTZW5kVGltZXN0YW1wO1xuXHR2YXIgcGVyaW9kID0gMTAwMCAvIHRoaXMuZnJlcXVlbmN5O1xuXHRpZihlbGFwc2VkVGltZSA+PSBwZXJpb2QpIGRvU2VuZCgpO1xuXHRlbHNlIGlmKCF0aGlzLl9zZW5kUmVxdWVzdGVkKSB7XG5cdFx0dGhpcy5fc2VuZFJlcXVlc3RlZCA9IHRydWU7XG5cdFx0c2V0VGltZW91dChkb1NlbmQsIHBlcmlvZCAtIGVsYXBzZWRUaW1lKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRvU2VuZCgpIHtcblx0XHR0aGF0Ll9zZW5kUmVxdWVzdGVkID0gZmFsc2U7XG5cdFx0dGhhdC5fbGFzdFNlbmRUaW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHR2YXIgcmV0ID0gdGhhdC5fc2VuZCh0aGF0Ll9idWZmZXIpO1xuXHRcdC8vSWYgYXV0b3NlbmQgaXMgc2V0LCBhdXRvbWF0aWNhbGx5IHNlbmQgYnVmZmVyIGF0IHRoZSBnaXZlbiBmcmVxdWVuY3lcblx0XHRpZihyZXQgJiYgdGhhdC5hdXRvc2VuZCkgdGhhdC5fcmVxdWVzdFNlbmQoKTtcblx0fVxufTtcblxuLyoqIEFjdHVhbCBzZW5kIHRoZSBpbnRlcm5hbCBkYXRhIGJ1ZmZlciB0aHJvdWdoIHRoZSBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9zZW5kID0gZnVuY3Rpb24obXNnKXtcblx0aWYodGhpcy5jbG9zZWQgfHwgIXRoaXMuY2hhbm5lbCkgcmV0dXJuIGZhbHNlO1xuXHRlbHNlIGlmKHRoaXMuY2hhbm5lbC5yZWFkeVN0YXRlID09PSAnb3BlbicpIHtcblx0XHR0cnkge1xuXHRcdFx0dGhpcy5jaGFubmVsLnNlbmQobXNnKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbcnRjLmNoYW5uZWwud3JpdGVdIGV4Y2VwdGlvbiBvY2N1cmVkIHdoaWxlIHNlbmRpbmcgZGF0YScpO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRlbHNlIHtcblx0XHRjb25zb2xlLmxvZygnW3J0Yy5jaGFubmVsLndyaXRlXSB3YXJuaW5nIDogd2VicnRjIGRhdGFjaGFubmVsIHN0YXRlID0gJyt0aGlzLmNoYW5uZWwucmVhZHlTdGF0ZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKiogQ2FsbGVkIHdoZW4gYSBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIGNoYW5uZWwncyBSVEMgZGF0YWNoYW5uZWwgKi9cbkNoYW5uZWwucHJvdG90eXBlLl9vbk1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdHZhciB2YWxBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkobWVzc2FnZS5kYXRhKTtcblx0dGhpcy5lbWl0KCd2YWx1ZScsIHZhbEFycmF5KTtcbn07XG5cbi8qKiBDYWxsZWQgd2hlbiB0aGUgY2hhbm5lbCBpcyBjbG9zZWQgb24gdGhlIHJlbW90ZSBzaWRlICovXG5DaGFubmVsLnByb3RvdHlwZS5fb25DbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZygnQ2xvc2UgZGF0YWNoYW5uZWwgJyt0aGlzLm5hbWUpO1xuXHR0aGlzLmVtaXQoJ2Nsb3NlJyk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFJUQyBQZWVyIGltcGxlbWVudGF0aW9uIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBBbiBSVEMgUGVlciBhc3NvY2lhdGVkIHRvIGEgc2luZ2xlIChEaXlhTm9kZSBwZWVySWQsIHByb21JZCkgY291cGxlLlxuICogQHBhcmFtIGRuSWQgOiBUaGUgRGl5YU5vZGUgcGVlcklkXG4gKiBAcGFyYW0gcnRjIDogVGhlIFJUQyBkaXlhLXNkayBpbnN0YW5jZVxuICogQHBhcmFtIGlkIDogdGhlIHByb21JZFxuICogQHBhcmFtIGNoYW5uZWxzIDogYW4gYXJyYXkgb2YgUlRDIGNoYW5uZWwgbmFtZXMgdG8gb3BlblxuICovXG5mdW5jdGlvbiBQZWVyKGRuSWQsIHJ0YywgaWQsIGNoYW5uZWxzKXtcblx0dGhpcy5kbiA9IGQxKGRuSWQpO1xuXHR0aGlzLmRuSWQgPSBkbklkO1xuXHR0aGlzLmlkID0gaWQ7XG5cdHRoaXMuY2hhbm5lbHMgPSBjaGFubmVscztcblx0dGhpcy5ydGMgPSBydGM7XG5cdHRoaXMucGVlciA9IG51bGw7XG5cblx0dGhpcy5zdHJlYW1zID0gW107XG5cblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59XG5cbi8qKiBJbml0aWF0ZSBhIFJUQyBjb25uZWN0aW9uIHRvIHRoaXMgUGVlciAqL1xuUGVlci5wcm90b3R5cGUuX2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLmRuLnN1YnNjcmliZSh7XG5cdFx0c2VydmljZTogJ3J0YycsIGZ1bmM6ICdDb25uZWN0Jywgb2JqOiB0aGlzLmNoYW5uZWxzLCBkYXRhOiB7IHByb21JRDogdGhpcy5pZCB9XG5cdH0sIGZ1bmN0aW9uKGRpeWEsIGVyciwgZGF0YSl7XG5cdFx0aWYoZGF0YSkge1xuXHRcdFx0aWYoZGF0YS5ldmVudFR5cGUgPT09ICdUdXJuSW5mbycpIHRoYXQuX3R1cm5pbmZvID0gZGF0YS50dXJuO1xuXHRcdFx0ZWxzZSBpZihkYXRhLmV2ZW50VHlwZSA9PT0gJ1JlbW90ZU9mZmVyJykgdGhhdC5fY3JlYXRlUGVlcihkYXRhKTtcblx0XHRcdGVsc2UgaWYoZGF0YS5ldmVudFR5cGUgPT09ICdSZW1vdGVJQ0VDYW5kaWRhdGUnKSB0aGF0Ll9hZGRSZW1vdGVJQ0VDYW5kaWRhdGUoZGF0YSk7XG5cdFx0fVxuXHR9KTtcblxuXHR0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGlmKCF0aGF0LmNvbm5lY3RlZCAmJiAhdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpOyB9LCA0MDAwMCk7XG59O1xuXG4vKiogUmVjb25uZWN0cyB0aGUgUlRDIHBlZXIgKi9cblBlZXIucHJvdG90eXBlLl9yZWNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR0aGlzLmNsb3NlKCk7XG5cblx0dGhpcy5wZWVyID0gbnVsbDtcblx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0dGhpcy5jbG9zZWQgPSBmYWxzZTtcblxuXHR0aGlzLl9jb25uZWN0KCk7XG59O1xuXG5cbi8qKiBDcmVhdGVzIGEgUlRDUGVlckNvbm5lY3Rpb24gaW4gcmVzcG9uc2UgdG8gYSBSZW1vdGVPZmZlciAqL1xuUGVlci5wcm90b3R5cGUuX2NyZWF0ZVBlZXIgPSBmdW5jdGlvbihkYXRhKXtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdHZhciBpY2VTZXJ2ZXJzID0gW107XG5cdGlmKHRoaXMuX3R1cm5pbmZvKSB7XG5cdFx0aWNlU2VydmVycy5wdXNoKHsgdXJsczogWyB0aGlzLl90dXJuaW5mby51cmwgXSwgdXNlcm5hbWU6IHRoaXMuX3R1cm5pbmZvLnVzZXJuYW1lLCBjcmVkZW50aWFsOiB0aGlzLl90dXJuaW5mby5wYXNzd29yZCB9KTtcblx0fSBlbHNlIHtcblx0XHRpY2VTZXJ2ZXJzLnB1c2goe3VybHM6IFsgXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCIgXX0pO1xuXHR9XG5cdFxuXHR2YXIgY29uZmlnID0ge1xuXHRcdGljZVNlcnZlcnM6IGljZVNlcnZlcnMsXG5cdFx0aWNlVHJhbnNwb3J0UG9saWN5OiAnYWxsJ1x0XG5cdH07XG5cblx0dmFyIGNvbnN0cmFpbnRzID0ge1xuXHRcdG1hbmRhdG9yeToge0R0bHNTcnRwS2V5QWdyZWVtZW50OiB0cnVlLCBPZmZlclRvUmVjZWl2ZUF1ZGlvOiB0cnVlLCBPZmZlclRvUmVjZWl2ZVZpZGVvOnRydWV9XG5cdH1cblx0XG5cdGNvbnNvbGUubG9nKGNvbmZpZyk7XG5cdGNvbnNvbGUubG9nKGNvbnN0cmFpbnRzKTtcblxuXHR2YXIgcGVlciA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjb25maWcsICBjb25zdHJhaW50cyk7XG5cdHRoaXMucGVlciA9IHBlZXI7XG5cblx0dGhpcy5zdHJlYW1zLmZvckVhY2goZnVuY3Rpb24ocykge1xuXHRcdHBlZXIuYWRkU3RyZWFtKHMpO1xuXHR9KTtcblxuXHRwZWVyLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe3NkcDogZGF0YS5zZHAsIHR5cGU6IGRhdGEudHlwZX0pKTtcblxuXHRwZWVyLmNyZWF0ZUFuc3dlcihmdW5jdGlvbihzZXNzaW9uX2Rlc2NyaXB0aW9uKXtcblx0XHRwZWVyLnNldExvY2FsRGVzY3JpcHRpb24oc2Vzc2lvbl9kZXNjcmlwdGlvbik7XG5cblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnQW5zd2VyJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cHJvbUlEOiBkYXRhLnByb21JRCxcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0c2RwOiBzZXNzaW9uX2Rlc2NyaXB0aW9uLnNkcCxcblx0XHRcdFx0dHlwZTogc2Vzc2lvbl9kZXNjcmlwdGlvbi50eXBlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZ1bmN0aW9uKGVycil7IGNvbnNvbGUubG9nKGVycik7IH0sXG5cdHsnbWFuZGF0b3J5JzogeyBPZmZlclRvUmVjZWl2ZUF1ZGlvOiB0cnVlLCBPZmZlclRvUmVjZWl2ZVZpZGVvOiB0cnVlfX0pO1xuXG5cdHBlZXIub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnY29ubmVjdGVkJyl7XG5cdFx0XHR0aGF0LmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0XHRpZih0aGF0LnN1YnNjcmlwdGlvbikgdGhhdC5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0XHR9XG5cdFx0ZWxzZSBpZihwZWVyLmljZUNvbm5lY3Rpb25TdGF0ZSA9PT0gJ2Rpc2Nvbm5lY3RlZCcgfHwgcGVlci5pY2VDb25uZWN0aW9uU3RhdGUgPT09ICdjbG9zZWQnIHx8IHBlZXIuaWNlQ29ubmVjdGlvblN0YXRlID09PSAnZmFpbGVkJyl7XG5cdFx0XHRpZighdGhhdC5jbG9zZWQpIHRoYXQuX3JlY29ubmVjdCgpO1xuXHRcdH1cblx0fTtcblxuXHRwZWVyLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KXtcblx0XHR0aGF0LmRuLnJlcXVlc3Qoe1xuXHRcdFx0c2VydmljZTogJ3J0YycsXG5cdFx0XHRmdW5jOiAnSUNFQ2FuZGlkYXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cGVlcklkOiBkYXRhLnBlZXJJZCxcblx0XHRcdFx0cHJvbUlEOiB0aGF0LmlkLFxuXHRcdFx0XHRjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGVcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRwZWVyLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpe1xuXHRcdHRoYXQuY29ubmVjdGVkID0gdHJ1ZTtcblx0XHR0aGF0LnJ0Yy5fb25EYXRhQ2hhbm5lbCh0aGF0LmRuSWQsIGV2dC5jaGFubmVsKTtcblx0fTtcblxuXHRwZWVyLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0dGhhdC5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdHRoYXQucnRjLl9vbkFkZFN0cmVhbSh0aGF0LmRuSWQsIGV2dC5zdHJlYW0pO1xuXHR9O1xufTtcblxuXG5QZWVyLnByb3RvdHlwZS5fYWRkUmVtb3RlSUNFQ2FuZGlkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG5cdHRyeSB7XG5cdFx0Ly9jb25zb2xlLmxvZygncmVtb3RlIGljZSA6Jyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhLmNhbmRpZGF0ZS5jYW5kaWRhdGUpO1xuXHRcdHZhciBjYW5kaWRhdGUgPSBuZXcgUlRDSWNlQ2FuZGlkYXRlKGRhdGEuY2FuZGlkYXRlKTtcblx0XHR0aGlzLnBlZXIuYWRkSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSwgZnVuY3Rpb24oKXt9LGZ1bmN0aW9uKGVycil7IGNvbnNvbGUuZXJyb3IoZXJyKTtcdH0pO1xuXHR9IGNhdGNoKGVycikgeyBjb25zb2xlLmVycm9yKGVycik7IH1cbn07XG5cbi8qKiBTZW5kIHRoZSBtYXBwaW5ncyBmcm9tIGNoYW5uZWwgbmFtZXMgdG8gc3RyZWFtIElEcyAqL1xuUGVlci5wcm90b3R5cGUuc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZG4ucmVxdWVzdCh7XG5cdFx0c2VydmljZTpcInJ0Y1wiLFxuXHRcdGZ1bmM6XCJDaGFubmVsc1N0cmVhbXNNYXBwaW5nc1wiLFxuXHRcdGRhdGE6e3BlZXJJZDowLCBtYXBwaW5nczp0aGlzLnJ0Y1t0aGlzLmRuSWRdLmNoYW5uZWxzQnlTdHJlYW19XG5cdH0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKXtcblx0XHRpZihlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0fSk7XG59O1xuXG4vKiogQWRkcyBhIGxvY2FsIHN0cmVhbSB0byB0aGlzIFBlZXIgKi9cblBlZXIucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuXHR0aGlzLnNlbmRDaGFubmVsc1N0cmVhbXNNYXBwaW5ncygpO1xuXHRpZighdGhpcy5zdHJlYW1zLmZpbHRlcihmdW5jdGlvbihzKXtyZXR1cm4gc3RyZWFtLmlkID09PSBzO30pWzBdKSB0aGlzLnN0cmVhbXMucHVzaChzdHJlYW0pO1xuXHR0aGlzLl9yZWNvbm5lY3QoKTtcbn1cblxuUGVlci5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG5cdHRoaXMuc3RyZWFtcyA9IHRoaXMuc3RyZWFtcy5maWx0ZXIoZnVuY3Rpb24ocyl7cmV0dXJuIHN0cmVhbS5pZCAhPT0gczt9KTtcblx0aWYodGhpcy5wZWVyKSB0aGlzLnBlZXIucmVtb3ZlU3RyZWFtKHN0cmVhbSk7XG59XG5cblBlZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtcblx0aWYodGhpcy5zdWJzY3JpcHRpb24pIHRoaXMuc3Vic2NyaXB0aW9uLmNsb3NlKCk7XG5cdGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0SWQpO1xuXHRpZih0aGlzLnBlZXIpe1xuXHRcdHRyeXtcblx0XHRcdHRoaXMucGVlci5jbG9zZSgpO1xuXHRcdH1jYXRjaChlKXt9XG5cdFx0dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmNsb3NlZCA9IHRydWU7XG5cdH1cbn07XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIFJUQyBzZXJ2aWNlIGltcGxlbWVudGF0aW9uIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5cbmZ1bmN0aW9uIFJUQyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXG5cdHRoaXMucmVxdWVzdGVkQ2hhbm5lbHMgPSBbXTtcblx0dGhpcy5jaGFubmVsc0J5U3RyZWFtID0gW107XG59XG5cblJUQy5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24obmFtZV9yZWdleCwgdHlwZSwgb25kYXRhY2hhbm5lbF9jYWxsYmFjaywgb25hZGRzdHJlYW1fY2FsbGJhY2spe1xuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLnB1c2goe3JlZ2V4OiBuYW1lX3JlZ2V4LCB0eXBlOnR5cGUsIGNiOiBvbmRhdGFjaGFubmVsX2NhbGxiYWNrLCBzdHJlYW1fY2I6IG9uYWRkc3RyZWFtX2NhbGxiYWNrfSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqIFN0YXJ0IGxpc3RlbmluZyB0byBQZWVycyBjb25uZWN0aW9ucy5cbiAqIEEgJ1BlZXInIG9iamVjdCB3aWxsIGJlIGNyZWF0ZWQgZm9yIGVhY2ggRGl5YU5vZGUgcGVlcklkIGFuZCBlYWNoIHByb21JRFxuICovXG5SVEMucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblxuXHR0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuc2VsZWN0b3Iuc3Vic2NyaWJlKHtcblx0XHRzZXJ2aWNlOiAncnRjJyxcblx0XHRmdW5jOiAnUGVlcnMnXG5cdH0sIGZ1bmN0aW9uKGRuSWQsIGVyciwgZGF0YSl7XG5cblx0XHRpZighdGhhdFtkbklkXSkgdGhhdC5fY3JlYXRlRGl5YU5vZGUoZG5JZCk7XG5cblx0XHRpZihlcnIgPT09ICdTdWJzY3JpcHRpb25DbG9zZWQnIHx8IGVyciA9PT0gJ1BlZXJEaXNjb25uZWN0ZWQnKXtcblx0XHRcdHRoYXQuX2Nsb3NlRGl5YU5vZGUoZG5JZCk7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblxuXHRcdGlmKGRhdGEgJiYgZGF0YS5ldmVudFR5cGUgJiYgZGF0YS5wcm9tSUQgIT09IHVuZGVmaW5lZCl7XG5cblx0XHRcdGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNvbm5lY3RlZCcpe1xuXHRcdFx0XHRpZighdGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pe1xuXHRcdFx0XHRcdHZhciBjaGFubmVscyA9IHRoYXQuX21hdGNoQ2hhbm5lbHMoZG5JZCwgZGF0YS5jaGFubmVscyk7XG5cdFx0XHRcdFx0aWYoY2hhbm5lbHMubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0XHR0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSA9IG5ldyBQZWVyKGRuSWQsIHRoYXQsIGRhdGEucHJvbUlELCBjaGFubmVscyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQXV0b3JlY29ubmVjdCBkZWNsYXJlZCBzdHJlYW1zXG5cdFx0XHRcdFx0dGhhdC5jaGFubmVsc0J5U3RyZWFtLmZvckVhY2goZnVuY3Rpb24oY2JzKSB7XG5cdFx0XHRcdFx0XHR0aGF0LmFkZFN0cmVhbShjYnMuY2hhbm5lbCwgY2JzLm1lZGlhU3RyZWFtKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih0aGF0W2RuSWRdLnBlZXJzW2RhdGEucHJvbUlEXSkgdGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0uc2VuZENoYW5uZWxzU3RyZWFtc01hcHBpbmdzKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGRhdGEuZXZlbnRUeXBlID09PSAnUGVlckNsb3NlZCcpIHtcblx0XHRcdFx0aWYodGhhdFtkbklkXS5wZWVyc1tkYXRhLnByb21JRF0pIHtcblx0XHRcdFx0XHR0aGF0Ll9jbG9zZVBlZXIoZG5JZCwgZGF0YS5wcm9tSUQpO1xuXHRcdFx0XHRcdGlmKHR5cGVvZiB0aGF0Lm9uY2xvc2UgPT09ICdmdW5jdGlvbicpIHRoYXQub25jbG9zZShkbklkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sIHthdXRvOiB0cnVlfSk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5SVEMucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dGhpcy5zZWxlY3Rvci5lYWNoKGZ1bmN0aW9uKGRuSWQpe1xuXHRcdGlmKCF0aGF0W2RuSWRdKSByZXR1cm4gO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdC5fY2xvc2VQZWVyKGRuSWQsIHByb21JRCk7XG5cdFx0fVxuXHR9KTtcblxuXHRpZih0aGlzLnN1YnNjcmlwdGlvbikgdGhpcy5zdWJzY3JpcHRpb24uY2xvc2UoKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cblJUQy5wcm90b3R5cGUuX2NyZWF0ZURpeWFOb2RlID0gZnVuY3Rpb24oZG5JZCl7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHR0aGlzW2RuSWRdID0ge1xuXHRcdGRuSWQ6IGRuSWQsXG5cdFx0dXNlZENoYW5uZWxzOiBbXSxcblx0XHRyZXF1ZXN0ZWRDaGFubmVsczogW10sXG5cdFx0cGVlcnM6IFtdLFxuXHRcdGNoYW5uZWxzQnlTdHJlYW06IFtdXG5cdH1cblxuXHR0aGlzLnJlcXVlc3RlZENoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24oYyl7dGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVscy5wdXNoKGMpfSk7XG59O1xuXG5SVEMucHJvdG90eXBlLl9jbG9zZURpeWFOb2RlID0gZnVuY3Rpb24oZG5JZCl7XG5cdGZvcih2YXIgcHJvbUlEIGluIHRoaXNbZG5JZF0ucGVlcnMpe1xuXHRcdHRoaXMuX2Nsb3NlUGVlcihkbklkLCBwcm9tSUQpO1xuXHR9XG5cblx0ZGVsZXRlIHRoaXNbZG5JZF07XG59O1xuXG5SVEMucHJvdG90eXBlLl9jbG9zZVBlZXIgPSBmdW5jdGlvbihkbklkLCBwcm9tSUQpe1xuXHRpZih0aGlzW2RuSWRdLnBlZXJzW3Byb21JRF0pe1xuXHRcdHZhciBwID0gdGhpc1tkbklkXS5wZWVyc1twcm9tSURdO1xuXHRcdHAuY2xvc2UoKTtcblxuXHRcdGZvcih2YXIgaT0wO2k8cC5jaGFubmVscy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRkZWxldGUgdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbcC5jaGFubmVsc1tpXV07XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXNbZG5JZF0ucGVlcnNbcHJvbUlEXTtcblx0fVxufTtcblxuLyoqIE1hdGNoZXMgdGhlIGdpdmVuIHJlY2VpdmVkQ2hhbm5lbHMgcHJvcG9zZWQgYnkgdGhlIGdpdmVuIERpeWFOb2RlIHBlZXJJZFxuICogIGFnYWluc3QgdGhlIHJlcXVlc3RlZCBjaGFubmVscyBhbmQgY3JlYXRlcyBhIENoYW5uZWwgZm9yIGVhY2ggbWF0Y2hcbiAqL1xuUlRDLnByb3RvdHlwZS5fbWF0Y2hDaGFubmVscyA9IGZ1bmN0aW9uKGRuSWQsIHJlY2VpdmVkQ2hhbm5lbHMpe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0dmFyIGNoYW5uZWxzID0gW107XG5cblx0Zm9yKHZhciBpID0gMDsgaSA8IHJlY2VpdmVkQ2hhbm5lbHMubGVuZ3RoOyBpKyspe1xuXHRcdHZhciBuYW1lID0gcmVjZWl2ZWRDaGFubmVsc1tpXTtcblx0XHR2YXIgcmVtb3RlU3RyZWFtSWQgPSBuYW1lLnNwbGl0KFwiXzs6X1wiKVsxXTtcblx0XHRuYW1lID0gbmFtZS5zcGxpdChcIl87Ol9cIilbMF07XG5cblx0XHRmb3IodmFyIGogPSAwOyBqIDwgdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVscy5sZW5ndGg7IGorKyl7XG5cdFx0XHR2YXIgcmVxID0gdGhhdFtkbklkXS5yZXF1ZXN0ZWRDaGFubmVsc1tqXTtcblxuXHRcdFx0aWYobmFtZSAmJiBuYW1lLm1hdGNoKHJlcS5yZWdleCkgJiYgIXRoYXRbZG5JZF0udXNlZENoYW5uZWxzW25hbWVdKXtcblx0XHRcdFx0dmFyIGNoYW5uZWwgPSBuZXcgQ2hhbm5lbChkbklkLCBuYW1lLCByZXEuY2IsIHJlcS5zdHJlYW1fY2IpO1xuXHRcdFx0XHR0aGF0W2RuSWRdLnVzZWRDaGFubmVsc1tuYW1lXSA9IGNoYW5uZWw7XG5cdFx0XHRcdGNoYW5uZWxzLnB1c2gobmFtZSk7XG5cblx0XHRcdFx0Ly8gSWYgYSBzdHJlYW0gaWQgaXMgcHJvdmlkZWQgZm9yIHRoZSBjaGFubmVsLCByZWdpc3RlciB0aGUgbWFwcGluZ1xuXHRcdFx0XHRpZihyZW1vdGVTdHJlYW1JZCkge1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbSA9IHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLnN0cmVhbSAhPT0gcmVtb3RlU3RyZWFtSWQgJiYgY2JzLmNoYW5uZWwgIT09IGNoYW5uZWw7IH0pO1xuXHRcdFx0XHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtzdHJlYW06cmVtb3RlU3RyZWFtSWQsIGNoYW5uZWw6Y2hhbm5lbH0pO1xuXHRcdFx0XHRcdGNoYW5uZWwuc3RyZWFtSWQgPSBzdHJlYW1JZDtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbG9jYWxTdHJlYW1JZCA9IHRoYXQuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgPT09IG5hbWU7IH0pWzBdO1xuXHRcdFx0XHRpZihsb2NhbFN0cmVhbUlkKSB7XG5cdFx0XHRcdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuc3RyZWFtICE9PSBsb2NhbFN0cmVhbUlkICYmIGNicy5jaGFubmVsICE9PSBuYW1lOyB9KTtcblx0XHRcdFx0XHR0aGF0W2RuSWRdLmNoYW5uZWxzQnlTdHJlYW0ucHVzaCh7c3RyZWFtOmxvY2FsU3RyZWFtSWQsIGNoYW5uZWw6bmFtZX0pO1xuXHRcdFx0XHRcdGNoYW5uZWwubG9jYWxTdHJlYW1JZCA9IGxvY2FsU3RyZWFtSWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gIGNoYW5uZWxzO1xufTtcblxuXG4vKiogQ2FsbGVkIHVwb24gUlRDIGRhdGFjaGFubmVscyBjb25uZWN0aW9ucyAqL1xuUlRDLnByb3RvdHlwZS5fb25EYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKGRuSWQsIGRhdGFjaGFubmVsKXtcblx0aWYoIXRoaXNbZG5JZF0pIHJldHVybiBjb25zb2xlLndhcm4oXCJUcmllZCB0byBvcGVuIGEgZGF0YSBjaGFubmVsIG9uIGEgY2xvc2VkIHBlZXJcIik7XG5cdHZhciBjaGFubmVsID0gdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbZGF0YWNoYW5uZWwubGFiZWxdO1xuXG5cdGlmKCFjaGFubmVsKXtcblx0XHRjb25zb2xlLmxvZyhcIkRhdGFjaGFubmVsIFwiK2RhdGFjaGFubmVsLmxhYmVsK1wiIHVubWF0Y2hlZCwgY2xvc2luZyAhXCIpO1xuXHRcdGRhdGFjaGFubmVsLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXHRjaGFubmVsLnNldERhdGFDaGFubmVsKGRhdGFjaGFubmVsKTtcbn07XG5cbi8qKiBDYWxsZWQgdXBvbiBSVEMgc3RyZWFtIGNoYW5uZWwgY29ubmVjdGlvbnMgKi9cblJUQy5wcm90b3R5cGUuX29uQWRkU3RyZWFtID0gZnVuY3Rpb24oZG5JZCwgc3RyZWFtKSB7XG5cdGlmKCF0aGlzW2RuSWRdKSByZXR1cm4gY29uc29sZS53YXJuKFwiVHJpZWQgdG8gb3BlbiBhIHN0cmVhbSBvbiBhIGNsb3NlZCBwZWVyXCIpO1xuXG5cdHZhciBjaGFubmVsID0gdGhpc1tkbklkXS51c2VkQ2hhbm5lbHNbc3RyZWFtLmlkXTtcblxuXHRpZighY2hhbm5lbCl7XG5cdFx0Y29uc29sZS53YXJuKFwiU3RyZWFtIENoYW5uZWwgXCIrIHN0cmVhbS5pZCArXCIgdW5tYXRjaGVkLCBjbG9zaW5nICFcIik7XG5cdFx0c3RyZWFtLmNsb3NlKCk7XG5cdFx0cmV0dXJuIDtcblx0fVxuXHRjaGFubmVsLm9uQWRkU3RyZWFtKHN0cmVhbSk7XG59O1xuXG4vKiogQWRkIGEgbG9jYWwgc3RyZWFtIHRvIGJlIHNlbnQgdGhyb3VnaCB0aGUgZ2l2ZW4gUlRDIGNoYW5uZWwgKi9cblJUQy5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oY2hhbm5lbCwgc3RyZWFtKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBSZWdpc3RlciB0aGUgY2hhbm5lbDwtPnN0cmVhbSBtYXBwaW5nXG5cdHRoaXMuY2hhbm5lbHNCeVN0cmVhbSA9IHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5maWx0ZXIoZnVuY3Rpb24oY2JzKXtyZXR1cm4gY2JzLmNoYW5uZWwgIT09IGNoYW5uZWwgJiYgY2JzLnN0cmVhbSAhPT0gc3RyZWFtLmlkOyB9KTtcbiBcdHRoaXMuY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtjaGFubmVsOmNoYW5uZWwsIHN0cmVhbTpzdHJlYW0uaWQsIG1lZGlhU3RyZWFtOnN0cmVhbX0pO1xuXG5cdGNvbnNvbGUubG9nKFwiT3BlbiBsb2NhbCBzdHJlYW0gXCIgKyBjaGFubmVsKTtcblxuXHQvLyBTZW5kIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmcgdG8gYWxsIGNvbm5lY3RlZCBQZWVyc1xuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXHRcdHRoYXRbZG5JZF0uY2hhbm5lbHNCeVN0cmVhbS5wdXNoKHtjaGFubmVsOmNoYW5uZWwsIHN0cmVhbTpzdHJlYW0uaWR9KTtcblx0XHRmb3IodmFyIHByb21JRCBpbiB0aGF0W2RuSWRdLnBlZXJzKXtcblx0XHRcdHRoYXRbZG5JZF0ucGVlcnNbcHJvbUlEXS5hZGRTdHJlYW0oc3RyZWFtKTtcblx0XHR9XG5cdH0pO1xuXG59O1xuXG5SVEMucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHN0cmVhbSkge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0Ly8gUmVnaXN0ZXIgdGhlIGNoYW5uZWw8LT5zdHJlYW0gbWFwcGluZ1xuXHR0aGlzLmNoYW5uZWxzQnlTdHJlYW0gPSB0aGlzLmNoYW5uZWxzQnlTdHJlYW0uZmlsdGVyKGZ1bmN0aW9uKGNicyl7cmV0dXJuIGNicy5jaGFubmVsICE9PSBjaGFubmVsICYmIGNicy5zdHJlYW0gIT09IHN0cmVhbS5pZDsgfSk7XG5cblx0Y29uc29sZS5sb2coXCJDbG9zZSBsb2NhbCBzdHJlYW0gXCIgKyBjaGFubmVsKTtcblxuXHQvLyBTZW5kIHRoZSBjaGFubmVsPC0+c3RyZWFtIG1hcHBpbmcgdG8gYWxsIGNvbm5lY3RlZCBQZWVyc1xuXHR0aGlzLnNlbGVjdG9yLmVhY2goZnVuY3Rpb24oZG5JZCl7XG5cdFx0aWYoIXRoYXRbZG5JZF0pIHJldHVybiA7XG5cdFx0dGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtID0gdGhhdFtkbklkXS5jaGFubmVsc0J5U3RyZWFtLmZpbHRlcihmdW5jdGlvbihjYnMpe3JldHVybiBjYnMuY2hhbm5lbCAhPT0gY2hhbm5lbCAmJiBjYnMuc3RyZWFtICE9PSBzdHJlYW0uaWQ7IH0pO1xuXHRcdGZvcih2YXIgcHJvbUlEIGluIHRoYXRbZG5JZF0ucGVlcnMpe1xuXHRcdFx0dGhhdFtkbklkXS5wZWVyc1twcm9tSURdLnJlbW92ZVN0cmVhbShzdHJlYW0pO1xuXHRcdH1cblx0fSk7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLnJ0YyA9IGZ1bmN0aW9uKCl7IHJldHVybiBuZXcgUlRDKHRoaXMpO307XG4iLCIvKiBtYXlhLWNsaWVudFxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBQYXJ0bmVyaW5nIFJvYm90aWNzLCBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBsaWJyYXJ5IGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vclxuICogbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgdmVyc2lvblxuICpcdDMuMCBvZiB0aGUgTGljZW5zZS4gVGhpcyBsaWJyYXJ5IGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlXG4gKiB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlblxuICogdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRS4gU2VlIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWNcbiAqIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIGxpYnJhcnkuXG4gKi9cblxudmFyIERpeWFTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uL0RpeWFTZWxlY3RvcicpLkRpeWFTZWxlY3RvcjtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5cbnZhciBNZXNzYWdlID0gcmVxdWlyZSgnLi4vbWVzc2FnZScpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vIExvZ2dpbmcgdXRpbGl0eSBtZXRob2RzIC8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIERFQlVHID0gdHJ1ZTtcbnZhciBMb2dnZXIgPSB7XG5cdGxvZzogZnVuY3Rpb24obWVzc2FnZSl7XG5cdFx0aWYoREVCVUcpIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHR9LFxuXG5cdGVycm9yOiBmdW5jdGlvbihtZXNzYWdlKXtcblx0XHRpZihERUJVRykgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufTtcblxuLyoqXG4gKlx0Y2FsbGJhY2sgOiBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgbW9kZWwgdXBkYXRlZFxuICogKi9cbmZ1bmN0aW9uIFN0YXR1cyhzZWxlY3Rvcil7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuXHR0aGlzLl9jb2RlciA9IHNlbGVjdG9yLmVuY29kZSgpO1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcblxuXHQvKiogbW9kZWwgb2Ygcm9ib3QgOiBhdmFpbGFibGUgcGFydHMgYW5kIHN0YXR1cyAqKi9cblx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdHRoaXMuX3JvYm90TW9kZWxJbml0ID0gZmFsc2U7XG5cblx0LyoqKiBzdHJ1Y3R1cmUgb2YgZGF0YSBjb25maWcgKioqXG5cdFx0IGNyaXRlcmlhIDpcblx0XHQgICB0aW1lOiBhbGwgMyB0aW1lIGNyaXRlcmlhIHNob3VsZCBub3QgYmUgZGVmaW5lZCBhdCB0aGUgc2FtZSB0aW1lLiAocmFuZ2Ugd291bGQgYmUgZ2l2ZW4gdXApXG5cdFx0ICAgICBiZWc6IHtbbnVsbF0sdGltZX0gKG51bGwgbWVhbnMgbW9zdCByZWNlbnQpIC8vIHN0b3JlZCBhIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgZW5kOiB7W251bGxdLCB0aW1lfSAobnVsbCBtZWFucyBtb3N0IG9sZGVzdCkgLy8gc3RvcmVkIGFzIFVUQyBpbiBtcyAobnVtKVxuXHRcdCAgICAgcmFuZ2U6IHtbbnVsbF0sIHRpbWV9IChyYW5nZSBvZiB0aW1lKHBvc2l0aXZlKSApIC8vIGluIHMgKG51bSlcblx0XHQgICByb2JvdDoge0FycmF5T2YgSUQgb3IgW1wiYWxsXCJdfVxuXHRcdCAgIHBsYWNlOiB7QXJyYXlPZiBJRCBvciBbXCJhbGxcIl19XG5cdFx0IG9wZXJhdG9yOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9IC0oIG1heWJlIG1veSBzaG91bGQgYmUgZGVmYXVsdFxuXHRcdCAuLi5cblxuXHRcdCBwYXJ0cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBQYXJ0c0lkfSB0byBnZXQgZXJyb3JzXG5cdFx0IHN0YXR1cyA6IHtbbnVsbF0gb3IgQXJyYXlPZiBTdGF0dXNOYW1lfSB0byBnZXQgc3RhdHVzXG5cblx0XHQgc2FtcGxpbmc6IHtbbnVsbF0gb3IgaW50fVxuXHQqL1xuXHR0aGlzLmRhdGFDb25maWcgPSB7XG5cdFx0Y3JpdGVyaWE6IHtcblx0XHRcdHRpbWU6IHtcblx0XHRcdFx0YmVnOiBudWxsLFxuXHRcdFx0XHRlbmQ6IG51bGwsXG5cdFx0XHRcdHJhbmdlOiBudWxsIC8vIGluIHNcblx0XHRcdH0sXG5cdFx0XHRyb2JvdDogbnVsbFxuXHRcdH0sXG5cdFx0b3BlcmF0b3I6ICdsYXN0Jyxcblx0XHRwYXJ0czogbnVsbCxcblx0XHRzdGF0dXM6IG51bGxcblx0fTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG4vKipcbiAqIEdldCByb2JvdE1vZGVsIDpcbiAqIHtcbiAqICBwYXJ0czoge1xuICpcdFx0XCJwYXJ0WFhcIjoge1xuICogXHRcdFx0IGVycm9yc0Rlc2NyOiB7IGVuY291bnRlcmVkIGVycm9ycyBpbmRleGVkIGJ5IGVycm9ySWRzPjAgfVxuICpcdFx0XHRcdD4gQ29uZmlnIG9mIGVycm9ycyA6XG4gKlx0XHRcdFx0XHRjcml0TGV2ZWw6IEZMT0FULCAvLyBjb3VsZCBiZSBpbnQuLi5cbiAqIFx0XHRcdFx0XHRtc2c6IFNUUklORyxcbiAqXHRcdFx0XHRcdHN0b3BTZXJ2aWNlSWQ6IFNUUklORyxcbiAqXHRcdFx0XHRcdHJ1blNjcmlwdDogU2VxdWVsaXplLlNUUklORyxcbiAqXHRcdFx0XHRcdG1pc3Npb25NYXNrOiBTZXF1ZWxpemUuSU5URUdFUixcbiAqXHRcdFx0XHRcdHJ1bkxldmVsOiBTZXF1ZWxpemUuSU5URUdFUlxuICpcdFx0XHRlcnJvcjpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHR0aW1lOltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0cm9ib3Q6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHR9LFxuICpcdCBcdC4uLiAoXCJQYXJ0WVlcIilcbiAqICB9LFxuICogIHN0YXR1czoge1xuICpcdFx0XCJzdGF0dXNYWFwiOiB7XG4gKlx0XHRcdFx0ZGF0YTpbRkxPQVQsIC4uLl0sIC8vIGNvdWxkIGJlIGludC4uLlxuICpcdFx0XHRcdHRpbWU6W0ZMT0FULCAuLi5dLFxuICpcdFx0XHRcdHJvYm90OltGTE9BVCwgLi4uXSxcbiAqXHRcdFx0XHQvLy8gcGxhY2U6W0ZMT0FULCAuLi5dLCBub3QgaW1wbGVtZW50ZWQgeWV0XG4gKlx0XHRcdFx0cmFuZ2U6IFtGTE9BVCwgRkxPQVRdLFxuICpcdFx0XHRcdGxhYmVsOiBzdHJpbmdcbiAqXHRcdFx0fSxcbiAqXHQgXHQuLi4gKFwiU3RhdHVzWVlcIilcbiAqICB9XG4gKiB9XG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0Um9ib3RNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLnJvYm90TW9kZWw7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhQ29uZmlnIGNvbmZpZyBmb3IgZGF0YSByZXF1ZXN0XG4gKiBpZiBkYXRhQ29uZmlnIGlzIGRlZmluZSA6IHNldCBhbmQgcmV0dXJuIHRoaXNcbiAqXHQgQHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0IEByZXR1cm4ge09iamVjdH0gY3VycmVudCBkYXRhQ29uZmlnXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YUNvbmZpZyA9IGZ1bmN0aW9uKG5ld0RhdGFDb25maWcpe1xuXHRpZihuZXdEYXRhQ29uZmlnKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnPW5ld0RhdGFDb25maWc7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWc7XG59O1xuLyoqXG4gKiBUTyBCRSBJTVBMRU1FTlRFRCA6IG9wZXJhdG9yIG1hbmFnZW1lbnQgaW4gRE4tU3RhdHVzXG4gKiBAcGFyYW0gIHtTdHJpbmd9XHQgbmV3T3BlcmF0b3IgOiB7W2xhc3RdLCBtYXgsIG1veSwgc2R9XG4gKiBAcmV0dXJuIHtTdGF0dXN9IHRoaXMgLSBjaGFpbmFibGVcbiAqIFNldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqIERlcGVuZHMgb24gbmV3T3BlcmF0b3JcbiAqXHRAcGFyYW0ge1N0cmluZ30gbmV3T3BlcmF0b3JcbiAqXHRAcmV0dXJuIHRoaXNcbiAqIEdldCBvcGVyYXRvciBjcml0ZXJpYS5cbiAqXHRAcmV0dXJuIHtTdHJpbmd9IG9wZXJhdG9yXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuRGF0YU9wZXJhdG9yID0gZnVuY3Rpb24obmV3T3BlcmF0b3Ipe1xuXHRpZihuZXdPcGVyYXRvcikge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5vcGVyYXRvciA9IG5ld09wZXJhdG9yO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGVsc2Vcblx0XHRyZXR1cm4gdGhpcy5kYXRhQ29uZmlnLm9wZXJhdG9yO1xufTtcbi8qKlxuICogRGVwZW5kcyBvbiBudW1TYW1wbGVzXG4gKiBAcGFyYW0ge2ludH0gbnVtYmVyIG9mIHNhbXBsZXMgaW4gZGF0YU1vZGVsXG4gKiBpZiBkZWZpbmVkIDogc2V0IG51bWJlciBvZiBzYW1wbGVzXG4gKlx0QHJldHVybiB7U3RhdHVzfSB0aGlzXG4gKiBlbHNlXG4gKlx0QHJldHVybiB7aW50fSBudW1iZXIgb2Ygc2FtcGxlc1xuICoqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhU2FtcGxpbmcgPSBmdW5jdGlvbihudW1TYW1wbGVzKXtcblx0aWYobnVtU2FtcGxlcykge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5zYW1wbGluZyA9IG51bVNhbXBsZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuc2FtcGxpbmc7XG59O1xuLyoqXG4gKiBTZXQgb3IgZ2V0IGRhdGEgdGltZSBjcml0ZXJpYSBiZWcgYW5kIGVuZC5cbiAqIElmIHBhcmFtIGRlZmluZWRcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVCZWcgLy8gbWF5IGJlIG51bGxcbiAqXHRAcGFyYW0ge0RhdGV9IG5ld1RpbWVFbmQgLy8gbWF5IGJlIG51bGxcbiAqXHRAcmV0dXJuIHtTdGF0dXN9IHRoaXNcbiAqIElmIG5vIHBhcmFtIGRlZmluZWQ6XG4gKlx0QHJldHVybiB7T2JqZWN0fSBUaW1lIG9iamVjdDogZmllbGRzIGJlZyBhbmQgZW5kLlxuICovXG5TdGF0dXMucHJvdG90eXBlLkRhdGFUaW1lID0gZnVuY3Rpb24obmV3VGltZUJlZyxuZXdUaW1lRW5kLCBuZXdSYW5nZSl7XG5cdGlmKG5ld1RpbWVCZWcgfHwgbmV3VGltZUVuZCB8fCBuZXdSYW5nZSkge1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyA9IG5ld1RpbWVCZWcuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCA9IG5ld1RpbWVFbmQuZ2V0VGltZSgpO1xuXHRcdHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLnJhbmdlID0gbmV3UmFuZ2U7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB7XG5cdFx0XHRiZWc6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmJlZyksXG5cdFx0XHRlbmQ6IG5ldyBEYXRlKHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS50aW1lLmVuZCksXG5cdFx0XHRyYW5nZTogbmV3IERhdGUodGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnRpbWUucmFuZ2UpXG5cdFx0fTtcbn07XG4vKipcbiAqIERlcGVuZHMgb24gcm9ib3RJZHNcbiAqIFNldCByb2JvdCBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHJvYm90SWRzIGxpc3Qgb2Ygcm9ib3QgSWRzXG4gKiBHZXQgcm9ib3QgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiByb2JvdCBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUm9ib3RJZHMgPSBmdW5jdGlvbihyb2JvdElkcyl7XG5cdGlmKHJvYm90SWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnJvYm90ID0gcm9ib3RJZHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZWxzZVxuXHRcdHJldHVybiB0aGlzLmRhdGFDb25maWcuY3JpdGVyaWEucm9ib3Q7XG59O1xuLyoqXG4gKiBEZXBlbmRzIG9uIHBsYWNlSWRzIC8vIG5vdCByZWxldmFudD8sIG5vdCBpbXBsZW1lbnRlZCB5ZXRcbiAqIFNldCBwbGFjZSBjcml0ZXJpYS5cbiAqXHRAcGFyYW0ge0FycmF5W0ludF19IHBsYWNlSWRzIGxpc3Qgb2YgcGxhY2UgSWRzXG4gKiBHZXQgcGxhY2UgY3JpdGVyaWEuXG4gKlx0QHJldHVybiB7QXJyYXlbSW50XX0gbGlzdCBvZiBwbGFjZSBJZHNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5EYXRhUGxhY2VJZHMgPSBmdW5jdGlvbihwbGFjZUlkcyl7XG5cdGlmKHBsYWNlSWRzKSB7XG5cdFx0dGhpcy5kYXRhQ29uZmlnLmNyaXRlcmlhLnBsYWNlSWQgPSBwbGFjZUlkcztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRlbHNlXG5cdFx0cmV0dXJuIHRoaXMuZGF0YUNvbmZpZy5jcml0ZXJpYS5wbGFjZTtcbn07XG4vKipcbiAqIEdldCBkYXRhIGJ5IHNlbnNvciBuYW1lLlxuICpcdEBwYXJhbSB7QXJyYXlbU3RyaW5nXX0gc2Vuc29yTmFtZSBsaXN0IG9mIHNlbnNvcnNcbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5nZXREYXRhQnlOYW1lID0gZnVuY3Rpb24oc2Vuc29yTmFtZXMpe1xuXHR2YXIgZGF0YT1bXTtcblx0Zm9yKHZhciBuIGluIHNlbnNvck5hbWVzKSB7XG5cdFx0ZGF0YS5wdXNoKHRoaXMuZGF0YU1vZGVsW3NlbnNvck5hbWVzW25dXSk7XG5cdH1cblx0cmV0dXJuIGRhdGE7XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byBlcnJvci9zdGF0dXMgdXBkYXRlc1xuICovXG5TdGF0dXMucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24ocm9ib3ROYW1lcywgY2FsbGJhY2spe1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKHJvYm90TmFtZXMpO1xuXG5cdHZhciBzdWJzID0gdGhpcy5zZWxlY3Rvci5zdWJzY3JpYmUoe1xuXHRcdHNlcnZpY2U6ICdzdGF0dXMnLFxuXHRcdGZ1bmM6ICdTdGF0dXMnLFxuXHRcdGRhdGE6IHJvYm90TmFtZXNcblx0fSwgZnVuY3Rpb24gKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cocGVlcklkKTtcblx0XHQvLyBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdGlmIChlcnIgfHwgKGRhdGEmJmRhdGEuZXJyJmRhdGEuZXJyLnN0KSApIHtcblx0XHRcdExvZ2dlci5lcnJvciggXCJTdGF0dXNTdWJzY3JpYmU6XCIrKGVycj9lcnI6XCJcIikrXCJcXG5cIisoZGF0YSYmZGF0YS5lcnI/ZGF0YS5lcnI6XCJcIikgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoZGF0YSAmJiBkYXRhLmhlYWRlclxuXHRcdFx0ICAgJiYgZGF0YS5oZWFkZXIudHlwZSA9PT0gXCJpbml0XCIpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGlzYXRpb24gb2Ygcm9ib3QgbW9kZWxcblx0XHRcdFx0dGhhdC5yb2JvdE1vZGVsSW5pdCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGlmKHRoYXQucm9ib3RNb2RlbEluaXQpIHtcblx0XHRcdFx0dGhhdC5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2MihkYXRhKTtcblx0XHRcdFx0aWYodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHRcdGNhbGxiYWNrKHRoYXQucm9ib3RNb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gRXJyb3Jcblx0XHRcdFx0TG9nZ2VyLmVycm9yKFwiUm9ib3QgbW9kZWwgaGFzIG5vdCBiZWVuIGluaXRpYWxpc2VkLCBjYW5ub3QgYmUgdXBkYXRlZFwiKTtcblx0XHRcdFx0Ly8vIFRPRE8gdW5zdWJzY3JpYmVcblx0XHRcdH1cblx0XHR9XG5cdH0sIHsgYXV0bzogdHJ1ZSB9KTtcblx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3Vicyk7XG59O1xuXG4vKipcbiAqIENsb3NlIGFsbCBzdWJzY3JpcHRpb25zXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuY2xvc2VTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oKXtcblx0Zm9yKHZhciBpIGluIHRoaXMuc3Vic2NyaXB0aW9ucykge1xuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc1tpXS5jbG9zZSgpO1xuXHR9XG5cdHRoaXMuc3Vic2NyaXB0aW9ucyA9W107XG59O1xuXG5cbi8qKlxuICogR2V0IGRhdGEgZ2l2ZW4gZGF0YUNvbmZpZy5cbiAqIEBwYXJhbSB7ZnVuY30gY2FsbGJhY2sgOiBjYWxsZWQgYWZ0ZXIgdXBkYXRlXG4gKiBUT0RPIFVTRSBQUk9NSVNFXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBkYXRhQ29uZmlnKXtcblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGRhdGFNb2RlbCA9IHt9O1xuXHRpZihkYXRhQ29uZmlnKVxuXHRcdHRoaXMuRGF0YUNvbmZpZyhkYXRhQ29uZmlnKTtcblx0Ly8gY29uc29sZS5sb2coXCJSZXF1ZXN0OiBcIitKU09OLnN0cmluZ2lmeShkYXRhQ29uZmlnKSk7XG5cdHRoaXMuc2VsZWN0b3IucmVxdWVzdCh7XG5cdFx0c2VydmljZTogXCJzdGF0dXNcIixcblx0XHRmdW5jOiBcIkRhdGFSZXF1ZXN0XCIsXG5cdFx0ZGF0YToge1xuXHRcdFx0dHlwZTpcInNwbFJlcVwiLFxuXHRcdFx0ZGF0YUNvbmZpZzogdGhhdC5kYXRhQ29uZmlnXG5cdFx0fVxuXHR9LCBmdW5jdGlvbihkbklkLCBlcnIsIGRhdGEpe1xuXHRcdGlmKGVycikge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiW1wiK3RoYXQuZGF0YUNvbmZpZy5zZW5zb3JzK1wiXSBSZWN2IGVycjogXCIrSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmKGRhdGEuaGVhZGVyLmVycm9yKSB7XG5cdFx0XHQvLyBUT0RPIDogY2hlY2svdXNlIGVyciBzdGF0dXMgYW5kIGFkYXB0IGJlaGF2aW9yIGFjY29yZGluZ2x5XG5cdFx0XHRMb2dnZXIuZXJyb3IoXCJVcGRhdGVEYXRhOlxcblwiK0pTT04uc3RyaW5naWZ5KGRhdGEuaGVhZGVyLnJlcUNvbmZpZykpO1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiRGF0YSByZXF1ZXN0IGZhaWxlZCAoXCIrZGF0YS5oZWFkZXIuZXJyb3Iuc3QrXCIpOiBcIitkYXRhLmhlYWRlci5lcnJvci5tc2cpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL0xvZ2dlci5sb2coSlNPTi5zdHJpbmdpZnkodGhhdC5kYXRhTW9kZWwpKTtcblx0XHRkYXRhTW9kZWwgPSB0aGF0Ll9nZXREYXRhTW9kZWxGcm9tUmVjdihkYXRhKTtcblxuXHRcdExvZ2dlci5sb2codGhhdC5nZXREYXRhTW9kZWwoKSk7XG5cblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhhdCk7IC8vIGJpbmQgY2FsbGJhY2sgd2l0aCBTdGF0dXNcblx0XHRjYWxsYmFjayhkYXRhTW9kZWwpOyAvLyBjYWxsYmFjayBmdW5jXG5cdH0pO1xufTtcblxuXG4vKipcbiAqIFVwZGF0ZSBpbnRlcm5hbCByb2JvdCBtb2RlbCB3aXRoIHJlY2VpdmVkIGRhdGEgKHZlcnNpb24gMilcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIHJlY2VpdmVkIGZyb20gRGl5YU5vZGUgYnkgd2Vic29ja2V0XG4gKiBAcmV0dXJuIHtbdHlwZV19XHRcdFtkZXNjcmlwdGlvbl1cbiAqL1xuU3RhdHVzLnByb3RvdHlwZS5fZ2V0Um9ib3RNb2RlbEZyb21SZWN2MiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cdHZhciBkYXRhUm9ib3RzID0gZGF0YS5yb2JvdHM7XG5cdHZhciBkYXRhUGFydHMgPSBkYXRhLnBhcnRMaXN0O1xuXG5cdGlmKCF0aGlzLnJvYm90TW9kZWwpXG5cdFx0dGhpcy5yb2JvdE1vZGVsID0gW107XG5cdC8vIGNvbnNvbGUubG9nKFwiX2dldFJvYm90TW9kZWxGcm9tUmVjdlwiKTtcblx0Ly8gY29uc29sZS5sb2codGhpcy5yb2JvdE1vZGVsKTtcblxuXHRmb3IodmFyIG4gaW4gdGhpcy5yb2JvdE1vZGVsKSB7XG5cdFx0Ly8gY29uc29sZS5sb2cobik7XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzID0ge307IC8vIHJlc2V0IHBhcnRzXG5cdH1cblxuXHRmb3IodmFyIG4gaW4gZGF0YVJvYm90cykge1xuXHRcdGlmKCF0aGlzLnJvYm90TW9kZWxbbl0pXG5cdFx0XHR0aGlzLnJvYm90TW9kZWxbbl09e307XG5cdFx0dGhpcy5yb2JvdE1vZGVsW25dLnJvYm90ID0gZGF0YVJvYm90c1tuXS5yb2JvdDtcblxuXHRcdC8vIGlmKHRoaXMucm9ib3RNb2RlbC5sZW5ndGg8ZGF0YS5sZW5ndGgpIHtcblx0XHQvLyBcdHRoaXMucm9ib3RNb2RlbC5wdXNoKHtyb2JvdDogZGF0YVswXS5yb2JvdHN9KTtcblx0XHQvLyB9XG5cblx0XHQvKiogZXh0cmFjdCBwYXJ0cyBpbmZvICoqL1xuXHRcdGlmKGRhdGFSb2JvdHNbbl0gJiYgZGF0YVJvYm90c1tuXS5wYXJ0cykge1xuXHRcdFx0dmFyIHBhcnRzID0gZGF0YVJvYm90c1tuXS5wYXJ0cztcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cyA9IHt9O1xuXHRcdFx0dmFyIHJQYXJ0cyA9IHRoaXMucm9ib3RNb2RlbFtuXS5wYXJ0cztcblx0XHRcdC8vIGZvcih2YXIgcSBpbiByUGFydHMpIHtcblx0XHRcdC8vIFx0LyoqIHBhcnRbcV0gd2FzIG5vdCBzZW50IGJlY2F1c2Ugbm8gZXJyb3IgKiovXG5cdFx0XHQvLyBcdGlmKCFwYXJ0c1txXVxuXHRcdFx0Ly8gXHQgICAmJnJQYXJ0c1txXS5ldnRzJiZyUGFydHNbcV0uZXZ0cy5jb2RlKSB7XG5cdFx0XHQvLyBcdFx0clBhcnRzW3FdLmV2dHMgPSB7XG5cdFx0XHQvLyBcdFx0XHRjb2RlOiAwLFxuXHRcdFx0Ly8gXHRcdFx0Y29kZVJlZjogMCxcblx0XHRcdC8vIFx0XHRcdHRpbWU6IERhdGUubm93KCkgLyoqIHVwZGF0ZSAqKi9cblx0XHRcdC8vIFx0XHR9O1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0XHRmb3IgKHZhciBwIGluIHBhcnRzKSB7XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PWRhdGFQYXJ0c1twXS5jYXRlZ29yeTtcblx0XHRcdFx0XHQvKiB1cGRhdGUgcGFydCBuYW1lICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLm5hbWU9ZGF0YVBhcnRzW3BdLm5hbWU7XG5cdFx0XHRcdFx0LyogdXBkYXRlIHBhcnQgbGFiZWwgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubGFiZWw9ZGF0YVBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIGRhdGFQYXJ0c1twXS5lcnJvckxpc3QgKVxuXHRcdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3RbZWxdKVxuXHRcdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0W2VsXSA9IGRhdGFQYXJ0c1twXS5lcnJvckxpc3RbZWxdO1xuXG5cdFx0XHRcdFx0clBhcnRzW3BdLmV2dHMgPSB7XG5cdFx0XHRcdFx0XHRjb2RlOiBwYXJ0c1twXS5jb2RlLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogcGFydHNbcF0uY29kZVJlZixcblx0XHRcdFx0XHRcdHRpbWU6IHBhcnRzW3BdLnRpbWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0c1twXS5lcnJvcik7XG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncGFydHMsIHJQYXJ0cycpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHMpO1xuIFx0XHQvLyBcdGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cblxuLyoqXG4gKiBVcGRhdGUgaW50ZXJuYWwgcm9ib3QgbW9kZWwgd2l0aCByZWNlaXZlZCBkYXRhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgZGF0YSByZWNlaXZlZCBmcm9tIERpeWFOb2RlIGJ5IHdlYnNvY2tldFxuICogQHJldHVybiB7W3R5cGVdfVx0XHRbZGVzY3JpcHRpb25dXG4gKi9cblN0YXR1cy5wcm90b3R5cGUuX2dldFJvYm90TW9kZWxGcm9tUmVjdiA9IGZ1bmN0aW9uKGRhdGEpe1xuXHR2YXIgcm9ib3Q7XG5cblx0aWYoIXRoaXMucm9ib3RNb2RlbClcblx0XHR0aGlzLnJvYm90TW9kZWwgPSBbXTtcblx0Ly8gY29uc29sZS5sb2coXCJfZ2V0Um9ib3RNb2RlbEZyb21SZWN2XCIpO1xuXHQvLyBjb25zb2xlLmxvZyh0aGlzLnJvYm90TW9kZWwpO1xuXG5cdC8qKiBPbmx5IG9uZSByb2JvdCBpcyBtYW5hZ2UgYXQgdGhlIHNhbWUgdGltZSBjdXJyZW50bHkgKiovXG5cdGZvcih2YXIgbiBpbiBkYXRhKSB7XG5cdFx0aWYoIXRoaXMucm9ib3RNb2RlbFtuXSlcblx0XHRcdHRoaXMucm9ib3RNb2RlbFtuXT17fTtcblx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucm9ib3QgPSBkYXRhW25dLnJvYm90O1xuXG5cdFx0Ly8gaWYodGhpcy5yb2JvdE1vZGVsLmxlbmd0aDxkYXRhLmxlbmd0aCkge1xuXHRcdC8vIFx0dGhpcy5yb2JvdE1vZGVsLnB1c2goe3JvYm90OiBkYXRhWzBdLnJvYm90c30pO1xuXHRcdC8vIH1cblxuXHRcdC8qKiBleHRyYWN0IHBhcnRzIGluZm8gKiovXG5cdFx0aWYoZGF0YVtuXSAmJiBkYXRhW25dLnBhcnRzKSB7XG5cdFx0XHRpZighdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzKVxuXHRcdFx0XHR0aGlzLnJvYm90TW9kZWxbbl0ucGFydHMgPSB7fTtcblx0XHRcdHZhciBwYXJ0cyA9IGRhdGFbbl0ucGFydHM7XG5cdFx0XHR2YXIgclBhcnRzID0gdGhpcy5yb2JvdE1vZGVsW25dLnBhcnRzO1xuXHRcdFx0Zm9yKHZhciBxIGluIHJQYXJ0cykge1xuXHRcdFx0XHQvKiogcGFydFtxXSB3YXMgbm90IHNlbnQgYmVjYXVzZSBubyBlcnJvciAqKi9cblx0XHRcdFx0aWYoIXBhcnRzW3FdXG5cdFx0XHRcdCAgICYmclBhcnRzW3FdLmV2dHMmJnJQYXJ0c1txXS5ldnRzLmNvZGUpIHtcblx0XHRcdFx0XHRyUGFydHNbcV0uZXZ0cyA9IHtcblx0XHRcdFx0XHRcdGNvZGU6IFswXSxcblx0XHRcdFx0XHRcdGNvZGVSZWY6IFswXSxcblx0XHRcdFx0XHRcdHRpbWU6IFtEYXRlLm5vdygpXSAvKiogdXBkYXRlICoqL1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAodmFyIHAgaW4gcGFydHMpIHtcblx0XHRcdFx0aWYocGFydHNbcF0mJnBhcnRzW3BdLmVyciAmJiBwYXJ0c1twXS5lcnIuc3Q+MCkge1xuXHRcdFx0XHRcdExvZ2dlci5lcnJvcihcIlBhcnRzIFwiK3ArXCIgd2FzIGluIGVycm9yOiBcIitkYXRhW3BdLmVyci5tc2cpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyUGFydHNbcF0pIHtcblx0XHRcdFx0XHRyUGFydHNbcF09e307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocGFydHNbcF0pIHtcblx0XHRcdFx0XHQvLyBMb2dnZXIubG9nKG4pO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGNhdGVnb3J5ICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmNhdGVnb3J5PXBhcnRzW3BdLmNhdGVnb3J5O1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IG5hbWUgKi9cblx0XHRcdFx0XHRyUGFydHNbcF0ubmFtZT1wYXJ0c1twXS5uYW1lO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBwYXJ0IGxhYmVsICovXG5cdFx0XHRcdFx0clBhcnRzW3BdLmxhYmVsPXBhcnRzW3BdLmxhYmVsO1xuXHRcdFx0XHRcdC8qIHVwZGF0ZSBlcnJvciB0aW1lICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0pO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzW3BdLmVycm9ycy50aW1lKTtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0udGltZSk7XG5cdFx0XHRcdFx0LyogdXBkYXRlIGVycm9yICovXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cocGFydHNbcF0uZXJyb3JzLmNvZGUpO1xuXG5cdFx0XHRcdFx0LyoqIHVwZGF0ZSBlcnJvckxpc3QgKiovXG5cdFx0XHRcdFx0aWYoIXJQYXJ0c1twXS5lcnJvckxpc3QpXG5cdFx0XHRcdFx0XHRyUGFydHNbcF0uZXJyb3JMaXN0PXt9O1xuXHRcdFx0XHRcdGZvciggdmFyIGVsIGluIHBhcnRzW3BdLmVycm9yTGlzdCApXG5cdFx0XHRcdFx0XHRpZighclBhcnRzW3BdLmVycm9yTGlzdFtlbF0pXG5cdFx0XHRcdFx0XHRcdHJQYXJ0c1twXS5lcnJvckxpc3RbZWxdID0gcGFydHNbcF0uZXJyb3JMaXN0W2VsXTtcblxuXHRcdFx0XHRcdHJQYXJ0c1twXS5ldnRzID0ge1xuXHRcdFx0XHRcdFx0Y29kZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGUpLFxuXHRcdFx0XHRcdFx0Y29kZVJlZjogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLmNvZGVSZWYpLFxuXHRcdFx0XHRcdFx0dGltZTogdGhpcy5fY29kZXIuZnJvbShwYXJ0c1twXS5ldnRzLnRpbWUpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhyUGFydHNbcF0uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3BhcnRzLCByUGFydHMnKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHBhcnRzKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJQYXJ0cyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0TG9nZ2VyLmVycm9yKFwiTm8gcGFydHMgdG8gcmVhZCBmb3Igcm9ib3QgXCIrZGF0YVtuXS5uYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKiBjcmVhdGUgU3RhdHVzIHNlcnZpY2UgKiovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLlN0YXR1cyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBuZXcgU3RhdHVzKHRoaXMpO1xufTtcblxuLyoqXG4gKiBTZXQgb24gc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGZpbmQgc3RhdHVzIHRvIG1vZGlmeVxuICogQHBhcmFtIHBhcnROYW1lIFx0dG8gZmluZCBzdGF0dXMgdG8gbW9kaWZ5XG4gKiBAcGFyYW0gY29kZVx0XHRuZXdDb2RlXG4gKiBAcGFyYW0gc291cmNlXHRcdHNvdXJjZVxuICogQHBhcmFtIGNhbGxiYWNrXHRcdHJldHVybiBjYWxsYmFjayAoPGJvb2w+c3VjY2VzcylcbiAqL1xuRGl5YVNlbGVjdG9yLnByb3RvdHlwZS5zZXRTdGF0dXMgPSBmdW5jdGlvbihyb2JvdE5hbWUsIHBhcnROYW1lLCBjb2RlLCBzb3VyY2UsIGNhbGxiYWNrKSB7XG5cdHZhciBmdW5jTmFtZSA9IFwiU2V0U3RhdHVzX1wiK3BhcnROYW1lO1xuXHR0aGlzLnJlcXVlc3QoXG5cdFx0e3NlcnZpY2U6XCJzdGF0dXNcIixmdW5jOmZ1bmNOYW1lLGRhdGE6IHtyb2JvdE5hbWU6IHJvYm90TmFtZSwgc3RhdHVzQ29kZTogY29kZSwgcGFydE5hbWU6IHBhcnROYW1lLCBzb3VyY2U6IHNvdXJjZXwxfX0sIGZ1bmN0aW9uKHBlZXJJZCwgZXJyLCBkYXRhKSB7XG5cdFx0XHRpZihlcnIpIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2sodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG59O1xuXG4vKipcbiAqIEdldCBvbmUgc3RhdHVzXG4gKiBAcGFyYW0gcm9ib3ROYW1lIHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBwYXJ0TmFtZSBcdHRvIGdldCBzdGF0dXNcbiAqIEBwYXJhbSBjYWxsYmFja1x0XHRyZXR1cm4gY2FsbGJhY2soLTEgaWYgbm90IGZvdW5kL2RhdGEgb3RoZXJ3aXNlKVxuICogQHBhcmFtIF9mdWxsIFx0bW9yZSBkYXRhIGFib3V0IHN0YXR1c1xuICovXG5EaXlhU2VsZWN0b3IucHJvdG90eXBlLmdldFN0YXR1cyA9IGZ1bmN0aW9uKHJvYm90TmFtZSwgcGFydE5hbWUsIGNhbGxiYWNrLCBfZnVsbCkge1xuXHR2YXIgZnVsbD1fZnVsbHx8ZmFsc2U7XG5cdHRoaXMucmVxdWVzdChcblx0XHR7c2VydmljZTpcInN0YXR1c1wiLGZ1bmM6XCJHZXRTdGF0dXNcIixkYXRhOiB7cm9ib3ROYW1lOiByb2JvdE5hbWUsIHBhcnROYW1lOiBwYXJ0TmFtZSwgZnVsbDogZnVsbH19LCBmdW5jdGlvbihwZWVySWQsIGVyciwgZGF0YSkge1xuXHRcdFx0aWYoZXJyKSB7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjaygtMSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYoY2FsbGJhY2spIGNhbGxiYWNrKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcbiIsIi8qIG1heWEtY2xpZW50XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFBhcnRuZXJpbmcgUm9ib3RpY3MsIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGxpYnJhcnkgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yXG4gKiBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljXG4gKiBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyB2ZXJzaW9uXG4gKlx0My4wIG9mIHRoZSBMaWNlbnNlLiBUaGlzIGxpYnJhcnkgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGVcbiAqIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuXG4gKiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFLiBTZWUgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpY1xuICogTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgbGlicmFyeS5cbiAqL1xuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgY2hhbm5lbCBlbmNvZGluZ1xuICogLSBiYXNlNjQgY29kaW5nXG4gKiAtIG5vbmVcbiAqIERhdGEgZm9ybWF0IDpcbiAqXHRcdHQ6IHsnYjY0Jywnbm9uZSd9XG4gKlx0XHRiOiA8aWYgYjY0PiB7NCw4fVxuICpcdFx0ZDogZW5jb2RlZCBkYXRhIHtidWZmZXIgb3IgQXJyYXl9XG4gKlx0XHRzOiBzaXplXG4gKi9cblxuXG52YXIgRGl5YVNlbGVjdG9yID0gcmVxdWlyZSgnLi4vLi4vRGl5YVNlbGVjdG9yJykuRGl5YVNlbGVjdG9yO1xudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2UtNjQnKTtcblxuLyoqXG4gKiBEZWZhdWx0IDogbm8gZW5jb2RpbmdcbiAqIEVmZmVjdGl2ZSBmb3Igc3RyaW5nIGJhc2VkIGNoYW5uZWxzIChsaWtlIEpTT04gYmFzZWQgV1MpXG4gKiAqL1xuZnVuY3Rpb24gTm9Db2RpbmcoKXtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQ29udmVydCBidWZmZXIgY29kZWQgaW4gYmFzZTY0IGFuZCBjb250YWluaW5nIG51bWJlcnMgY29kZWQgYnlcbiogYnl0ZUNvZGluZyBieXRlcyBpbnRvIGFycmF5XG4qIEBwYXJhbSBidWZmZXIgaW4gYmFzZTY0XG4qIEBwYXJhbSBieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBudW1iZXIgKDQgb3IgOClcbiogQHJldHVybiBhcnJheSBvZiBmbG9hdCAoMzIgb3IgNjQpLiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24oZGF0YSkge1xuXHRyZXR1cm4gZGF0YS5kO1xufTtcblxuLyoqXG4qIENvbnZlcnQgYXJyYXkgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5IGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBidWZmZXIgY29kZWQgaW4gYmFzZTY0XG4qIEBwYXJhbSBcdHtBcnJheTxGbG9hdD59IFx0YXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0IGJpdHMpXG4qIEBwYXJhbSBcdHtpbnRlZ2VyfSBcdGJ5dGVDb2RpbmcgbnVtYmVyIG9mIGJ5dGVzIGZvciBlYWNoIGZsb2F0ICg0IG9yIDgpXG4qIEByZXR1cm4gIFx0e1N0cmluZ30gXHRidWZmZXIgaW4gYmFzZTY0LiBudWxsIGlmIGNvdWxkIG5vdCBjb252ZXJ0LlxuKi9cbk5vQ29kaW5nLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uKGFycmF5KSB7XG5cdHJldHVybiB7XG5cdFx0dDogJ25vJywgLyogdHlwZSAqL1xuXHRcdGQ6IGFycmF5LCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoXG5cdH07XG59O1xuXG5cblxuXG4vKipcbiAqIE1hbmFnZW1lbnQgb2YgYmFzZTY0IGVuY29kaW5nXG4gKiBFZmZlY3RpdmUgZm9yIHN0cmluZyBiYXNlZCBjaGFubmVscyAobGlrZSBKU09OIGJhc2VkIFdTKVxuICogKi9cbmZ1bmN0aW9uIEJhc2U2NENvZGluZygpe1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgICBVdGlsaXR5IGZ1bmN0aW9ucyAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qXFxcbiB8KnxcbiB8KnwgIHV0aWxpdGFpcmVzIGRlIG1hbmlwdWxhdGlvbnMgZGUgY2hhw65uZXMgYmFzZSA2NCAvIGJpbmFpcmVzIC8gVVRGLThcbiB8KnxcbiB8KnwgIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvRMOpY29kZXJfZW5jb2Rlcl9lbl9iYXNlNjRcbiB8KnxcbiBcXCovXG4vKiogRGVjb2RlciB1biB0YWJsZWF1IGQnb2N0ZXRzIGRlcHVpcyB1bmUgY2hhw65uZSBlbiBiYXNlNjQgKi9cbnZhciBiNjRUb1VpbnQ2ID0gZnVuY3Rpb24obkNocikge1xuXHRyZXR1cm4gbkNociA+IDY0ICYmIG5DaHIgPCA5MSA/XG5cdFx0bkNociAtIDY1XG5cdFx0OiBuQ2hyID4gOTYgJiYgbkNociA8IDEyMyA/XG5cdFx0bkNociAtIDcxXG5cdFx0OiBuQ2hyID4gNDcgJiYgbkNociA8IDU4ID9cblx0XHRuQ2hyICsgNFxuXHRcdDogbkNociA9PT0gNDMgP1xuXHRcdDYyXG5cdFx0OiBuQ2hyID09PSA0NyA/XG5cdFx0NjNcblx0XHQ6XHQwO1xufTtcblxuLyoqXG4gKiBEZWNvZGUgYmFzZTY0IHN0cmluZyB0byBVSW50OEFycmF5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNCYXNlNjRcdFx0YmFzZTY0IGNvZGVkIHN0cmluZ1xuICogQHBhcmFtICB7aW50fSBuQmxvY2tzU2l6ZSBzaXplIG9mIGJsb2NrcyBvZiBieXRlcyB0byBiZSByZWFkLiBPdXRwdXQgYnl0ZUFycmF5IGxlbmd0aCB3aWxsIGJlIGEgbXVsdGlwbGUgb2YgdGhpcyB2YWx1ZS5cbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9XHRcdFx0XHR0YWIgb2YgZGVjb2RlZCBieXRlc1xuICovXG52YXIgYmFzZTY0RGVjVG9BcnIgPSBmdW5jdGlvbihzQmFzZTY0LCBuQmxvY2tzU2l6ZSkge1xuXHR2YXJcblx0c0I2NEVuYyA9IHNCYXNlNjQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csIFwiXCIpLCBuSW5MZW4gPSBzQjY0RW5jLmxlbmd0aCxcblx0bk91dExlbiA9IG5CbG9ja3NTaXplID8gTWF0aC5jZWlsKChuSW5MZW4gKiAzICsgMSA+PiAyKSAvIG5CbG9ja3NTaXplKSAqIG5CbG9ja3NTaXplIDogbkluTGVuICogMyArIDEgPj4gMixcblx0YnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG5PdXRMZW4pLCB0YUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuXHRmb3IgKHZhciBuTW9kMywgbk1vZDQsIG5VaW50MjQgPSAwLCBuT3V0SWR4ID0gMCwgbkluSWR4ID0gMDsgbkluSWR4IDwgbkluTGVuOyBuSW5JZHgrKykge1xuXHRcdG5Nb2Q0ID0gbkluSWR4ICYgMzsgLyogbiBtb2QgNCAqL1xuXHRcdG5VaW50MjQgfD0gYjY0VG9VaW50NihzQjY0RW5jLmNoYXJDb2RlQXQobkluSWR4KSkgPDwgMTggLSA2ICogbk1vZDQ7XG5cdFx0aWYgKG5Nb2Q0ID09PSAzIHx8IG5JbkxlbiAtIG5JbklkeCA9PT0gMSkge1xuXHRcdFx0Zm9yIChuTW9kMyA9IDA7IG5Nb2QzIDwgMyAmJiBuT3V0SWR4IDwgbk91dExlbjsgbk1vZDMrKywgbk91dElkeCsrKSB7XG5cdFx0XHRcdHRhQnl0ZXNbbk91dElkeF0gPSBuVWludDI0ID4+PiAoMTYgPj4+IG5Nb2QzICYgMjQpICYgMjU1O1xuXHRcdFx0fVxuXHRcdFx0blVpbnQyNCA9IDA7XG5cdFx0fVxuXHR9XG5cdC8vIGNvbnNvbGUubG9nKFwidThpbnQgOiBcIitKU09OLnN0cmluZ2lmeSh0YUJ5dGVzKSk7XG5cdHJldHVybiBidWZmZXI7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLyAgIEludGVyZmFjZSBmdW5jdGlvbnMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuLyoqXG4qIENvbnZlcnQgYnVmZmVyIGNvZGVkIGluIGJhc2U2NCBhbmQgY29udGFpbmluZyBudW1iZXJzIGNvZGVkIGJ5XG4qIGJ5dGVDb2RpbmcgYnl0ZXMgaW50byBhcnJheVxuKiBAcGFyYW0gYnVmZmVyIGluIGJhc2U2NFxuKiBAcGFyYW0gYnl0ZUNvZGluZyBudW1iZXIgb2YgYnl0ZXMgZm9yIGVhY2ggbnVtYmVyICg0IG9yIDgpXG4qIEByZXR1cm4gYXJyYXkgb2YgZmxvYXQgKDMyIG9yIDY0KS4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdHZhciBieXRlQ29kaW5nID0gZGF0YS5iO1xuXG5cdC8qIGNoZWNrIGJ5dGUgY29kaW5nICovXG5cdGlmKGJ5dGVDb2RpbmcgIT09IDQgJiYgYnl0ZUNvZGluZyAhPT0gOCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyogZGVjb2RlIGRhdGEgdG8gYXJyYXkgb2YgYnl0ZSAqL1xuXHR2YXIgYnVmID0gYmFzZTY0RGVjVG9BcnIoZGF0YS5kLCBkYXRhLmIpO1xuXHQvKiBwYXJzZSBkYXRhIHRvIGZsb2F0IGFycmF5ICovXG5cdHZhciBmQXJyYXk9bnVsbDtcblx0c3dpdGNoKGRhdGEuYikge1xuXHRjYXNlIDQ6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0ZkFycmF5ID0gbmV3IEZsb2F0NjRBcnJheShidWYpO1xuXHRcdGJyZWFrO1xuXHRkZWZhdWx0OlxuXHRcdGNvbnNvbGUubG9nKFwiVW5leHBlY3RlZCBieXRlQ29kaW5nISBTaG91bGQgbm90IGhhcHBlbiEhXCIpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdC8qIHBhcnNlIGZBcnJheSBpbnRvIG5vcm1hbCBhcnJheSAqL1xuXHR2YXIgdGFiID0gW10uc2xpY2UuY2FsbChmQXJyYXkpO1xuXG5cdGlmKGRhdGEucyAhPT0gdGFiLmxlbmd0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwiU2l6ZSBtaXNtYXRjaCB3aGVuIGRlY29kaW5nICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHRhYjtcbn07XG5cbi8qKlxuKiBDb252ZXJ0IGFycmF5IGNvbnRhaW5pbmcgbnVtYmVycyBjb2RlZCBieSBieXRlQ29kaW5nIGJ5dGVzIGludG8gYnVmZmVyIGNvZGVkIGluIGJhc2U2NFxuKiBAcGFyYW0gXHR7QXJyYXk8RmxvYXQ+fSBcdGFycmF5IG9mIGZsb2F0ICgzMiBvciA2NCBiaXRzKVxuKiBAcGFyYW0gXHR7aW50ZWdlcn0gXHRieXRlQ29kaW5nIG51bWJlciBvZiBieXRlcyBmb3IgZWFjaCBmbG9hdCAoNCBvciA4KVxuKiBAcmV0dXJuICBcdHtTdHJpbmd9IFx0YnVmZmVyIGluIGJhc2U2NC4gbnVsbCBpZiBjb3VsZCBub3QgY29udmVydC5cbiovXG5CYXNlNjRDb2RpbmcucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIGJ5dGVDb2RpbmcpIHtcblx0LyogY2hlY2sgYnl0ZSBjb2RpbmcgKi9cblx0aWYoYnl0ZUNvZGluZyAhPT0gNCAmJiBieXRlQ29kaW5nICE9PSA4KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKioqIGNhc2UgQXJyYXlCdWZmZXIgKioqL1xuXHR2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGFycmF5Lmxlbmd0aCpieXRlQ29kaW5nKTtcblx0c3dpdGNoKGJ5dGVDb2RpbmcpIHtcblx0Y2FzZSA0OlxuXHRcdHZhciBidWYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblx0XHRidWYzMi5zZXQoYXJyYXkpO1xuXHRcdGJyZWFrO1xuXHRjYXNlIDg6XG5cdFx0dmFyIGJ1ZjY0ID0gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHRcdGJ1ZjY0LnNldChhcnJheSk7XG5cdFx0YnJlYWs7XG5cdH1cblx0dmFyIGJ1ZmZDaGFyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0dmFyIGJ1ZmZDaGFyQ29kZWQgPSBuZXcgQXJyYXkoYnVmZkNoYXIubGVuZ3RoKTtcblx0Zm9yKHZhciBuID0wOyBuPGJ1ZmZDaGFyLmxlbmd0aDsgbisrKSB7XG5cdFx0YnVmZkNoYXJDb2RlZFtuXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZkNoYXJbbl0pO1xuXHR9XG5cdHZhciBzdHIgPSBuZXcgU3RyaW5nKGJ1ZmZDaGFyQ29kZWQuam9pbignJykpO1xuXHR2YXIgYjY0QnVmZiA9IGJhc2U2NC5lbmNvZGUoc3RyKTtcblx0cmV0dXJuIHtcblx0XHR0OiAnYjY0JywgLyogdHlwZSAqL1xuXHRcdGI6IGJ5dGVDb2RpbmcsIC8qIGJ5dGVDb2RpbmcgKi9cblx0XHRkOiBiNjRCdWZmLCAvKiBkYXRhICovXG5cdFx0czogYXJyYXkubGVuZ3RoIC8qIHNpemUgKi9cblx0fTtcbn07XG5cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBvZiBjb21tIGVuY29kaW5nXG4gKiAqL1xuZnVuY3Rpb24gQ29kaW5nSGFuZGxlcigpe1xuXHR0aGlzLmI2NCA9IG5ldyBCYXNlNjRDb2RpbmcoKTtcblx0dGhpcy5ub25lID0gbmV3IE5vQ29kaW5nKCk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbihkYXRhKSB7XG5cdGlmKCFkYXRhIHx8IGRhdGE9PT1udWxsKVxuXHRcdHJldHVybiBudWxsO1xuXHRzd2l0Y2goZGF0YS50KSB7XG5cdGNhc2UgJ2I2NCc6XG5cdFx0cmV0dXJuIHRoaXMuYjY0LmZyb20oZGF0YSk7XG5cdGRlZmF1bHQ6XG5cdFx0cmV0dXJuIHRoaXMubm9uZS5mcm9tKGRhdGEpO1xuXHR9XG59O1xuXG5cbkNvZGluZ0hhbmRsZXIucHJvdG90eXBlLnRvID0gZnVuY3Rpb24oYXJyYXksIHR5cGUsIGJ5dGVDb2RpbmcpIHtcblx0aWYodHlwZW9mIGFycmF5ID09PSAnbnVtYmVyJykge1xuXHRcdGFycmF5PVthcnJheV07XG5cdH1cblx0aWYoIUFycmF5LmlzQXJyYXkoYXJyYXkpKXtcblx0XHRjb25zb2xlLmxvZyhcIkNvZGluZ0hhbmRsZXIudG8gb25seSBhY2NlcHRzIGFycmF5ICFcIik7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzd2l0Y2godHlwZSkge1xuXHRjYXNlICdiNjQnOlxuXHRcdHJldHVybiB0aGlzLmI2NC50byhhcnJheSwgYnl0ZUNvZGluZyk7XG5cdGNhc2UgJ25vJzpcblx0ZGVmYXVsdDpcblx0XHRyZXR1cm4gdGhpcy5ub25lLnRvKGFycmF5KTtcblx0fVxufTtcblxuXG4vKiogQWRkIGJhc2U2NCBoYW5kbGVyIHRvIERpeWFTZWxlY3RvciAqKi9cbkRpeWFTZWxlY3Rvci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIG5ldyBDb2RpbmdIYW5kbGVyKCk7XG59O1xuIl19
