/**
 *	tools/scraper.js
 *	==========
 *	Downloads HTML code from a website and saves it to a temp file.
 */

// Load external modules
const http = require('https');
const fs = require('fs');

// Local variables
const directory = `${basedir}/temp`;
var scraper = {};

/**
 *	Initializes the scraper with necessary values.
 *	@param options {Object}
 */
exports.init = (options) => {
	scraper.host = options.host || undefined;
	scraper.path = options.path || undefined;
	scraper.port = options.port || undefined;
	scraper.file = options.file || undefined;
	scraper.storage = options.storage;
	scraper.scrape = scrape;
	return scraper;
}

/**
 *	Requests data from a webpage and scrapes the downloaded code.
 */
var scrape = () => {
	http.request({
		port: 443,
		host: scraper.host,
		path: scraper.path,
		rejectUnauthorized: false,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'fr-BE,en;q=0.7,en-US;q=0.3',
			'Connection': 'keep-alive'
		}
	}, downloadHTML).end();
}

/**
 *	Downloads HTML from a given URL.
 *	@param res {Buffered Object}
 */
var downloadHTML = (res) => {
	let html = '';

	res.on('data', (chunk) => {
		html += chunk;
	});

	res.on('end', () => {
		saveHTML(html, (err, description) => {			
			if (err) logger.error(err);
		});
	});

	res.on('error', (err) => {
		err = new BotError(`An unexpected error occured while downloading HTML`);
		logger.error(err);
	});
}

/**
 *	Saves HTML data in a temp file.
 *	@param html {String}
 *	@param done {function}
 */
var saveHTML = (html, done) => {
	fs.access(directory, (err) => {
		if (err) {
			fs.mkdir(directory, (err) => {
				if (err) {
					let error = new BotError(`Unable to create or access directory ${directory}`);
					return done(err);
				}
				return saveHTML(html, (err) => {
					if (err) return done(err);
				});
			});
		}

		fs.writeFile(`${directory}/${scraper.file}.html`, html, (err) => {
			if (err) {
				let err = new BotError(`Unable to save HTML to "${directory}/${scraper.file}.html"`);
				return done(err);
			}
			return done(null, `Successfully saved HTML to temp file`);
		});
	});
}
