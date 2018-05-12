/**
 *	commands/alma.js
 *	==========
 *	Displays the almanax of the day.
 */

// Load external modules
const almanax = require(`${basedir}/tools/almanax.js`);

// Local variables
var scraper = require(`${basedir}/tools/scraper`).init({
	host: config.almanax.host,
	path: config.almanax.path,
	port: 80,
	file: config.almanax.file,
	storage: `${basedir}/resources/almanax`
});

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	let date = new Date();

	if (args && args.length > 0) {
		date = new Date(`${date.getFullYear()}-${args[1] ? utils.pad(args[1], '0', 2) : utils.pad(date.getMonth() + 1, '0', 2)}-${args[0] ? utils.pad(args[0], '0', 2) : utils.pad(date.getDate(), '0', 2)}`);
	
		if (date.toString() === 'Invalid Date') {
			let err = new BotError(`Invalid date given`);
			return done(err);
		}
	}

	dateString = `${date.getFullYear()}-${utils.pad(date.getMonth() + 1, '0', 2)}-${utils.pad(date.getDate(), '0', 2)}`;
	scraper.path = `${config.almanax.path + dateString}`;
	scraper.file = `${config.almanax.file}_${dateString}`;
	almanax.extract(scraper, (err, description, reply) => {
		if (err) return done(err);
		return done(null, description, reply);
	});
}
