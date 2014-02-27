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
var htmlDoc = '<!DOCTYPE html><html><head><title>quest</title></head><body>{content}</body></html>'


// Lists contentsof _posts folder
function listPosts( postsDir ){

	fs.readdir( postsDir, function(err, fd){
		if( err ) {
			console.log( 'An error occured while reading contents of directory: '+ err );
		} else {
			console.log( fd );
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
function convertMarkdown( input ) {
	
	// convert to String
	var input = input.toString();
	
	// Use marked to compile Markdown
	marked( input, function( err, content ) {
		if( err ) {
			console.log( 'An error occured while converting Markdown: ' + err );
		} else {
			console.log( content );
			return( content );
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

openPost( postPath, convertMarkdown );

// saveFile( insertContent( convertMarkdown( openPost( postPath ))));

