/**
 *	commands/queue.js
 *	==========
 *	Displays the current state of the musical playlist, including a full list
 *	of the musics remaining to be played.
 */

// Load external modules
const queue = require(`${basedir}/tools/music.js`).queue;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	queue(client, message, (err, description, info) => {
		if (err) return done(err);

		let reply = {
			embed: {
				color: config.colors.erib,
				title: info.title,
				description: info.description
			}
		};

		return done(null, description, reply);
	});
}
