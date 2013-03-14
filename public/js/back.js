/**
* Back-office
**/

var thisPage = false;

var socket = io.connect('/module');

 
 var thisPage = new Page();
 thisPage.init();



	
	
/***
** Routing
***/

function route(route) {
	var args = getArgs(route);
	thisPage.load({
		module	: args.module,
		action	: 'list'
	});
	$('#menuLAMD').find('li.module[data-module="'+args.module+'"]').addClass('current');
}
function getArgs (route) {
	route = route.replace('#', '');
	
	var allArgs = route.split('-');
	var args = {};
	for ( var i=0; i<allArgs.length; i++ ) {
		var tmp = allArgs[i].split(':');
		
		if ( tmp[1] )   value = tmp[1]
		else			value = '';
		args[tmp[0]] = value;
	}
	args[args.action] = {};
	
	for ( var p in args ) {
		if ( p == 'module' )  args.module = args[p];
		else if ( p != args.action ) {
			args[args.action][p] = args[p];
		}
	}
	return args;
}


function loadPackages () {
	socket.emit('packages', function (err, tpl) {
		if (err) alert(err);
		else {
			$('#menuLAMD').html(tpl);
			routing();
		}
	});
}

// Routing sur chargement de la page
function routing () {
	anchor = window.location.hash;
	anchor = anchor.substring(1,anchor.length);
	if ( !anchor.isEmpty() ) {
		route(anchor);
	}
}



