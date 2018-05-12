/**
 *	tools/scraper.js
 *	==========
 *	Provides tools and commands to share and listen to music in vocal channels.
 */

// Load external modules
const youtubeDL = require('youtube-dl');
const request = require('request');

// Local variables
let isGlobal = false;
let maxQueueSize = 20;
let queues = {};

/**
 *	Fetches the music queue for a given guild.
 *	@param guild {Guild}
 */
var getQueue = (guild) => {
	if (isGlobal) guild = '_';
	if (!queues[guild]) queues[guild] = [];
	return queues[guild];
}

/**
 * 	Adds musics to the queue and plays them.
 * 	@param client {Discord.Client}
 * 	@param message {Discord.Message}
 * 	@param source {String}
 *	@param done {function}
 */
exports.stream = (client, message, source, done) => {

	// Make sure the suffix exists
	if (!source) {
		let error = new BotError(`No video to search for, aborting`);
		return done(err);
	}

	// Get the current queue
	let queue = getQueue(message.guild.id);
	let args = ['-q', '--default-search', 'auto'];

	youtubeDL.getInfo(source, args, (err, info) => {

		if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
			let err = new BotError(`No result for video "${source}"`);
			return done(err);
		}

		let lookahead = /:(?!.*:)/ig;

		info.duration = info.duration
			.replace(lookahead, 'm ')
			.replace(lookahead, 'h ') + 's';

		if (queue.length > maxQueueSize) {
			let err = new BotError(`Max number of video already queued for guild ${utils.guildname(message)}, queueing abo`);
			return done(err);
		}

		queue.push(info);

		info = {
			title: info.title,
			duration: info.duration,
			thumbnail: info.thumbnail,
			position: queue.length
		}

		if (queue.length === 1) {
			executeQueue(client, message, queue, (err, description) => {
				if (err) return done(err);
				return done(null, description, info);
			});
		}

		return done(null, `Successfully added "${info.title}" to queue for guild ${utils.guildname(message)}`, info);
	});
}

/**
 *	Prints out the composition of the musical queue for the guild in which
 *	the message was send.
 *	@param client {Client}
 *	@param message {Message}
 *	@param done {function}
 */
exports.queue = (client, message, done) => {

	let queue = getQueue(message.guild.id);
	let info = {};

	if (queue.length <= 0) {
		info.description = `Aucune musique dans la playlist pour le moment.`;
	} else {
		info.description = queue.map((video, index) => {
			return `- ${video.title} [ ${video.duration} ] {#${utils.pad(index + 1, '0', 2)}}`;
		}).join('\n');
	}

	let connection = client.voiceConnections.get(message.guild.id);
	info.title = `Playlist ${connection ? (connection.player.dispatcher.paused ? 'en pause' : 'en cours de lecture') : 'arrêtée'}`;

	return done(null, `Successfully got list of queued videos`, info);
}

/**
 *	Pauses the voice stream currently playing.
 *	@param client {Client}
 *	@param message {Message}
 *	@param done {function}
 */
exports.pause = (client, message, done) => {

	let connection = client.voiceConnections.get(message.guild.id);
	
	if (!connection || connection === undefined) {
		let err = new BotError(`No stream in guild ${utils.guildname(message)} for the moment, aborting`);
		return done(err);
	}

	let dispatcher = connection.player.dispatcher;

	if (!dispatcher) {
		let err = new BotError(`Unable to find dispatcher for guild ${utils.guildname(message)}`);
		return done(err);
	}

	dispatcher.pause();
	let info = { channel: connection.channel.name };

	return done(null, `Stream successfully paused in guild ${utils.guildname(message)}`, info);
}

/**
 *	Resumes a voice stream currently paused.
 *	@param client {Client}
 *	@param message {Message}
 *	@param done {function}
 */
exports.resume = (client, message, done) => {

	let connection = client.voiceConnections.get(message.guild.id);

	if (!connection || connection === undefined) {
		let err = new BotError(`No paused stream in guild ${utils.guildname(message)} for the moment, aborting`);
		return done(err);
	}

	let dispatcher = connection.player.dispatcher;

	if (!dispatcher) {
		let err = new BotError(`Unable to find dispatcher for guild ${utils.guildname(message)}`);
		return done(err);
	}

	dispatcher.resume();
	let info = { channel: connection.channel.name };

	return done(null, `Stream successfully resumed in guild ${utils.guildname(message)}`, info);
}

