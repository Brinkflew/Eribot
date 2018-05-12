/**
 *	tools/messenger.js
 *	==========
 *	Handles reception and sending of messages, rudely reply to some messages
 *	read in chat and sends preventive message in case of spam.
 */

// Loads external modules
const fs = require('fs');
const replies = require(`${basedir}/lang/${config.language}/strings.json`);
const words = {
	dick: /\bbi+te+(u+h)?\b/ig,
	fuck: /\bpu?ta?i?n\b/ig,
	fun: /\b(a?(ha)+h?|lo+l|mdr+|(\:|X)'?(D+|\)))\b/ig,
	name: /\b(Breb(ytes)?s|Flow(eal)?|Zut(zo)?|Brink(flew|fael)?)\b/ig,
	small: /\bpe?'?tite?\b/ig
};

// Local variables
var timeout = undefined;
var spammer = {
	id: undefined,
	count: {
		current: 0,
		min: config.spam.min,
		max: config.spam.max
	}
};

/**
 *	Checks the validity of a message and wheter it is suitable for further usage.
 *	@param message {Message}
 *	@param done {function}
 */
exports.check = (message, done) => {
	if (!message.author) {
		if (!message) {
			let err = new BotError(`Unable to read message: message is undefined`);
			return done(err);
		}

		let err = new BotError(`Unable to read message: author is undefined`);
		return done(err);
	}

	return done(null);
}

/**
 *	Checks if the message received has been issued by a bot user or not.
 *	@param message {Message}
 */
exports.isFromBot = (message) => {
	if (message.author.bot) return true;
	return false;
}

/**
 *	Checks wheter the message is a command to the bot or not.
 *	@param message {Message}
 *	@param done {function}
 */
exports.isCommand = (message) => {
	if (message.content.startsWith(config.prefix)) return true;
	return false;
}

/**
 *	Parses a message to retrieve the command name and passed in arguments.
 *	@param message {Message}
 *	@param done {function}
 */
exports.parse = (message, done) => {
	let text = message.content.replace(/\s\s+/ig, ' ');
	text = text.split(' ');
	let command = text[0];
	command = command.slice(config.prefix.length);
	let args = text.slice(1);

	if (/^(\.|\/)/ig.test(command)) {
		let err = new BotError(`${utils.username(message)} may have tried to access another directory, operation aborted`);
		return done(err);
	}

	return done(null, command, args);
}

/**
 *	Opens a file containing a command and execute it.
 *	@param command {String}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.execute = (client, message, command, args, done) => {
	let file = `${basedir}/commands/${command}.js`;

	fs.access(file, fs.constants.R_OK, (err) => {
		if (err) {
			let err = new BotError(`Unable to access file "${file}"`);
			return done(err);
		}

		let cmd = require(file).run(client, message, args, (err, description, reply) => {
			if (err) return done(err);
			return done(null, description, reply);
		});
	});
}

/**
 *	Sends an error message to the chat.
 *	@param channel {Channel}
 *	@param description {String}
 */
exports.error = (channel, description) => {
	channel.send({ embed: {
		color: config.colors.red,
		title: `Une erreur sauvage apparait !`,
		description: description
	}});
}

/**
 *	Reads and parse a message to find useful information.
 *	@param message {Message}
 *	@param done {function}
 */
exports.read = (message, done) => {

	if (words.dick.test(message.content) && utils.likelihood(75)) {

		let directory = `${basedir}/resources/pictures/dicks`;

		utils.randomFile(directory, (err, file) => {
			if (err) {
				return done(err);
			}

			message.channel.send(
				replies.dick[utils.random(0, replies.dick.length)], {
				files: [ `${directory}/${file}` ]
			});

			return done(null, `Gracefully replied with a picture of a veggie dick`);
		});

	} else if (words.fuck.test(message.content) && utils.likelihood(85)) {
		let reply = replies.fuck[utils.random(0, replies.fuck.length)];
		reply = reply.replace(/\{username\}/ig, message.author.username);
		message.channel.send(reply);
		return done(null, `Gracefully replied to ${utils.username(message)}`);

	} else if (words.fun.test(message.content) && utils.likelihood(33)) {
		let reply = replies.fun[utils.random(0, replies.fun.length)];
		reply = reply.replace(/\{username\}/ig, message.author.username);
		message.channel.send(reply);
		return done(null, `Found that funny, made the others know about that`);

	} else if (words.name.test(message.content) && utils.likelihood(45)) {
		let reply = replies.name[utils.random(0, replies.name.length)];
		reply = reply.replace(/\{username\}/ig, message.author.username);
		message.channel.send(reply);
		return done(null, `Gracefully insulted ${utils.username(message)}`);

	} else if (words.small.test(message.content) && utils.likelihood(50)) {
		let reply = replies.small[utils.random(0, replies.small.length)];
		reply = reply.replace(/\{username\}/ig, message.author.username);
		message.channel.send(reply);
		return done(null, `Just dropped a small reply`);
	} else {
		return done(null, `No action taken`);
	}
}

/**
 *	Updates the timeout before sending an automatic message because of boredom.
 *	@param message {Message}
 *	@param done {function}
 */
exports.updateTimeout = (message, done) => {

	if (timeout && timeout != undefined) {
		clearTimeout(timeout);
	}

	let remainingTime = 1000 * 60 * 60 * utils.random(3, 12);

	timeout = setTimeout(() => {
		message.guild.defaultChannel.send(
			replies.bored[utils.random(0, replies.bored.length)]
		);
		return done(null);
	}, remainingTime);
}

/**
 *	Prevents spam by sending preventive messages in case a user is sending a
 *	lot of messages and nobody is responding to him/her.
 *	@param message {Message}
 *	@param done {function}
 */
exports.preventSpam = (message, done) => {

	if (!spammer.id || spammer.id != message.author.id) {
		spammer.id = message.author.id;
		spammer.count.current = 0;
	} else {
		spammer.count.current++;
	}

	if (spammer.count.current > utils.random(spammer.count.min, spammer.count.max)) {
		message.channel.send(replies.spam[utils.random(0, replies.spam.length)]);
		spammer.count.current = 0;
		return done(null, `Asked ${utils.username(message)} to stop spamming text channels`)
	}
}
