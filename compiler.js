// Imports
var fs = require('fs');
var marked = require('marked');
var highlight = require('highlight.js');
var mkPath = require('mkpath');
var rmdir = require('rimraf');
var config = require('./config.js');

// Set Options of marked
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    },
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});



/*
 * Trims redundant whitespace
 */
function trim(str) {
    return str.replace(/^\s+|\s+$/g,'');
}



/*
 * Finds Value in Object via path-string
 */
function pathFinder(obj, path) {
    var paths = path.split('.')
    var current = obj
    var i;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}



/*
 * Seperate Meta from Post
 */
function seperatePostContents(postString) {
    var seperatorString = '---';
    var postContents = [];
    var metaStart = postString.indexOf( seperatorString, 0 );
    var metaEnd = postString.indexOf( seperatorString, seperatorString.length );
    postContents.push( postString.substring( metaStart + seperatorString.length, metaEnd ));
    postContents.push( postString.substring( metaEnd + seperatorString.length ));

    return postContents;
}



/*
 * Build Meta Object
 */
function parseMeta( metaString ) {
    metaString = metaString.replace( /^\s*[\r\n]/gm, '');
    var meta = {};
    // Build Array of Meta Lines
    var metaLines = metaString.split( '\n');

    for (var i = 0; i < metaLines.length; i++) {
        if ( metaLines[i] !== '' ) {
            // Search for first ':'
            var metaSeperator = metaLines[i].search( /(?:\:\s)|(?:\:)/ );
            // Parts of Metaline
            var metaLine = [];

            if (metaSeperator !== -1 ){
                var key = trim( metaLines[i].slice( 0, metaSeperator ) );
                var value = trim( metaLines[i].slice( metaSeperator+1 ) );
                // Save in Object
                meta[key] = value;
            }
        }
    }
    return meta;
}



/*
 * Build URL
 */
function buildHtmlFilename(postTitle) {

    // TODO: Improve (Umlaute, etc.)
    // Lower Case
    htmlFileName = postTitle.toLowerCase();

    // Replace ' ' with '_'
    htmlFileName = htmlFileName.replace( /\s+/g, '_');

    // Remove URI Chars
    htmlFileName = htmlFileName.replace(/\.|\!|\~|\*|\'|\(|\)/g, '' );

    // Escape Special Characters
    htmlFileName = encodeURIComponent( htmlFileName ); // Improve this shit!

    // add file extension
    htmlFileName += '.html';

    return(htmlFileName);
}



/*
 * Save post as .HTML File
 */
function saveFile(post, callback) {
    mkPath.sync(post.path);
    fs.writeFile(post.path + post.htmlFilename, post.build, function (err) {
        if (err) throw err;
        if (callback) {
            callback();
        }
    });
}



/*
 * Insert Content to Template
 */
function insertContent(post, callback) {
    var insertRegex = /\{\{ *?([a-z0-9\-\_\.]+?) *?\}\}/igm;
    var insertMatches = [];

    while ((match = insertRegex.exec(post.build)) !== null) {
        insertMatches.push({'tag': match[0], 'insert': match[1]});
    }

    if (insertMatches.length > 0) {
        for(i = 0; i < insertMatches.length; i++) {
            post.build = post.build.replace(insertMatches[i].tag, pathFinder(post, insertMatches[i].insert));
        }
    }
    callback(post);
}



/*
 * Compile the Template: Include includes
 */
function compileTemplate(post, callback) {

    // TODO: Write as recursive function
    // Includes
    var includeRegex = /\{\% *?include *?([a-z0-9\-\_\.]+?) *?\%\}/igm;
    var includeMatches = [];

    while ((match = includeRegex.exec(post.build)) !== null) {
        includeMatches.push({'tag': match[0], 'include': match[1]});
    }

    function series(includeMatch) {
        if(includeMatch) {
            fs.readFile(config.includesDir +'/'+ includeMatch.include + '.html', 'utf-8', function(err, include) {
                if (err) throw err;
                post.build = post.build.replace(includeMatch.tag, include);
                return series(includeMatches.shift());
            });
        } else {
            insertContent(post, callback);
        }
    }

    series(includeMatches.shift());
}



/*
 * Reads the Template belonging to the markdown File
 */
function readTemplate(post, callback) {
    if (post.meta.layout) {
        fs.readFile(config.layoutsDir +'/'+ post.meta.layout + '.html', 'utf-8', function(err, template) {
            if (err) throw err;
            post.build = template;
            post = compileTemplate(post, callback);
        })
    } else if (config.defaultLayout) {
        fs.readFile(config.layoutsDir +'/'+ config.defaultLayout + '.html', 'utf-8', function(err, template) {
            if (err) throw err;
            post.build = template;
            post = compileTemplate(post, callback);
        })
    } else {
        callback(post);
    }
}



/*
 * Convert the Markdown to HTML
 */
function convertMarkdown(post, callback) {
    marked(post.markdown, function(err, content) {
        if (err) throw err;
        post.content = content;
        readTemplate(post, callback);
    });
}



/*
 * Read MD Files, parse String
 */
function parsePost(file, callback) {
    var filename = config.postsDir +'/'+ file;
    fs.readFile(filename, 'utf-8', function (err, data) {
        if (err) throw err;
        var postElems = seperatePostContents(data);
        var post = {};
        post.mdFilename = filename;
        post.meta = parseMeta(postElems[0]);
        post.path = config.publicDir + '/' + config.postBase + '/' + post.meta.date + '/';
        post.url = config.postBase + '/' + post.meta.date + '/';
        post.htmlFilename = buildHtmlFilename(post.meta.title);
        post.markdown = postElems[1];

        convertMarkdown(post, callback);
    });
}



/*
 * Build Index File
 */
function buildIndex(posts, callback) {
    var indexLinks = '';
    var index = {};

    function compare(a,b) {
        if (a.meta.date < b.meta.date)
            return 1;
        if (a.meta.date > b.meta.date)
            return -1;
        return 0;
    }
    posts = posts.sort(compare);

    posts.forEach(function(post) {
        indexLinks += '<li><a href="./'+ post.url + post.htmlFilename +'">'
            + '<div>'
            + '<span class="qst-post-title">'
            + post.meta.title
            + '</span>'
            + '<span class="qst-post-date">'
            + post.meta.date
            + '</span>'
            + '</div>'
            + '</a>'
            + '</li>\n';
    });

    fs.readFile(config.layoutsDir + '/' + config.indexFile +'.html', 'utf-8', function(err, template) {
        if (err) throw err;
        index.build = template.replace('{{ indexLinks }}', indexLinks);
        index.build = index.build.replace('{{ title }}', config.title);
        index.path = config.publicDir + '/';
        index.htmlFilename = config.indexFile + '.html';

        compileTemplate(index, callback);
    });
}



/*
 * Start Compilation of the Posts
 */
function compile() {
    var posts = [];

    fs.readdir(config.postsDir, function (err, files) {
        files.forEach (function (file) {
            parsePost(file, function (post) {
                saveFile(post);
                posts.push(post);
                console.log('Built: ' + post.meta.title);
                if (posts.length === files.length) {
                    buildIndex(posts, function(index) {
                        saveFile(index);
                        console.log('Built: index');
                        console.log('Done');
                    });
                }
            })
        })
    });
}

compile();
