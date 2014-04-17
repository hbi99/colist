<?php

// wp stuff
media_upload_header();
wp_enqueue_style( 'media' );

// scripts
wp_enqueue_style( array( "colist-admin_style" ) );
wp_enqueue_script( array( "colist-admin_script" ) );

?>
<a class="tmp_reload" href="javascript: document.location.reload();">Reload</a>

<div class="colist">
	<div class="reel">

		<div class="column">
			<div class="frame">
				<div class="resize"></div>
				<div class="content">
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row active"><figure class="icon-folder"></figure><span>Folder 1</span></div>
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
				</div>
			</div>
		</div>

		<div class="column">
			<div class="frame">
				<div class="resize"></div>
				<div class="content">
					<div class="row active"><span class="processing"></span><figure class="icon-folder"></figure><span>Folder Folder Folder Folder </span></div>
					<div class="row"><span class="processing"></span><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row"><span class="processing"></span><figure class="icon-file-o"></figure><span>.htaccess</span></div>
					<div class="row"><figure class="icon-file-text-o"></figure><span>readme.md</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 2.png</span></div>
				</div>
			</div>
		</div>

		<div class="column active">
			<div class="frame">
				<div class="resize"></div>
				<div class="content">
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row active"><span class="processing"></span><figure class="icon-picture-o"></figure><span>Image 2.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
				</div>
			</div>
		</div>

		<div class="column">
			<div class="frame">
				<div class="resize"></div>
				<div class="content">
					
					<div class="file-preview">
						<!-- filetype: text content -->
						<pre class="file-text hideMe">
&lt;?php
/** PHP file
 */

	function __construct() {
		//******** settings
		$this->settings = array(
			'path' => plugin_dir_url( __FILE__ ),
			'dir' => plugin_dir_path( __FILE__ ),
			'version' => '0.0.1'
		);
		//******** ajax
		add_action( 'wp_ajax_mce_fonts/save_fonts', array( $this, 'save_fonts' ) );
		
		add_action( 'init', array( $this, 'init' ), 1 );
	}

?&gt;
						</pre>
						<!-- filetype: image content -->
						<div class="file-image hideMe" style="background-image: url('http://frojd.theforumist/wp-content/uploads/2014/02/The_Forum_mensfashion_01-500x330.jpg');"></div>
						<!-- default -->
						<div class="file-generic">
							<span class="file-extension">pdf</span>
						</div>
					</div>
					<div class="file-details">
						<div class="detail-row">Name <span>Image 2.png</span></div>
						<div class="detail-row">Kind <span>PNG</span></div>
						<div class="detail-row">Size <span>145 Kb</span></div>
						<div class="detail-row">Dimensions <span>597 x 196</span></div>
						<div class="detail-row">Uploaded <span>2014-02-25 12:14</span></div>
					</div>

				</div>
			</div>
		</div>

	</div>
</div>