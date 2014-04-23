
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
			$(document).on('mousedown', '.extended', this.doEvent);

			setTimeout(function() {
				$('#insert-media-button').trigger('click');

				setTimeout(function() {
					$('.media-menu-item:nth(6)').trigger('click');
				}, 500);
			}, 100);
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
				el,
				il, i;

			switch (type) {
				// native events
				case 'keydown':
					if (event.which === 13) {
						$('.media-iframe iframe')[0]
							.contentWindow
							.colist.doEvent('/show-search-results/', this.value);
						event.preventDefault();
						this.blur();
					}
					break;
				case 'mousedown':
					el = $(this);
					if (el.hasClass('extended')) {
						event.preventDefault();

						el.addClass('active');
						root.hideSubmenu(true);
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
						fnEls    = $('.colist-toolbar .menu_filename'),
						colist   = $('.media-iframe iframe')[0].contentWindow.colist;
					for (i=0, il=selectInfo.length; i<il; i++) {
						isDir = (selectInfo[i].extension.slice(0,1) === '_') || isDir;
					}
					isFile = il > 0;
					isMulti = il > 1;

					root.hideSubmenu();

					var selected_filename = colist.doEvent('/language-phrase/', 'selected_files');

					if (isFile && !isDir) {
						fnEls.parent().removeClass('hideMe');
					} else {
						fnEls.parent().addClass('hideMe');
					}

					if (isFile && !isMulti) {
						selected_filename = selectInfo[0].filename;
					}

					fnEls.html( selected_filename );
					break;
				case '/toggle-list-multi/':
					el = arguments[1].find('figure');
					var isExpand = el.hasClass('icon-expand'),
						state    = isExpand ? 'collapse' : 'expand',
						colist   = $('.media-iframe iframe')[0].contentWindow.colist;

					// change icon
					el.removeClass('icon-expand icon-collapse').addClass('icon-'+ state);
					// forward command
					colist.doEvent('/attenuate-siblings/', (isExpand ? 'off' : 'on'));
					break;
				case '/toggle-asc-desc/':
					el = arguments[1].find('figure');
					var isAsc  = el.hasClass('icon-sort-amount-asc'),
						state  = isAsc ? 'desc' : 'asc',
						colist = $('.media-iframe iframe')[0].contentWindow.colist;

					// change icon
					el.removeClass('icon-sort-amount-asc icon-sort-amount-desc').addClass('icon-sort-amount-'+ state);
					// forward command
					colist.doEvent('/toggle-sort-asc/', (isAsc ? 'descending' : 'ascending'));
					break;
				case '/upload-file/':
					break;
				case '/download-selected/':
					break;
				case '/delete-selected/':
					break;
				case '/hide-selected/':
					break;
				case '/view-refresh/':
					$('.media-iframe iframe')[0].contentWindow.location.reload();
					break;
				case '/colist-use-selected/':
					break;
				case '/append-toolbar/':
					var titleEl = $('.media-frame-title');
					titleEl.find('.colist-toolbar').remove()
					titleEl.append( arguments[1] );
					// listening for 'return'
					titleEl.find('input').bind('keydown', root.doEvent);
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

					var colist = $('.media-iframe iframe')[0].contentWindow.colist;
					colist.doEvent('/change-sorting/', type.split('-')[2].slice(0,-1));
					break;
				case '/about-colist/':
					break;
			}
		}
	};

	win.colist_modal = colist_modal;

	$(document).ready(function() {
		if (!$('#tmpl-media-modal').length) return;
		colist_modal.init();
	});

})(window, document, jQuery);
