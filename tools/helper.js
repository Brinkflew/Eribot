/**
 *	tools/helper.js
 *	==========
 *	Provides tools to fetch and display help to the users.
 */

// Import external modules
const fs = require('fs');
const help = require(`${basedir}/lang/fr/help.json`);

/**
 *	Fetches help for all commands.
 *	@param done {function}
 */
exports.all = (done) => {
	let fields = [];


	Object.keys(help).sort().forEach((command, index) => {
		
		let args = [];
		help[command].args.forEach((arg) => {
			args.push(`<${arg.name}>`);
		});

		fields.push({
			name: `${config.prefix + command} ${args.join(' ')}`,
			value: help[command].description
		});
	});

	return done(null,
		`Successfully found help for all commands`,
		{ fields: fields }
	);
}

/**
 *	Finds help for a particular command and gives use examples.
 *	@param args {[String]}
 *	@param done {function}
 */
exports.one = (args, done) => {
	
	if (!help.hasOwnProperty(args[0])) {
		let err = new BotError(`Unable to find help for command "${args[0]}"`);
		return done(err);
	}

	let command = help[args[0]];
	command.name = args[0];

	let fields = [];
	let examples = [];
	let params = [];

	command.args.forEach((arg) => {
		params.push(`**[${arg.name}]** - ${arg.description} ${arg.optional ? '(optionel)' : ''}`);
	});

	if (params.length > 0) {
		fields.push({
			name: `Arguments`,
			value: params.join('\n')
		});
	}

	command.examples.forEach((example) => {
		examples.push(`**${config.prefix}${command.name}${example.args ? ' ' + example.args : ''}** - ${example.description}`);
	});

	if (examples.length > 0) {
		fields.push({
			name: `Exemples`,
			value: examples.join('\n')
		});
	}

	return done(null,
		`Successfully fetched help for command "${command.name}"`,
		{ 
			title: command.name,
			description: command.description,
			fields: fields
		}
	);
}
