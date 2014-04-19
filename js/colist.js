
// DOM Controled by Hakan Bilgin (c) 2014

(function(win, document, $) {
	'use strict';

	var colist = {
		init: function() {
			this.el = $('.colist').on('click', '.row', this.doEvent);

			$(document).bind('keydown', this.doEvent);

			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}
			// temp
			this.doEvent('/get-children/');
		},
		doEvent: function(event) {
			var type = (typeof(event) === 'string')? event : event.type,
				self = colist,
				oldCol,
				newCol,
				newRow;

			switch (type) {
				// native events
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
					// stop default behaviour
					event.preventDefault();
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
				// custom events
				case '/get-children/':
					$.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_children',
							path   : '2013'
						},
						success: function(data) {
							//console.log( data );
							var temp = Defiant.render('column', data);
							$('.column').after( temp );
						}
					});
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
		},
		resize: {
			init: function() {
				var root = colist;
				$(root.el).on('mousedown dblclick', '.resize', this.doEvent);
			},
			doEvent: function(event) {
				var root = colist,
					self = root.resize,
					dim,
					el,
					rows,
					width,
					il, i;
				event.preventDefault();
				switch (event.type) {
					case 'dblclick':
						el = $(this).parent();
						rows = el.find('.row');
						if (rows.length === 0) return;
						width = 0;
						i = 0;
						il = rows.length;
						for (; i<il; i++) {
							width = Math.max(rows[i].lastChild.scrollWidth + 61, width);
						}
						el.parent().css({'width': width +'px'});
						break;
					case 'mousedown':
						el = $(this).addClass('moving').parents('.column');
						dim = root.getDim(this, 'className', 'frame');
						self.drag = {
							el: el,
							clickX: event.pageX - dim.l
						};
						self.drag.minW = parseInt(el.css('min-width'), 10);
						$(document).bind('mousemove mouseup', self.doEvent);
						break;
					case 'mousemove':
						if (!self.drag.el) return;
						width = Math.max(event.pageX - self.drag.clickX, self.drag.minW);
						self.drag.el.css({'width': width +'px'});
						break;
					case 'mouseup':
						self.drag.el.find('.resize').removeClass('moving');
						self.drag.el = false;

						$(document).unbind('mousemove mouseup', self.doEvent);
						break;
				}
			}
		},
		getDim: function(el, a, v) {
			a = a || 'nodeName';
			v = v || 'BODY';
			var p = {w:el.offsetWidth, h:el.offsetHeight, t:0, l:0, obj:el};
			while (el && el[a] !== v && (el.getAttribute && el.getAttribute(a) !== v)) {
				if (el === document.firstChild) return null;
				p.t += el.offsetTop - el.scrollTop;
				p.l += el.offsetLeft - el.scrollLeft;
				if (el.scrollWidth > el.offsetWidth && el.style.overflow === 'hidden') {
					p.w = Math.min(p.w, p.w-(p.w + p.l - el.offsetWidth - el.scrollLeft));
				}
				el = el.offsetParent;
			}
			return p;
		}
	};

	win.colist = colist;

	$(document).ready(function() {
		colist.init();
	});

})(window, document, jQuery);