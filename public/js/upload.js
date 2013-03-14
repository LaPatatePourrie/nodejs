var socket = io.connect('/accueil', {
	'connect timeout': 500,
	'reconnect': true,
	'reconnection delay': 500,
	'reopen delay': 500,
	'max reconnection attempts': 10
 });


$(document).ready(function () {

	uploads = new Uploads();
	uploads.init();
	
});

function Uploads () {
	this.all = {};
	this.elem = {
		$feedback 	: $('.upload .feedback'),
		$table 		: $('.upload table.uploads'),
		field 		: {
			$input		: $('.upload .field input'),
			$btn		: $('.upload .field .btn')
		},
		$export 	: $('.upload .export')
	};
	
	this.init = function () {
		this.setHandlers();
		this.setSockets();
	}
	
	this.setHandlers = function () {
		var self = this;
		
		// Uploader le fichier
		this.elem.field.$input.live('change', function (evnt) {
			self.add(evnt);
		});
		this.elem.field.$btn.live('click', function () {
			self.elem.field.$input.trigger('click');
		});
		// Supprimer le fichier
		this.elem.$table.find('td.option.del').live('click', function () {
			self.feedback().askRemoveUpload($(this).parent().attr('data-file'));
		});
		this.elem.$feedback.find('.confirm').live('click', function () {
			self.del($(this).attr('data-file'));
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
			self.all[name].save();
			self.feedback().saved();
		});
		// Télécharger le fichier envoyé
		this.elem.$table.find('td.title').live('click', function () {
			if ( $(this).parent().attr('data-statut') == 'ended' ) {
				var name = $(this).parent().attr('data-file');
				window.location = '/download/?file='+name+'&type=tmp';
			}
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
			self.ended(data.name);
		});
	}
	
	this.add = function (evnt) {
		var file = evnt.target.files[0];
		var name = file.name;
		
		if ( this.all[name] ) {
			// Fichier déjà envoyé
			this.feedback().error('alreadySent');
			return;
		}
		
		this.feedback().hide();
		this.elem.$export.val(name);
		
		if ( _.size(this.all) == 0 ) 	this.showTable();
		
		this.all[name] = new Upload(file);
		this.all[name].init();
	}
	
	this.del = function (name) {
		if ( $(this).parent().attr('data-statut') == 'uploading' ) {
			self.all[name].stop();
		}
		
		this.feedback().removeUpload(name);
		this.all[name].feedback().removeUpload(name);
		this.all = _.omit(this.all, name);
		
		socket.emit('upload-del', {
			name	: name
		},
		function () {});
	}
	
	this.ended = function (name) {
		this.feedback().ended();
		this.all[name].ended();
	}
	
	this.showTable = function () {
		this.elem.$table.fadeIn('fast');
	}
	
	this.feedback = function () {
		var self = this;
		
		var feed = {
			error 	: function (err) {
				switch ( err ) {
					case 'alreadySent' :
						this.showError('Fichier d&eacute;j&agrave; envoy&eacute;');
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
				if ( longer ) time += 1500; 
				
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
				self.elem.$feedback.attr('data-statut', 'error');
				this.show(str);
			},
			hide	 	: function () {
				self.elem.$feedback.css('visibility', 'hidden');
				self.elem.$feedback.html('');
			}
		}
		
		return feed;
	}
}

function Upload (file) {
	this.file = file;
	this.reader = new FileReader();
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
	
	
	this.init = function () {
		this.start();
	}
	
	this.start = function () {
		var self = this;
		this.uploading = true;
		this.reader = new FileReader();
		
		this.file.strSize = this.getSize();
		this.file.ext = this.getExt();
		this.feedback().addUpload();
		
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
	this.save = function () {
		var datas = {};
		this.elem.$table.find('tr.form[data-file="'+this.file.name+'"] .field').each(function () {
			var value = $(this).val();
			if ( !value.isEmpty() ) {
				datas[$(this).attr('name')] = value;
			}
		});
		if ( datas.title ) {
			this.elem.$table.find('tr[data-file="'+this.file.name+'"] td.title .name .txt').html(datas.title);
		}
		this.feedback().hideForm();
	}
	this.stop = function () {
		this.uploading = false;
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
	this.getExt = function () {
		var ext = this.file.name.split('.');
		return ext[ext.length-1];
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
	
	this.more = function (data) {
		if ( !this.uploading ) return;
		
		// On créé un nouveau bloc de lecture
		var place = data['place'] * 524288;
		var newFile; 
		if ( this.file.webkitSlice ) {
			newFile = this.file.webkitSlice(place, place + Math.min(524288, (this.file.size-place)));
		}
		else {
			newFile = this.file.mozSlice(place, place + Math.min(524288, (this.file.size-place)));
		}
		// On lit le nouveau bloc
		this.reader.readAsBinaryString(newFile);
	}
	
	this.ended = function () {
		this.fileLine.$file.find('.inner').css('width', '100%');
		this.fileLine.$file.find('.percent').html('Envoi termin&eacute;');
		this.fileLine.$file.find('td.option.del').parent().attr('data-statut', 'ended');
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
			addUpload : function () {
				// Création de la ligne contenant le nouveau téléchagement et du formulaire
				self.fileLine.$file = self.elem.$table.find('.tpl.file').clone();
				self.fileLine.$form = self.elem.$table.find('.tpl.form').clone();
				
				self.fileLine.$file.removeClass('tpl');
				self.fileLine.$form.removeClass('tpl');
				
				self.fileLine.$file.attr('data-file', self.file.name);
				self.fileLine.$file.attr('data-statut', 'uploading');
				self.fileLine.$form.attr('data-file', self.file.name);
				
				self.fileLine.$file.find('td.title').attr('title', self.file.name);
				self.fileLine.$file.find('td.title img').attr('src', self.getIcon());
				self.fileLine.$file.find('td.title .txt').html(self.file.name);
				
				self.fileLine.$file.find('td.size').html(self.file.strSize);
				
				// Création du formulaire associé au fichier
				
				
				// Rajout des éléments au tableau
				self.elem.$table.append(self.fileLine.$file);
				self.elem.$table.append(self.fileLine.$form);
			},
			removeUpload : function () {
				self.elem.$table.find('tr[data-file="'+self.file.name+'"]').fadeOut(function () {
					$(this).remove();
				});
				self.elem.$forms.find('.form[data-file="'+self.file.name+'"]').remove();
			},
			showForm	 : function (name) {
				self.fileLine.$form.fadeOut('fast');
				self.fileLine.$form.fadeIn('fast');
			},
			hideForm	 : function (name) {
				self.fileLine.$form.fadeIn('fast');
				self.fileLine.$form.fadeOut('fast');
			}
		}
		
		return feed;
	}
}




