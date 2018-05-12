/**
 *	commands/portal.js
 *	==========
 *	Displays information about a portal to a divine dimension.
 */

// Load external modules
const portal = require(`${basedir}/tools/portal.js`);

// Local variables
var scraper = require(`${basedir}/tools/scraper`).init({
	host: config.portals.host,
	path: config.portals.path,
	port: 80,
	file: config.portals.file,
	storage: `${basedir}/resources/portals`
});

/**
 *	Run the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {
	if (!args && args.length < 0) {
		let err = new BotError(
			`No dimension provided, unable to find portal position`
		);
		return done(err);
	}
	
	if (!/\b(xel|sram|eca|enu)\b/ig.test(args[0])) {
		let err = new BotError(`Unknown dimension provided, unable to find portal position`);
		return done(err);
	}
		
	dimension = args[0];
	scraper.path = `${config.portals.path + config.portals.server}`;
	scraper.file = `${config.portals.file}_${args[0]}`;
	portal.extract(scraper, (err, description, reply) => {
		if (err) return done(err);
		return done(null, description, reply);
	});
}
