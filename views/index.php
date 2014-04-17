<?php

// wp stuff
media_upload_header();
wp_enqueue_style( 'media' );

// scripts
wp_enqueue_style( array( "colflow-admin_style" ) );
wp_enqueue_script( array( "colflow-admin_script" ) );

?>
<a class="tmp_reload" href="javascript: document.location.reload();">Reload</a>

<div class="colflow">
	<div class="reel">

		<div class="column">
			<div class="frame">
				<div class="content">
					<div class="row active"><figure class="icon-folder"></figure><span>Folder 1</span></div>
					<div class="row"><figure class="icon-folder"></figure><span>Folder 2</span></div>
					<div class="row"><figure class="icon-file-o"></figure><span>.htaccess</span></div>
					<div class="row"><figure class="icon-file-text-o"></figure><span>readme.md</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 2.png</span></div>
				</div>
			</div>
		</div>

		<div class="column">
			<div class="frame">
				<div class="content">
					<div class="row"><figure class="icon-picture-o"></figure><span>Image 1.png</span></div>
					<div class="row active"><figure class="icon-picture-o"></figure><span>Image 2.png</span></div>
				</div>
			</div>
		</div>

		<div class="column">
			<div class="frame">
				<div class="content">
					
					<div class="file-preview">
						<figure class="icon-picture-o"></figure>
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