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
	postBase: 'posts'
};

var postsDir = '_posts';
var postPath = '_posts/test.md';
var postDest = 'public/test.html';
var fileContent;
var htmlDoc = '<!DOCTYPE html><html><head><title>quest</title></head><body>{content}</body></html>';



// Initiates Compiling
function compile( postsDir ) {
	console.log( '==========================' );
	collectPosts( postsDir, parsePosts);
}


// Collect Posts
function collectPosts( postsDir, callback ) {

	fs.readdir( postsDir, function(err, fd){

		if( err ) {
			console.log( 'An error occured while reading contents of directory: '+ err );
		} else {

			// Next function
			callback( postsDir, fd );
		}
	});
}



// Seperate Meta from Post
function seperateFromMeta( postString ) {

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



// Process Posts
function parsePosts( postsDir, postNamesArray ) {

	var posts = [];
	var nav = [];

	for (var i = 0; i < postNamesArray.length; i++) {

		var postPath = postsDir+'/'+postNamesArray[i];
		var count = 0;

		fs.readFile( postPath, {encoding: 'utf-8'}, function( err, data ) {

			if ( err ) {
				console.log( 'An error ocurred while opening a file: '+ err );
			} else {

				// Build Post Object
				var post = {};
				var postContents = seperateFromMeta( data );

				post.meta = parseMeta( postContents[0] );
				post.content = postContents[1];
				post.body = '';
				post.uri = buildNavAnchor( post.meta.title, post.meta.date, config.postBase );

				nav.push( post.uri );

				// Use marked to compile Markdown
				marked( post.content, function( err, content ) {
					if( err ) {
						console.log( 'An error occured while converting Markdown: ' + err );
					} else {
						count++;
						post.body = content;
						posts.push( post );

						if ( count === postNamesArray.length ){
							console.log( 'Count ist: ' + count );
							console.log( 'PostNamesArray.length ist: ' + postNamesArray.length );
							buildPosts( posts, nav );
						}
					}
				});
			}
		});
	}
}






// build Posts
function buildPosts( postsArray, navArray ) {

	console.log( navArray );

	for (var i = 0; i < postsArray.length; i++) {
		console.log( postsArray[i].uri );
		console.log( postsArray[i].meta.title );
	}
	console.log( '--------------------------------' );
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
