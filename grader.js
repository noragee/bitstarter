#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    return checkHtml(fs.readFileSync(htmlfile), checksfile);
};

var checkHtml = function(html, checksfile) {
    console.error("html:\n" + html.toString());
    $ = cheerio.load(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(url, checksfile) {
    console.error("url: " + url);
    var callback = buildfn(checksfile);
    rest.get(url).on('complete', callback);
};

var ProcessCheckJson = function(checkJson) {
    console.log(JSON.stringify(checkJson, null, 4));
}

var util = require('util');

var buildfn = function(checksfile) {
    var callback = function(result) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(result.message));
        } else {
            ProcessCheckJson(checkHtml(result, checksfile));
        }
    };
    return callback;
};
			
var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL')
        .parse(process.argv);
	if (program.url == undefined) {
            ProcessCheckJson(checkHtmlFile(program.file, program.checks));
	}
	else {
            checkUrl(program.url, program.checks);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
