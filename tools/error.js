/**
 *	tools/error.js
 *	==========
 *	Handle error messages and map messages to readable names.
 */

/**
 *	Custom error handler.
 *	@param message {String}
 *	@param code {int}
 */
function BotError(message, code) {
	this.name = 'BotError';
	this.message = message;
	this.code = code || 1;
	this.stack = (new Error()).stack;
}

// Extend the initial Error class
BotError.prototype = new Error;

module.exports = BotError;
