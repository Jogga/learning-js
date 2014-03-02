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
var postsDir = '_posts';
var postPath = '_posts/test.md';
var postDest = 'public/test.html';
var fileContent;
var htmlDoc = '<!DOCTYPE html><html><head><title>quest</title></head><body>{content}</body></html>';



// Initiates Compiling
function compile( postsDir ) {
	collectPosts( postsDir);
}


// Collect Posts
function collectPosts( postsDir ) {

	console.log( 'Collect Posts' );

	fs.readdir( postsDir, function(err, fd){

		if( err ) {
			console.log( 'An error occured while reading contents of directory: '+ err );
		} else {

			// Test
			console.log( fd );

			// Next function
			processPosts( postsDir, fd );
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




function trim( str ) {
	return str.replace(/^\s+|\s+$/g,'');
}


// Build Post Object
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

				meta[key] = value;
			}
		}
	}
	console.log( meta.title );
	return meta;
}



// Process Posts
function processPosts( postsDir, postNamesArray ) {

	console.log( 'Process Posts ');

	for (var i = 0; i < postNamesArray.length; i++) {

		var postPath = postsDir+'/'+postNamesArray[i];

		fs.readFile( postPath, {encoding: 'utf-8'}, function( err, data ) {

			if ( err ) {
				console.log( 'An error ocurred while opening a file: '+ err );
			} else {

				// console.log( data );
				var post = {};
				var postContents = seperateFromMeta( data );
				post.meta = parseMeta( postContents[0]);
				post.content = postContents[1];

				console.log ( post );
			}
		});
	}
}





// Build Nav List
function listFolderCtntsAsHtml( contentsArray ) {

	for (var i = contentsArray.length - 1; i >= 0; i--) {
		console.log( contentsArray[i] );
	}
}


// Lists contentsof _posts folder
function listPosts( postsDir ){

	fs.readdir( postsDir, function(err, fd){
		if( err ) {
			console.log( 'An error occured while reading contents of directory: '+ err );
		} else {
			console.log( fd );
			listFolderCtntsAsHtml( fd );
		}
	});
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
			callBack( content );
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

// openPost( postPath, convertMarkdown( input, insertContent ) );
// listPosts( postsDir );
// saveFile( insertContent( convertMarkdown( openPost( postPath ))));

compile( postsDir );
