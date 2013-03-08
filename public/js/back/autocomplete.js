
/***
** Autocomplete
***/
function Autocomplete (field) {
	var field = field;
	
	this.load = function () {
		field.elem.$field.attr('autocomplete', 'off');
		
		// Handlers
		this.handleFilling();
		this.handleClick();
		this.handleNavigation();
		this.handleOver();
	}
	
	this.show = function () {
		$('tr[data-field="'+field.name+'"] .autocomplete').fadeIn(100);
	}
	this.hide = function () {
		$('tr[data-field="'+field.name+'"] .autocomplete').hide();
	}
	
	this.handleFilling = function () {
		var self = this;
		
		field.elem.$field.live('keyup', function (e) {
			var code = e.keycode ? e.keycode : e.which;
			if ( code == 38 || code == 40 || code == 13 ) return;
			
			// Appelle de l'autocomplete sur "keydown"
			// Drapeau pour l'affichage final de l'autocomplete ou non
			var flag = false;
			var minchar = 2;
			var $this = $(this);
			
			// On diffère légèrement
			setTimeout(function() {triggerAutocomplete()}, 50);
			
			function triggerAutocomplete () {
				var fieldValue = $this.val();
				
				// On remplit le champs export (dans le cas où l'on peut mettre une valeur perso)
				if ( field.param.value.allowOther )  field.elem.$export.val(fieldValue);
				
				// S'il y a moins d'un certain nombre de caractère > on sort
				if ( fieldValue.length < minchar ) {
					toggle(false);
					return;
				}
				
				if ( !field.param.value.embedded ) {
					// Si l'autocomplete est non-embedded, on récupère les valeurs correspondant au motif
					
					timerOn = false;
					var timer = setTimeout(
						function () {
							if ( !timerOn ) {
								timerOn = true;
								emitSocket();
							}
						}, 
						100
					);
					
					function emitSocket () {
						socket.emit(
							'autocomplete', {	
								dynamic : field.param.value.dynamic, 
								field : field.name, 
								motif : fieldValue
							}, 
							function (err, data) {
								var html = '';
								
								// On construit le contenu de l'autocomplete
								for ( var i=0; i<data.length; i++ ) {
									html += '<li data-value="'+data[i].value+'" data-txt="'+data[i].txt+'">'+data[i].txt+'</li>';
								}
								// On remplit l'autocomplete
								$('tr[data-field="'+field.name+'"] ul').html(html);
								if ( data.length > 0 ) flag = true;
								
								toggle(flag);
							}
						);
					}
				}
				
				else {
					// Si l'autocomplete est embedded, on affiche l'autocomplete et on cache les éléments ne correspondant pas au motif
					field.elem.$autocomplete.find('li').each(function () {
						$(this).show();
						
						var ac_value = $(this).attr('data-value');
						var ac_txt = $(this).attr('data-txt');
						
						var reg = new RegExp('^.*'+fieldValue+'.*$', 'ig');
						
						if ( reg.test(ac_value) || reg.test(ac_txt) ) 		flag = true;
						else 												$(this).hide();
					});
					toggle(flag);
				}
			}
				
			function toggle(flag) {
				// On déroule ou chache l'autocomplete
				if ( !flag ) 	self.hide();
				else			self.show();
			}
		});
	}
	this.handleNavigation = function () {
		// Navigation au clavier
		field.elem.$field.live('keyup', function (e) {
			var code = e.keycode ? e.keycode : e.which;
			
			if ( code == 38 || code == 40 ) {
				field.elem.$field.focusend();
				
				var $current = field.elem.$autocomplete.find('li[data-hover="true"]');
				$current.attr('data-hover', 'false');
				
				var $next = $current.next();
				var $prev = $current.prev();
				if ( $current.length == 0 ) {
					var $next = field.elem.$autocomplete.find('ul li:first-child');
					var $prev = field.elem.$autocomplete.find('ul li:last-child');
				}
				
				if ( code == 38 ) 		$prev.attr('data-hover', 'true');
				if ( code == 40 ) 		$next.attr('data-hover', 'true');
			}
			else if ( code == 13 ) {
				field.elem.$field.val(field.elem.$autocomplete.find('li[data-hover="true"]').attr('data-txt'));
				field.elem.$autocomplete.hide();
			}
		});
	}
	this.handleOver = function () {
		field.elem.$autocomplete.find('li').live('mouseover', function () { $(this).attr('data-hover', 'true'); });
		field.elem.$autocomplete.find('li').live('mouseout', function () { $(this).attr('data-hover', 'false'); });
	}
	this.handleClick = function () {
		// Clic sur un élément
		field.elem.$autocomplete.find('li').live('click', function () {
			field.elem.$export.val($(this).attr('data-value'));
			field.elem.$field.val($(this).attr('data-txt'));
			field.elem.$field.focusend();
		});
		
		// Clic n'importe où  > on ferme les autocomplete
		$('body').live('click', function () {
			$('.autocomplete').hide();
		});
	}
}