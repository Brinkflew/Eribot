/**
 *	commands/ted.js
 *	==========
 *	Says hello on behalf of Ted, Brebs' cat.
 */

// Load strings
const ted = require(`${basedir}/lang/fr/strings.json`).ted;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	let reply = ted[utils.random(0, ted.length)];
	return done(null, null, reply);
}
