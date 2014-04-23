
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
			this.el = $('.colist').on('mousedown', '.content', this.doEvent);
			this.reel = this.el.find('> .reel');

			$(document).bind('keydown', this.doEvent);
			$(document).bind('click', this.doEvent);
			// init all sub objects
			for (var name in this) {
				if (typeof(this[name].init) === 'function') {
					this[name].init();
				}
			}
			// fast track initiate Defiant
			Defiant.gather_templates();
			// store xsl sorter
			this.xsl_sorter = this.defiant.xsl_template.selectSingleNode('//*[@name="rows"]//xsl:sort[@select="@extension"]');
			// turn on attentuation
			this.doEvent('/attenuate-siblings/', 'on');
			// append toolbar
			this.doEvent('/customize-parent-frame/');
			// init: get root folder
			this.doEvent('/get-active-item/');
		},
		doEvent: function(event) {
			var root = colist,
				type = (typeof(event) === 'string')? event : event.type,
				metaKey = event.metaKey || event.ctrlKey,
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
					if (event.target.className.indexOf('content') > -1) {
						// clear selection
						newCol = $(event.target).parents('.column');
						newCol.find('.active').removeClass('active');
						root.activeCol = newCol;
						root.makeActive(false, true);
						return;
					}
					newRow = $(event.target).parents('.row');
					newCol = newRow.parents('.column');
					if (!metaKey) {
						newCol.find('.active').removeClass('active');
					}
					root.active = root.active || root.getActive();
					oldCol = root.active.parents('.column').removeClass('active');
					if (newCol === oldCol.prev('.column')) {
						root.active.removeClass('active');
					}
					//event.preventDefault();
					root.makeActive(newRow, metaKey);
					break;
				case 'click':
					win.parent.colist_modal.hideSubmenu();
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
				case 'render-list-of-path':
					root.reel.append( root.defiant.render({
						'template': 'column',
						'match': arguments[1],
						'data': root.ledger
					}) );
					root.doEvent('/identify-siblings/');
					break;
				case '/language-phrase/':
					var phrase = arguments[1],
						translation = $('.language var.'+ phrase, root.el);
					return (translation.length)? translation.html() : phrase;
				case '/toggle-sort-asc/':
					var cols      = root.reel.find('.column:not(.preview)'),
						activeCol = $(cols[ cols.length - 1 ]),
						ascDesc   = arguments[1];
					// alter sorter
					root.xsl_sorter.setAttribute('order', ascDesc);
					// get "path"
					path = activeCol.attr('data-id');
					// remove active column
					activeCol.remove();
					root.reel.find('.preview').remove();
					// render html
					root.doEvent('render-list-of-path', '//*[@id="'+ path +'"]');
					break;
				case '/change-sorting/':
					var cols      = root.reel.find('.column:not(.preview)'),
						activeCol = $(cols[ cols.length - 1 ]),
						sort      = arguments[1];
					// alter sorter
					root.xsl_sorter.setAttribute('select', '@'+ sort);
					// get "path"
					path = activeCol.attr('data-id');
					// remove active column
					activeCol.remove();
					root.reel.find('.preview').remove();
					// render html
					root.doEvent('render-list-of-path', '//*[@id="'+ path +'"]');
					break;
				case '/attenuate-siblings/':
					var isAttenuated = arguments[1] || root.attenuateSiblings;
					if (isAttenuated === 'on') {
						root.el.addClass('isAttenuated');
						root.attenuateSiblings = 1;
					} else {
						root.el.removeClass('isAttenuated');
						root.attenuateSiblings = 0;
					}
					break;
				case '/identify-siblings/':
					var activeCol = $('.column.active', root.reel),
						rows = activeCol.find('.row .filename'),
						pRow;
					for (i=0, il=rows.length; i<il; i++) {
						if (rows[i].innerHTML.match(/\-\d{1,}x\d{1,}/g) !== null) {
							pRow = rows[i].parentNode;
							pRow.className += ' attenuated';
						}
					}
					break;
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
						root.doEvent('render-list-of-path', xPath);
					};

					xPath = '//*[@id="network_shared"]/*[@id="'+ siteid +'"]';
					oFile = JSON.search(root.ledger, xPath);
					if (oFile.length && oFile[0].file) return func();

					// abort previous ajax call
					if (root.active_ajax) {
						root.active_ajax.abort();
						root.progress.abort();
					}

					// start progress bar
					root.doEvent('/start-progress-bar/');

					root.active_ajax = $.ajax({
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
							root.active_ajax = false;
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
						var template = root.defiant.xsl_template,
							sorter = template.selectSingleNode('//*[@name="rows"]/xsl:sort[@select="@extension"]'),
							order = sorter.getAttribute('select');
						// sort by date
						sorter.setAttribute('select', 'modified');
						// render html
						root.doEvent('render-list-of-path', xPath);
						// restore previous sort order
						sorter.setAttribute('select', order);
					};

					xPath = '//*[@id="recent_uploads"]';
					oFile = JSON.search(root.ledger, xPath);
					if (oFile.length && oFile[0].file) return func();

					// abort previous ajax call
					if (root.active_ajax) {
						root.active_ajax.abort();
						root.progress.abort();
					}

					// start progress bar
					root.doEvent('/start-progress-bar/');

					root.active_ajax = $.ajax({
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
							root.active_ajax = false;
							// store in ledger
							oFile[0].file = data.file;

							setTimeout(func, 250);
						}
					});
					break;
				case '/show-search-results/':
					var phrase = arguments[1] || root.search_phrase;

					xPath = '//*[@id="search_results"]';
					oFile = JSON.search(root.ledger, xPath);

					func = function() {
						root.doEvent('render-list-of-path', '//*[@id="search_results"]');
					};

					// if no phrase is passed, render last results
					if (!phrase) {
						if (!oFile.file || !oFile.file.length) {
							win.parent.colist_modal.doEvent('/focusin-search-field/');
						}
						return func();
					}

					root.makeActive( $('.row[data-id="search_results"]'), true );
					root.search_phrase = phrase;

					// abort previous ajax call
					if (root.active_ajax) {
						root.active_ajax.abort();
						root.progress.abort();
					}

					// start progress bar
					root.doEvent('/start-progress-bar/');

					root.active_ajax = $.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_search_results',
							phrase : phrase
						},
						success: function(data) {
							//console.log( data.file.length );

							// finish progressbar
							root.progress.set(100);
							root.active_ajax = false;
							// store in ledger
							oFile[0].file = data.file;

							setTimeout(func, 250);
						}
					});
					break;
				case '/start-progress-bar/':
					var progress = root.progress,
						progEl = arguments[1] ? arguments[1] : progress.defEl,
						activeCol = root.active ? root.active.parents('.column') : false,
						progCol = progEl.parent(),
						pVal = parseInt(Math.random() * 31, 10) + 13,
						left = (activeCol && activeCol.length)? activeCol[0].offsetLeft + activeCol[0].offsetWidth : 0;

					if (!arguments[1]) {
						if (activeCol && activeCol.length) progCol.css({'width': activeCol.width() +'px'});
						progCol.css({'left': left +'px'});
					}
					progress.set(pVal, progEl);
					progress.set(109-pVal, progEl, 379);
					break;
				case '/customize-parent-frame/':
					var parent = win.parent.colist_modal;
					if (!parent || root.toolbar_init) return;
					parent.doEvent( '/append-toolbar/', root.defiant.render('toolbar', {}) );
					root.toolbar_init = true;
					break;
				case '/focusin-active-column/':
					oldCol = root.activeCol || root.getActiveColumn();
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
							'@order': '20',
							'@action': '/recent-uploads/'
						},
						{
							'@id': 'search_results',
							'@name': 'Search results',
							'@icon': 'search',
							'@order': '30',
							'@action': '/show-search-results/'
						},
						{
							'@type': 'divider',
							'@order': '99'
						}
					];
					if (colist_cfg.multisite) {
						extra.push({
							'@id': 'network_shared',
							'@name': 'Network Shared Media',
							'@icon': 'globe',
							'@order': '10',
							'@action': '/network-shared/'
						});
					}
					return extra;
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
							root.reel.append( root.defiant.render({
								'template': 'single',
								'match': '//*[@id="'+ path +'"]',
								'data': root.ledger
							}) );
							//root.doEvent('/focusin-active-column/');
							newCol = root.reel.find('.column:last-child').find('.file-preview pre');
							if (newCol.length) {

								// start progress bar
								root.doEvent('/start-progress-bar/', newCol.find('.progress'));

								$.ajax({
									type: 'POST',
									url: colist_cfg.ajax_path,
									data: {
										nonce  : colist_cfg.ajax_nonce,
										action : 'colist/get_file_contents',
										path   : oFile[0]['@path']
									},
									success: function(data) {
										// finish progressbar
										root.progress.set(100);
										
										setTimeout(function() {
											var htm = data.replace(/</g, '&lt;');
											htm = htm.replace(/>/g, '&gt;');
											htm = htm.replace(/\n/g, '<br/>');
											htm = htm.replace(/\t/g, '&#160; &#160; &#160; &#160; ');
											newCol.html( htm );
										}, 677);
									}
								});

							}
							return;
						}
						if (oFile[0].file) {
							root.doEvent('render-list-of-path', '//*[@id="'+ path +'"]');
							root.doEvent('/focusin-active-column/');
							return;
						}
					}

					// start progress bar
					root.doEvent('/start-progress-bar/');

					// abort previous ajax call
					if (root.active_ajax) {
						root.active_ajax.abort();
						root.progress.abort();
					}

					// make ajax call
					path = path || '.';
					root.active_ajax = $.ajax({
						type: 'POST',
						url: colist_cfg.ajax_path,
						data: {
							nonce  : colist_cfg.ajax_nonce,
							action : 'colist/get_folder_list',
							path   : path
						},
						success: function(data) {
							//console.log( JSON.stringify( data ) );
							var root = colist;
							// finish progressbar
							root.progress.set(100);
							
							root.active_ajax = false;

							// store json data
							if (!root.ledger) {
								data.options = root.doEvent('/get-extra-options/');
								root.ledger = data;

								// prepare network shared media
								root.doEvent('/initiate-multisite/');
							} else oFile[0].file = data.file;

							setTimeout(function() {
								root.doEvent('render-list-of-path', '//*[@id="'+ path +'"]');

								// temp
								//root.doEvent('/change-sorting/', 'name');
								//root.doEvent('/show-search-results/', 'hansen');
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
		getActiveColumn: function() {
			var col = this.getActive().parents('.column');
			if (!col.length) col = this.active.parents('.column');
			if (!col.length) col = this.reel.find('.column:nth-last-child(1)');
			return col;
		},
		makeActive: function(newRow, ignoreCommand) {
			// make active
			if (newRow) {
				this.active    = newRow.addClass('active');
				this.activeCol = this.active.parents('.column');
			}
			this.activeCol.addClass('active')
				.nextAll('.column').each(function(i, el) {
					el.parentNode.removeChild(el);
				});
			// abort current ajax call
			if (this.active_ajax) {
				this.active_ajax.abort();
				this.progress.abort();
			}
			this.doEvent('/focusin-active-column/');
			if (!ignoreCommand) {
				this.doEvent('/get-active-item/');
			}
			// assemble selected file info
			var actives = this.activeCol.find('.row.active'),
				select_info = [],
				il = actives.length,
				i = 0,
				filename,
				el;
			for (; i<il; i++) {
				el = $(actives[i]);
				filename = el.find('.filename').text();
				select_info.push({
					'extension': el.find('figure').attr('data-extension'),
					'filename': filename,
					'path': el.parents('.column').attr('data-id') +'/'+ filename
				});
			}
			win.parent.colist_modal.doEvent('/file-selected/', select_info);
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
				this.defEl = $('.reel .progress');
			},
			set: function(val, aEl, timed) {
				var self = this,
					el = aEl || self.el || self.defEl,
					pEl = el.parent();
				if (val <= ((el.width() / pEl.width()) * 100)) return;
				self.el = el;
				pEl.css({'opacity': '1'}).addClass('enabled');
				self.timer = setTimeout(function() {
					el.css({'width': val +'%'});
					if (val >= 100) setTimeout(self.reset, 330);
				}, timed || 0);
			},
			reset: function() {
				var self = colist.progress;
				win.clearTimeout(self.timer);
				if (!self.el) return;
				self.el.parent().css({'opacity': '0'});
				setTimeout(function() {
					self.el.css({'width': '0'}).removeClass('enabled');
					self.el = false;
				}, 200);
			},
			abort: function() {
				colist.progress.reset();
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