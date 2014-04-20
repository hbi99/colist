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
		<div class="progressbar">
			<div class="progress"></div>
		</div>
	</div>
</div>

<script type="defiant/xsl-template">
	
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
					<div class="row">
						<figure class="icon-folder">
							<xsl:attribute name="class"><xsl:choose>
								<xsl:when test="@extension = '_dir'">icon-folder</xsl:when>
								<xsl:when test="@extension = 'txt' or @extension = 'pdf'">icon-file-text-o</xsl:when>
								<xsl:when test="@extension = 'gif' or @extension = 'jpg' or extension = 'jpeg' or @extension = 'png'">icon-picture-o</xsl:when>
								<xsl:when test="@extension = 'avi' or @extension = 'mov'">icon-film</xsl:when>
								<xsl:otherwise>icon-file-o</xsl:otherwise>
							</xsl:choose></xsl:attribute>
							&#160;</figure>
						<span class="filename"><xsl:value-of select="@name"/></span>
					</div>
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
