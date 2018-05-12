/**
 *	events/message.js
 *	==========
 *	Read incoming messages and parse them to find executable commands, or simply
 *	react to simple messages.
 */

// Load external modules
const messenger = require(`${basedir}/tools/messenger.js`);

/**
 *	Print information
 *	@param client {Discord.Client} The client (the bot)
 *	@param message {Discord.message} The message read
 */
exports.run = (client, message) => {
	
	messenger.check(message, (err) => {
		if (err) return logger.error(err);

		messenger.updateTimeout(message, (err) => {

			if (err) {
				return logger.error(err);
			}

			logger.debug(`Successfully updated timeout value`);
		});
		
		if (messenger.isFromBot(message)) {
			return logger.info(`Author of message is a bot user (${utils.username(message)}), no action taken`);
		} else {

			logger.info(`Author of message is a normal user (${utils.username(message)}), taking actions...`);

			if (messenger.isCommand(message)) {
				
				logger.info(`Message contains a command, identifying...`);

				messenger.parse(message, (err, command, args) => {
					if (err) {
						messenger.error(message.channel, `La commande "${message.content}" contient des caractères invalides.`);
						return logger.error(err);
					}

					logger.info(`Identified command "${config.prefix + command}" with ${args.length} arg${args.length > 1 ? 's' : ''}, running...`);

					messenger.execute(client, message, command, args, (err, description, reply) => {
						if (err) {
							messenger.error(message.channel, `Une erreur est survenue avec la commande "${config.prefix + command}", soit :\n- La commande n'existe pas.\n- La valeur d'un argument est incorrecte.`);
							return logger.error(err);
						}

						if (description) logger.info(description);
						message.channel.send(reply)
						.then((msg) => {
							return logger.ok(`Execution of command "${config.prefix + command}" ended successfully`);
						})
						.catch((err) => { return logger.error(err); });
					});
				});
			} else {

				messenger.preventSpam(message, (err, description) => {
					if (err) {
						return logger.error(err);
					}

					return logger.ok(description);
				});

				logger.info(`Message does no contain a command, checking message for potential reactions...`);

				messenger.read(message, (err, description) => {

					if (err) {
						return logger.error(err);
					}

					return logger.ok(description);
				});
			}
		}
	});
}
