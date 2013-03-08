$(document).ready(function () {
	$('[data-focus]').each(function () {
		addFocus($(this));
	});
	$('[data-href]').live('click', function () {
		if ( $(this).attr('data-href') != '' ) {
			window.location = $(this).attr('data-href');
		}
	});
	
	$('#topbar .user .login').click(function () {
		$(this).parent().find('.tools').slideToggle('fast');
	});
});

function addFocus($elem) {
	$elem.focus();
	val = $elem.val();
	$elem.val('');
	$elem.val(val);
}




/***
** Options
***/
var datepickerOptions = {
	closeText: 'Fermer',
	prevText: 'Pr&eacute;c&eacute;dent',
	nextText: 'Suivant',
	currentText: 'Aujourd\'hui',
	monthNames: ['Janvier','F&eacute;vrier','Mars','Avril','Mai','Juin',
	'Juillet','Août','Septembre','Octobre','Novembre','D&eacute;cembre'],
	monthNamesShort: ['Janv.','F&eacute;vr.','Mars','Avril','Mai','Juin',
	'Juil.','Août','Sept.','Oct.','Nov.','D&eacute;c.'],
	dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
	dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
	dayNamesMin: ['D','L','M','M','J','V','S'],
	weekHeader: 'Sem.',
	dateFormat: 'dd/mm/yy',
	firstDay: 1,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: ''
}


/***
** Prototypes
***/

$.prototype.enter = function (func) {
	var lastWhich = 0;
	
	this.live(
		'keyup', 
		function (e) {
			code = e.keycode ? e.keycode : e.which;
			if ( code == 13 && !( lastWhich == 13 && code == 16 || lastWhich == 16 && code == 13 || lastWhich == 13 && code == 13 ) ){
				func();
			} 
			else {
				lastWhich = e.which;
			}
			setTimeout(function () {
				lastWhich = 0;
			},
			1000);
		}
	)
};

$.prototype.focusend = function () {
	this.focus();
	value = this.val();
	this.val( '');
	this.val(value);
};

String.prototype.ucfirst = function () {
	var f = this.charAt(0).toUpperCase();
	return f + this.substr(1);
};
String.prototype.trim = function () {
	return this.replace(/^\s+/g,'').replace(/\s+$/g,'')
};

String.prototype.isEmpty = function () {
    if (typeof this == 'undefined' || this === null || this === '') return true;
    if (typeof this == 'number' && isNaN(this)) return true;
    if (this instanceof Date && isNaN(Number(obj))) return true;
	if ( this == '' ) return true;
	if ( this.match(/^\s+$/) ) return true;
    return false;
}

Array.prototype.contains = function(val) {
	for ( var i=0; i<this.length; i++ ) {
		if ( this[i] == val ) return true;
	}
	return false;
}