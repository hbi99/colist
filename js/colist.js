
// DOM Controled by Hakan Bilgin (c) 2014

(function(root, document, $) {
	'use strict';

	var colist = {
		init: function() {
			this.el = $('.colist').on('click', '.row', this.doEvent);

			$(document).bind('keydown', this.doEvent);
		},
		doEvent: function(event) {
			var type = event.type,
				self = colist,
				oldCol,
				newCol,
				newRow;

			switch (type) {
				case 'click':
					newRow = $(this);
					newCol = newRow.parents('.column');
					newCol.find('.active').removeClass('active');

					self.active = self.active || self.getActive();
					oldCol = self.active.parents('.column').removeClass('active');
					if (newCol === oldCol.prev('.column')) {
						self.active.removeClass('active');
					}
					self.makeActive(newRow);
					break;
				case 'keydown':
					self.active = self.active || self.getActive();
					if (!self.active.length) return;
					// handle arrow keys
					switch (event.which) {
						case 37: // left
							newRow = self.active.parents('.column').prev().find('.active');
							if (!newRow.length) return;
							self.active.removeClass('active');
							self.active.parents('.column').removeClass('active');
							break;
						case 39: // right
							newRow = self.active.parents('.column').next().find('.row:nth(0)');
							if (!newRow.length) return;
							self.active.parents('.column').removeClass('active');
							break;
						case 38: // up
							newRow = self.active.prev('.row');
							if (!newRow.length) return;
							self.active.removeClass('active');
							break;
						case 40: // down
							newRow = self.active.next('.row');
							if (!newRow.length) return;
							self.active.removeClass('active');
							break;
					}
					self.makeActive(newRow);
					break;
			}
		},
		getActive: function() {
			return $('.column.active .row.active', this.el);
		},
		makeActive: function(newRow) {
			// make active
			this.active = newRow.addClass('active');
			this.active.parents('.column').addClass('active');
		}
	};

	root.colist = colist;

	$(document).ready(function() {
		colist.init();
	});

})(window, document, jQuery);