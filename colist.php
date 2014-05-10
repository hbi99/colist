<?php
/**
 * Plugin Name: Colist
 * Plugin URI: 
 * Description: 
 * Version: 0.1
 * Author: Hakan Bilgin
 * Author URI:
 * License: GPLv2 or later
 */

class Colist {

	function __construct( ) {
		//******** settings
		$this->settings = array(
			'ns'        => 'Colist',
			'version'   => '0.2',
			'path'      => plugin_dir_url( __FILE__ ),
			'dir'       => plugin_dir_path( __FILE__ ),
			'uploads'   => '/uploads',
			'ignore'    => array( '.', '..', '.DS_Store' ),
			'img_types' => array( 'png', 'jpg', 'jpeg', 'gif' ),
		);
		
		if ( is_admin() ) {
			add_action( 'init', array( $this, 'Init' ), 1 );
		}
	}

	function __destruct( ) {
		
	}

	function Init( ) {
		global $wpdb;

		// min
		$min = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		//******** scripts
		$this->scripts = array(
			array(  'handle' => 'defiant',
					'src'    => $this->settings['path'] . "js/defiant{$min}.js",
					'deps'   => ''
			),
			array(  'handle' => 'colist-admin_script',
					'src'    => $this->settings['path'] . 'js/colist_frame.js',
					'deps'   => array( 'defiant', 'jquery' )
			),
			array(  'handle' => 'colist-modal_script',
					'src'    => $this->settings['path'] . 'js/colist.js',
					'deps'   => array( 'jquery' )
			),
		);
		foreach( $this->scripts as $script ) {
			wp_register_script( $script['handle'], $script['src'], $script['deps'] );
		}

		//******** styles
		$this->styles = array(
			'colist-modal_style' => $this->settings['path'] . 'css/colist.css',
			'colist-frame_style' => $this->settings['path'] . 'css/colist_frame.css',
		);
		foreach( $this->styles as $handle => $src ) {
			wp_register_style( $handle, $src, false, $this->settings['version'] );
		}

		//******** register tags to attachments
		//register_taxonomy_for_object_type( 'post_tag', 'attachment' );


		$upload_dir = wp_upload_dir();
		//******** ajax nonce
		$config = array(
			'ajax_path'      => admin_url( 'admin-ajax.php' ),
			'ajax_nonce'     => esc_js( wp_create_nonce( 'colist_nonce') ),
			//'uploads_folder' => site_url('/secrets/'),
			//'multisite'      => is_multisite() ? 1 : 0,
			//'sites'          => array(),
			'options'        => $this->Get_Extras()
		);
		//******** output config
		wp_localize_script( 'colist-admin_script',  'colist_cfg', $config );


		//******** modal dialog customize
		wp_enqueue_style( array( 'colist-modal_style' ) );
		wp_enqueue_script( array( 'colist-modal_script' ) );

		//******** ajax
		add_action( 'wp_ajax_colist/get_folder_list',    array( $this, 'Get_Folder_List' ),    0 );
		add_action( 'wp_ajax_colist/get_recent_uploads', array( $this, 'Get_Recent_Uploads' ), 0 );
		add_action( 'wp_ajax_colist/get_network_shared', array( $this, 'Get_Network_Shared' ), 0 );
		add_action( 'wp_ajax_colist/get_file_contents',  array( $this, 'Get_File_Contents' ),  0 );
		add_action( 'wp_ajax_colist/get_search_results', array( $this, 'Get_Search_Results' ), 0 );
		add_action( 'wp_ajax_colist/delete_files',       array( $this, 'Delete_Files' ),       0 );

		//******** filters
		add_filter( 'media_upload_tabs', array( $this, 'Add_Tab' ), 10, 1 );
		
		//******** actions
		add_action( 'media_upload_colistframe', array( $this, 'Add_Iframe' ) );
	}

	function Add_Tab( $tabs ) {
		$new_tab = array( 'colistframe' => 'Colist' );
        return array_merge( $tabs, $new_tab );
	}

	function Add_Iframe() {
		return wp_iframe( array( $this, 'Create_View' ) );
	}

	function Create_View() {
        include_once( 'views/index.php' );
	}

