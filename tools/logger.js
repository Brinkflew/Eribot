/**
 *	tools/logger.js
 *	==========
 *	Handles logging of messages and errors.
 */

// Load external modules
const fs = require('fs');

// Local variables
const file = `eribot.log`;
const directory = `${basedir}/logs`;
const style = {
	default: 	`\x1b[39m\x1b[0m`,
	grey: 		`\x1b[1m\x1b[38;5;240m`,
	orange: 	`\x1b[1m\x1b[38;5;214m`,
	red: 		`\x1b[1m\x1b[38;5;124m`,
	green: 		`\x1b[1m\x1b[38;5;034m`
}
const flags = [
	`${style.grey}[INFO]`,		// 0 - INFO
	`${style.green}[OK]`,		// 1 - OK
	`${style.orange}[WARN]`,	// 2 - WARNING
	`${style.red}[ERR]`,		// 3 - ERROR
	`${style.grey}[DEBUG]`,		// 4 - DEBUG
	``							// 5 - BLANK
];

/**
 *	Logs an information message.
 *	@param description {String}
 */
exports.info = (description) => {
	log(description, 0);
}


/**
 *	Logs a "OK" message.
 *	@param description {String}
 */
exports.ok = (description) => {
	log(description, 1);
}

/**
 *	Logs an warning message
 *	@param description {String}
 */
exports.warn = (description) => {
	log(description, 2);
}

/**
 *	Logs an error message.
 *	@param description {String}
 */
exports.error = (description) => {
	log(description, 3);
}

/**
 *	Logs a debug message.
 *	@param description {String}
 */
exports.debug = (description) => {
	if (config.testing) log(description, 4);
}

/**
 *	Logs a blank line for improved readibility.
 */
exports.blank = () => {
	log('', 5);
}

/**
 *	Logs a message in the command line and saves it to logfile.
 *	@param description {String}
 *	@param flag {String}
 */
log = (description, flag) => {

	fs.access(directory, (err) => {
		
		if (err) {
			fs.mkdir(directory, (err) => {
				if (err) console.error(err);
				return log(description, flag);
			});
		}

		let date = new Date();
		let longFlag = flags.reduce((a, b) => {
			return a.length > b.length ? a : b;
		});

		description = `${style.grey + date.toUTCString() + style.default} ${flags[flag] + style.default}${' '.repeat(longFlag.length - flags[flag].length)} ${description}`;

		// Log in command line
		console.log(description);

		// Save in file
		fs.appendFile(`${directory}/${file}`, `\n${description}`, (err) => {
			if (err) console.error(err);
		});
	});
}
