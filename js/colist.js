
// DOM Controled by Hakan Bilgin (c) 2014

(function(win, document, $) {
	'use strict';

	var colist = {
		init: function() {
			// fast references
			this.defiant = Defiant;
			this.el = $('.colist').on('click', '.row', this.doEvent);
			this.reel = this.el.find('> .reel');

			$(document).bind('keydown', this.doEvent);

			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}
			// temp
			this.doEvent('/get-active-item/');
		},
		doEvent: function(event) {
			var root = colist,
				type = (typeof(event) === 'string')? event : event.type,
				path,
				oldCol,
				newCol,
				newRow,
				cols,
				width,
				il, i;

			switch (type) {
				// native events
				case 'click':
					newRow = $(this);
					newCol = newRow.parents('.column');
					newCol.find('.active').removeClass('active');

					root.active = root.active || root.getActive();
					oldCol = root.active.parents('.column').removeClass('active');
					if (newCol === oldCol.prev('.column')) {
						root.active.removeClass('active');
					}
					event.preventDefault();
					root.makeActive(newRow);
					break;
				case 'keydown':
					root.active = root.active || root.getActive();
					if (!root.active.length) return;
					// stop default behaviour
					event.preventDefault();
					// handle arrow keys
					switch (event.which) {
						case 37: // left
							newRow = root.active.parents('.column').prev().find('.active');
							if (!newRow.length) return;
							root.active.removeClass('active');
							root.active.parents('.column').removeClass('active');
							break;
						case 39: // right
							newRow = root.active.parents('.column').next().find('.row:nth(0)');
							if (!newRow.length) return;
							root.active.parents('.column').removeClass('active');
							break;
						case 38: // up
							newRow = root.active.prev('.row');
							if (!newRow.length) return;
							root.active.removeClass('active');
							break;
						case 40: // down
							newRow = root.active.next('.row');
							if (!newRow.length) return;
							root.active.removeClass('active');
							break;
					}
					if (newRow) {
						root.makeActive(newRow);
					}
					break;
				// custom events
				case '/focusin-active-column/':
					oldCol = root.active.parents('.column.active');
					width = oldCol[0].offsetLeft + oldCol[0].offsetWidth + 351;

					var scrollLeft = root.el.scrollLeft(),
						paddingRight = parseInt(root.reel.css('padding-right'), 10);
					if (width > root.reel.width()) {
						root.reel.css({'width': width +'px'});
						root.el.scrollLeft(scrollLeft);
					}
					if (width > root.el[0].offsetWidth + scrollLeft + paddingRight || oldCol[0].offsetLeft - 20 < scrollLeft) {
						root.el.stop().animate({scrollLeft: oldCol[0].offsetLeft - 20}, 800);
					}
					break;
				case '/get-active-item/':
					var progress = root.progress,
						pVal = parseInt(Math.random() * 40, 10) + 15,
						progCol,
						thisCol,
						oFile,
						left;

					if (root.active) {
						thisCol = root.active.parents('.column');
						// path to request
						path = thisCol.attr('data-id') +'/'+ root.active.find('.filename').text();
						// prepare for post-ajax call
						oFile = JSON.search( root.ledger, '//*[@id="'+ path +'"]' );

						if (oFile[0]['@extension'] !== '_dir') {
							//console.log( JSON.stringify(oFile[0]) );
							root.reel.append( root.defiant.render({
								'template': 'single',
								'match': '//*[@id="'+ path +'"]',
								'data': root.ledger
							}) );
							root.doEvent('/focusin-active-column/');
							return;
						}
						if (oFile[0].file) {
							root.reel.append( root.defiant.render({
								'template': 'column',
								'match': '//*[@id="'+ path +'"]',
								'data': root.ledger
							}) );
							root.doEvent('/focusin-active-column/');
							return;
						}
					}

					// start progress bar
					left = (thisCol && thisCol.length)? thisCol[0].offsetLeft + thisCol[0].offsetWidth : 0;
					progCol = progress.el.parent()
					if (thisCol && thisCol.length) progCol.css({'width': thisCol.width() +'px'});
					progCol.css({'left': left +'px'});
					progress.set(pVal);

					// make ajax call
					path = path || '.';
					$.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_folder_list',
							path   : path
						},
						success: function(data) {
							//console.log( data );
							var root = colist;
							// finish progressbar
							progress.set(100);
							// store json data
							if (!root.ledger) root.ledger = data;
							else oFile[0].file = data.file;

							setTimeout(function() {
								root.reel.append( root.defiant.render({
									'template': 'column',
									'match': '//*[@id="'+ path +'"]',
									'data': root.ledger
								}) );
							}, 250);
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
			this.active.parents('.column').addClass('active')
				.nextAll('.column').each(function(i, el) {
					el.parentNode.removeChild(el);
				});
			this.doEvent('/focusin-active-column/');
			this.doEvent('/get-active-item/');
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
					drag,
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
						if (width - 4 > el.parent().width()) {
							el.parent().css({'width': width +'px'});
						}
						break;
					case 'mousedown':
						el = $(this).addClass('moving').parents('.column');
						dim = root.getDim(this, 'className', 'frame');
						self.drag = {
							el: el,
							reelW: root.reel.width() - el.width(),
							clickW: el.width(),
							clickX: event.pageX - dim.l
						};
						self.drag.minW = parseInt(el.css('min-width'), 10);
						$(document).bind('mousemove mouseup', self.doEvent);
						break;
					case 'mousemove':
						drag = self.drag;
						if (!drag.el) return;
						width = Math.max(event.pageX - drag.clickX, drag.minW);
						drag.el.css({'width': width +'px'});
						root.reel.css({'width': (drag.reelW + width + 100) +'px'});
						break;
					case 'mouseup':
						self.drag.el.find('.resize').removeClass('moving');
						self.drag.el = false;

						$(document).unbind('mousemove mouseup', self.doEvent);
						break;
				}
			}
		},
		progress: {
			init: function() {
				this.el = $('.reel .progress');
			},
			set: function(val, timed) {
				var self = this,
					el   = this.el,
					pEl  = el.parent();
				if (val <= ((el.width() / pEl.width()) * 100)) return;
				pEl.css({'opacity': '1'}).addClass('enabled');
				self.timer = setTimeout(function() {
					el.css({'width': val +'%'});
					if (val >= 100) setTimeout(self.reset, 330);
				}, timed || 0);
			},
			reset: function() {
				var self = colist.progress;
				win.clearTimeout(self.timer);
				self.el.parent().css({'opacity': '0'});
				setTimeout(function() {
					self.el.css({'width': '0'}).removeClass('enabled');
				}, 200);
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