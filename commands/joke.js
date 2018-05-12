/**
 *	commands/joke.js
 *	==========
 *	Tells a randomly chosen (bad) joke.
 */

// Load external modules
const joker = require(`${basedir}/tools/joker.js`);

/**
 *	Runs the command
 *	@param  client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {

	if (args[0] === 'count') {
		joker.count((err, description, reply) => {
			if (err) return done(err);
			return done(null, description, reply);
		});
	} else if (!args[0] || !isNaN(args[0])) {
		joker.tell(args, (err, description, reply) => {
			if (err) return done(err);
			return done(null, description, reply);
		});
	} else {
		let err = new BotError(`Wrong data type for args[0]`);
		return done(err);
	}
}
