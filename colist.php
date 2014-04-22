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
			'version'   => '0.1',
			'path'      => plugin_dir_url( __FILE__ ),
			'dir'       => plugin_dir_path( __FILE__ ),
			'uploads'   => '/uploads',
			'ignore'    => array( '.', '..', '.DS_Store' ),
			'img_types' => array( 'png', 'jpg', 'jpeg', 'gif' ),
		);
		
		add_action( 'init', array( $this, 'Init' ), 1 );
	}

	function __destruct( ) {
		
	}

	function Init( ) {
		global $wpdb;

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
			array(  'handle' => 'colist-modal_script',
					'src'    => $this->settings['path'] . 'js/colist_modal.js',
					'deps'   => array( 'jquery' )
			),
		);
		foreach( $this->scripts as $script ) {
			wp_register_script( $script['handle'], $script['src'], $script['deps'] );
		}

		//******** styles
		$this->styles = array(
			'colist-modal_style' => $this->settings['path'] . 'css/colist_modal.css',
			'colist-admin_style' => $this->settings['path'] . 'css/colist.css',
		);
		foreach( $this->styles as $handle => $src ) {
			wp_register_style( $handle, $src, false, $this->settings['version'] );
		}

		if ( is_admin() ) {
			//******** ajax nonce
			$config = array(
				'ajax_path'  => admin_url( 'admin-ajax.php' ),
				'ajax_nonce' => esc_js( wp_create_nonce( 'colist_nonce') ),
				'multisite'  => is_multisite() ? 1 : 0,
				'sites'      => array()
			);
			//******** multisite info
			$blogs = $wpdb->get_results("SELECT blog_id FROM {$wpdb->blogs}
											WHERE site_id = '{$wpdb->siteid}'
												AND spam = '0'
												AND deleted = '0'
												AND archived = '0';");
			foreach ( $blogs as $blog ) {
				$blog = array(
					'@id'        => $blog->blog_id,
					'@name'      => get_blog_option( $blog->blog_id, 'blogname' )
				);
				array_push( $config['sites'], $blog );
			}
			//******** output config
			wp_localize_script( 'colist-admin_script',  'colist_cfg', $config );


			//******** modal dialog customize
			wp_enqueue_style( array( 'colist-modal_style' ) );
			wp_enqueue_script( array( 'colist-modal_script' ) );

			//******** ajax
			add_action( 'wp_ajax_colist/get_folder_list', array( $this, 'Get_Folder_List' ) );
			add_action( 'wp_ajax_colist/get_recent_uploads', array( $this, 'Get_Recent_Uploads' ) );
			add_action( 'wp_ajax_colist/get_network_shared', array( $this, 'Get_Network_Shared' ) );

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

		// set path
		$path = isset( $_REQUEST['path'] )? $_REQUEST['path'] : '';
		$path = WP_CONTENT_DIR .'/uploads/'. $path .'/';
		// get directory listing
		$handle = opendir( $path );
		while ( false !== ( $item = readdir( $handle ) ) ) {
			if ( in_array( $item, $this->settings['ignore'] ) ) continue;
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
			if ( in_array( $ofile['@extension'], $this->settings['img_types'] ) ) {
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

	function Get_Recent_Uploads() {
		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );

		$attachment = get_posts( array(
			'post_type' => 'attachment',
			'orderby' => 'modified',
			'posts_per_page' => 21
		) );

		$res = array();
		foreach( $attachment as $file ) {
			$item_path = str_replace( 'http://'. $_SERVER['SERVER_NAME'], '', $file->guid );
			$fs_path = $_SERVER['DOCUMENT_ROOT'] . $item_path;
			$extension = strtolower( pathinfo( $file->guid, PATHINFO_EXTENSION ) );
			$ofile = array(
				'@id'        => $_REQUEST['path'] .'/'. $file->post_title .'.'. $extension,
				'@path'      => $item_path,
				'@name'      => $file->post_title .'.'. $extension,
				'@size'      => round( filesize( $fs_path ) / 1024),
				'@modified'  => $file->post_modified,
				'@extension' => $extension
			);
			if ( in_array( $ofile['@extension'], $this->settings['img_types'] ) ) {
				list( $ofile['@width'], $ofile['@height'] ) = getimagesize( $fs_path );
			}
			array_push( $res, $ofile );
		}

		echo json_encode( array(
			'@id'   => 'recent_uploads',
			'file'  => $res
		) );

		// exit properly - ajax call
		die( 1 );
	}

	function Get_Network_Shared() {
		global $wpdb;

		// set content type
		header('Content-type: application/json');
		// check nonce
		if ( !wp_verify_nonce( $_POST['nonce'], 'colist_nonce' ) ) die( -1 );
		// switch blog
		switch_to_blog( $_POST['siteid'] );

		$attachment = get_posts( array(
			'post_type'      => 'attachment',
			'posts_per_page' => -1
		) );

		$res = array();
		foreach( $attachment as $file ) {
			$item_path = str_replace( 'http://'. $_SERVER['SERVER_NAME'], '', $file->guid );
			$fs_path = $_SERVER['DOCUMENT_ROOT'] . $item_path;
			$extension = strtolower( pathinfo( $file->guid, PATHINFO_EXTENSION ) );
			$ofile = array(
				'@id'        => $_REQUEST['siteid'] .'/'. $file->post_title .'.'. $extension,
				'@path'      => $item_path,
				'@name'      => $file->post_title .'.'. $extension,
				'@size'      => round( filesize( $fs_path ) / 1024),
				'@modified'  => $file->post_modified,
				'@extension' => $extension
			);
			if ( in_array( $ofile['@extension'], $this->settings['img_types'] ) ) {
				list( $ofile['@width'], $ofile['@height'] ) = getimagesize( $fs_path );
			}
			array_push( $res, $ofile );
		}

		echo json_encode( array(
			'@id'   => 'network_shared',
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