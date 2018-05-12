/**
 *	events/ready.js
 *	==========
 *	Log information when starting and initializing the process.
 */

// Load external modules
const fs = require('fs');
const news = require(`${basedir}/tools/news.js`);

// Local variables
const directories = [
	`resources`,
	`resources/almanax`,
	`resources/portals`,
	`resources/pictures`,
	`resources/news`,
	`temp`
];

/**
 *	Print information relative to starting the process.
 *	@param client {Client}
 */
exports.run = (client) => {
	logger.info(`Initializing working directories...`);

	directories.forEach((directory, index) => {

		directory = `${basedir}/${directory}`;

		fs.mkdir(directory, (err) => {
			if (err) {
				err = new BotError(`Directory "${directory}" already exists`);
				return logger.error(err);
			}
		});
	});

	logger.ok(`Successfully initialized working directories`);
	logger.info(`Setting client status...`);

	if (config.testing) {
		client.user.setStatus('invisible');
	} else {
		client.user.setStatus('online');
		client.user.setGame(`${config.prefix}help pour l'aide`);
	}

	logger.info(`Status set to "${client.user.presence.status}"`);
	
	let guilds = [];
		
	client.guilds.forEach(guild => { 
		guilds.push(`\t${guild.name} -  ${guild.members.size} user${guild.members.size > 1 ? 's' : ''} in ${guild.channels.size} channel${guild.channels.size > 1 ? 's' : ''}`);
	});

	logger.ok(`Bot ready in ${client.channels.size} channel${client.channels.size > 1 ? 's' : ''} on ${client.guilds.size} guild${client.guilds.size > 1 ? 's' : ''}, for a total of ${client.users.size} user${client.users.size > 1 ? 's' : ''}\n${guilds.join('\n')}`);

	setInterval(news.run, 1000 * 60 * 15, client, (err, description, reply) => {
		logger.info(`Fetching last news from ${config.news.host + config.news.path}...`);
		if (err) return logger.error(err);
		logger.info(description);
		client.guilds.forEach(guild => {
			guild.channels.get(config.channels.text.general).send(reply);
		});
	});
}
