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
			'ns'      => 'Colist',
			'version' => '0.1',
			'path'    => plugin_dir_url( __FILE__ ),
			'dir'     => plugin_dir_path( __FILE__ ),
			'uploads' => '/uploads'
		);
		
		add_action( 'init', array( $this, 'Init' ), 1 );
	}

	function __destruct( ) {
		
	}

	function Init( ) {
		//******** scripts
		$this->scripts = array(
			array(  'handle' => 'defiant',
					'src'    => $this->settings['path'] . 'js/defiant.js',
					'deps'   => ''
			),
			array(  'handle' => 'colist-admin_script',
					'src'    => $this->settings['path'] . 'js/colist.js',
					'deps'   => array( 'defiant', 'jquery' )
			),
		);
		foreach( $this->scripts as $script ) {
			wp_register_script( $script['handle'], $script['src'], $script['deps'] );
		}

		//******** styles
		$this->styles = array(
			'colist-admin_style' => $this->settings['path'] . 'css/colist.css',
		);
		foreach( $this->styles as $handle => $src ) {
			wp_register_style( $handle, $src, false, $this->settings['version'] );
		}

		if ( is_admin() ) {
			//******** ajax nonce
			$nonce = array(
				'ajax_path'  => admin_url( 'admin-ajax.php' ),
				'ajax_nonce' => esc_js( wp_create_nonce( 'colist_nonce') ),
			);
			wp_localize_script( 'colist-admin_script',  'colist_cfg', $nonce );

			//******** ajax
			add_action( 'wp_ajax_colist/get_folder_list', array( $this, 'Get_Folder_List' ) );

			//******** filters
			add_filter( 'media_upload_tabs', array( $this, 'Add_Tab' ), 10, 1 );
			
			//******** actions
			add_action( 'media_upload_colistframe', array( $this, 'Add_Iframe' ) );
		}
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

	function Get_Folder_List() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );

		// prepare response
		$res = array();

		$ignore_arr = array( '.', '..', '.DS_Store' );
		$images_arr = array( 'png', 'jpg', 'jpeg', 'gif' );

		// set path
		$path = isset( $_REQUEST['path'] )? $_REQUEST['path'] : '';
		$path = WP_CONTENT_DIR .'/uploads/'. $path .'/';
		// get directory listing
		$handle = opendir( $path );
		while ( false !== ( $item = readdir( $handle ) ) ) {
			if ( in_array( $item, $ignore_arr ) ) continue;
			$item_path = $path . $item;
			$is_dir = is_dir( $item_path );
			$ofile = array(
				'@id'        => $_REQUEST['path'] .'/'. $item,
				'@name'      => $item,
				'@extension' => $is_dir ? '_dir' : strtolower( pathinfo( $item, PATHINFO_EXTENSION ) ),
				'@size'      => round( filesize( $item_path ) / 1024),
				'@modified'  => date ( 'Y-m-d H:i', filemtime( $item_path ) ),
			);
			if ( !$is_dir ) {
				$ofile['@path'] = str_replace( $_SERVER['DOCUMENT_ROOT'], '', str_replace( './', '', $item_path) );
			}
			if ( in_array( $ofile['@extension'], $images_arr ) ) {
				list( $ofile['@width'], $ofile['@height'] ) = getimagesize( $item_path );
			}
			array_push( $res, $ofile );
		}
		// output response
		echo json_encode( array(
			'@id'   => $_REQUEST['path'],
			'@name' => basename( $path ),
			'file'  => $res
		) );
		// exit properly - ajax call
		die( 1 );
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