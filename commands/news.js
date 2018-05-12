const news = require(`${basedir}/tools/news.js`);

exports.run = (client, message, args, done) => {
	news.run(client, (err, description, reply) => {
		if (err) return done(err);
		return done(null, description, reply);
	});
}