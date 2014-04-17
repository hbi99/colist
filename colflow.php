<?php
/**
 * Plugin Name: ColFlow
 * Plugin URI: 
 * Description: 
 * Version: 0.0.1
 * Author: Hakan Bilgin
 * Author URI:
 * License: GPLv2 or later
 */

class ColFlow {

	function __construct( ) {
		//******** settings
		$this->settings = array(
			'ns'      => 'ColFlow',
			'version' => '0.0.1',
			'path'    => plugin_dir_url( __FILE__ ),
			'dir'     => plugin_dir_path( __FILE__ )
		);
		//******** ajax
		//add_action( 'wp_ajax_colflow/do_ajax', array( $this, 'do_ajax' ) );
		
		add_action( 'init', array( $this, 'Init' ), 1 );
	}

	function __destruct( ) {
		
	}

	function Init( ) {
		//******** scripts
		$this->scripts = array(
			array(  'handle' => 'colflow-admin_script',
					'src'    => $this->settings['path'] . 'js/colflow.js',
					'deps'   => array( 'jquery' )
			),
		);
		foreach( $this->scripts as $script ) {
			wp_register_script( $script['handle'], $script['src'], $script['deps'] );
		}

		//******** ajax nonce
		$nonce = array(
			'ajax_path'  => admin_url( 'admin-ajax.php' ),
			'ajax_nonce' => esc_js( wp_create_nonce( 'colflow_nonce') ),
		);
		wp_localize_script( 'colflow-admin_script',  'colflow_cfg', $nonce );

		//******** styles
		$this->styles = array(
			'colflow-admin_style' => $this->settings['path'] . 'css/colflow.css',
		);
		foreach( $this->styles as $handle => $src ) {
			wp_register_style( $handle, $src, false, $this->settings['version'] );
		}
		
		if ( is_admin() ) {
			//******** filters
			add_filter( 'media_upload_tabs', array( $this, 'Add_Tab' ) );
			
			//******** actions
			add_action( 'media_upload_colflowframe', array( $this, 'Add_Iframe' ) );
		}
	}

	function Add_Tab( $tabs ) {
		$new_tab = array( 'colflowframe' => 'ColFlow' );
        return array_merge( $tabs, $new_tab );
	}

	function Add_Iframe() {
		return wp_iframe( array( $this, 'Create_View' ) );
	}

	function Create_View() {
        include_once( 'views/index.php' );
	}

}

function colflow() {
	global $colflow;
	if ( !isset( $colflow ) ) {
		$colflow = new ColFlow();
	}
	return $colflow;
}

// initialize
colflow();

?>