/**
 *	tools/news.js
 *	==========
 *	Provides some tools to parse and display the last official news.
 */

// Load external modules
const fs = require('fs');
const cheerio = require('cheerio');

// Local variables
var scraper = require(`${basedir}/tools/scraper`).init({
	host: config.news.host,
	path: config.news.path,
	port: 443,
	file: config.news.file,
	storage: `${basedir}/resources/news`
});

/**
 *	Runs the command
 *	@param client {Client}
 *	@param message {Message}
 *	@param args {[String]}
 *	@param done {function}
 */
exports.run = (client, done) => {
	
	let date = new Date();
	dateString = `${date.getFullYear()}-${utils.pad(date.getMonth() + 1, '0', 2)}-${utils.pad(date.getDate(), '0', 2)}-${utils.pad(date.getHours(), '0', 2)}-${utils.pad(date.getMinutes(), '0', 2)}`;
	scraper.path = `${config.news.path}`;
	scraper.file = `${config.news.file}_${dateString}`;
	
	extract((err, description, reply) => {
		if (err) return done(err);
		return done(null, description, reply);
	});
}

/**
 *	Extracts the almanax from HTML or JSON files.
 *	@param done {function}
 */
var extract = (done) => {

	let oldNews = undefined;
	let terminate = false;

	fs.readdir(scraper.storage, (err, files) => {
		if (err) {
			let err = new BotError(`An error occured while reading directory "${scraper.storage}"`);
			return done(err);
		}

		if (files.length <= 0 || files[files.length - 1] != `${scraper.file}.json`) {
			
			fs.readFile(`${basedir}/temp/${scraper.file}.html`, (err, data) => {
				if (err) {
					return scraper.scrape(`${scraper.file}`);
				}

				let news = {};
				let $ = cheerio.load(data);
				$ = cheerio.load($('.ak-container.ak-main-center .ak-item-elt.ak-universe-key-mmorpg').html());
				
				news.url = $('a.ak-link-img').attr('href');
				news.id = news.url.split('/')[5].split('-')[0];
				news.description = $('.ak-item-elt-desc').text().replace(/\s\s/ig, ' ').trim();
				news.image =  $('.img-responsive').attr('data-src');
				news.date = $('span.ak-publication').text().split('\n\n')[2].trim();
				news.type = $('span.ak-publication a.ak-ajaxloader').text().trim();
				news.title = cheerio.load($('span.ak-text a').html()).text();

				fs.readFile(`${scraper.storage}/${files[files.length - 1]}`, (err, data) => {
					if (err) {
						err = new BotError(`An error occured while reading last news`);
						return done(err);
					}
					
					if (data) {
						oldNews = JSON.parse(data);

						if (oldNews.id === news.id) {
							let err = new BotError(`No newly published news since last check`);
							terminate = true;
							return done(err);
						}
					}

					fs.writeFile(`${scraper.storage}/${scraper.file}.json`, JSON.stringify(news, null, 4), 'utf-8', (err) => {		
						if (err) {
							err = new BotError(`An error occured while saving JSON to file`);
							return done(err);
						}

						fs.unlink(`${basedir}/temp/${scraper.file}.html`, (err) => {

							if (err) {
								err = new BotError(`An error occured while deleting temp file, assuming it does not exist`);
								return done(err);
							}

							// fs.rmdir(`${basedir}/temp`, (err) => {
							// 	if (err) {
							// 		err = new BotError(`An error occured while deleting temp directory, assuming it does not exist`);
							// 		return done(err);
							// 	}
							// });
						});
					});
				});
			});

			if (!terminate) {
				return setTimeout(extract, 500, (err, description, news) => {
					if (err) return done(err);
					return done(null, description, news);
				});
			} else {
				let err = new BotError(`An error occured while fetching news`);
				return done(err);
			}

		} else {

			if (files.length >= 2) {
				oldNews = require(`${scraper.storage}/${files[files.length - 2]}`);
			}

			fs.access(`${scraper.storage}/${files[files.length - 1]}`, (err, data) => {
				if (err) {
					return done(err);
				}

				news = require(`${scraper.storage}/${files[files.length - 1]}`);

				if (oldNews && oldNews.id === news.id) {
					let err = new BotError(`No newly published news since last check`);
					return done(err);
				}

				return done(null, `Successfully parsed last news on ${scraper.host}${scraper.path}`, {
					embed: {
						color: config.colors.erib,
						author: {
							name: `${news.date} - ${news.type}`,
							url: `https://${scraper.host + news.url}`,
							icon_url: `https://s.ankama.com/www/static.ankama.com/ankama/cms/images/291/2014/05/20/419540.png`
						},
						title: news.title,
						description: news.description,
						thumbnail: { url: `http://www.otakia.com/wp-content/uploads/2011/03/Logo-Dofus.png` },
						image: { url: news.image }
					}
				});
			});
		}
	});
}
