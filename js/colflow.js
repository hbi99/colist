
// DOM Controled by Hakan Bilgin (c) 2014

(function(root, document, $) {
	'use strict';

	var colflow = {
		init: function() {
			$(document).bind('keydown', this.doEvent);
		},
		doEvent: function(event) {
			var type = event.type;

			switch (type) {
				case 'keydown':
					var which = event.which;
					// up 38
					// down 40
					// right 39
					// left 37
					break;
			}
		}
	};

	root.colflow = colflow;

	$(document).ready(function() {
		colflow.init();
	});

})(window, document, jQuery);