$(document).ready(function () {
	/***
	** Packages
	***/
	
	socket.on('connect', function () {
		loadPackages();
		$('#menuLAMD').find('.load').live('click', function () {
			loadPackages();
		});
	});
	
	
	
	
	/***
	** Menu LAMD  -  Packages
	***/
	$('#page').find('.packages .selected').live('click', function () {
		$('#page').find('.packages .others').slideToggle('fast');
		$(this).toggleClass('active');
	});
	$('#page').find('.packages .others .package').live('click', function () {
		socket.emit('setPackage', $(this).attr('data-package'), function () {
			loadPackages();
		});
	});
	
	/***
	** Menu LAMD  -  Modules
	***/
	$('#menuLAMD').find('ul.lamd').find('li.module').live('click', function () {
		var $menu = $('#menuLAMD').find('ul.lamd');
		$menu.find('li.module.current').removeClass('current');
		$menu.find('li.module.current2').removeClass('current2');
		$menu.find('li.view.current').removeClass('current');
		$(this).addClass('current');
		
		thisPage.load({
			module		: $(this).attr('data-module'),
			page		: 1,
			action		: 'list',
			list		: { view : 'main'}
		});
	});
	$('#menuLAMD').find('ul.lamd').find('li.view').live('click', function () {
		var $menu = $('#menuLAMD').find('ul.lamd');
		$menu.find('li.module.current').addClass('current2');
		$menu.find('li.module.current').removeClass('current');
		$menu.find('li.view.current').removeClass('current');
		$(this).addClass('current');
		
		thisPage.args.list.page = 1;
		thisPage.changeView($(this).attr('data-view'));
	});
	
	
	
	
	/***
	** List
	***/
	
	$module = $('#module');
	
	// Add - Mod - Del - Options
	$module.find('table.main td.option.mod').live('click', function () {
		thisPage.load({
			module		: thisPage.Module.name,
			action		: 'form',
			form		: { mod	: $(this).parent().attr('data-id') }
		});
	});
	$module.find('.header .option.add').live('click', function () {
		thisPage.load({
			module		: thisPage.Module.name,
			action		: 'form',
			form		: { add	: true }
		});
	});
	$module.find('.header .option.opt').live('click', function () {
		thisPage.load({
			module		: thisPage.Module.name,
			action		: 'options'
		});
	});
	
	
	// Search
	$module.find('.header .search .btn').live('click', function () {
		var $form = $(this).parent();
		var keywords = $form.find('input').val().trim();
		if ( keywords.length > 0 ) {
			thisPage.search(keywords);
		}
	});
	$module.find('.header .search input').enter(function () {
		$('.header .search .btn').trigger('click')
	});
	
	// Affichage en direct de la recherche
	$module.find('.header .search input').live('keyup', function () {
		var keywords = $(this).val().trim();
		var timer;
		
		if ( keywords.length > 1 ) {
			thisPage.speedSearch(keywords);
		}
	});
	
	
	// Check TD > all TR pour suppressions
	$module.find('table.main tr.title td.check').live('click', function () {
		var $tr = $(this).parent();
		
		if ( $tr.attr('data-checked') == 'true' ) {
			$tr.attr('data-checked', 'false')
			$('table.main tr.value').attr('data-checked', 'false');
			$('.options .option.del').attr('data-active', 'false');
		}
		else {
			$tr.attr('data-checked', 'true')
			$('table.main tr.value').attr('data-checked', 'true');
			$('.options .option.del').attr('data-active', 'true');
		}
	});
	
	
	// Check TR pour suppression
	$module.find('table.main tr.value td:not(.option, [data-transform="img"], [data-transform="link"], [data-transform="toggle"], [data-detail="url"], [data-detail="email"])')
		.live('click', function () {
		var $tr = $(this).parent();
		
		if ( $tr.attr('data-checked') == 'true')	$tr.attr('data-checked', 'false');
		else										$tr.attr('data-checked', 'true');
		
		if ( $('table.main tr.value[data-checked="true"]').length > 0 )
			$('.options .option.del').attr('data-active', 'true');
		else
			$('.options .option.del').attr('data-active', 'false');
	});
	
	
	// Sort 
	$module.find('table.main tr.title td[data-sort]').live('click', function () {
		var field = $(this).attr('data-sort');
		var asc = 1;
		if ( !thisPage.args.list.sort || thisPage.args.list.sort.asc == 1 ) {
			var asc = -1;
		}
		
		thisPage.args.list.sort = { field : field, asc : asc };
		thisPage.args.list.page = 1;
		thisPage.list();
	});
	
	
	// Pagination
	$('#pagination').find('ul li[data-page]').live('click', function () {
		var page = $(this).attr('data-page');
		thisPage.args.list.page = page;
		thisPage.list();
	});
	$('#pagination').find('.all').live('click', function () {
		var page = $(this).attr('data-page');
		thisPage.args.list.page = 'all';
		thisPage.list();
	});
	
	
	
	/***
	** Form
	***/
	
	var $form = $('#lamd');
	var $td = $form.find('td.value');
	
	// Soumission du formulaire
	$form.find('.btn[data-submit]').live('click', function () {
		thisPage.addMod();
	});
	$form.find('td.value input[data-entersubmit="true"]').enter(function () {
		// thisPage.addMod();
	});
	
	
	// Confirm
	$('[data-confirm]').live('click', function() {
		if ( $(this).attr('data-active') != 'true' ) return
		
		$confirm = $(this);
		$overlay = $('.overlay.confirm');
		$overlay.find('.txt').html($(this).attr('data-confirmdel'));
		$overlay.fadeIn('fast');
		
		// $overlay.find('.confirm').die('click');
		// $overlay.find('.cancel').die('click');
		
		$overlay.find('.confirm').live('click', function () {
			$overlay.fadeOut('fast');
			
			if ( typeof($confirm) !== 'undefined' ) {
				thisPage.load({
					module		: thisPage.Module.name,
					action		: 'del'
				});
			}
		});
		$overlay.find('.cancel').live('click', function () {
			$overlay.fadeOut('fast');
		});
	});
	
	// Champs du formulaire
	$td.find('input.case, select option.case').live('click', function () {
		var type = $(this).attr('type');
		if ( !type )  type = $(this).parent().attr('type');
		
		if ( type == 'checkbox' ) {
			if ( $(this).attr('data-checked') == 'true' ) {
				$(this).attr('data-checked', 'false')
				$(this).parent().attr('data-checked', 'false')
			}
			else {
				$(this).attr('data-checked', 'true')
				$(this).parent().attr('data-checked', 'true')
			}
		}
		else {
			$(this).parent().find('.case').attr('data-checked', 'false');
			$(this).attr('data-checked', 'true')
		}
		
		var thisValue = $(this).val();
		var $exported = $(this).parent().parent().parent().find('input.export');
		
		switch ( type ) {
		
			case 'radio' :
				$exported.val(thisValue);
				break;
				
			case 'select' :
				$exported.val(thisValue);
				break;
				
			case 'checkbox' :
				if ( $exported.val().isEmpty() ) 	var values = [];
				else								var values = $exported.val().split(',');
				
				var flag = true;
				for ( var i=0; i<values.length; i++ ) {
					if ( values[i] == thisValue ) {
						flag = false;
					}
				}
				
				if ( $(this).attr('data-checked') == 'true' && flag )	values.push(thisValue);
				else													values = _.without(values, thisValue);
				
				$exported.val(values.join(','));
				break;
		}
	});
});


