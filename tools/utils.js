/**
 *	tools/utils.js
 *	==========
 *	Collection of useful tools that can be used for diverse reasons.
 */

// Load external modules
const fs = require('fs');

/**
 *	Adds leading characters to a string.
 *	@param string {String}
 *	@param char {char}
 *	@param length {int}
 */
exports.pad = (string, char, length) => {
	return `${char.repeat(Math.max(0, length - string.toString().length))}${string}`;
}

/**
 *	Randomly chooses an integer between two inclusive values.
 *	@param {low} The minimum value (inclusive)
 *	@param {high} The maximum value (exclusive)
 */
exports.random = (low, high) => {
	return Math.floor(Math.random() * (high - low) + low);
}

/**
 *	Calculates the likelihood of an event occuring based on a percentage.
 *	@param percentage {int}
 */
exports.likelihood = (percentage) => {
	percentage = percentage || 50;
	let chance = utils.random(0, 100) <= percentage
		? true
		: false;
	return chance;
}

/**
 *	Prints the author of a Discord message in a readable way, consisting in
 *	printing its username followed by its Discord discriminator.
 *	@param message {Message}
 */
exports.username = (message) => {
	return `${message.author.username}#${message.author.discriminator}`;
}

/**
 *	Prints the name of the guild in which a message has been sent.
 *	@param message {Message}
 */
exports.guildname = (message) => {
	return `${message.guild.name}#${message.guild.id}`;
}

/**
 *	Sends a picture of veggie dick whith a random quote.
 *	@param directory {String}
 *	@param done {function}
 */
exports.randomFile = (directory, done) => {

	fs.readdir(directory, (err, files) => {

		if (err) {
			let err = new BotError(`Unable to read directory "${directory}"`);
			return done(err);
		}

		return done(null, files[utils.random(0, files.length)]);
	});
}

/**
 *	Cleans up the process on exit.
 *	@param client {Client}
 */
exports.cleanup = (client) => {
	logger.warn(`Caught SIGNAL INTERRUPT, ending process...`);

	rmRecur(`${basedir}/temp`);
	rmRecur(`${basedir}/resources/portals`);

	client.destroy().then(() => {
		setTimeout(() => {
			process.kill(process.pid);
		}, 100);
	});
}

/**
 *	Recursively delete all files in a directory.
 *	@param directory {String}
 */
var rmRecur = (directory) => {
	fs.readdir(directory, (err, files) => {
		if (err) return;
		files.forEach((file) => {
			fs.unlink(`${directory}/${file}`, (err) => {
				if (err) return;
			});
		});
		fs.rmdir(directory, (err) => {
			if (err) return;
		});
	});
}
