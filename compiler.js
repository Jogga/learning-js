var fs = require('fs'),
	marked = require('marked'),
	highlight = require('highlight.js');


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
	postBase: 'posts',
	postsDir: '_posts/',
	layoutsDir: '_layouts/'
};

var postsDir = '_posts';









// Initiates Compiling
function compile( postsDir ) {
	collectPosts( config.postsDir );
}






// Collect Posts
function collectPosts( postsDir ) {

	fs.readdir( postsDir, function(err, fd){

		if( err ) {
			console.log( 'An error occured while reading contents of directory: '+ err );
		} else {

			// Collect all Uris in NavArray
			var fileNames = fd;
			var navLis = [];

			for (var i = 0; i < fd.length; i++) {
				navLis.push( uriToLi( fileNameToUri( fd[i] )));
			}

			var navLis = navLis.join('');
			console.log( navLis );

			parsePosts( config.postsDir, fileNames, navLis );
		}
	});
}









// Process Posts
function parsePosts( postsDir, fileNames, navLis ) {

	// Iterate over all PostFiles
	for (var i = 0; i < fileNames.length; i++) {

		var postPath = postsDir+fileNames[i];

		fs.readFile( postPath, {encoding: 'utf-8'}, function( err, data ) {

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

	// Path to read html from
	var layoutPath = config.layoutsDir + postObject.meta.layout + '.html';

	// Open Html File, paste post Contents
	fs.readFile( layoutPath, {encoding: 'utf-8'}, function( err, data ) {

		// TODO: Check for includes first!?

		// Insert stuff
		var post = data.replace( '{content}', postObject.body );
		post = post.replace( '{title}', postObject.meta.title );
		post = post.replace( '{nav}', navLis );
		console.log( post );
		console.log( '--------------------------------' );

		// TODO: Save File
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









// build Posts
function test( postsArray, navArray ) {

	console.log( navArray );

	for (var i = 0; i < postsArray.length; i++) {
		console.log( postsArray[i].uri );
		console.log( postsArray[i].meta.title );
	}
}









// build Nav URI from filename
function fileNameToUri( fileName ){

	postUri = fileName;

	// Replace '.'' with '/'
	postUri = postUri.replace( /\-/g, '/');

	// Replace '.md' with '.html'
	postUri = postUri.replace( /\.md\b$/m, '.html');

	return postUri;
}









// insert Uri to <li>
function uriToLi( fileName ){

	// Insert Uri to A
	var navListElem = '<li><a src="' + fileName + '">{name}</a></li>';

	// Make linkName Readable
	var linkName = fileName;
	linkName = linkName.replace( /\-/g, ' ');
	linkName = linkName.replace( /\.html\b$/m, '');

	// Insert linkName
	navListElem = navListElem.replace( '{name}', linkName );

	return navListElem;
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
	postDate = postDate.replace( /\./g, '/');

	// Add trailing '/'
	postDate += '/';

	// Build Post URI
	postURI = postBase + '/' + postDate + postTitle + '.html';

	return( postURI );
}









// Open File
function openPost( postPath, callback ){

	fs.readFile( postPath, {encoding: 'utf-8'}, function( err, data ) {
		if ( err ) {
			console.log( 'An error ocurred while opening a file: '+ err );
		} else {
			callback( data );
		}
	});
}









// Convert Markdown to Html
function convertMarkdown( content ) {

	// convert to String
	var input = content.toString();

	// Use marked to compile Markdown
	marked( input, function( err, content ) {
		if( err ) {
			console.log( 'An error occured while converting Markdown: ' + err );
		} else {
			console.log( content );
			saveFile( insertContent( content ));
		}
	});
}









// Insert Content
function insertContent( content ){

	htmlDoc = htmlDoc.replace( '{content}', content );
	console.log( htmlDoc );
	return( htmlDoc );
}









// Save File
function saveFile( content ) {

	fs.writeFile( postDest, content, function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});
}

compile( postsDir );
