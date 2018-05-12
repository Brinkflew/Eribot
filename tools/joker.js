/**
 *	tools/joker.js
 *	==========
 *	Utils and tools for telling jokes.
 */

// Load resources
const jokes = require(`${basedir}/lang/fr/strings.json`).jokes;

/**
 *	Chooses a random joke to tell.
 *	@param args {[String]}
 *	@param done {function}
 */
exports.tell = (args, done) => {
	let seed;
	if (args.length < 1 || args[0] < 1 || args[0] > jokes.length) {
		seed = utils.random(0, jokes.length);
	} else {
		seed = args[0] - 1;
	}

	return done(null,
		`Randomly choosed joke #${seed + 1}`,
		jokes[seed]
	);
}

/**
 *	Counts the number of currently available jokes.
 *	@param done {function}
 */
exports.count = (done) => {
	return done(null, 
		`Counted the number of available jokes`,
		`Je connais ${jokes.length} bonnes blagues !`
	);
}
