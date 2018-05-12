/**
 *	commands/ted.js
 *	==========
 *	Provides help and examples for available commands that can be understood by
 *	the bot.
 */

// Import external modules
const helper = require(`${basedir}/tools/helper.js`);

/**
 *	Runs the command
 *	@param  client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, message, args, done) => {

	if (!args || args.length < 1) {
		helper.all((err, description, info) => {
			if (err) return done(err);

			let reply = {
				embed: {
					color: config.colors.erib,
					title: `Aide`,
					description: `Pour entrer une commande, entrez "${config.prefix}" suivit directement du nom de la commande à appeler (sans espace). Si la commande requiert un ou plusieurs arguments, ils peuvent être ajoutés séparés d'un espace.`,
					fields: info.fields
				}
			};

			return done(null, description, reply);
		});
	} else {
		helper.one(args, (err, description, info) => {
			if (err) return done(err);

			let reply = {
				embed: {
					color: config.colors.erib,
					title: `Aide de ${config.prefix + info.title}`,
					description: info.description,
					fields: info.fields
				}
			};

			return done(null, description, reply);
		});
	}
}
