var fs = require('fs');
var marked = require('marked');
var highlight = require('highlight.js');
var mkPath = require('mkPath');
var rmdir = require('rimraf');


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

// Some variables for testing
var config = {
    publicDir: 'public',
    postBase: 'posts',
    postsDir: '_posts/',
    layoutsDir: '_layouts/'
};









// Initiates Compiling
function compile( postsDir ) {
    collectPosts( config.postsDir );
}









/*
 * Collect Posts
 *
 * lists files in posts Directory
 * Builds Nav from filenames
 * calls parsePosts Function
 */
function collectPosts( postsDir ) {

    fs.readdir( postsDir, function(err, fileNames){

        if( err ) {
            console.log( 'An error occured while reading contents of directory: '+ err );
        } else {


            // String to collect all navLis
            var navLis = '';
            for (var i = 0; i < fileNames.length; i++) {
                navLis = navLis + uriToLi( fileNameToUri( fileNames[i] ));
            }


            // Wipe Directory
            rmdir( config.publicDir+'/'+config.postBase, function(err) {
                if(err){
                    console.log( 'error while rmdir');
                } else {
                    console.log( 'wiped directory');
                    parsePosts( config.postsDir, fileNames, navLis );
                }
            });
        }
    });
}




/*
 * build Nav URI from filename
 *
 * Args: fileName (string)
 * returns: reformatted fileName (string)
 */
function fileNameToUri( fileName ){

    var postUri = fileName;

    // Replace '-'' with '/'
    postUri = postUri.replace( /\-/g, '/');

    // Replace '.md' with '.html'
    postUri = postUri.replace( /\.md\b$/m, '');

    // Add postBase, '.html'
    postUri = config.postBase +'/'+ postUri + '.html';

    // return competed URI
    return postUri;
}









// insert Uri to <li>
function uriToLi( postUri ){

    // Insert Uri to A
    // TODO: Open template file, pick nav Element from there
    var navListElem = '<li><a href="/' + postUri + '">{name}</a></li>';

    // Make linkName Readable
    var linkName = postUri;
    linkName = linkName.replace( /\-/g, ' ');
    linkName = linkName.replace( /\.html\b$/m, '');

    // Insert linkName
    navListElem = navListElem.replace( '{name}', linkName );

    return navListElem;
}









// Process Posts
function parsePosts( postsDir, fileNames, navLis ) {

    // Iterate over all PostFiles
    for (var i = 0; i < fileNames.length; i++) {

        fs.readFile( postsDir+fileNames[i], {encoding: 'utf-8'}, function( err, data ) {

            if ( err ) {
                console.log( 'An error ocurred while opening a file: '+ err );
            } else {

                var postContents = seperatePostContents( data );

                // Build Post Object
                var post = {};
                post.meta = parseMeta( postContents[0] );
                post.content = postContents[1];
                post.body = '';
                post.uri = buildNavAnchor( post.meta.title, post.meta.date, config.postBase );

                // Use marked to compile Markdown
                marked( post.content, function( err, content ) {
                    if( err ) {
                        console.log( 'An error occured while converting Markdown: ' + err );
                    } else {
                        post.body = content;
                        // console.log( post );
                        buildPost( post, navLis );
                    }
                });
            }
        });
    }
}









// Build Post
function buildPost( postObject, navLis ) {

    // Path to read html from.
    // Constructed from cunfigured Layouts-Directory and the named layout
    // TODO: if no layout is defined, use default.
    var layoutPath = config.layoutsDir + postObject.meta.layout + '.html';

    // Open Html File, paste post Contents
    fs.readFile( layoutPath, {encoding: 'utf-8'}, function( err, data ) {

        // TODO: Check for includes and Comments first!?

        // Insert stuff
        var postDestination = postObject.uri;
        var postBody = data.replace( '{content}', postObject.body );
        postBody = postBody.replace( '{title}', postObject.meta.title );
        postBody = postBody.replace( '{nav}', navLis );


        // save this File
        saveFile( postBody, postDestination );
    });
}









// Save File
function saveFile( content, destination ) {

    // Array of directories making up the output path
    var dirPath = config.publicDir + '/' + destination.substring( 0, destination.lastIndexOf('/') );
    var postDestination = config.publicDir + '/' + destination;

    mkPath( dirPath, function (err) {
        if( err ) {
            console.log (err);
        } else {
            console.log ('rdy!');
            fs.writeFile( postDestination, content, function (err) {
                if(err){
                    console.log(err);
                } else {
                    console.log('file created!');
                }
            });
        }
    });
}









// Seperate Meta from Post
function seperatePostContents( postString ) {

    var seperatorString = '---';
    var postContents = [];

    var metaStart = postString.indexOf( seperatorString, 0 );
    var metaEnd = postString.indexOf( seperatorString, seperatorString.length );

    postContents.push( postString.substring( metaStart + seperatorString.length, metaEnd ));
    postContents.push( postString.substring( metaEnd + seperatorString.length ));

    return postContents;
}









// Trims redundant whitespace
function trim( str ) {

    return str.replace(/^\s+|\s+$/g,'');
}









// Build Meta Object
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









// Build Nav List
function buildNavAnchor( postTitle, postDate, postBase ) {

    var postURI = '';

    // Lower Case
    postTitle = postTitle.toLowerCase();

    // Replace ' ' with '_'
    postTitle = postTitle.replace( /\s+/g, '_');

    // Escape Special Characters
    postTitle = encodeURIComponent( postTitle ); // Improve this shit!

    // Remove URI Chars
    postTitle = postTitle.replace(/\.|\!|\~|\*|\'|\(|\)/g, '' );

    // Replace '.'' with '/'
    var postDateArray = postDate.split( /\./g);
    var uriDate = '';

    // Build Date as Y/M/D
    for (var i = postDateArray.length - 1; i >= 0; i--) {
        uriDate = uriDate + postDateArray[i] + '/';
    }

    // Build Post URI
    postURI = postBase + '/' + uriDate + postTitle + '.html';

    return( postURI );
}










compile( config.postsDir );
