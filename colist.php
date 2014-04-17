<?php
/**
 * Plugin Name: Colist
 * Plugin URI: 
 * Description: 
 * Version: 0.0.1
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
			'dir'     => plugin_dir_path( __FILE__ )
		);
		//******** ajax
		//add_action( 'wp_ajax_colist/do_ajax', array( $this, 'do_ajax' ) );
		
		add_action( 'init', array( $this, 'Init' ), 1 );
	}

	function __destruct( ) {
		
	}

	function Init( ) {
		//******** scripts
		$this->scripts = array(
			array(  'handle' => 'colist-admin_script',
					'src'    => $this->settings['path'] . 'js/colist.js',
					'deps'   => array( 'jquery' )
			),
		);
		foreach( $this->scripts as $script ) {
			wp_register_script( $script['handle'], $script['src'], $script['deps'] );
		}

		//******** ajax nonce
		$nonce = array(
			'ajax_path'  => admin_url( 'admin-ajax.php' ),
			'ajax_nonce' => esc_js( wp_create_nonce( 'colist_nonce') ),
		);
		wp_localize_script( 'colist-admin_script',  'colist_cfg', $nonce );

		//******** styles
		$this->styles = array(
			'colist-admin_style' => $this->settings['path'] . 'css/colist.css',
		);
		foreach( $this->styles as $handle => $src ) {
			wp_register_style( $handle, $src, false, $this->settings['version'] );
		}
		
		if ( is_admin() ) {
			//******** filters
			add_filter( 'media_upload_tabs', array( $this, 'Add_Tab' ) );
			
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