	function Get_Extras() {
		//******** populate tags list
		$tag_arr = array();
		$tags = get_tags( array( 'get' => 'all' ) );
		foreach( $tags as $tag ) {
			array_push( $tag_arr, array(
				'@rpath'     => 'tag-'. $tag->name,
				'@icon'       => 'tag',
				'@action'    => '/get-tagged-files/',
				'@name'      => $tag->name
			) );
		}

		$ret = array(
			array(
				'@rpath'  => 'recent_uploads',
				'@name'   => 'Recent Uploads',
				'@icon'   => 'cloud-upload',
				'@order'  => '30',
				'@action' => '/recent-uploads/'
			),
			array(
				'@rpath'  => 'search_results',
				'@name'   => 'Search Results',
				'@icon'   => 'search',
				'@order'  => '40',
				'@action' => '/show-search-results/'
			),
			array(
				'@type'   => 'divider',
				'@order'  => '99'
			),
		);

		//******** multisite info
		if ( is_multisite() ) {
			$sites = array();
			$blogs = wp_get_sites( array(
				'network_id' => $wpdb->siteid
			) );
			foreach ( $blogs as $blog ) {
				$blog = array(
					'@rpath'     => 'site-'. $blog['blog_id'],
					'@extension' => '_web',
					'@action'    => '/get-network-shared/',
					'@name'      => get_blog_option( $blog['blog_id'], 'blogname' )
				);
				array_push( $sites, $blog );
			}

			array_push( $ret, array(
				'@rpath'  => 'network_shared',
				'@name'   => 'Network Shared Media',
				'@icon'   => 'globe',
				'@order'  => '10',
				'@action' => '/network-shared/',
				'file'    => $sites
			) );
		}
		return $ret;
	}

