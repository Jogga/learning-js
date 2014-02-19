<?php

	$comment_dir = "../../_comments/"; 
	$post_id = $_POST["post_id"];
	unset($_POST["post_id"]);




	// Post Title
	$post_title = substr( strrchr( $post_id, '/'), 1);
	print( 'filename of post: '.$post_title.'<br>');
	

	

	// Create containing Folder
	$dir = $comment_dir.$post_title;
	print( 'path to directory: '.$dir.'<br>' );

	if( is_dir($dir) === false )
	{
    	mkdir($dir, 0775);
	}


	
	// Create Data From $_POST
	$yml_data = "post_id: $post_id\n";
	$yml_data .= "date: " . date('Y-m-d H:i') . "\n";

	foreach ($_POST as $key => $value) {
		if (strstr($value, "\n") != "") {
			// Value has newlines... need to indent them so the YAML
			// looks right
			$value = str_replace("\n", "\n  ", $value);
		}
		// It's easier just to single-quote everything than to try and work
		// out what might need quoting
		$value = "'" . str_replace("'", "''", $value) . "'";
		$yml_data .= "$key: $value\n";
	}




	// Create File Name
	$file_name = $post_title.'-'.date('Y-m-d-H-i-s').'.yml';
	$file_contents = $yml_data;	
	$file_path = $dir;

	print( '<br>post_title: '.$post_title );
	print( '<br>file_name: '.$file_name );
	print( '<br>file_path: '.$file_path );
	print( '<br>file_contents: '.$file_contents );
	// Open the file and erase the contents if any 
	$fp = fopen($file_path.'/'.$file_name, "w"); 
	fwrite($fp, $file_contents); 
	fclose($fp);

	mail('joachim@froestl.com', 'New Comment', 'Hola');


?>
