/**
 *	commands/resume.js
 *	==========
 *	Pauses the vocal stream if it is currently streaming.
 */

// Load external modules
const pause = require(`${basedir}/tools/music.js`).pause;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	pause(client, message, (err, description, info) => {
		if (err) return done(err);
		return done(null, description, `
			Lecture en pause dans le channel "${info.channel}".
		`);
	});
}
