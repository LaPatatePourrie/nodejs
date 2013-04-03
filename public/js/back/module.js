var working = {
	uploads		: 0
}


/*********
********** Page
*********/

function Page () {
	this.Module;
	this.forms = [];
	
	this.args = {	
		module	: false,
		action	: false,
		list	: {},
		form 	: {},
		del 	: {}
	}
	this.elem;
	this.timer = {
		loading 	: false,
		feedback 	: []
	}
	this.actions = [
		'list', 
		'form', 
		'del', 
		'options'
	]
	
	this.init = function (args) {
		this.setHandlers();
	}
	
	this.loadElems = function () {
		this.elem = {
			loading		: {
				$full		 	: $('#page').find('.overlay.loader.full'),
				$list		 	: $('#page').find('.overlay.loader.list')
			},
			$overlay 		: $('#page').find('.overlay.lamd'),
			$overlayContent : $('#page').find('.overlay.lamd > .container'),
			$feedback 		: $('#page').find('.overlay.feedback'),
			$menu			: $('#menuLAMD').find('ul.lamd'),
			$module			: $('#module'),
			$list			: $('#module').find('table.main'),
			search			: {
				$input			: $('#module').find('.search input'),
				$btn			: $('#module').find('.search .btn'),
				$loader			: $('#module').find('.search .loader')
			}
		}
	}
	
	// Constructeur
	this.load = function (args) {
		var self = this;
		// On charge les éléments jQuery
		this.loadElems();
		
		this.updateArgs(args);
		
		this.loadModule(function (err) {
			if (err) {
				self.feedback({
					flag	: 'error',
					type	: 'nonAuthorized'
				});
				return
			}
			
			self.router();
		});
	}
	
	this.loadModule = function (callback) {
		this.Module = new Module(this.args.module);
		this.Module.load(function (err) {
			if ( err ) 		callback(err)
			else			callback(false);
		});
	}
	
	// Router
	this.router = function () {
		var self = this;
		
		if ( !this.args.action || !_.contains(this.actions, this.args.action) ) {
			alert('Action impossible')
		}
		else {
			switch ( this.args.action ) {
				case 'list':
					this.list(true);
					break;
					
				case 'form':
					// Mod
					if ( !_.isUndefined(this.args.form.mod) ) {
						this.form('mod');
					}
					// Add
					else if ( !_.isUndefined(this.args.form.add) ) {
						this.form('add');
					}
					break;
					
				case 'del':
					// Del
					this.del();
					break;
					
				case 'options':
					// Del
					this.options();
					break;
			}
		}
	}
	
	this.updateArgs = function(args) {
		var newArgs = this.args;
		for ( a in args ) {
			newArgs[a] = args[a];
		}
		this.args = newArgs;
	}
	
	
	this.changeView = function (view) {
		this.reinit();
		this.args.list.view = view;
		this.list();
	}
	
	// List
	this.list = function (newModule) {
		var self = this;
		this.loading(newModule);
		var param = this.args.list;
		
		if ( newModule ) { 
			this.reinit();
			// Affichage du sous-menu des vues
			this.displayMenu();
		}
		
		this.Module.list(param, function (err, tpl) {
			if (err) {
				self.feedback({
					flag	: 'error',
					type	: 'nonAuthorized'
				}).displayPostit();
				self.stopLoading();
				return;
			}
			
			var time0 = new Date();
			// Affichage final de la list
			document.getElementById('module').innerHTML = tpl;
			// self.elem.$module.html(tpl);
			var time1 = new Date();
			console.log('Temps de chargement des details : '+(time1-time0));
			
			self.stopLoading();
			
			// Réglage des détails : url, img...
			self.setListDetails();
			
			// On recharge les éléments jQuery
			self.loadElems();
			
			// Focus sur le champs de recherche si post-search
			if ( self.args.list.keywords ) {
				$('#module .search input').focusend();
				self.overline(self.args.list.keywords);
			}
		});
	}
	
	// Form
	this.form = function (mode) {
		this.showOverlay();
		var self = this;
		var args = this.args.form;
		
		if ( mode == 'mod' ) 		param = args.mod;
		else if ( mode == 'add' ) 	param = false;
		
		this.Module.form(param, function (err, tpl) {
			if (err) {
				self.feedback({
					flag	: 'error',
					type	: 'nonAuthorized'
				}).displayPostit();
				return;
			}
			
			self.elem.$overlayContent.html(tpl);
			// Focus sur le premier champs
			$('table tr.field:first-child input[type="text"]').focusend();
		});
	}
	
	// Add - Mod
	this.addMod = function () {
		var self = this;
		
		var datas = this.Module.Form.getDatas();
		var mode = this.Module.Form.getMode();
		
		if ( working.uploads > 0 ) {
			// Uploads en cours
			this.feedback({flag : 'error', type : 'uploading'}).displayPostit();
			return;
		}
		
		this.Module.addMod(mode, datas, function (id, tpl) {
			self.hideOverlay();
			
			var feedback = self.feedback({
				type	: mode, 
				flag	: 'ok',
				id		: id
			});
			
			switch ( mode ) {
				case 'add' :
					self.elem.$module.find('table.main tr.title').after('<tr class="value" data-checked="false" data-id="'+id+'">'+tpl+'</tr>');
					self.setListDetails(self.elem.$module.find('table.main tr.value[data-id="'+id+'"]'));
					self.scrollTop();
					break;
					
				case 'mod' :
					$tr = self.elem.$module.find('table.main tr[data-id="'+id+'"]');
					$tr.html(tpl);
					self.setListDetails($tr);
					break;
			}
			
			feedback.overline();
			feedback.displayPostit();
		});
	}
	// Del
	this.del = function () {
		var self = this;
		var idDel = [];
		$('table.main tr.value[data-checked="true"]').each(function () {
			idDel.push($(this).attr('data-id'));
		});
		
		this.Module.del(idDel, function (err, tpl) {
			if (err) {
				self.feedback({
					flag	: 'error',
					type	: 'nonAuthorized'
				}).displayPostit();
				return;
			}
			
			// Feedback
			self.feedback({type:'del', flag:'ok'}).displayPostit();
			
			// Supprimer les éléments de la vue
			for ( var i=0; i<idDel.length; i++ ) {
				$('table.main tr[data-id="'+idDel[i]+'"]').attr('data-statut', 'deleted').hide('medium', function () {
					$(this).remove();
				});
				$('.options .option.del').attr('data-active', 'false');
			}
		});
	}
	// Options
	this.options = function () {
		var self = this;
		this.showOverlay();
		
		socket.emit('options', function (err, tpl) {
			self.elem.$overlayContent.html(tpl);
		});
	}
	
	this.setListDetails = function ($tr) {
		var module = this.Module;
		
		this.elem.$module.find('table.main td.value a.lightbox').fancybox({
			openEffect	: 'none',
			closeEffect	: 'none'
		});
		
		if ( !$tr ) {
			var $eachElem = this.elem.$module.find('table.main tr.value td.value');
		}
		else {
			var $eachElem = $tr.find('td.value');
		}
		
		$eachElem.each(function () {
			var $td = $(this);
			
			var realvalue = $td.attr('data-value');
			if ( !realvalue ) return;
			
			var value = $td.html();
			var fullvalue = $td.attr('data-fullvalue');
			var detail = $td.attr('data-detail');
			var transform = $td.attr('data-transform');
			
			if (!detail.isEmpty()) 		setDetails();
			if (!transform.isEmpty())   setTransform();
			
			
			function setTransform () {
				//Transformation : Images, musiques...
				if ( transform.isEmpty() ) return;
				
				var id = $td.parent().attr('data-id');
				var field = $td.attr('data-field');
				var files = $td.attr('data-files');
				
				var fileParam = module.param.fields.all[field].param.file;
				var html = '';
				
				switch ( transform ) {
					case 'img' :
						if ( fileParam.statut == 'private' ) break;
						
						var img = files.split('/');
						for ( var i=0; i<img.length; i++ ) {
							var href = '/public/data/uploads/'+module.name+'/'+id+'/'+img[i];
							var rel	 = id;
							
							html += '<a class="lightbox" href="'+href+'" rel="'+rel+'">';
							html += 	'<img src="'+href+'"/>'	
							html += '</a>';
						}
						
						$td.html(html);
						break;
					
					case 'link' :
						var filesNames = files.split('/');
						var links = fullvalue.split('/');
						
						for (var i = 0, l = links.length; i<l; i++) {
							var href = '/download/?file='+id+'_'+filesNames[i]+'&type='+fileParam.statut+'&module='+module.name;
							
							html += '<a href="'+href+'">';
							html += 	links[i];
							html += '</a>';
							
							if ( i < links.length-1 ) html += ' / ';
						}
						
						$td.html(html);
						break;
						
					case 'toggle' :
						var param = module.param.fields.all[field].param;
						var toggle = getToggle(realvalue, param.toggle);
						html = '<img class="toggle" src="'+toggle+'"/>';
						
						$td.live('click', function () {
							var paramMod = {};
							paramMod.toggle = true;
							paramMod.id = id;
							paramMod.data = {}
							
							var values = param.value.values;
							values.getSmallest = function () {
								s = 1000;
								for ( var v in this ) {
									if ( v < s ) s = v;
								}								
								return s;
							}
							var val = parseInt(realvalue);
							
							var nextvalue = val+1;
							if ( !_.has(values, nextvalue) ) {
								nextvalue = values.getSmallest();
							}
							paramMod.data[field] = nextvalue;
							
							socket.emit('mod', paramMod, function () {
								realvalue = nextvalue;
								$td.find('img').attr('src', getToggle(realvalue, param.toggle));
								$td.attr('title', '');
							});
						});
						
						$td.html(html);
						break;
				}
			}
			
			function setDetails () {
				// Url, liens, email...
				switch ( detail ) {
					case 'url' :
						$td.html('<a target="blank" href="'+fullvalue+'">'+value+'</a>');
						break;
					case 'email' :
						$td.html('<a target="blank" href="mailto:'+fullvalue+'">'+value+'</a>');
						break;
				}
			}
			
			function getToggle (value, param) {
				var toggle;
				
				if ( param.customize ) {
					toggle = param.customize[value];
				}
				else {
					switch ( param.type ) {
						case 'arrow' :
							if (value == 0) 		toggle = 'arrow_grey';
							else if (value == 1)	toggle = 'arrow_'+param.color;
							break;
							
						case 'uncorrect' :
							if (value == 0) 		toggle = 'cross';
							else if (value == 1)	toggle = 'valid';
							break;
							
						case 'forbidden' :
							if (value == 0) 		toggle = 'forbidden';
							else if (value == 1)	toggle = 'valid';
							break;
							
						case 'locked' :
							if (value == 0) 		toggle = 'locked';
							else if (value == 1)	toggle = 'valid';
							break;
					}
				}
				var src = '/public/img/icon/toggle/'+toggle+'.png';
				return src;
			}
		});
	}
	
	// Loader
	this.loading = function (newModule) {
		var self = this;
		this.timer.loading = setTimeout(function () {
			if (newModule) 		var $elem = self.elem.loading.$full;
			else				var $elem = self.elem.loading.$list;
			
			var scroll = $(window).scrollTop();
			scroll += 100;
			
			$elem.find('.loading').css('top', scroll);
			$elem.show();
		}, 
		100);
	}
	this.stopLoading = function () {
		clearTimeout(this.timer.loading);
		this.elem.loading.$full.hide();
		this.elem.loading.$list.hide();
	}
	
	this.setHandlers = function () {
		var self = this;
		
		// Touche échap
		$('body').live('keyup', function (e) {
			code = e.keyCode ? e.keyCode : e.which;
			
			if ( code == 27 ) {
				// self.exitForm();
			}
		});
		// Clique sur cancel
		$('.header .cancel').live('click', function () {
			self.exitForm();
		});
	}
	
	this.showOverlay = function () {
		this.elem.$overlay.fadeIn('fast');
	}
	this.hideOverlay = function () {
		this.elem.$overlay.fadeOut('fast');
	}
	
	this.search = function (keywords) {
		if (!this.args.list) this.args.list = {}
		this.args.list.keywords = keywords;
		var self = this;
		
		this.elem.$module.find('.search .loader').addClass('visible');
		var loading = setTimeout(
			function () {
				self.elem.$module.find('.search .loader').removeClass('visible');
				self.list();
			},
			500
		);
	}
	this.speedSearch = function (keywords) {
		var $tr = this.elem.$module.find('table.main tr.value');
		var elem = [];
		var i = 0;
		$tr.each(function () {
			$this = $(this);
			elem[i] = [];
			var j = 0;
			$this.find('td.value').each(function () {
				elem[i][j] = $(this).text().trim();
				j++;
			});
			i++;
		});
		
		keys = keywords.split(' ');
		var show = [];
		
		for ( var i=0; i<elem.length; i++ ) {
			var ind = 0;
			for ( var k=0; k<keys.length; k++ ) {
				for ( var j=0; j<elem[i].length; j++ ) {
					if ( elem[i][j] != '' ) {
						var reg = new RegExp(keys[k], 'i');
						if ( elem[i][j].match(reg) ) {
							ind++;
							break;
						}
					}
				}
			}
			
			if ( ind >= k ) {
				show[show.length] = i;
			}
		}
		
		$tr.hide();
		for ( var i=0; i<show.length; i++ ) {
			this.elem.$module.find('table.main tr.value:eq('+(show[i])+')').show();
		}

		this.overline(keywords)
	}

	this.overline = function (keywords) {
		elem = $('#module table.main td.value');
		
		$('#module table.main td.value .keywordsFound').each(function () {
			$(this).replaceWith($(this).html());
		});
		
		keywords = keywords.split(' ');
		
		elem.each(function () {
			var value = $(this).html().split(' ');
			
			for ( var k=0; k<value.length; k++ ) {
				for ( var i=0; i<keywords.length; i++ ) {
					if ( !value[k].match(/span/i) && !value[k].match(/<|>/i) && !value[k].match(/=/i) && !value[k].match(/"/i) ) {
						var reg = '/('+keywords[i]+')/i';
						value[k] = value[k].replace(eval(reg), '<span class="keywordsFound">$1</span>');
					}
				}
			}
			
			var html = '';
			for ( var k=0; k<value.length; k++ ) {
				html += value[k]+' ';
			}
			$(this).html(html);
		});
	}
	
	// Feedbacks
	this.feedback = function(param) {
		var param = param;
		var self = this;
		
		var txt = {
			'ok'	: {
				'add'		: 'Ajout effectu&eacute;',
				'mod'		: 'Modification effectu&eacute;e',
				'del'		: 'Suppression effectu&eacute;e'
			},
			'error' : {
				'nonAuthorized'	: 'Vous n\'&ecirc;tes pas autoris&eacute; &agrave; effectuer cette action',
				'uploading'		: 'Des t&eacute;l&eacute;chargements sont en cours'
			}
		};		
		
		var feed = {
		
			// Affichage du post-it
			displayPostit	: function () {
				var $feedback = self.elem.$feedback;
				
				$feedback.attr('data-flag', param.flag);
				if ( $feedback.hasClass('visible') ) {
					$feedback.addClass('override')
				}
				$feedback.addClass('visible');
				$feedback.fadeIn('fast');
				$feedback.html(txt[param.flag][param.type]);
				
				setTimeout(
					function () {
						if ( !$feedback.hasClass('override') ) {
							$feedback.fadeOut('fast');
						}
						$feedback.removeClass('visible');
						$feedback.removeClass('override');
					},
					3000
				);
			},
			
			// Surlignage de la ligne
			overline		: function () {
				if ( param.type == 'mod' )  	 var statut = 'updated';
				else if ( param.type == 'add' )  var statut = 'added';
				
				$('table.main tr[data-id="'+param.id+'"]').attr('data-statut', statut);
				
				setTimeout(function () {
						$('table.main tr[data-id="'+param.id+'"]').attr('data-statut', '');
					},
					7000
				);
			}
		};
		
		return feed;
	}
	
	this.exitForm = function () {
		var self = this;
		
		if ( working.uploads > 0 ) {
			this.feedback({flag : 'error', type : 'uploading'}).displayPostit();
		}
		else  {
			var uploads = {};
			if ( this.Module.Form ) {
				for ( f in this.Module.Form.fields ) {
					var field = this.Module.Form.fields[f];
					if ( field.uploads ) {
						uploads = field.uploads.all;
					}
				}
				if ( _.size(uploads) > 0 ) {
					socket.emit('upload-deleteFiles', uploads)
				}
			}
			exit();
		}
		
		function exit () {
			self.hideOverlay();
		}
	}
	
	this.reinit	= function () {
		// Init search
		this.args.list.keywords = false;
		this.args.list.view = 'main';
		this.elem.search.$input.val('');
		// Init views
		this.args.list.keywords = false;
	}
	this.displayMenu = function () {
		this.elem.$menu.find('li.view').slideUp(100);
		this.elem.$menu.find('li.view[data-module="'+this.Module.name+'"]').slideDown('fast');
	}
	this.scrollTop = function () {
		$('html, body').animate({scrollTop: 0}, 200);
	}
}



/*********
********** Module
*********/

function Module (name) {
	this.Form;
	this.name = name;
	this.param;
	
	// Constructeur
	this.load = function (callback) {
		var self = this;
		socket.emit('getModule', this.name, function (err, moduleParam) {
			if ( err ) callback(err);
			else {
				self.param = moduleParam;
				callback(false);
			}
		});
	}
	
	this.list = function (param, callback) {
		var self = this;
		param.module = this.name;
		
		socket.emit('list', param, 
			function (err, tpl) {
				callback(err, tpl);
			}
		);
	}
	this.del = function (ids, callback) {
		var self = this;
		socket.emit('del', {
				module  : this.name,
				ids		: ids
			}, 
			function (err) {
				callback(err);
			}
		);
	}
	this.form = function (id, callback) {
		var self = this;
		
		socket.emit('form', {
				module  : this.name,
				id		: id
			}, 
			function (err, tpl, data) {
				callback(err, tpl);
				self.Form = new Form(self.param.fields.all, self.param.order);
				self.Form.load(data);
			}
		);
		
	}
	this.addMod = function (mode, datas, callback) {
		if ( this.Form.check(datas.data) ) {
			socket.emit(mode, datas, function (id, tpl) {
				callback(id, tpl);
			});
		}
		else {
			this.Form.scrollTop();
			this.Form.setAutovalidation();
		}
	}
}






/*********
********** Form
*********/

function Form(fields, order) {
	this.fields = fields;
	this.data;
	this.order = order;
	this.autovalid = false;
	this.elem = {
		$form 		: $('#page').find('form#lamd'),
		$content	: $('#page').find('.container > .content')
	}
	
	this.load = function (data) {
		if ( data ) {
			this.data = data;
		}
		
		var fields = {};
		for ( var f=0; f<this.order.length; f++ ) {
			var fieldName = this.order[f];
			if ( !this.fields[fieldName].display.form ) continue;
			fields[fieldName] = new Field(fieldName);
			
			if ( this.data ) data = this.data[fieldName]
			
			fields[fieldName].load(this.fields[fieldName], data);
		}
		this.fields = fields;
	}
	
	this.check = function (data) {
		var check = this.checkConstraints(data);
		this.hideCorrectedFields();
		return check;
	}
	
	this.checkConstraints = function (data) {
		var err = [];
		for ( var f in data ) {
			err.push(this.fields[f].check(data[f]));
		}
		
		return !_.contains(err, false);
	}
	this.hideCorrectedFields = function () {
		for ( f in this.fields ) {
			if ( this.fields[f].statut == 'correct' ) {
				this.fields[f].elem.$tr.attr('data-statut', 'default');
			}
		}
	}
	this.setAutovalidation = function () {
		for ( var f in this.fields ) {
			if ( this.fields[f].requireAutovalidation ) {
				this.fields[f].setAutovalidation();
			}
		}
	}
	
	this.getDatas = function () {
		var datas = {};
		datas.id = this.elem.$form.attr('data-id');
		datas.data = {};
		
		
		for ( var f in this.fields ) {
			var field = this.fields[f];
			var type = field.param.type
			var value = field.getValue();
			
			if ( !field.isActive() ) continue;
			if ( field.param.widget && field.param.widget.wysiwyg )    field.fillTextarea();
			if ( field.param.detail == 'url' && value=='http://' )    value = '';
			
			switch ( type ) {
				case 'checkbox' :
					var newValue = [];
					for ( var v=0; v<value.length; v++ ) {
						if ( field.elem.$field.find('.case[value="'+value[v]+'"]').length > 0 && !_.contains(newValue, value[v]) && !value[v].isEmpty() ) {
							newValue.push(value[v]);
						}
					}
					value = newValue;
					break;
					
				case 'radio' :
				case 'select' :
					if ( field.elem.$field.find('.case[value="'+value+'"]').length == 0 ) {
						value = '';
					}
					break;
					
				case 'file' :	
					value = [];
					var files = field.uploads.all;
					
					for ( f in files ) {
						var file = {};
						file.title	 = files[f].file.name;
						if ( files[f].file.title ) 	file.title = files[f].file.title;
						
						file.name	 = files[f].file.name;
						file.size 	 = files[f].file.size;
						file.type	 = files[f].file.type;
						file.ext	 = files[f].file.ext;
						value.push(file);
					}
					console.log(value);
					break;
			}
			
			var name = field.name;
			datas.data[name] = value;
		}
		
		return datas;
	}
	
	this.getMode = function () {
		return this.elem.$form.attr('data-mode');
	}
	this.scrollTop = function () {
		this.elem.$content.animate({scrollTop: 0}, 200);
	}
}







/*********
********** Field
*********/

function Field(name) {
	this.name = name;
	this.data;
	this.param;
	this.label;
	this.details;
	this.display;
	this.constraints = false;
	this.triggers = false;
	this.uploads = false;
	this.statut = '';
	
	this.requireAutovalidation = false;
	this.elem = {};	// $tr, $td, $field, $export
	
	this.load = function (field, data) {
		this.data = data;
		
		for ( param in field ) {
			this[param] = field[param];
		}
		
		this.elem = {
			$form 			: $('#lamd'),
			$tr 			: $('#lamd').find('tr[data-field="'+this.name+'"]'),
			$td 			: $('#lamd').find('tr[data-field="'+this.name+'"] td.value'),
			$container 		: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .container'),
			$field 			: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .field'),
			$check 			: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .field, tr[data-field="'+this.name+'"] td.value .export'),
			$export   		: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .export'),
			$feedback   	: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .feedback'),
			$feed 			: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .feed'),
			$help 			: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .help'),
			$autocomplete 	: $('#lamd').find('tr[data-field="'+this.name+'"] td.value .autocomplete'),
			$autocompleteul : $('#lamd').find('tr[data-field="'+this.name+'"] td.value .autocomplete ul')
		}
		
		this.setOptions();
		this.markCheckbox();
	}
	
	this.setOptions = function () {
		if ( this.details ) 				this.setDetails();
		if ( this.param.autocomplete ) 		this.setAutocomplete();
		if ( this.param.type=='passwd' ) 	this.setPasswd();
		if ( this.param.type=='file' )	 	this.setUploads();
		if ( this.param.widget ) 			this.setWidgets();
		if ( this.triggers ) 				this.setTriggers();
	}
	this.setWidgets = function () {
		// Date
		if ( this.param.widget.date ) {
			$.datepicker.setDefaults(datepickerOptions);
			this.elem.$field.datepicker();
		}
		// Colorpicker
		else if ( this.param.widget.colorpicker ) {
			this.elem.$field.minicolors();
		}
		// CKeditor
		else if ( this.param.widget.wysiwyg ) {
			if ( this.param.widget.wysiwyg == 'ckeditor' ) {
				CKEDITOR.replace(this.name);
			}
			else if ( this.param.widget.wysiwyg == 'tinymce' ) {
				tinyMCE.init({
					mode : 'exact',
					elements : this.name
				});
			}
		}
		// Switcher
		else if ( this.param.widget.switcher ) {
			this.setSwitcher();
		}
	}
	
	this.check = function (data) {
		if ( !data )						var data = this.getValue();
		if ( !this.constraints ) 			return true;
		if ( !this.requireValidation() ) 	return true;
		
		var flag = true;
		var err = [];
		
		for ( var c in this.constraints ) {
			var param = false;
			
			if ( !this.constraints[c] )	 continue;
			else			 			 param = this.constraints[c];
			
			// Test de la fonction d'erreur
			var check = this.error(this, data);
			var error = check[c](param);
			
			if ( !error.flag ) {
				// Il y une erreur sur le champs
				err.push(error.txt);
			}
		}
		
		if ( err.length > 0 ) {
			this.statut = 'error';
			flag = false;
			this.requireAutovalidation = true;
			this.displayErrors(err);
		}
		else {
			if ( this.requireAutovalidation ) {
				this.corrected();
			}
		}
		
		return flag;
	}
	
	this.corrected = function () {
		this.statut =  'correct';
		this.fieldFeedback().show('correct');
		var self = this;
		setTimeout(
			function () {
				if ( self.elem.$feed.attr('data-statut') == 'correct' ) {
					self.fieldFeedback().hide();
				}
			},
			3000
		);
	}
	
	this.requireValidation = function () {
		if ( this.elem.$tr.attr('data-active') == 'true' ) {
			return true;
		}
		return false;
	}
	
	this.setAutovalidation = function () {
		var self = this;
		
		if ( this.param.type == 'passwd' ) { 
			this.elem.$checkConfirm.live('change', function () { self.check(); });
			this.elem.$checkConfirm.live('keyup', function () { self.check(); });
		}
		
		this.elem.$check.live('click', function () { self.check(); });
		this.elem.$check.live('change', function () { self.check(); });
		this.elem.$check.live('keyup', function () { self.check(); });
	}
	this.setTriggers = function () {
		var self = this;
		
		// On cache les champs qui doivent être triggered
		for ( var i=0; i<this.triggers.length; i++ ) {
			var fields = this.triggers[i].fields;
			
			for ( var j=0; j<fields.length; j++ ) {
				this.getField(fields[j]).hide();
				this.getField(fields[j]).attr('data-active', 'false');
			}
		}
		
		// Handler
		this.elem.$tr.live('click', function () {
			setTimeout(function () {
					trigger();
				},
				50
			);
		});
		trigger();
		
		// Fonction appelée à chaque event
		function trigger () {
			for ( var i=0; i<self.triggers.length; i++ ) {
				var trigger = self.triggers[i];
				
				var values = trigger.values;
				var fields = trigger.fields;
				var options = '';
				if ( trigger.options) var options = trigger.options;
				
				
				var flag = false;
				for ( var j=0; j<values.length; j++ ) {
					flag = checkFieldValue(values[j].toString(), options);
					if ( flag ) break;
				}
				
				for ( var k=0; k<fields.length; k++ ) {
					if ( flag ) {
						self.getField(fields[k]).show('fast');
						self.getField(fields[k]).attr('data-active', 'true');
					}
					else {
						self.getField(fields[k]).hide('fast');
						self.getField(fields[k]).attr('data-active', 'false');
					}
				}
			}
		}
		function checkFieldValue (checkValue, options) {
			var fieldValue = self.getValue();
			
			if ( checkValue.match(/^#.+#$/) ) {
				var testReg = checkValue.replace('#', '').replace('#', '');
				var reg = new RegExp(testReg, options);
				flag = reg.test(fieldValue);
			}
			else {
				flag = (checkValue == fieldValue  ||  _.contains(fieldValue, checkValue));
			}
			return flag;
		}
	}
	this.setDetails = function () {
		var self = this;
		this.fieldFeedback().show('details', this.details);
		
		var feed = this.elem.$feed;
		this.elem.$help.live('click', function () {
			if ( self.elem.$tr.attr('data-statut') == 'details' )
				self.elem.$tr.attr('data-statut', '');
			else {
				self.elem.$tr.attr('data-statut', 'details');
				feed.html(self.details);
			}
		});
	}
	
	this.setAutocomplete = function () {
		var ac = new Autocomplete(this);
		ac.load();
	}
	this.setUploads = function () {
		this.uploads = new Uploads(this.param.file);
		this.uploads.init(this.data);
	}
	this.setPasswd = function () {
		var self = this;
		
		// Rajout de la contrainte native passwd
		if ( !this.constraints) this.constraints = {passwd:true};
		else 					this.constraints.passwd = true;
		
		var $tr_confirm = this.elem.$tr.clone();
		$tr_confirm.find('[data-action]').hide();
		$tr_confirm.find('td.label').html('Confirmez votre mot de passe *');
		$tr_confirm.attr('data-field',  this.elem.$tr.attr('data-field')+'_confirm');
		$tr_confirm.find('.export').attr('name',  this.elem.$tr.find('.export').attr('name')+'_confirm');
		this.elem.$tr.after($tr_confirm);
		
		if ( this.getMode() == 'mod' ) {
			this.elem.$tr.attr('data-active', 'false');
			this.elem.$tr.next().hide();
			
			// Annuler le changement de mdp
			this.elem.$tr.find('.changePasswd[data-action="cancel"]').live('click', function () {
				self.elem.$tr.attr('data-active', 'false');
				self.elem.$tr.next().hide();
				self.initStatut();
			});
			// Changer de mdp
			this.elem.$tr.find('.changePasswd[data-action="change"]').live('click', function () {
				self.elem.$tr.attr('data-active', 'true');
				self.elem.$tr.next().show();
				self.initStatut();
			});
		}
		else {
			this.elem.$tr.find('[data-action]').hide();
			this.elem.$tr.next().attr('data-active', 'true');
		}
		
		this.elem.$checkConfirm = $tr_confirm.find('.field');
	}
	
	this.setSwitcher = function () {
		var $container = this.elem.$container
		var $field = this.elem.$field
		$field.hide();
		$container.append('<div class="switcher widget"></div>');
		
		var $switcher = this.elem.$td.find('.switcher');

		$field.find('input').each(function () {
			$this = $(this);
			$switcher.append(
				'<div class="label" data-checked="'+$this.attr('data-checked')+'" data-value="'+$this.val()+'">'+
					$this.attr('data-label')+
				'</div>'
			);
		});
		
		$switcher.find('.label').live('click', function () {
			$this = $(this);
			// Modif sur le switcher
			$switcher.find('.label').attr('data-checked', 'false');
			$this.attr('data-checked', 'true');
			
			// Modif sur l'export
			$container.find('.export').val($this.attr('data-value'));
		});
	}
	
	
	this.displayErrors = function (errors) {
		var txt = '';
		for ( var i=0; i<errors.length; i++ ) {
			txt += '- '+errors[i]+'<br/>';
		}
		this.fieldFeedback().show('error', txt);
	}
	this.initStatut = function () {
		this.elem.$tr.attr('data-statut', 'default');
	}
	
	this.markCheckbox = function (field) {
		// Coche les checkbox/radio/select après chargement du formulaire
		var $field = this.elem.$field;
	
		$field.find('.case').each(function () {
			$this = $(this);
			if ( $this.attr('data-checked') == 'false' )	return;
			
			$this.attr('checked', 'checked');
			$this.attr('selected', 'selected');
		});
	}
	
	this.getValue = function () {
		var value = this.elem.$export.val().trim();
		
		if ( this.param.type == 'checkbox' )  value = value.split(',');
		
		return value;
	}
	this.getDefaultValue = function () {
		return this.elem.$export.attr('data-default');
	}
	this.getField = function (field) {
		return $('tr[data-field="'+field+'"]');
	}
	
	this.getMode = function () {
		return this.elem.$form.attr('data-mode');
	}
	this.isActive = function () {
		if (this.elem.$tr.attr('data-active') == 'false' ) return false;
		return true;
	}
	this.fillTextarea = function () {
		this.elem.$export.html(CKEDITOR.instances[this.name].getData());
	}
	

	this.fieldFeedback = function (param) {
		var self = this;
		
		this.errors = {
			notEmpty		: 'Ne doit pas &ecirc;tre vide',
			longerThan		: 'Minimum '+param+' caract&egrave;res',
			smallerThan		: 'Maximum '+param+' caract&egrave;res',
			passwdConfirm	: 'Les deux mots de passe ne correspondent pas',
			email			: 'Un email est requit',
			tel				: 'Un num&eacute;ro de t&eacute;l&eacute;phone est requit',
			url				: 'Une URL est requise',
			regex			: 'Le format du champs est incorrect',
			
			corrected		: 'Parfait !',
			
			show			:   function (statut, txt) {
									if ( statut == 'details' ) return
									
									self.elem.$tr.attr('data-statut', statut);
									
									if ( statut == 'correct' ) txt = this.corrected;
									self.elem.$feed.html(txt);
									
								},
			
			hide			:   function () {
									self.elem.$feed.attr('data-statut', '');
									self.elem.$feed.html('');
									
								}
		};
		
		return this.errors;
	}
	
	
	// Vérification des erreurs
	this.error = function (field, data) {
		var field = field;
		var data = data;
		var flag = true;
		
		var check = {
			notEmpty : function () {
				var flag = true;
				if ( data.length == 0 ||  field.getDefaultValue() == data ) flag = false;
				
				return {flag : flag, txt : field.fieldFeedback().notEmpty};
			},
			longerThan : function (param) {
				var flag = true;
				if ( data.length < param )  flag = false;
				
				return {flag : flag, txt : field.fieldFeedback(param).longerThan};
			},
			smallerThan : function (param) {
				var flag = true;
				if ( data.length > param )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).smallerThan};
			},
			passwd : function (param) {
				var flag = true;
				if ( data != field.elem.$tr.next().find('.export').val() )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).passwdConfirm};
			},
			email : function (param) {
				var flag = true;
				var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
				if ( !reg.test(data) && data!='' )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).email};
			},
			tel : function (param) {
				var flag = true;
				var reg = new RegExp(param);
				if ( !reg.test(data) && data!='' )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).tel};
			},
			url : function (param) {
				var flag = true;
				var reg = new RegExp('^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?', 'gi');
				if ( !reg.test(data) && data != 'http://' )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).url};
			},
			regex : function (param) {
				var flag = true;
				var reg = new RegExp(param);
				if ( !reg.test(data) )  flag = false;
				
				return {flag :flag, txt : field.fieldFeedback(param).regex};
			}
		}
		
		return check;
	}
}