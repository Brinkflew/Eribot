/**
 *	commands/resume.js
 *	==========
 *	Resumes the vocal stream if it has been paused earlier.
 */

// Load external modules
const resume = require(`${basedir}/tools/music.js`).resume;

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	resume(client, message, (err, description, info) => {
		if (err) return done(err);
		return done(null, description, `
			Reprise de la lecture dans le channel "${info.channel}".
		`);
	});
}
