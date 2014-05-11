
// DOM Controled by Hakan Bilgin (c) 2014

(function(win, document, $) {
	'use strict';

	var colist = {
		init: function() {
			var iframe = $('.media-iframe iframe'),
				doc = $(document);
			if (iframe.length) {
				iframe[0].contentWindow.colist_frame.doEvent('/customize-parent-frame/');
			}
			doc.on('click', '[data-cmd]', this.doEvent);
			doc.bind('mousedown', this.doEvent);

			this.opener = win.dialogArguments || opener || parent || top;

			this.bridgeWpBase(doc);
		},
		bridgeWpBase: function(doc) {
			/*
			doc.on('click', '.insert-media, .insert-media-button', function( event ) {
				var wpmf = wp.media.frame,
					media_frame =  $('.media-frame.wp-core-ui').css({'opacity': '0'}),
					fn = function() {
						$('.media-menu .media-menu-item').each(function() {
							if (this.innerHTML !== 'Colist') return;
							media_frame.css({'opacity': ''});
							$(this).trigger('click');
						});
						doc.off('ajaxComplete', fn);
					};
				if (!wpmf) doc.on('ajaxComplete', fn);
				else fn();
			});
			*/

			var fn = function(el) {
				var colistEl = el.find('.media-frame-colist');
				if ( colistEl.length ) return;
				el.find('.media-frame-content')
					.after('<div class="media-frame-colist">'+
							'<div class="media-frame-title"><h1>Colist</h1></div>'+
							'<div class="media-frame-content"><div class="media-iframe">'+
							'<iframe src="http://local.glasberga/wp-admin/media-upload.php?chromeless=1&amp;post_id=77&amp;tab=colistframe"></iframe></div>'+
							'</div></div>');
			};

			// acf insert media
			doc.on('click', '.acf-image-uploader, .add-image', function( event ) {
				fn(wp.media.frame.$el);
			});
			
			var wpfi = wp.media.featuredImage.frame();
			wpfi.on('open', function() {
				fn(wpfi.$el);
			});
		},
		hideSubmenu: function(doUnbind) {
			var root = colist;
			if (root.submenu) {
				root.submenu.hide().parent().removeClass('active');
				root.submenu = false;
			}
			if (!doUnbind) {
				$(document).unbind('mousedown', root.hideSubmenu);
			}
		},
		doEvent: function(event) {
			var root = colist,
				type = (typeof(event) === 'string')? event : event.type,
				target,
				coreEl,
				insertBtn,
				el,
				il, i;

			switch (type) {
				// native events
				case 'keydown':
					if (event.which === 13) {
						root.getColist();
						root.colist_frame.doEvent('/show-search-results/', this.value);
						event.preventDefault();
						this.blur();
					}
					break;
				case 'mousedown':
					target = event.target;
					el = $( target.nodeName.toLowerCase() === 'figure' ? target.parentNode : target );
					if (!target.getAttribute('data-cmd') && !target.parentNode.getAttribute('data-cmd')) {
						root.hideSubmenu(true);
					}

					if (el.hasClass('extended')) {
						event.preventDefault();

						el.addClass('active');
						root.submenu = el.find('.submenu').show();

						if (!root.submenu) {
							$(document).bind('mousedown', root.hideSubmenu);
						}
					}
					break;
				case 'click':
					var cmd = this.getAttribute('href') || this.getAttribute('data-cmd');
					el = $(this);
					event.preventDefault();
					root.hideSubmenu();
					if (!el.hasClass('disabled')) {
						root.doEvent(cmd, el, event);
					}
					break;
				// custom events
				case '/focusin-search-field/':
					setTimeout(function() {
						$('.colist-toolbar input').focus();
					}, 1);
					break;
				case '/file-selected/':
					var selectInfo = arguments[1] || [],
						isFile,
						isDir,
						isMulti,
						fileName = '',
						toolbar  = $('.colist-toolbar'),
						fnEls    = $('.menu_filename', toolbar),
						wpm = wp.media,
						wpmf = wpm.frame,
						wp_selection = wpmf.state().get('selection'),
						wp_attachment,
						i;

					coreEl = $('.media-frame.wp-core-ui');
					insertBtn = coreEl.find('.media-frame-toolbar .media-button-insert');
					insertBtn.attr({'disabled': 'disabled'});

					wpmf.state().reset();

					for (i=0, il=selectInfo.length; i<il; i++) {
						if (selectInfo[i].extension === '') isDir = true;
						isDir = (selectInfo[i].extension.slice(0,1) === '_') || isDir;

						if (selectInfo[i].id) {
							wp_attachment = wpm.attachment(selectInfo[i].id);
							wp_attachment.fetch();
							
							if (wp_selection) {
								wp_selection.add(wp_attachment);
							} else {
								insertBtn.removeAttr('disabled');
								//wp_selection = wpm.collection.add(wp_selection);
								//wp_selection.attach(wp_attachment);
							}
						}
					}
					isFile = il > 0;
					isMulti = il > 1;

					root.hideSubmenu();
					root.selectInfo = selectInfo;

					// enable/disable toolbar & menu - depending on selection
					if (isFile && !isDir) {
						fnEls.removeClass('hideMe');
						$('.menu-use, .menu-delete', toolbar).removeClass('disabled');
					} else {
						fnEls.addClass('hideMe');
						$('.menu-use, .menu-delete', toolbar).addClass('disabled');
					}
					if (isFile && !isDir && !isMulti) $('.menu-download, .menu-replace', toolbar).removeClass('disabled');
					else $('.menu-download, .menu-replace', toolbar).addClass('disabled');
					
					root.getColist();
					var selected_filename = root.colist_frame.doEvent('/language-phrase/', 'selected_files');
					if (isFile && !isMulti) {
						selected_filename = selectInfo[0].filename;
					}

					fnEls.html( selected_filename );
					break;
				case '/toggle-list-multi/':
					el = arguments[1].find('figure');
					var isExpand = el.hasClass('icon-expand'),
						tState   = isExpand ? 'collapse' : 'expand';

					root.getColist();

					// change icon
					el.removeClass('icon-expand icon-collapse').addClass('icon-'+ tState);
					// forward command
					root.colist_frame.doEvent('/attenuate-siblings/', (isExpand ? 'off' : 'on'));
					break;
				case '/toggle-asc-desc/':
					el = arguments[1].find('figure');
					var isAsc  = el.hasClass('icon-sort-amount-asc'),
						state  = isAsc ? 'desc' : 'asc';

					root.getColist();

					// change icon
					el.removeClass('icon-sort-amount-asc icon-sort-amount-desc').addClass('icon-sort-amount-'+ state);
					// forward command
					root.colist_frame.doEvent('/toggle-sort-asc/', (isAsc ? 'descending' : 'ascending'));
					break;
				case '/download-selected/':
				case '/delete-selected/':
					root.colist_frame.doEvent(type);
					break;
				case '/upload-file/':
					break;
				case '/replace-selected/':
					break;
				case '/colist-use-selected/':
					var htm = '',
						files = root.selectInfo;

					for (i=0, il=files.length; i<il; i++) {
						switch (files[i].extension) {
							case 'pdf':
								htm += '<a href="'+ files[i].path +'">'+ files[i].name +'</a>';
								break;
							case 'png':
							case 'gif':
							case 'jpg':
							case 'jpeg':
								htm += '<img src="'+ files[i].path +'" alt="" width="'+ files[i].width +'" height="'+ files[i].height +' />';
								break;
						}
					}
					root.opener.send_to_editor(htm);
					// reset colist
					root.colist_frame.doEvent('/reset-colist/');
					break;
				case '/reset-colist/':
					break;
				case '/view-refresh/':
					el = arguments[1];
					el.parents('.media-frame').find('.media-iframe iframe')[0].contentWindow.location.reload();
					break;
				case '/dispose-colist/':
					coreEl = $('.media-frame.wp-core-ui');
					insertBtn = coreEl.find('.media-frame-toolbar .media-button-insert');
					insertBtn.unbind('click', root.doEvent);
					break;
				case '/append-toolbar/':
					coreEl = $('.media-frame.wp-core-ui');
					var rootEl = coreEl.find('.media-frame-colist'),
						titleEl = coreEl.find('.media-frame-title');
					titleEl.find('.colist-toolbar').remove();
					titleEl.append( arguments[1] );
					// listening for 'return'
					titleEl.find('input').bind('keydown', root.doEvent);
					// show wp toolbar
					coreEl.removeClass('hide-toolbar');
					if (!coreEl.hasClass('hide-menu')) {
						insertBtn = coreEl.find('.media-frame-toolbar .media-button-insert');
						insertBtn
								//.removeAttr('disabled')
								.attr({'href': '/colist-use-selected/'})
								.bind('click', root.doEvent);
					}
					break;
				// menu events
				case '/order-by-name/':
				case '/order-by-extension/':
				case '/order-by-modified/':
				case '/order-by-size/':
				case '/order-by-none/':
					el = arguments[1];
					el.parents('.submenu').find('.checked').removeClass('checked');
					el.addClass('checked');

					root.getColist();
					root.colist_frame.doEvent('/change-sorting/', type.split('-')[2].slice(0,-1));
					break;
				case '/about-colist/':
					break;
			}
		},
		getColist: function() {
			this.colist_frame = $('.media-iframe iframe')[0].contentWindow.colist_frame;
			return this.colist_frame;
		}
	};

	win.colist = colist;

	$(document).ready(function() {
		if (!$('#tmpl-media-modal').length) return;
		colist.init();
	});

})(window, document, jQuery);

// I really dont like Backbone