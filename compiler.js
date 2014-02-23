var fs = require('fs'),
	marked = require('marked');


// Set Options of marked
marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

var fileContent;
var htmlDoc = '<!DOCTYPE html><html><head><title>quest</title></head><body>{content}</body></html>'


// Read Contents of directory
fs.readdir('_posts', function(err, fd){
	if( err ) {
		console.log( 'An error occured while reading contents of directory: '+ err );
	} else {
		console.log( fd );
	}
});



// Open File
fs.readFile('_posts/test.md', {encoding: 'utf-8'}, function( err, data ) {
	if ( err ) {
		console.log( 'An error ocurred while opening a file: '+ err );
	} else {
		convertMarkdown( data );
	}
});



// Convert Markdown to Html
function convertMarkdown( input ) {
	
	// convert to String
	var input = input.toString();
	
	// Use marked to compile Markdown
	marked( input, function( err, content ) {
		if( err ) {
			console.log( 'An error occured while converting Markdown: ' + err );
		} else {
			insertContent( content );
		}
	});
}



// Insert Content
function insertContent( content ){
	htmlDoc = htmlDoc.replace( '{content}', content );
	console.log( htmlDoc );
	saveFile( htmlDoc );
}


// Save File
function saveFile( content ) {

	fs.writeFile('public/test.html', content, function (err) {
		if (err) throw err;
		console.log('It\'s saved!');
	});
}
