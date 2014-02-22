var fs = require('fs');

fs.readFile('_posts/test.txt', {encoding: 'utf-8'}, function( err, data ) {
	if ( err ) {
		console.log( 'an error ocurred: '+ err );
	} else {
		var content = data.toString();
		console.log( content );
	}
});
