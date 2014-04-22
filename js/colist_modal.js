
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

			setTimeout(function() {
				$('#insert-media-button').trigger('click');

				setTimeout(function() {
					$('.media-menu-item:nth(5)').trigger('click');
				}, 500);

			}, 100);
		},
		doEvent: function(event) {
			var root = colist_modal,
				type = (typeof(event) === 'string')? event : event.type,
				il, i;

			switch (type) {
				// native events
				case 'click':
					event.preventDefault();
					var cmd = this.getAttribute('href') || this.getAttribute('data-cmd');
					root.doEvent(cmd, $(this), event);
					break;
				// custom events
				case '/colist-settings/':
					break;
				case '/colist-delete-selected/':
					break;
				case '/colist-reload/':
					$('.media-iframe iframe')[0].contentWindow.location.reload();
					break;
				case '/colist-use-selected/':
					break;
				case '/append-toolbar/':
					var titleEl = $('.media-frame-title');
					titleEl.find('.colist-toolbar').remove()
					titleEl.append( arguments[1] );
					break;
				// menu events
				case '/order-by-name/':
				case '/order-by-kind/':
				case '/order-by-date/':
				case '/order-by-size/':
				case '/order-by-none/':
					break;
				case '/delete-selected/':
					break;
				case '/hide-multiples/':
					break;
				case '/about-colist/':
					break;
			}
		}
	};

	win.colist_modal = colist_modal;

	$(document).ready(function() {
		colist_modal.init();
	});

})(window, document, jQuery);
