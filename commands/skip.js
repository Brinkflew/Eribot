/**
 *	commands/skip.js
 *	==========
 *	Skips a music in the music queue. By default, skips the first music in the
 *	queue, which is generally the one being currently streamed. If a number is
 *	given in args, skips the music in that position.
 */

// Load external modules
const skip = require(`${basedir}/tools/music.js`).skip;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	skip(client, message, args, (err, description, info) => {
		if (err) return done(err);

		let reply = {
			embed: {
				color: config.colors.erib,
				title: `Lecture annulée avec succès`,
				thumbnail: { url: info.thumbnail },
				description: `${info.title} [ ${info.duration} ] en position #${info.position}`
			}
		};

		return done(null, description, reply);
	});
}
