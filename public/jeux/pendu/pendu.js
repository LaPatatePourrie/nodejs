// JavaScript Document

function Pendu() {
	this.Word = new Word();
	this.Draw = new Draw();
	this.Keyboard = new Keyboard();
	
	this.game = 0;
	this.score = 0;
	this.errorCount = 0;
	this.maxError = 6;
	this.tryed;
	this.state = 'off';
	this.difficulte;
	
	this.feedback = document.getElementById('feedback').getElementsByTagName('span')[0];
	
	this.initialize = function () {
		this.state = 'off';
		this.errorCount = 0;
		this.tryed = new Array();
		this.tryed['notFound'] = new Array();
		this.tryed['found'] = new Array();
		
		this.feedback.removeClass('success');
		this.feedback.removeClass('gameover');
		this.feedback.innerHTML = '';
		
		this.control();
		this.Keyboard.initialize();
		this.Draw.initialize(this.maxError);
		this.essaiRestant();
		this.setEvents();
	}
	this.start = function () {
		this.Word.initialize(this.difficulte, this.categorie);
		this.Draw.initialize(this.maxError);
		this.state = 'on';
	}
	this.restart = function () {
		this.initialize();
		this.Word.hideType();
		
		var word = $('#word .word');
		var loader = $('.loader');
		word.hide();
		loader.show();
		
		var self = this;
		setTimeout(function() {
			loader.hide(0, function () {word.fadeIn('slow')});
			self.start();
		}
		, 500);
		
	}
	
	this.control = function () {
		var input = document.getElementById('control').getElementsByClassName('categorie')[0].getElementsByTagName('input');
		for ( var i=0; i<input.length; i++ ) {
			if ( input[i].checked ) {
				this.categorie = input[i].value;
			}
		}
		
		var input = document.getElementById('control').getElementsByClassName('difficulte')[0].getElementsByTagName('input');
		for ( var i=0; i<input.length; i++ ) {
			if ( input[i].checked ) {
				this.difficulte = input[i].value;
			}
		}
	}
	
	this.setEvents = function () {
		var self = this;
		var letters = document.querySelectorAll('#keyboard .active');
		
		for ( var i=0; i<letters.length; i++ ) {
			letters[i].addEventListener('click', function () {
				self.tryLetter(this.getAttribute('data-letter'));
			});
		}
	}
	
	this.tryLetter = function (letter) {
		if ( this.state == 'on' ) {
			if ( !this.tryed['found'].in_array(letter) && !this.tryed['notFound'].in_array(letter) ) {
				if ( this.Word.hasLetter(letter) ) {
					this.found(letter);
				}
				else {
					this.notFound(letter);
				}
			}
		}
	}
	this.found = function (letter) {
		this.tryed['found'].push(letter);
		this.Word.displayLetter(letter, 'string');
		
		if ( this.Word.found() ) {
			this.victory();
		}
	}
	this.notFound = function (letter) {
		this.errorCount++;
		this.essaiRestant();
		this.tryed['notFound'].push(letter);
		this.Keyboard.notFound(letter);
		
		this.Draw.next();
		if ( this.errorCount == this.maxError ) {
			this.gameover();
		}
	}
	this.essaiRestant = function () {
		var essaiRestant = this.maxError-this.errorCount;
		
		if ( essaiRestant == 1 ) {
			this.feedback.innerHTML = 'Dernier essai !';
		}
		else if ( essaiRestant == this.maxError ) {
			this.feedback.innerHTML = 'Choisissez une lettre, '+essaiRestant+' essais restants';
		}
		else {
			this.feedback.innerHTML = essaiRestant+' essais restant';
		}
		
	}
	
	this.gameover = function () {
		this.state = 'gameover';
		this.Word.show();
		this.Word.notFound();
		this.Keyboard.desactivate();
		this.feedback.addClass('gameover');
		this.feedback.innerHTML = 'Pendu !';
		this.displayScore();
	}
	this.victory = function () {
		this.score++;
		this.Keyboard.desactivate();
		this.state = 'success';
		this.feedback.addClass('success');
		this.feedback.innerHTML = 'Gagn&eacute; !';
		this.displayScore();
	}
	this.displayScore = function () {
		this.game++;
		var score = this.score+'/'+this.game;
		var div = document.getElementById('score').getElementsByClassName('score')[0];
		
		div.innerHTML = 'Votre score : '+score;
	}
}