/**
 *	Skips a music in the queue for a given guild.
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.skip = (client, message, args, done) => {

	let connection = client.voiceConnections.get(message.guild.id);

	if (!connection || connection === undefined) {
		let err = new BotError(`No stream in guild ${utils.guildname(message)} for the moment, aborting`);
		return done(err);
	}

	let queue = getQueue(message.guild.id);

	if (!queue || queue.length <= 0) {
		let err = new BotError(`Queue is empty in guild ${utils.guildname(message)}, aborting`);
		return done(err);
	}

	let offset = 0;

	if (args[0] && args[0] != undefined) {
		if (!isNaN(args[0]) && parseInt(args[0]) >= 0) {
			offset = parseInt(args[0]);
		}
	}

	offset = Math.max(0, Math.min(offset, queue.length) - 1);

	let skipped = queue.splice(offset, 1);

	if (offset === 0) {
		let dispatcher = connection.player.dispatcher;

		if (!dispatcher) {
			let err = new BotError(`Unable to find dispatcher for guild ${utils.guildname(message)}`);
			return done(err);
		}

		dispatcher.end(['skipped']);
	}

	let info = {
		title: skipped[0].title,
		position: offset + 1,
		duration: skipped[0].duration
	}

	return done(null, `Successfully skipped music "${skipped[0].title}" in guild ${utils.guildname(message)}`, info);
}

/**
 *	Checks if the bot is already connected to a voice channel, or joins a voice
 *	channel if needed.
 *	@param message {Message}
 *	@param queue {[Object]}
 *	@param done {function}
 */
var joinVoiceChannel = (client, message, queue, done) => {

	let connection = client.voiceConnections.get(message.guild.id);

	if (!connection || connection === undefined) {

		let channel = client.channels.get(config.channels.voice.music);

		if (!channel || channel === undefined) {
			queue.splice(0, queue.length);
			let error = new BotError(`No voice channel to join`);
			return done(err);
		}

		channel.join().then((connection) => {
			return done(null, connection);
		});
	} else {
		return done(null, connection);
	}
}

/**
 *	Plays a voice stream in a voice channel.
 *	@param connection {Connection}
 *	@param queue {[Object]}
 *	@param done {function}
 */
var playStream = function(client, message, connection, queue, done) {

	let dispatcher = connection.playStream(request(queue[0].url), {
		seek: 0,
		volume: 0.5
	});

	if (!dispatcher || dispatcher === undefined) {
		let err = new BotError(`Unable to start stream dispatcher`);
		return done(err);
	}

	dispatcher.on('end', (reasons) => {
		if (!reasons || reasons.indexOf('skipped') < 0) {
			queue.shift();
		}
		
		setTimeout(() => {	
			executeQueue(client, message, queue, (err) => {
				if (err) return done(err);
				return done(null, `Successfully started streaming "${queue[0].title}"`);
			});
		}, 500);
	});

	dispatcher.on('error', (err) => {
		queue.shift();
		setTimeout(() => {	
			executeQueue(client, message, queue, (err) => {
				if (err) return done(err);
				return done(null, `Successfully started streaming "${queue[0].title}"`);
			});
		}, 500);
	});
}

/**
 *	Reads the queue and launches a vocal stream in the channel to which the
 *	author of the message is connected.
 *	@param client {Client}
 *	@param message {Message}
 *	@param queue {[Object]}
 *	@param done {function}
 */
var executeQueue = (client, message, queue, done) => {

	if (queue.length <= 0) {
		let connection = client.voiceConnections.get(message.guild.id);
		if (connection && connection != undefined) connection.channel.leave();
		return done(null, `Audio stream ended because the queue is empty`);
	}

	joinVoiceChannel(client, message, queue, (err, connection) => {

		if (err) {
			return done(err);
		}

		playStream(client, message, connection, queue, (err, description) => {
			if (err) return done(err);
			return done(null, description);
		});
	});
}
