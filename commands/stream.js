/**
 *	commands/stream.js
 *	==========
 *	Adds a music from YouTube to the music queue and starts streaming the queue
 *	if this is the first music to be added.
 */

// Load external modules
const stream = require(`${basedir}/tools/music.js`).stream;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	let source = args.join(' ');
	stream(client, message, source, (err, description, info) => {
		if (err) return done(err);
		let reply = {
			embed: {
				color: config.colors.erib,
				title: `Musique ajoutée en position #${info.position}`,
				thumbnail: { url: info.thumbnail },
				description: `${info.title} [ ${info.duration} ]`
			}
		};

		return done(null, description, reply);
	});
}
