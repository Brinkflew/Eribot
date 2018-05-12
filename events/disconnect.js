/**
 *	events/disconnect.js
 *	==========
 *	Log information when exiting the process.
 */

/**
 *	Print information relative to exiting the process.
 *	@param client {Client}
 */
exports.run = (client) => {
	logger.ok(`Successfully logged out of ${client.guilds.size} guild${client.guilds.size > 1 ? 's' : ''}\n`);
}
