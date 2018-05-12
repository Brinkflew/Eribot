/**
 *	tools/almanax.js
 *	==========
 *	Provides some tools to parse and display the almanax of the day.
 */

// Load external modules
const fs = require('fs');
const cheerio = require('cheerio');
const months = require(`${basedir}/lang/fr/strings.json`).months;

/**
 *	Extracts the almanax from HTML or JSON files.
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

				let almanax = { bonus: {} };
				let $ = cheerio.load(data);

				almanax.boss = $("#almanax_boss_image img").attr("src");
				almanax.icon = $("#almanax-left #logo").attr("src");
				
				$ = cheerio.load($("#achievement_dofus").html());
				
				almanax.title = $(".more-infos").first().text().trim().split("\n")[0].split(":")[1].trim();
				almanax.description = $(".fleft").text().trim();
				almanax.thumbnail = $("img").attr("src");
				almanax.bonus.title = $(".mid").text().trim().split("\n")[0].trim();
				almanax.bonus.description = $(".more").text().trim().split("\n")[0].trim();
				almanax.date = new Date(dateString);

				fs.writeFile(
					`${scraper.storage}/${scraper.file}.json`, 
					JSON.stringify(almanax, null, 4), 'utf-8', 
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
			
			return setTimeout(exports.extract, 500, scraper, (err, description, almanax) => {
				if (err) return done(err);
				return done(null, description, almanax);
			});
		}

		almanax = require(`${scraper.storage}/${scraper.file}.json`);
		almanax.date = new Date(almanax.date);

		return done(null, `Almanax successfully parsed for ${dateString}`, {
			embed: {
				color: config.colors.erib,
				author: {
					name: `Almanax : ${almanax.date.getDate()} ${months[almanax.date.getMonth()]}`,
					icon_url: almanax.boss,
					url: `http://${scraper.host}/${scraper.path}`
				},
				thumbnail: { url: almanax.thumbnail },
				fields: [
					{
						name: almanax.title,
						value: almanax.description,
						inline: true
					},
					{
						name: almanax.bonus.title,
						value: almanax.bonus.description,
						inline: true
					}
				]
			}
		});
	});
}