function Keyboard () {
	this.div = document.getElementById('keyboard').getElementsByClassName('keyboard')[0];
	this.letters = 'azertyuiopqsdfghjklmwxcvbn';
	
	this.initialize = function () {
		this.build();
	}
	
	this.build = function () {
		this.div.innerHTML = '';
		for ( var i=0; i<this.letters.length; i++ ) {
			if ( i == 0 ) {
				this.div.innerHTML += '<div class="line">';
			}
			
			this.div.innerHTML += '<div class="letter active" data-letter="'+this.letters[i]+'">'+this.letters[i].toUpperCase()+'</div>';
			
			if ( i == 9 || i == 19 ) {
				this.div.innerHTML += '</div><div class="line">';
			}
			else if ( i == 25 ) { 
				this.div.innerHTML += '</div>';
			}
		}
	}
	this.found = function (letter) {
		var letter = this.findLetter(letter);
		this.desactivate(letter);
		letter.addClass('found');
	}
	this.notFound = function (letter) {
		var letter = this.findLetter(letter);
		this.desactivate(letter);
		letter.addClass('notFound');
	}
	this.findLetter = function (letter) {
		var letters = this.div.getElementsByClassName('letter');
		for ( var i=0; i<letters.length; i++ ) {
			if ( letters[i].getAttribute('data-letter') == letter ) {
				return letters[i];	
			}
		}
		return false;
	}
	
	this.desactivate = function (letter) {
		if ( !letter ) {
			var letters = document.querySelectorAll('#keyboard .active');
		}
		else {
			var letters = new Array(letter);
		}
		
		for ( var i=0; i<letters.length; i++ ) {
			letters[i].removeClass('active');
			letters[i].addClass('inactive');
		}
	}
}


