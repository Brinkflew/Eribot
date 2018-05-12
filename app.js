/**
 *	app.js
 *	==========
 *	A Discord bot for the guild Eriboux in Dofus, server Brumen.
 *	Author: Brinkflew <antoine.van-serveyt@hotmail.be>
 */

// Initial directory configuration
global.basedir = __dirname;

// Load the discord.js module
const Discord = require('discord.js');
const client = new Discord.Client();

// Load external modules
const fs = require('fs');
global.BotError = require(`${basedir}/tools/error.js`);
global.utils = require(`${basedir}/tools/utils.js`);
global.config = require(`${basedir}/config/config.json`);
global.logger = require(`${basedir}/tools/logger.js`);
global.langdir = `${basedir}/lang/${config.language}/`;

// Local variables
const eventdir = `${basedir}/events/`;

// Reads the /events/ folder and attaches each event file
// to the appropriate event	
fs.readdir(eventdir, (err, files) => {
	
	if (err) {
		return logger.error(`An error occured while reading directory /events/`);
	}

	logger.info(`Mapping events...`);

	files.forEach((file) => {
		let event = {};
		event.method = require(`${eventdir}${file}`);
		event.name = file.split('.')[0];
		client.on(event.name, (...args) => event.method.run(client, ...args));
		logger.info(`Successfully mapped "${event.name}" event`);
	});

	logger.ok(`Successfully mapped all events`);
});

// Handle SIGINT (Signal Interrupt)
// For Windows, create a ReadLine interface
if (process.platform === 'win32') {
	var rl = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('SIGINT', () => {
		process.emit('SIGINT');
	});
}

// Graceful shutdown
process.on('SIGINT', () => {
	utils.cleanup(client);
});

process.on('exit', (code) => {
	logger.info(`Process exited with code ${code}`);
});


// Log the bot in
logger.blank();
logger.info('Starting process...');
logger.info(`App running on ${process.platform} ${process.arch}`);
logger.debug(`App running in test mode`);
logger.info(`Logging in...`);
client.login(config.token);
