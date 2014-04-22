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
</div>

<script type="defiant/xsl-template">

	<xsl:template name="toolbar">
		<div class="colist-toolbar">
			<ul class="colist-group">
				<li data-cmd="/colist-reload/" title="Refresh"><figure class="icon-rotate-left">&#160;</figure></li>
				<li data-cmd="/colist-use-selected/" title="Embed on page" class="disabled"><figure class="icon-check">&#160;</figure></li>
			</ul>
			<ul class="colist-group">
				<li class="extended" title="Order by..."><figure class="icon-filter">&#160;</figure>
					<ul class="submenu">
						<li data-cmd="/order-by-name/">Name</li>
						<li data-cmd="/order-by-kind/">Kind</li>
						<li data-cmd="/order-by-date/">Date</li>
						<li data-cmd="/order-by-size/">Size</li>
						<li class="divider"></li>
						<li data-cmd="/order-by-none/" class="checked">None</li>
					</ul>
				</li>
			</ul>
			<ul class="colist-group">
				<li class="extended" title="Settings"><figure class="icon-gear">&#160;</figure>
					<ul class="submenu">
						<li data-cmd="/delete-selected/">Delete selected item</li>
						<li data-cmd="/hide-multiples/" class="checked">Hide multiple sizes</li>
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
			<xsl:attribute name="data-id"><xsl:value-of select="./@id"/></xsl:attribute>
			<div class="frame">
				<div class="resize">&#160;</div>
				<div class="content">
					<xsl:if test="count(./file) = 0">
						<div class="folder_empty">This folder is empty</div>
					</xsl:if>

					<xsl:for-each select="./file">
					<xsl:sort order="ascending" select="@extension"/>
					<xsl:sort order="ascending" select="@name"/>

					<xsl:choose>
						<xsl:when test="@type = 'divider'">
							<div class="divider">&#160;</div>
						</xsl:when>
						<xsl:otherwise>
							<div class="row">
								<xsl:if test="@action">
									<xsl:attribute name="class">row hasChildren</xsl:attribute>
									<xsl:attribute name="data-cmd"><xsl:value-of select="@action"/></xsl:attribute>
									<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
								</xsl:if>
								<figure>
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
				</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template name="single">
		<div class="column">
			<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
			<xsl:attribute name="style"><xsl:choose>
				<xsl:when test="@extension = 'gif' or @extension = 'jpg' or extension = 'jpeg' or @extension = 'png'">width: 250px;</xsl:when>
				<xsl:when test="@extension = 'txt'">width: 350px;</xsl:when>
			</xsl:choose></xsl:attribute>
			<div class="frame">
				<div class="resize">&#160;</div>
				<div class="content">
					<div class="file-preview">
						<xsl:choose>
							<xsl:when test="@extension = 'gif' or @extension = 'jpg' or extension = 'jpeg' or @extension = 'png'">
								<div class="file-image">
									<xsl:attribute name="style">background-image: url(<xsl:value-of select="@path"/>);</xsl:attribute>
									&#160;</div>
							</xsl:when>
							<xsl:when test="@extension = 'txt'">
								<pre class="file-text"></pre>
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
						<div class="detail-row file-size"><var>Size</var> <span><xsl:value-of select="@size"/> KB</span></div>
						<xsl:if test="@width and @height">
							<div class="detail-row file-dim"><var>Dimensions</var> <span><xsl:value-of select="@width"/> x <xsl:value-of select="@height"/></span></div>
						</xsl:if>
						<div class="detail-row file-date"><var>Uploaded</var> <span><xsl:value-of select="@modified"/></span></div>
					</div>
				</div>
			</div>
		</div>
	</xsl:template>

</script>
