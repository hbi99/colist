
// DOM Controled by Hakan Bilgin (c) 2014

(function(win, document, $) {
	'use strict';

	var colist_modal = {
		init: function() {
			var iframe = $('.media-iframe iframe');
			if (iframe.length) {
				iframe[0].contentWindow.colist.doEvent('/customize-parent-frame/');
			}
			$(document).on('click', '[data-cmd]', this.doEvent);
			$(document).bind('mousedown', this.doEvent);

			/*
			// regular insert media
			$(document).on('click', '.insert-media', function( event ) {
			    $('.media-menu .media-menu-item').each(function() {
			    	if (this.innerHTML !== 'Colist') return;
			    	$(this).trigger('click');
			    });
			});

			// acf insert media
			$(document).on('click', '.acf-image-uploader .add-image', function( event ) {
				var media_frame = $('.media-frame.wp-core-ui.hide-menu'),
					media_modal = $('.media-modal.wp-core-ui', media_frame),
					media_content = $('.media-frame-content', media_frame),
					media_title = $('.media-frame-title h1', media_frame);

				media_frame.addClass('hide-router');
				media_title.html('Colist');
				media_content.html('<div class="media-iframe"><iframe src="http://local.glasberga/wp-admin/media-upload.php?chromeless=1&amp;post_id=77&amp;tab=colistframe"></iframe></div>');
			});
			*/
		},
		hideSubmenu: function(doUnbind) {
			var root = colist_modal;
			if (root.submenu) {
				root.submenu.hide().parent().removeClass('active');
				root.submenu = false;
			}
			if (!doUnbind) {
				$(document).unbind('mousedown', root.hideSubmenu);
			}
		},
		doEvent: function(event) {
			var root = colist_modal,
				type = (typeof(event) === 'string')? event : event.type,
				target,
				el,
				il, i;

			switch (type) {
				// native events
				case 'keydown':
					if (event.which === 13) {
						root.getColist();
						root.colist.doEvent('/show-search-results/', this.value);
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
						fnEls    = $('.menu_filename', toolbar);
					for (i=0, il=selectInfo.length; i<il; i++) {
						if (selectInfo[i].extension === '') isDir = true;
						isDir = (selectInfo[i].extension.slice(0,1) === '_') || isDir;
					}
					isFile = il > 0;
					isMulti = il > 1;

					root.hideSubmenu();

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
					var selected_filename = root.colist.doEvent('/language-phrase/', 'selected_files');
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
					root.colist.doEvent('/attenuate-siblings/', (isExpand ? 'off' : 'on'));
					break;
				case '/toggle-asc-desc/':
					el = arguments[1].find('figure');
					var isAsc  = el.hasClass('icon-sort-amount-asc'),
						state  = isAsc ? 'desc' : 'asc';

					root.getColist();

					// change icon
					el.removeClass('icon-sort-amount-asc icon-sort-amount-desc').addClass('icon-sort-amount-'+ state);
					// forward command
					root.colist.doEvent('/toggle-sort-asc/', (isAsc ? 'descending' : 'ascending'));
					break;
				case '/download-selected/':
				case '/delete-selected/':
					root.colist.doEvent(type);
					break;
				case '/upload-file/':
					break;
				case '/replace-selected/':
					break;
				case '/colist-use-selected/':
					break;
				case '/view-refresh/':
					$('.media-iframe iframe')[0].contentWindow.location.reload();
					break;
				case '/append-toolbar/':
					var titleEl = $('.media-frame-title');
					titleEl.find('.colist-toolbar').remove();
					titleEl.append( arguments[1] );
					// listening for 'return'
					titleEl.find('input').bind('keydown', root.doEvent);
					// show wp toolbar
					$('.media-frame.wp-core-ui').removeClass('hide-toolbar');
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
					root.colist.doEvent('/change-sorting/', type.split('-')[2].slice(0,-1));
					break;
				case '/about-colist/':
					break;
			}
		},
		getColist: function() {
			this.colist = $('.media-iframe iframe')[0].contentWindow.colist;
			return this.colist;
		}
	};

	win.colist_modal = colist_modal;

	$(document).ready(function() {
		if (!$('#tmpl-media-modal').length) return;
		colist_modal.init();
	});

})(window, document, jQuery);

// I really dont like Backbone