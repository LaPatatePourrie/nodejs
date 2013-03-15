var speed = {
	fast		: 100,
	slow		: 400
}

function Uploads (param) {
	this.all = {};
	this.param = param;
	this.elem;
	
	this.init = function (uploaded) {
		this.setElements();
		this.setHandlers();
		this.setSockets();
		
		if ( uploaded ) this.setPreviousUploads(uploaded);
	}
	
	this.setElements = function () {
		this.elem = {
			$feedback 	: $('#lamd').find('.upload .feedback'),
			$table 		: $('#lamd').find('.upload table.uploads'),
			field 		: {
				$input		: $('#lamd').find('.upload .field input'),
				$btn		: $('#lamd').find('.upload .field .btn')
			},
			$export 	: $('#lamd').find('.upload .export')
		};
	}
	
	this.setPreviousUploads = function (uploaded) {
		var self = this;
		
		socket.emit('upload-checkFile', uploaded, function (existing) {
			for ( var i=0; i<existing.length; i++ ) {
				self.addPrevious(existing[i]);
			}
		});
	}
	
	this.setHandlers = function () {
		var self = this;
		
		// Uploader le fichier
		this.elem.field.$input.die('change');
		this.elem.field.$btn.die('click');
		this.elem.$feedback.find('.confirm').die('click');
		this.elem.$table.find('td.option.mod').die('click');
		this.elem.$table.find('tr.form .cancel').die('click');
		this.elem.$table.find('td.option.save').die('click');
		this.elem.$table.find('td.title .txt').die('click');
		
		
		this.elem.field.$input.live('change', function (evnt) {
			self.addNew(evnt);
		});
		this.elem.field.$btn.live('click', function () {
			self.elem.field.$input.trigger('click');
		});
		// Supprimer le fichier
		this.elem.$table.find('td.option.del').live('click', function () {
			self.feedback().askRemoveUpload($(this).parent().attr('data-file'));
		});
		// Confirmer la suppression du fichier
		this.elem.$feedback.find('.confirm').live('click', function () {
			var name = $(this).attr('data-file');
			var statut = self.all[name].getStatut();
			
			// Stop upload
			if (statut == 'uploading')	self.stop(name);
			// Delete upload
			else						self.del(name, statut);
		});
		// Modification
		this.elem.$table.find('td.option.mod').live('click', function () {
			var name = $(this).parent().attr('data-file');
			self.all[name].feedback().showForm();
		});
		// Annuler modification
		this.elem.$table.find('tr.form .cancel').live('click', function () {
			var name = $(this).parent().attr('data-file');
			self.all[name].feedback().hideForm();
		});
		// Sauvegarder modifications
		this.elem.$table.find('td.option.save').live('click', function () {
			var name = $(this).parent().attr('data-file');
			if ( self.all[name].save() ) {
				self.feedback().saved();
			}
		});
		// Télécharger le fichier envoyé
		this.elem.$table.find('td.title .txt').live('click', function () {
			var name = $(this).parent().parent().parent().attr('data-file');
			self.all[name].download();
		});
	}
	
	this.setSockets = function () {
		var self = this;
		socket.on('upload-more', function (data) {
			if ( !self.all[data.name] ) return;
			self.all[data.name].feedback().updateBar(data['percent']);
			self.all[data.name].more(data);
		});
		socket.on('upload-ended', function (data){
			if ( !self.all[data.name] ) return;
			working.uploads--;
			self.ended(data.name);
		});
	}
	
	this.checkUpload = function (file) {
		var self = this;
		
		var check = [
			function () {
				// Extensions
				var ext = getExt(file);
				
				if ( !self.param.ext || self.param.ext.contains(ext) ) return false;
				return 'uncorrectExt';
			},
			function () {
				// Nombre d'upload max
				if ( _.size(self.all) < self.param.max ) return false;
				return 'maxUploads';
			},
			function () {
				// Taille max du fichier
				if ( parseFloat(self.param.maxSize) > parseFloat(file.size/1000) ) return false;
				return 'maxSize';
			}
		];
		
		for ( var i=0; i<check.length; i++ ) {
			if ( check[i]() ) return check[i]();
		}
		return false;
	}
	
	this.add = function (file, type) {
		var name = file.name;
		
		if ( this.all[name] ) {
			// Fichier déjà envoyé
			this.feedback().error('alreadySent');
			return;
		}
		
		var err = this.checkUpload(file);
		
		if ( type == 'new' && err ) {
			// Upload impossible
			this.feedback().error(err);
			return;
		}
		
		this.feedback().hide();
		this.elem.$export.val(name);
		
		if ( _.size(this.all) == 0 ) 	this.showTable();
		
		this.all[name] = new Upload(file, this.param);
		this.all[name].init(type);
	}
	
	this.addPrevious = function (file) {
		this.add(file, 'prev');
	}
	this.addNew = function (evnt) {
		var file = evnt.target.files[0];
		this.add(file, 'new');
	}
	
	this.del = function (name, statut) {
		this.feedback().removeUpload(name);
		this.all[name].feedback().removeUpload(name);
		this.all = _.omit(this.all, name);
		
		socket.emit('upload-del', {
			name	: name,
			statut	: statut
		},
		function () {});
	}
	this.stop = function (name) {
		this.all[name].stop();
		this.all = _.omit(this.all, name);
	}
	
	this.ended = function (name) {
		this.feedback().ended();
		this.all[name].setStatut('ended');
		this.all[name].ended();
	}
	
	this.showTable = function () {
		this.elem.$table.fadeIn(speed.fast);
	}
	
	this.feedback = function () {
		var self = this;
		
		var feed = {
			error 	: function (err) {
				switch ( err ) {
					case 'alreadySent' :
						this.showError('Fichier d&eacute;j&agrave; envoy&eacute;');
						break;
					case 'uncorrectExt' :
						this.showError('Extensions autoris&eacute;es: '+self.param.ext);
						break;
					case 'maxUploads' :
						this.showError(self.param.max+' fichiers autoris&eacute;s.');
						break;
					case 'maxSize' :
						this.showError('Taille maximale autoris&eacute;: '+self.param.maxSize+' Ko');
						break;
				}
			},
			removeUpload : function (err) {
				this.showCorrect('Fichier supprim&eacute;');
			},
			askRemoveUpload : function (name) {
				this.showCorrect('<div class="confirm" data-file="'+name+'">Confirmer la suppression ?</div>', true);
			},
			ended		 : function () {
				this.showCorrect('Envoi termin&eacute;');
			},
			saved  	: function (percent) {
				this.showCorrect('Informations sauvegard&eacute;es');
			},
			show	 	: function (str, longer) {
				this.hide();
				
				self.elem.$feedback.css('visibility', 'visible');
				self.elem.$feedback.html(str);
				
				var time = 300000;
				if ( longer ) time += 3000; 
				
				var f = this;
				clearTimeout(self.timer);
				self.timer = setTimeout(function () {
					f.hide();
				},
				time);
			},
			showCorrect	: function (str) {
				self.elem.$feedback.attr('data-statut', 'default');
				this.show(str);
			},
			showError	: function (str) {
				self.elem.$feedback.attr('title', str);
				self.elem.$feedback.attr('data-statut', 'error');
				this.show(str, true);
			},
			hide	 	: function () {
				self.elem.$feedback.css('visibility', 'hidden');
				self.elem.$feedback.html('');
			}
		}
		
		return feed;
	}
}




