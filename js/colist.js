
// DOM Controled by Hakan Bilgin (c) 2014

(function(win, document, $) {
	'use strict';

	var colist = {
		init: function() {
			if (this.initiated) return;
			// this flag prevents initiation more than once
			this.initiated = true;
			// fast references
			this.defiant = Defiant;
			this.el = $('.colist').on('mousedown', '.row', this.doEvent);
			this.reel = this.el.find('> .reel');

			$(document).bind('keydown', this.doEvent);
			// init all sub objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}
			this.doEvent('/customize-parent-frame/');
			// init: get root folder
			this.doEvent('/get-active-item/');
		},
		doEvent: function(event) {
			var root = colist,
				type = (typeof(event) === 'string')? event : event.type,
				func,
				oFile,
				action,
				xPath,
				path,
				thisCol,
				oldCol,
				newCol,
				newRow,
				cols,
				width,
				il, i;

			switch (type) {
				// native events
				case 'mousedown':
					newRow = $(this);
					newCol = newRow.parents('.column');
					newCol.find('.active').removeClass('active');

					root.active = root.active || root.getActive();
					oldCol = root.active.parents('.column').removeClass('active');
					if (newCol === oldCol.prev('.column')) {
						root.active.removeClass('active');
					}
					//event.preventDefault();
					root.makeActive(newRow);
					break;
				case 'keydown':
					root.active = root.active || root.getActive();
					if (!root.active.length) return;
					if (event.which >= 37 && event.which <= 40) {
						// stop default behaviour
						event.preventDefault();
					}
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
				case '/initiate-multisite/':
					var sites = colist_cfg.sites,
						rows = [];

					if (!sites.length) return;

					for (i=0, il=sites.length; i<il; i++) {
						rows.push({
							'@id': 'site-'+ sites[i]['@id'],
							'@name': sites[i]['@name'],
							'@extension': '_web',
							'@action': '/get-network-shared/'
						});
					}

					xPath = '//*[@id="network_shared"]';
					oFile = JSON.search(root.ledger, xPath);
					oFile[0].file = rows;
					break;
				case '/get-network-shared/':
					var siteid = root.active.attr('data-id');
					
					func = function() {
						root.reel.append( root.defiant.render({
							'template': 'column',
							'match': xPath,
							'data': root.ledger
						}) );
					};

					xPath = '//*[@id="network_shared"]/*[@id="'+ siteid +'"]';
					oFile = JSON.search(root.ledger, xPath);
					if (oFile.length && oFile[0].file) return func();

					// start progress bar
					root.doEvent('/start-progress-bar/');

					$.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_network_shared',
							siteid : siteid
						},
						success: function(data) {
							// finish progressbar
							root.progress.set(100);
							// store in ledger
							oFile[0].file = data.file;

							setTimeout(func, 250);
						}
					});
					break;
				case '/network-shared/':
					root.reel.append( root.defiant.render({
						'template': 'column',
						'match': '//*[@id="network_shared"]',
						'data': root.ledger
					}) );
					break;
				case '/recent-uploads/':
					func = function() {
						root.reel.append( root.defiant.render({
							'template': 'column',
							'match': xPath,
							'data': root.ledger
						}) );
					};

					xPath = '//*[@id="recent_uploads"]';
					oFile = JSON.search(root.ledger, xPath);
					if (oFile.length && oFile[0].file) return func();

					// start progress bar
					root.doEvent('/start-progress-bar/');

					$.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_recent_uploads',
							path   : 'recent_uploads'
						},
						success: function(data) {
							// finish progressbar
							root.progress.set(100);
							// store in ledger
							oFile[0].file = data.file;

							setTimeout(func, 250);
						}
					});
					break;
				case '/show-search-results/':
					break;
				case '/start-progress-bar/':
					var progress = root.progress,
						activeCol = root.active ? root.active.parents('.column') : false,
						progCol = progress.el.parent(),
						pVal = parseInt(Math.random() * 40, 10) + 15,
						left = (activeCol && activeCol.length)? activeCol[0].offsetLeft + activeCol[0].offsetWidth : 0;

					if (activeCol && activeCol.length) progCol.css({'width': activeCol.width() +'px'});
					progCol.css({'left': left +'px'});
					progress.set(pVal);
					break;
				case '/customize-parent-frame/':
					var parent = win.parent.colist_modal;
					if (!parent || root.toolbar_init) return;
					parent.doEvent( '/append-toolbar/', root.defiant.render('toolbar', {}) );
					root.toolbar_init = true;
					break;
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
				case '/get-extra-options/':
					var extra = [
						{
							'@id': 'recent_uploads',
							'@name': 'Recent uploads',
							'@icon': 'cloud-upload',
							'@extension': '_20',
							'@action': '/recent-uploads/'
						},
						{
							'@id': 'search_results',
							'@name': 'Search results',
							'@icon': 'search',
							'@extension': '_30',
							'@action': '/search-results/'
						},
						{
							'@type': 'divider',
							'@extension': '_99'
						}
					];
					if (colist_cfg.multisite) {
						extra.push({
							'@id': 'network_shared',
							'@name': 'Network Shared Media',
							'@icon': 'globe',
							'@extension': '_10',
							'@action': '/network-shared/'
						});
					}
					return extra;
					break;
				case '/get-active-item/':

					if (root.active) {
						thisCol = root.active.parents('.column');
						// path to request
						path = thisCol.attr('data-id') +'/'+ root.active.find('.filename').text();

						// check if its action
						action = root.active.attr('data-cmd');
						if (action) {
							return root.doEvent(action);
						}
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
					root.doEvent('/start-progress-bar/');

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
							var root = colist,
								extra;
							// finish progressbar
							root.progress.set(100);
							// store json data
							if (!root.ledger) {
								extra = root.doEvent('/get-extra-options/');
								data.file = data.file.concat(extra);
								root.ledger = data;
								// prepare network shared media
								root.doEvent('/initiate-multisite/');
							} else oFile[0].file = data.file;

							setTimeout(function() {
								root.reel.append( root.defiant.render({
									'template': 'column',
									'match': '//*[@id="'+ path +'"]',
									'data': root.ledger
								}) );

								// temp
								//$('.row.hasChildren:nth(0)').trigger('click');
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
						var startW = el.parent()[0].offsetWidth;
						width = 0;
						i = 0;
						il = rows.length;
						for (; i<il; i++) {
							width = Math.max(rows[i].lastChild.scrollWidth + 61, width);
						}
						if (width - 4 > el.parent().width()) {
							el.parent().css({'width': width +'px'});
							root.reel.css({'width': (root.reel.width() + (width - startW)) +'px'});
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