	function Get_Folder_List() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );

		// prepare response
		$res = array();
		// used later to serve paths
		$real_root = realpath( $_SERVER['DOCUMENT_ROOT'] );

		// set path
		$path = isset( $_REQUEST['path'] )? $_REQUEST['path'] : '';
		$path = WP_CONTENT_DIR .'/uploads/'. $path .'/';
		// get directory listing
		$handle = opendir( $path );
		while ( false !== ( $item = readdir( $handle ) ) ) {
			if ( in_array( $item, $this->settings['ignore'] ) ) continue;
			$item_path = str_replace( './', '', $path . $item );
			$is_dir    = is_dir( $item_path );
			$filesize  = filesize( $item_path );
			$ofile = array(
				'@rpath'     => $_REQUEST['path'] .'/'. $item,
				'@name'      => $item,
				'@size'      => ( $filesize < 1024 ) ? '.'. $filesize : round( $filesize / 1024),
				'@extension' => $is_dir ? '_dir' : strtolower( pathinfo( $item, PATHINFO_EXTENSION ) ),
				'@modified'  => date ( 'Y-m-d H:i:s', filemtime( $item_path ) ),
			);
			if ( !$is_dir ) {
				$ofile['@path'] = str_replace( $real_root, '', $item_path );
			}
			if ( in_array( $ofile['@extension'], $this->settings['img_types'] ) ) {
				list( $ofile['@width'], $ofile['@height'] ) = getimagesize( $item_path );
			}
			array_push( $res, $ofile );
		}
		// output response
		echo json_encode( array(
			'@rpath' => $_REQUEST['path'],
			'@name'  => basename( $path ),
			'file'   => $res
		) );
		// exit properly - ajax call
		die( 1 );
	}

	function Get_Recent_Uploads() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );

		$uploads = get_posts( array(
			'post_type'      => 'attachment',
			'orderby'        => 'modified',
			'posts_per_page' => 21
		) );

		echo json_encode( array(
			'@rpath' => 'recent_uploads',
			'file'   => $this->Loop_Object( $_REQUEST['path'], $uploads )
		) );

		// exit properly - ajax call
		die( 1 );
	}

	function Get_Network_Shared() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );
		// switch blog
		list( $tmp, $id ) = explode('-', $_POST['siteid']);
		switch_to_blog( $id );

		$attachments = get_posts( array(
			'post_type'      => 'attachment',
			'posts_per_page' => -1
		) );

		echo json_encode( array(
			'@rpath' => 'network_shared',
			'file'   => $this->Loop_Object( $_REQUEST['siteid'], $attachments )
		) );

		// exit properly - ajax call
		die( 1 );
	}

	function Get_File_Contents() {
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );
		// build file path
		$filepath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['path'];
		// output
		echo file_get_contents( $filepath );
		// exit properly - ajax call
		die( 1 );
	}

	function Get_Search_Results() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );

		$phrase = $_REQUEST['phrase'];
		// store current blog id
		$current_blog_id = get_current_blog_id();

		$res = array();
		$blog_list = get_blog_list( 0, 'all' );
		foreach ( $blog_list as $blog ) {
			switch_to_blog( $blog['blog_id'] );
			$found  = get_posts( array(
				'post_type'      => 'attachment',
				'posts_per_page' => -1,
				's'              => $phrase
			) );
			$res = array_merge( $res, $this->Loop_Object( 'search_results', $found ) );
		}
		// restore blog id
		switch_to_blog( $current_blog_id );

		echo json_encode( array(
			'@rpath'  => 'search_results',
			'@phrase' => $phrase,
			'file'    => $res
		) );

		// exit properly - ajax call
		die( 1 );
	}

	function Delete_Files() {
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );
		// check if logged in
		if ( !is_admin() ) die( -1 );

		$files = $_REQUEST['files'];
		foreach( $files as $file ) {
			$attechmentId = $this->get_attachment_id_by_url( $file );
			if ( $attechmentId ) {
				// remove with WP function
				wp_delete_attachment( $attechmentId, true );
			} else {
				// item only exists in FS, remove
				$path = parse_url( $file, PHP_URL_PATH );
				unlink( $_SERVER['DOCUMENT_ROOT'] . $path );
			}
		}

		// exit properly - ajax call
		die( 1 );
	}

	function get_attachment_id_by_url( $url ) {
		global $wpdb;

		// Split the $url into two parts with the wp-content directory as the separator.
		$parse_url = explode( parse_url( WP_CONTENT_URL, PHP_URL_PATH ), $url );

		// Get the host of the current site and the host of the $url, ignoring www.
		$this_host = str_ireplace( 'www.', '', parse_url( home_url(), PHP_URL_HOST ) );
		$file_host = str_ireplace( 'www.', '', parse_url( $url, PHP_URL_HOST ) );

		// Return nothing if there aren't any $url parts or if the current host and $url host do not match.
		if ( ! isset( $parse_url[1] ) || empty( $parse_url[1] ) || ( $this_host != $file_host ) ) {
			return;
		}

		// Now we're going to quickly search the DB for any attachment GUID with a partial path match.
		// Example: /uploads/2013/05/test-image.jpg
		$attachment = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->prefix}posts WHERE guid RLIKE %s;", $parse_url[1] ) );

		// Returns null if no attachment is found.
		return $attachment[0];
	}

	function Loop_Object( $root_path, $records ) {
		$res = array();
		foreach( $records as $file ) {
			$item_path = str_replace( 'http://'. $_SERVER['SERVER_NAME'], '', $file->guid );
			$fs_path   = $_SERVER['DOCUMENT_ROOT'] . $item_path;
			$extension = strtolower( pathinfo( $file->guid, PATHINFO_EXTENSION ) );
			$ofile = array(
				'@id'        => $file->ID,
				'@rpath'     => $root_path .'/'. $file->post_title .'.'. $extension,
				'@path'      => $item_path,
				'@name'      => $file->post_title .'.'. $extension,
				'@size'      => round( filesize( $fs_path ) / 1024),
				'@modified'  => $file->post_modified,
				'@extension' => $extension
			);
			if ( in_array( $ofile['@extension'], $this->settings['img_types'] ) ) {
				list( $ofile['@width'], $ofile['@height'] ) = getimagesize( $fs_path );
				// get medium size - for faster UI
				$medium_url = wp_get_attachment_image_src( $file->ID, 'medium' );
				$ofile['@medium'] = $medium_url[0];
			}
			array_push( $res, $ofile );
		}
		return $res;
	}

}

function colist() {
	global $colist;
	if ( !isset( $colist ) ) {
		$colist = new Colist();
	}
	return $colist;
}

// initialize
colist();

?>