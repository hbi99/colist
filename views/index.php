<?php

// wp stuff
media_upload_header();
wp_enqueue_style( 'media' );

// scripts
wp_enqueue_style( array( 'colist-admin_style' ) );
wp_enqueue_script( array( 'colist-admin_script' ) );

?>

<div class="colist">
	<div class="reel">
		<div class="progressbar">
			<div class="progress"></div>
		</div>
	</div>

	<div class="language hideMe">
		<var class="files">files</var>
		<var class="selected_files">selected files</var>
	</div>
</div>

<script type="defiant/xsl-template">

	<xsl:template name="toolbar">
		<div class="colist-toolbar">
			<ul class="colist-group">
				<li data-cmd="/view-refresh/" title="Refresh"><figure class="icon-rotate-left">&#160;</figure></li>
				<li data-cmd="/toggle-list-multi/" title="Toggle image siblings"><figure class="icon-expand">&#160;</figure></li>
				<li data-cmd="/colist-use-selected/" title="Embed on page" class="disabled"><figure class="icon-check">&#160;</figure></li>
			</ul>
			<ul class="colist-group">
				<li data-cmd="/toggle-asc-desc/" title="Toggle Ascending"><figure class="icon-sort-amount-asc">&#160;</figure></li>
				<li class="extended"><figure class="icon-filter" title="Order by...">&#160;</figure>
					<ul class="submenu">
						<li data-cmd="/order-by-name/">Name</li>
						<li data-cmd="/order-by-extension/" class="checked">Filetype</li>
						<li data-cmd="/order-by-modified/">Date uploaded</li>
						<li data-cmd="/order-by-size/">Size</li>
						<li class="divider"></li>
						<li data-cmd="/order-by-none/">None</li>
					</ul>
				</li>
			</ul>
			<ul class="colist-group">
				<li class="extended"><figure class="icon-gear" title="Settings">&#160;</figure>
					<ul class="submenu" title="">
						<li data-cmd="/upload-file/">Upload files</li>
						<li data-cmd="/download-selected/" class="hideMe">Download "<span class="menu_filename">&#160;</span>"</li>
						<li data-cmd="/delete-selected/" class="hideMe">Delete "<span class="menu_filename">&#160;</span>"</li>
						<li data-cmd="/replace-selected/" class="hideMe">Replace "<span class="menu_filename">&#160;</span>"</li>
						<li class="divider"></li>
						<li data-cmd="/about-colist/">About Colist</li>
					</ul>
				</li>
			</ul>
			<div class="colist_search">
				<input type="text" name="colist-search" placeholder="Search..."/>
			</div>
		</div>
	</xsl:template>
	
	<xsl:template name="column">
		<div class="column active">
			<xsl:attribute name="data-rpath"><xsl:value-of select="./@rpath"/></xsl:attribute>
			<div class="frame">
				<div class="resize">&#160;</div>
				<div class="content">
					<xsl:if test="count(./file) = 0">
						<xsl:choose>
							<xsl:when test="@rpath = 'search_results'">
								<div class="folder_empty">Enter search phrase</div>
							</xsl:when>
							<xsl:otherwise>
								<div class="folder_empty">This folder is empty</div>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
					<xsl:call-template name="rows">
						<xsl:with-param name="toLoop" select="./options" />
					</xsl:call-template>
					<xsl:call-template name="rows">
						<xsl:with-param name="toLoop" select="./file" />
					</xsl:call-template>
				</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template name="rows">
		<xsl:param name="toLoop" />

		<xsl:for-each select="$toLoop">
		<xsl:sort order="ascending" select="@order"/>
		<xsl:sort order="ascending" select="@extension"/>
			<xsl:choose>
				<xsl:when test="@type = 'divider'">
					<div class="divider">&#160;</div>
				</xsl:when>
				<xsl:otherwise>
					<div class="row">
						<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
						<xsl:if test="@action">
							<xsl:attribute name="class">row hasChildren</xsl:attribute>
							<xsl:attribute name="data-cmd"><xsl:value-of select="@action"/></xsl:attribute>
							<xsl:attribute name="data-rpath"><xsl:value-of select="@rpath"/></xsl:attribute>
						</xsl:if>
						<figure>
							<xsl:attribute name="data-extension"><xsl:value-of select="@extension"/></xsl:attribute>
							<xsl:attribute name="class"><xsl:choose>
								<xsl:when test="@icon">icon-<xsl:value-of select="@icon"/></xsl:when>
								<xsl:when test="@extension = '_web'">icon-sitemap</xsl:when>
								<xsl:when test="@extension = '_dir'">icon-folder</xsl:when>
								<xsl:when test="@extension = 'txt' or @extension = 'pdf'">icon-file-text-o</xsl:when>
								<xsl:when test="@extension = 'gif' or @extension = 'jpg' or extension = 'jpeg' or @extension = 'png'">icon-picture-o</xsl:when>
								<xsl:when test="@extension = 'avi' or @extension = 'mov'">icon-film</xsl:when>
								<xsl:otherwise>icon-file-o</xsl:otherwise>
							</xsl:choose></xsl:attribute>
							&#160;</figure>
						<span class="filename"><xsl:value-of select="@name"/></span>
					</div>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="single">
		<xsl:variable name="isImage" select="@extension='gif' or @extension='jpg' or extension='jpeg' or @extension='png'" />
		<xsl:variable name="isCleartext" select="@extension='txt' or @extension='js' or @extension='json' or @extension='php'" />

		<div class="column preview">
			<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
			<xsl:attribute name="data-rpath"><xsl:value-of select="@rpath"/></xsl:attribute>
			<xsl:attribute name="style"><xsl:choose>
				<xsl:when test="$isImage">width: 269px;</xsl:when>
				<xsl:when test="$isCleartext">width: 283px;</xsl:when>
				<xsl:otherwise>width: 251px;</xsl:otherwise>
			</xsl:choose></xsl:attribute>
			<div class="frame">
				<div class="resize">&#160;</div>
				<div class="content">
					<div class="file-preview">
						<xsl:choose>
							<xsl:when test="$isImage">
								<div class="file-image">
									<xsl:attribute name="style">background-image: url(<xsl:choose>
										<xsl:when test="@medium"><xsl:value-of select="@medium"/></xsl:when>
										<xsl:otherwise><xsl:value-of select="@path"/></xsl:otherwise>
										</xsl:choose>);</xsl:attribute>
									&#160;</div>
							</xsl:when>
							<xsl:when test="$isCleartext">
								<pre class="file-text">
									<div class="progressbar"><div class="progress"></div></div>
								</pre>
							</xsl:when>
							<xsl:otherwise>
								<div class="file-generic">
									<span class="file-extension"><xsl:value-of select="@extension"/></span>
								</div>
							</xsl:otherwise>
						</xsl:choose>
					</div>
					<div class="file-details">
						<div class="detail-row file-name"><var>Name</var> <span><xsl:value-of select="@name"/></span></div>
						<div class="detail-row file-ext"><var>Kind</var> <span><xsl:value-of select="@extension"/></span></div>
						<div class="detail-row file-size"><var>Size</var> <span><xsl:choose>
							<xsl:when test="starts-with(@size, '.')"><xsl:value-of select="substring(@size, 2, string-length(@size))"/> bytes</xsl:when>
							<xsl:otherwise><xsl:value-of select="@size"/> KB</xsl:otherwise>
						</xsl:choose></span></div>
						<xsl:if test="@width and @height">
							<div class="detail-row file-dim"><var>Dimensions</var> <span><xsl:choose>
									<xsl:when test="@width = 'null'">N/A</xsl:when>
									<xsl:otherwise><xsl:value-of select="@width"/> x <xsl:value-of select="@height"/></xsl:otherwise>
								</xsl:choose></span></div>
						</xsl:if>
						<div class="detail-row file-date"><var>Uploaded</var> <span><xsl:value-of select="substring(@modified, 1, 10)"/> <span><xsl:value-of select="substring(@modified, 11, 6)"/></span></span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</xsl:template>

</script>
