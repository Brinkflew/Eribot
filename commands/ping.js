/**
 *	commands/ping.js
 *	==========
 *	Replies to the message with "Pong!" and indicates the time between the 
 *	creation of the message and its reception by the bot.
 */

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	let diff = Math.abs(Date.now() - message.createdAt);
	return done(null, null, { embed: {
		color: config.colors.erib,
		description: `${message.author.toString()}, pong ! (${diff}ms)`
	}});
}
