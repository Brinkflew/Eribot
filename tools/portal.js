/**
 *	tools/portal.js
 *	==========
 *	Provides some tools to parse and display information about portals to the
 *	divine dimensions.
 */

// Load external modules
const fs = require('fs');
const cheerio = require('cheerio');

/**
 *	Extracts the portal information from HTML or JSON files.
 *	@param scraper {Object}
 *	@param done {function}
 */
exports.extract = (scraper, done) => {
	fs.readFile(`${scraper.storage}/${scraper.file}.json`, (err, data) => {
		if (err) {
			fs.readFile(`${basedir}/temp/${scraper.file}.html`, (err, data) => {
				if (err) {
					return scraper.scrape(`${scraper.file}`);
				}

				let portal = { dimension: {}, modifier: {} };
				let $ = cheerio.load(data);

				$('.row').each(function(ind, element) {
					if ($(this)
						.text()
						.trim()
						.toLowerCase()
						.startsWith(dimension.toLowerCase())) {

						$ = cheerio.load($(this).html());
					}
				});

				portal.dimension.name = $('.dimension h2').text().trim();
				portal.dimension.picture = `http://sweet.ovh/images/portals/${$('.dimension img').attr('src').split('/')[3]}`;
				portal.modifier.name = $('.cycle h3').text().trim();
				portal.modifier.description = $('.cycle .modificateurs :not(.visible-lg-inline) img').attr('title').split(':')[1].trim();
				portal.lastUpdate = `${$('.maj h4').text().trim()} ${$('.maj h3').text().trim()}`;
				portal.position = ($('.infos h3').text().split('Utilisations')[0] || `Inconnue`);
				portal.uses = ($('.infos h3').text().split('Utilisations')[1] || `Inconnu`);

				fs.writeFile(
					`${scraper.storage}/${scraper.file}.json`,
					JSON.stringify(portal, null, 4),
					'utf-8',
					(err) => {

					if (err) {
						let err = new BotError(`An error occured while saving JSON to file`);
						return done(err);
					}

					fs.unlink(`${basedir}/temp/${scraper.file}.html`, (err) => {

						if (err) {
							let err = new BotError(`An error occured while deleting temp file, assuming it does not exist`);
							return done(err);
						}

						// fs.rmdir(`${basedir}/temp`, (err) => {
						// 	if (err) {
						// 		let err = new BotError(`An error occured while deleting temp directory, assuming it does not exist`);
						// 		return done(err);
						// 	}
						// });
					});
				});
			});
			
			// Wait a bit, to make sure that HTML has been saved to file
			return setTimeout(exports.extract, 500, scraper, (err, description, portal) => {
				if (err) return done(err);
				return done(null, description, portal);
			});
		}

		portal = require(`${scraper.storage}/${scraper.file}.json`);

		fs.unlink(`${scraper.storage}/${scraper.file}.json`, (err) => {

			if (err) {
				let err = new BotError(`An error occured while deleting JSON file, assuming it does not exist`);
				return done(err);
			}
			
			return done(null, `Successfuly parsed portal information`, {
				embed: {
					color: config.colors.erib,
					author: {
						name: `Portail vers ${portal.dimension.name}`,
						icon_url: `${portal.dimension.picture}`,
						url: `http://${scraper.host}/${scraper.path}/${config.portals.server}`
					},
					thumbnail: { url: portal.dimension.picture },
					fields: [
						{
							name: 'Position',
							value: portal.position,
							inline: true
						},
						{
							name: 'Utilisations',
							value: `${portal.uses}${!isNaN(portal.uses) ? ' restante' + (portal.uses > 1 ? 's' : '') : ''}`,
							inline: true
						},
						{
							name: `Modificateur : ${portal.modifier.name}`,
							value: portal.modifier.description
						}
					]
				}
			});
		});
	});
}