function Word () {
	this.Keyboard = new Keyboard();
	this.previousWords = new Array();
	this.allWords;
	this.word;
	this.type;
	this.wordLength;
	this.divWord = document.getElementById('word').getElementsByClassName('word')[0];
	
	this.initialize = function (difficulte, categorie) {
		this.difficulte = difficulte;
		this.categorie = categorie;
		
		this.divWord.innerHTML = '';
		this.divWord.removeClass('wordNotFound');
		this.divWord.removeClass('wordFound');
		
		this.hideType();
		this.setWord();
		this.countFound = 0;
	}
	this.setWord = function () {
		this.allWords = new Array();
		
		
		this.allWords['cg'] = new Array();
		this.allWords['histoire'] = new Array();
		this.allWords['cinema'] = new Array();
		this.allWords['musique'] = new Array();
		this.allWords['litterature'] = new Array();
		
		
		this.allWords['cg']['facile'] = new Array('pomme', 'rigolade', 'internet', 'cascade', 'montagne', 'bateau', 'pistache', 'radiateur',
												 'voiture', 'affiche', 'renard', 'bouteille', 'epinard', 'dauphin', 'maison', 'boutique', 'pruneau'
												  );
		this.allWords['cg']['intermediaire'] = new Array('culturisme', 'sphynx', 'chenapan', 'humeur', 'camp', 'foulard', 'escarpin', 'boutade',
												 'ventricule', 'estomac', 'devisager', 'repliquer', 'inexcusable', 'sortilege', 'griffonner',
												 'applaudissement', 'praticite', 'ergonomie', 'injonction', 'infiltration', 'reflexion');
		this.allWords['cg']['difficile'] = new Array('escamoter', 'yeux', 'wagonnet', 'plethore', 'gourgandine', 'friche', 'idem', 'tronc', 
													 'exuberance', 'cacophonie', 'paralysie', 'egyptien', 'infinitesimal', 'caqueter');
		
		
		this.allWords['histoire']['facile'] = new Array('Napoleon', 'religion', 'epidemie', 'palais', 'empire', 'Charlemagne', 'royaume',
														'chevalier', 'Arthur', 'bataille', 'Jacques chirac', 'Charles de gaulle', 'Jules Cesar',
														'civilisation');
		this.allWords['histoire']['intermediaire'] = new Array('guillotine', 'echaffaud', 'Saint Louis', 'Montesquieu', 'Medicis', 'Clovis', 'arbalete',
													   'Danton', 'Marat', 'John fitzgerald kennedy', 'esclavage', 'abolition');
		this.allWords['histoire']['difficile'] = new Array('typhus', 'Excalibur', 'Toutankhamon', 'Nikita krouchtchev', 'Jacques chaban delmas',
														   'contextualisation');
		
		
		this.allWords['cinema']['facile'] = new Array('Leonardo dicaprio', '-titanic', 'Jean Dujardin', 'Louis de funes', 'Charlie chaplin', 
													  'projection', 'film', 'tournage', 'actrice', 'producteur', '-star wars', 
													  '-la grande vadrouille', '-le seigneur des anneaux');
		this.allWords['cinema']['intermediaire'] = new Array('Orson wells', 'Woody allen', 'Albert dupontel', 'Andre dussolier', '-les tontons flingueurs',
													 'Lino ventura', 'Bourvil', '-le pere noel est une ordure', 'Fabrice luchini', 'pellicule',
													 'thriller', '-les trois freres', 'comedien', 'scenario', '-le silence des agneaux');
		this.allWords['cinema']['difficile'] = new Array('Ewan mc gregor', '-tanguy', 'Sabine azema', '-effroyables jardins', 'Joaquin phoenix',
														 'Buster keaton', '-la vie est un long fleuve tranquille', '-le fabuleux destin d amelie poulain');
		
		
		this.allWords['musique']['facile'] = new Array('Antonio vivaldi', '+metallica', 'Jacques brel', 'Georges brassen', 'Renaud', 'concerto',
													   'melodie', 'partition');
		this.allWords['musique']['intermediaire'] = new Array('Wolfgang amadeus mozart', 'Frederic Chopin', 'Ludwig van beethoven', 'Tchaikovski', 
													  'Bobby lapointe', 'Elvis presley', 'clavecin', 'Francoise hardy', '-lettre a france');
		this.allWords['musique']['difficile'] = new Array('Hector berlioz', '+deep purple', 'Eddie mitchell', 'ut', '-les mots bleus', 
														  '-mistral gagnant', '-laisse tomber les filles');
		
		
		this.allWords['litterature']['facile'] = new Array('culturisme', 'sphynx');
		this.allWords['litterature']['intermediaire'] = new Array('culturisme', 'sphynx');
		this.allWords['litterature']['difficile'] = new Array('culturisme', 'sphynx');
		
		
		var thisWords = this.allWords[this.categorie][this.difficulte];
		
		
		var n = this.getRandom(0, thisWords.length);
		
		var i = 0;
		while ( this.previousWords.in_array(thisWords[n]) && i<thisWords.length*2 ) {
			var n = this.getRandom(0, thisWords.length);
			i++;
		}
		this.word = thisWords[n];
		this.previousWords.push(thisWords[n]);
		
		
		this.type = this.getType();
		this.displayType();
		this.word = this.word.toLowerCase();
		this.word = this.word.replace('-', '');
		this.word = this.word.replace('+', '');
		
		this.wordLength = 0;
		for ( var i=0; i<this.word.length; i++ ) {
			if ( this.word[i] == ' ' ) {
				this.divWord.innerHTML += '<span class="blank"></span> ';
			}
			else {
				this.wordLength++;
				this.divWord.innerHTML += '<span data-letter="'+this.word[i]+'">_</span> ';
			}
		}
		
		this.displayDifficulte()
	}
	this.getRandom = function (nMin, nMax) {
		var n = Math.floor((Math.random() * (nMax-nMin)) + nMin);
		return n;	
	}
	this.getType = function () {
		var lower = this.word.toLowerCase();
		
		if ( this.word[0] != lower[0] ) {
			return 'nomPropre';	
		}
		else if ( this.word[0] == '-' && this.categorie == 'cinema' ) {
			return 'titreFilm';	
		}
		else if ( this.word[0] == '-' && this.categorie == 'musique' ) {
			return 'titreChanson';	
		}
		else if ( this.word[0] == '+' && this.categorie == 'musique' ) {
			return 'groupe';	
		}
		else  {
			return 'nomCommun';	
		}
	}
	
	this.displayDifficulte = function () {
		if ( this.difficulte == 'facile' ) {
			this.displayLetter(0, 'int');	
			this.displayLetter(this.word.length-1, 'int');	
		}
		else if ( this.difficulte == 'intermediaire' ) {
			this.displayLetter(0);	
		}
	}
	
	this.hasLetter = function (letter) {
		var regex = /letter/
		if ( this.word.match(new RegExp(letter)) ) {
			return true;
		}
		else {
			return false;	
		}
	}
	this.displayLetter = function (letter, type, hide) {
		var letters = this.divWord.getElementsByTagName('span');
		
		
		if ( type == 'string' ) {
			if ( !hide ) {
				this.Keyboard.found(letter);
			}
			for ( var i=0; i<letters.length; i++ ) {
				if ( letters[i].getAttribute('data-letter') == letter ) {
					letters[i].addClass('found');
					letters[i].innerHTML = letter.toUpperCase();
				}
			}
		}
		else {
			if ( !hide ) {
				this.Keyboard.found(this.word[letter]);
			}
			for ( var i=0; i<letters.length; i++ ) {
				if ( letters[i].getAttribute('data-letter') == this.word[letter] ) {
					letters[i].addClass('found');
					letters[i].innerHTML = this.word[letter].toUpperCase();
				}
			}
		}
	}
	this.displayType = function () {
		$('#word .type').css('visibility', 'visible');
		switch ( this.type ) {
			case 'nomPropre' :
				type = 'Personnalit&eacute;';
				break;
			case 'nomCommun' :
				type = 'Nom commun';
				break;
			case 'titreFilm' :
				type = 'Titre de film';
				break;
			case 'titreChanson' :
				type = 'Titre musical';
				break;
			case 'groupe' :
				type = 'Groupe de musique';
				break;
		}
		$('#word .type').html(type);
	}
	this.hideType = function () {
		$('#word .type').css('visibility', 'hidden');
	}
	
	this.found = function () {
		if ( this.divWord.getElementsByClassName('found').length == this.wordLength ) {
			this.divWord.addClass('wordFound');
			return true;	
		}
		else {
			return false;	
		}
	}
	this.notFound = function () {
		this.divWord.addClass('wordNotFound');	
	}
	this.show = function () {
		for (var i=0; i<this.word.length; i++ ) {
			this.displayLetter(i, 'int', true);	
		}
	}
}

function Draw () {
	this.step = 0;
	this.maxStep;
	this.img = document.getElementById('draw').getElementsByClassName('draw')[0].getElementsByTagName('img')[0];
	
	this.initialize = function (maxStep) {
		this.maxStep = maxStep;
		this.step = 0;	
		this.img.src = '';	
	}
	this.next = function() {
		this.img.src = '/public/jeux/pendu/img/step'+(this.maxStep-this.step-1)+'.png';	
		this.step++;
	}
}



// PROTOTYPE

Array.prototype.in_array = function(p_val) {
    var l = this.length;
    for(var i = 0; i < l; i++) {
        if(this[i] == p_val) {
            return true;
        }
    }
    return false;
}
	
Node.prototype.hasClass = function (cls) {
	return this.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
 
Node.prototype.addClass = function (cls) {
	if (!this.hasClass(cls)) {
		this.className += " "+cls;
	}
}
 
Node.prototype.removeClass = function (cls) {
	if ( this.hasClass(cls) ) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		this.className=this.className.replace(reg,' ');
	}
}

//



var game = new Pendu();
game.initialize();
game.start();