function Upload (file, param) {
	this.file = file;
	this.param = param;
	this.reader;
	this.uploading;
	this.elem = {
		field 		: {
			$input		: $('.upload .field input'),
			$btn		: $('.upload .field .btn')
		},
		$export 	: $('.upload .export'),
		$submit 	: $('.upload .submit'),
		$forms	 	: $('.upload .forms'),
		$table	 	: $('.upload table.uploads'),
		table		: {
			$tpl		: $('.upload table.uploads tr.tpl'),
			$title		: $('.upload table.uploads td.title')
		}
	};
	this.fileLine = {};
	
	this.init = function (type) {
		if ( type == 'prev' ) 	this.setPrevious();
		else					this.start();
	}
	
	this.start = function () {
		var self = this;
		this.uploading = true;
		working.uploads++;
		if ( this.reader )		this.reader.abort();
		this.reader = new FileReader();
		
		this.file.strSize = this.getSize();
		this.file.ext = getExt(this.file);
		
		
		
		console.log(this.file);
		this.add();
		
		socket.emit('upload-start', { 
			name	: this.file.name, 
			size 	: this.file.size 
		});
		this.reader.onload = function(evnt) {
			socket.emit('upload', {
				name 	: self.file.name,
				data  	: evnt.target.result 
			});
		}
	}
	
	this.stop = function () {
		working.uploads--;
		this.uploading = false;
		this.feedback().removeUpload();
	}
	
	this.more = function (data) {
		if ( !this.uploading ) 					return;
		if ( this.getStatut() != 'uploading' )  return;
		
		// On créé un nouveau bloc de lecture
		var place = data['place'] * 524288;
		var newFile; 
		
		if ( this.file.mozSlice ) {
			newFile = this.file.mozSlice(place, place + Math.min(524288, (this.file.size-place)));
		}
		else {
			newFile = this.file.slice(place, place + Math.min(524288, (this.file.size-place)));
		}
		// On lit le nouveau bloc
		this.reader.readAsBinaryString(newFile);
	}
	
	this.setPrevious = function () {
		var self = this;
		
		socket.emit('upload-previously', { 
				name	: this.file.name, 
				size 	: this.file.size 
			}, 
			function () {
				self.add();
				self.setStatut('previously');
				self.ended();
				self.fileLine.$file.find('.percent').html('Envoi effectu&eacute;');
				self.elem.$table.find('tr.file[data-file="'+self.file.name+'"] td.title .name .txt').html(self.file.title);
				self.elem.$table.find('tr.file[data-file="'+self.file.name+'"] td.size').html(self.getSize(self.file.size));
				self.elem.$table.find('tr.form[data-file="'+self.file.name+'"] input.field[name="title"]').val(self.file.title);
			}
		);
	}
	
	this.ended = function () {
		$file = this.fileLine.$file;
		
		$file.find('.inner').css('width', '100%');
	
		$file.find('.percent').html('Envoi termin&eacute;');
		
		if ( this.publicDisplay() ) {
			// Thumbnails
			$file.find('td.title .img').hide();
			$file.find('td.title .thumb').show();
			$file.find('td.title .thumb a').attr('rel', 'galery');
			
			var href = '/public/data/tmp/'+this.getModule()+'/'+this.file.name;
			if ( this.getStatut() == 'previously' ) {
				href = '/public/data/uploads/'+this.getModule()+'/'+$('form#lamd').attr('data-id')+'/'+this.file.name;
			}
			
			$file.find('td.title .thumb a').attr('href', href);
			$file.find('td.title .thumb img').attr('src', href);
			
			$file.find('td.title .thumb a').fancybox({
				openEffect	: 'none',
				closeEffect	: 'none'
			});
		}
	}
	
	this.save = function () {
		var datas = {};
		this.elem.$table.find('tr.form[data-file="'+this.file.name+'"] .field').each(function () {
			var value = $(this).val();
			if ( !value.isEmpty() ) {
				datas[$(this).attr('name')] = value;
			}
		});
		
		if ( datas.title ) {
			this.file.title = datas.title;
			this.elem.$table.find('tr[data-file="'+this.file.name+'"] td.title .name .txt').html(datas.title);
		}
		
		this.feedback().hideForm();
		
		if ( _.isEmpty(datas) ) return false;
		return true;
	}
	
	this.download = function () {
		var url = false;
		var module = '';
			
		var module = this.getModule();
		var file = this.file.name;
		var statut = this.param.statut;
		if (statut == 'pub') statut = 'public';
		
		if ( this.getStatut() == 'previously' ){
			var id = $('form#lamd').attr('data-id');
			var type = 'uploaded';
		}
		else {
			var type = 'tmp';
		}
		
		
		url = '/download/?file='+file+'&id='+id+'&type='+type+'&module='+module+'&statut='+statut;
		// alert(url);
		window.location = url;
	}
	
	this.add = function () {
		$file = this.elem.$table.find('.tpl.file').clone();
		$form = this.elem.$table.find('.tpl.form').clone();
		
		$file.removeClass('tpl');
		$form.removeClass('tpl');
		
		$file.attr('data-file', this.file.name);
		$form.attr('data-file', this.file.name);
		
		$file.find('td.title').attr('title', this.file.name);
		$file.find('td.title img').attr('src', this.getIcon());
		$file.find('td.title img').attr('src', this.getIcon());
		$file.find('td.title .txt').html(this.file.name);
		$file.find('td.title .thumb').hide();
		
		$file.find('td.size').html(this.file.strSize);
		
		// Rajout des éléments au tableau
		this.elem.$table.append($file);
		this.elem.$table.append($form);
		this.fileLine.$file = $file;
		this.fileLine.$form = $form;
		
		this.setStatut('uploading');
	}
	
	this.feedback = function () {
		var self = this;
		
		var feed = {
			init 	: function () {
				
			},
			updateBar  : function (percent) {
				self.fileLine.$file.find('.inner').css('width', percent+'%');
				self.fileLine.$file.find('.percent').html(Math.round(percent)+'%');
			},
			removeUpload : function () {
				self.elem.$table.find('tr[data-file="'+self.file.name+'"]').fadeOut(function () {
					$(this).remove();
				});
				self.elem.$forms.find('.form[data-file="'+self.file.name+'"]').remove();
			},
			showForm	 : function (name) {
				self.fileLine.$form.hide();
				self.fileLine.$form.fadeIn(speed.fast);
			},
			hideForm	 : function (name) {
				self.fileLine.$form.fadeIn(speed.fast);
				self.fileLine.$form.fadeOut(speed.fast);
			}
		}
		
		return feed;
	}
	
	this.getSize = function () {
		var size = Math.round(this.file.size / 1048576);
		var unite = 'Mo'; 
		if ( size == 0 ) {
			size = Math.round(this.file.size / 1048);
			var unite = 'Ko';
		}
		size += ' '+unite;
		return size;
	}
	this.getIcon = function () {
		switch ( this.file.ext ) {
			
			case 'rar' :
				icon = 'rar';
				break;
			
			case 'gif' :
				icon = 'gig';
				break;
				
			case 'png' :
			case 'jpg' :
				icon = 'img';
				break;
				
			case 'xsl' :
			case 'xslx' :
				icon = 'excel';
				break;
				
			case 'doc' :
			case 'docx' :
				icon = 'word';
				break;
				
			case 'mpeg' :
			case 'mpg' :
			case 'mp4' :
				icon = 'mpg';
				break;
				
			case 'mp3' :
			case 'wma' :
				icon = 'mp3';
				break;
				
			default :
				icon = 'default';
		}
		
		icon = '/public/img/icon/file/'+icon+'.png';
		return icon;
	}
	this.publicDisplay = function () {
		if (this.param.media == 'img' && this.param.statut == 'pub') {
			return true;
		}
		return false;
	}
	this.getStatut = function () {
		return this.fileLine.$file.attr('data-statut');
	}
	this.setStatut = function (statut) {
		this.statut = statut;
		this.fileLine.$file.attr('data-statut', statut);
	}
	this.getModule = function () {
		return $('form#lamd').attr('data-module');
	}
}


function getExt (file) {
	var ext = file.name.split('.');
	return ext[ext.length-1].toLowerCase();
}


