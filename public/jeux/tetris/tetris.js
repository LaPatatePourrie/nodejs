
function Tetris () {
	this.Piece = new Piece();
	this.Style = new Style();
	this.Points = new Points();
	this.Feedback = new Feedback();
	this.Timer;
	
	this.mode = false;
	this.state = 'off';
	this.keypadAuth = true;
	
	
	this.bouton_play = function () {
		var bouton_play = document.getElementById('play');
		var bouton_stop = document.getElementById('stop');
		var bouton_txt = document.getElementById('play').getElementsByTagName('p')[0];
		
		switch ( this.state ) {
			case 'off' :
				if ( this.mode ) {
					if ( this.mode == 'bonus' ) {
						this.Points.mode = 'bonus';
					}
					else if ( this.mode == 'classic' ) {
						this.Points.mode = 'classic';
					}
					bouton_txt.innerHTML = '<span>P</span>ause';
					bouton_stop.style.visibility = 'visible';
				}
				else {
					this.selectMode();
				}
				break;
			case 'on' :
				this.pause();
				bouton_txt.innerHTML = '<span>R</span>eprendre';
				break;
			case 'pause' :
				if ( this.mode == 'bonus' ) {
					this.Points.Bonus.showBase();
				}
				this.restart();
				bouton_txt.innerHTML = '<span>P</span>ause';
				break;
		}
	}
	this.bouton_stop = function () {
		this.stopGame();
		this.initialize();
		var bouton_play = document.getElementById('play');
		var bouton_stop = document.getElementById('stop');
		var bouton_txt = document.getElementById('play').getElementsByTagName('p')[0];
		bouton_stop.style.visibility = 'hidden';
		
		bouton_txt.innerHTML = '<span>J</span>ouer';
	}
	this.bouton_regles = function () {
		if ( this.state == 'on' ) {
			this.pause();
		}
		this.Feedback.display('regles');
	}
	this.bouton_close = function () {
		this.Feedback.hide();
	}
	this.bouton_bonus = function () {
		if ( this.state == 'on' || this.state == 'pause' ) {
			if ( this.state == 'on' ) {
				this.pause();
			}
			this.Points.Bonus.display();
		}
	}
	
	this.initialize = function () {
		this.Feedback.hide();
		this.Piece.cleanPositions();	
		this.Points.initialize();	
	}
	
	this.selectMode = function () {
		this.Feedback.display('mode');
	}
	
	this.start = function () {
		this.bouton_play();
		this.initialize();
		this.state = 'on';
		this.keypadAuth = true;
		this.Piece.initialize(this.mode);
		this.Timer = new Timer(this);
		this.Timer.start();
		this.Points.Timer = this.Timer;
	}
	
	this.pause = function () {
		this.state = 'pause';
		this.Timer.stopTimer();
	}
	
	this.restart = function () {
		this.Feedback.hide();
		this.state = 'on';
		this.Timer.start();
	}
	
	this.stopGame = function () {
		this.keypadAuth = false;
		this.state = 'off';
		this.Timer.stopTimer();
		this.Feedback.display('regles');
		this.Points.Bonus.stopAll();
		this.mode = false;
	}
	
	this.play = function () {
		var flag = this.Piece.changePos('down');
		
		if ( flag === false ) {
			this.gameOver();
		}
		else if ( flag !== true ) {
			switch ( flag[0] ) {
				case 'collapse' :
					this.collapse(flag[1]);
					break;
			}
			
		}
	}
	
	this.collapse = function (complete) {
		this.Points.ligne(complete.length);
		
		this.keypadAuth = false;
		this.Timer.stopTimer();
		this.Style.collapse(complete);
		
		var self = this;
		var complete = complete;
		
		this.collapsing = window.setInterval(function () {
			self.Style.collapse(complete);
			setTimeout(function () {
				self.Style.collapseEnd(complete);
			},
			35);
		},
		70);
		
		setTimeout(function () {
			self.keypadAuth = true;
			self.Style.collapseEnd(complete);
			self.Piece.collapse(complete);
			window.clearInterval(self.collapsing);
			if ( self.state == 'on' ) {
				self.restart();	
			}
		},
		210);
	}
	
	this.gameOver = function () {
		this.stopGame();
		
		var bouton_txt = document.getElementById('play').getElementsByTagName('p')[0];
		bouton_txt.innerHTML = '<span>J</span>ouer';
		
		var divGameover = document.querySelector('#feedback .score span:first-child').innerHTML = this.Points.points;
		var divGameover = document.querySelector('#feedback .score span:last-child').innerHTML = this.Points.level+1;
		
		this.Feedback.display('gameover');
	}
	
	
	this.keypad = function(e) {
		if ( this.keypadAuth ) {
			switch ( e.keyCode ) {
				case 40 :
				    if ( this.state == 'on' ) {
						this.play();
						this.Points.forceDown();
					}
					break;
				case 37 :
				    if ( this.state == 'on' )
						this.Piece.changePos('left');
					break;
				case 38 :
				    if ( this.state == 'on' ) {
						this.Piece.rotate();
					}
					break;
				case 39 :
				    if ( this.state == 'on' )
						this.Piece.changePos('right');
					break;
					
					
				case 80 :
				case 82 :
				case 74 :
				case 65 :
					this.bouton_play();
					break;
					
				case 66 :
					this.bouton_bonus();
					break;
			}
		}
	}
	
	this.useBonus = function (elem, flag) {
		var bonusId = elem.getAttribute('title');
		var duree = this.Points.Bonus.duree;
		
		switch ( bonusId ) {
		
			case 'ralentissementx2' :
				this.Points.Bonus.use(bonusId);
				this.Timer.ralentissement(2, duree);
				this.restart();
				break;
			case 'ralentissementx5' :
				this.Points.Bonus.use(bonusId);
				this.Timer.ralentissement(5, duree);
				this.restart();
				break;
			case 'pointsx2' :
				this.Points.Bonus.use(bonusId);
				this.Points.bonus(2, duree);
				this.restart();
				break;
			case 'pointsx5' :
				this.Points.Bonus.use(bonusId);
				this.Points.bonus(5, duree);
				this.restart();
				break;
			case 'choix' :
				if ( flag ) {
					this.Points.Bonus.update('choix');
					this.Points.Bonus.show();
					this.restart();	
				}
				else {
					this.Feedback.display('choix_piece');
				}
				break;
		}
		
	}
	
}


function Bonus () {
	this.Feedback = new Feedback;
	this.Style = new Style;
	this.bonus = new Array();	
	this.duree = 30000;
	this.mode;
	this.bonusTimer;
	this.bonusInterval;
	
	this.allBonus = new Array();
	this.allBonus['ralentissementx2'] = new Array('Ralentissement x2', 'Diminue par 2 la vitesse de chute.');
	this.allBonus['ralentissementx5'] = new Array('Ralentissement x5', 'Diminue par 5 la vitesse de chute.');
	this.allBonus['pointsx2'] = new Array('Points x2', 'Multiplie par 2 les points gagn&eacute;s.');
	this.allBonus['pointsx5'] = new Array('Points x5', 'Multiplie par 5 les points gagn&eacute;s.');
	this.allBonus['choix'] = new Array('Choisissez une autre pi&egrave;ce', 'Supprimer la pi&egrave;ce actuelle et vous permet d\'en choisir une nouvelle.');
	
	this.divBonus = document.getElementById('bonus');
	this.divBonus_encours = document.getElementById('bonus_encours');
	this.divBonus0 = document.getElementById('bonus0');
	this.divBonus_dispo = document.getElementById('bonus_dispo');
	this.ulBonus = this.divBonus_dispo.getElementsByTagName('ul')[0];
	
	this.stopAll = function () {
		clearTimeout(this.bonusTimer);
		clearInterval(this.bonusInterval);
		this.hideAll();
	}
	
	this.add = function (bonus) {
		switch ( bonus ) {
			case 'niveau1' :
					this.bonus.push('pointsx2');
					break;
			case 'niveau3' :
					this.bonus.push('choix');
					break;
			case 'niveau5' :
					this.bonus.push('ralentissementx2');
					break;
			case 'niveau7' :
					this.bonus.push('choix');
					this.bonus.push('ralentissementx5');
					break;
			case 'niveau9' :
					this.bonus.push('choix');
					this.bonus.push('choix');
					this.bonus.push('ralentissementx5');
					break;
			case 'ligne2' :
					this.bonus.push('choix');
					break;
			case 'ligne4' :
					this.bonus.push('choix');
					this.bonus.push('pointsx5');
					this.bonus.push('ralentissementx5');
					break;
		}
		
		this.Style.addClass(this.divBonus, 'addBonus');
		var self = this;
		setTimeout(function () {
			self.Style.removeClass(self.divBonus, 'addBonus');
		 },
		 2000);
		
		this.show();
	}
	this.initialize = function (mode) {
		this.mode = mode;
		this.divBonus_encours.innerHTML = '';
		this.bonus = new Array();
		if ( mode == 'bonus' ) {
			this.showBase();	
		}
		else {
			this.hideAll();	
		}
	}
	this.show = function () {
		this.showBase();
		this.divBonus0.getElementsByTagName('span')[0].innerHTML = this.bonus.length;
		this.divBonus0.getElementsByTagName('div')[0].style.display = 'block';
	}
	this.display = function () {
		this.Feedback.display('bonus');
		this.divBonus0.style.display = 'none';
		this.divBonus_dispo.style.display = 'block';
		
		var menu = '';
		if ( this.bonus.length == 0 ) {
			menu += 'Vous n\'avez aucun bonus.';
		}
		else {
			for ( var i=0; i<this.bonus.length; i++ ) {
				menu += '<li class="accordeon" onclick="Tetris.useBonus(this);" title="' + this.bonus[i] + '">- <a href="#">' + this.allBonus[this.bonus[i]][0] + '</a><br/>' + this.allBonus[this.bonus[i]][1] + '</li>';
			}
		}
		
		this.ulBonus.innerHTML = menu;
	}
	this.hideAll = function () {
		this.divBonus_dispo.style.display = 'none';
		this.divBonus0.style.display = 'none';
		this.divBonus_encours.style.display = 'none';
	}
	this.showBase = function () {
		this.divBonus.style.display = 'block';
		this.divBonus0.style.display = 'block';
		this.divBonus_dispo.style.display = 'none';
	}
	this.use = function (bonusId) {
		this.update(bonusId);
		
		this.hideAll();
		this.divBonus_encours.style.display = 'block';
		this.divBonus_encours.innerHTML += '<span class="'+bonusId+'">'+this.allBonus[bonusId][0] + ''+'<br/></span><span class="timer"></span>';
		this.timer();
		
		var self = this;
		this.bonusTimer = setTimeout(function () {
			self.divBonus_encours.innerHTML = '';
			self.divBonus_encours.style.display = 'none';
			self.show();
		},
		this.duree);
	}
	this.update = function (bonusId) {
		var oldArray = this.bonus;
		
		var newArray = new Array();
		for ( var i = 0; i < oldArray.length; i++ ) {
			if ( oldArray[i] != bonusId || flag ) {
				newArray.push(oldArray[i]);
			}
			else {
				var flag = true;	
			}
		}
		this.bonus = newArray;	
	}
	this.timer = function () {
		var sec = this.duree/1000;
		var divTimer = this.divBonus_encours.getElementsByClassName('timer')[0];
		
		divTimer.innerHTML = sec;
		sec--;
		var self = this;
		this.bonusInterval = setInterval(function () {
			if ( sec >= 0 ) {
				divTimer.innerHTML = sec;
				sec--;
			}
		},
		1000);
	}
}

function Feedback (Tetris) {
	this.feedback = document.querySelector('#feedback');
	
	this.hide = function () {
		var allFeedback = this.feedback.querySelectorAll('.feedback');
		for ( var i=0; i<allFeedback.length; i++ ) {
			allFeedback[i].style.display = 'none';
		}
		this.feedback.style.display = 'none';
	}
	this.display = function (div) {
		this.hide();
		this.feedback.style.display = 'block';
		this.feedback.querySelector('.'+div).style.display = 'block';
	}
}

function Timer (Tetris) {
	this.Tetris = Tetris;
	this.timer;
	this.allSpeed = new Array(700, 500, 350, 275, 225, 185, 150, 130, 120, 110, 105, 95, 90, 85, 80, 75, 65, 60, 55, 50, 45);
	this.ind = 0;
	this.speed;
	
	this.forcedSpeed = false;
	
	this.start = function () {
		this.getSpeed();
		this.stopTimer();
		
		var speed = false;
		if ( !this.forcedSpeed ) {
			speed = this.speed;	
		}
		else {
			speed = this.forcedSpeed;	
		}
		
		var self = this;
		this.timer = setInterval(function () { self.Tetris.play(); }, speed);
	}
	this.getSpeed = function () {
		this.speed = this.allSpeed[this.ind];	
	}
	this.stopTimer = function () {
		window.clearInterval(this.timer);
	}
	this.accelerate = function () {
		this.ind++;
		this.forcedSpeed = false;
		this.start();
	}
	this.ralentissement = function (fact, duree) {
		var self = this;
		var prevSpeed = this.speed;
		
		setTimeout( function () { 
			self.forcedSpeed = false;
			self.speed = prevSpeed;
			if ( self.state == 'on' ) {
				self.start();
			}
		},
		duree);
		this.forcedSpeed = this.speed*fact;
	}
}


function Points () {
	this.Style = new Style();
	this.Bonus = new Bonus();
	
	this.divLevel = document.getElementById('level');
	this.divLevelTxt = document.getElementById('level').getElementsByTagName('span')[0];
	
	this.divNextLevelTxt = document.getElementById('nextLevel').getElementsByTagName('span')[0];
	
	this.divPoints = document.getElementById('nbPoints');
	this.divPointsTxt = this.divPoints.getElementsByTagName('span')[0];
	
	this.divPointsPlus = document.getElementById('nbPointsPlus');
	this.divPointsPlusTxt = this.divPointsPlus.getElementsByTagName('span')[0];
	
	
	this.fact = 1;
	this.points = 0;
	this.level = 0;
	
	this.plus;
	this.timer;
	this.allLevel = new Array(500, 1500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000); 
	
	this.Timer;
	
	this.initialize = function () {
		this.points = 0;
		this.level = 0;
		this.fact = 1;
		this.afficher();
		this.Bonus.initialize();
	}
	
	this.ligne = function (nbLigne) {
		var fact = 100;
		if ( nbLigne >= 2 && nbLigne < 4  ) {
			fact = 200;
			if ( this.mode == 'bonus' ) {
				this.Bonus.add('ligne2');
			}
		}
		else if ( nbLigne >= 4 && nbLigne < 6  ) {
			fact = 200;
			if ( this.mode == 'bonus' ) {
				this.Bonus.add('ligne4');
			}
		}
		else if ( nbLigne >= 6  ) {
			fact = 300;
			if ( this.mode == 'bonus' ) {
				this.Bonus.add('ligne4');
			}
		}
		this.plus = nbLigne*fact;
		this.augmenter();
	}
	
	this.forceDown = function () {
		this.plus = 1;
		this.augmenter();
	}
	
	this.pointPrev = function () {
		var pointPrev = parseInt(this.divPoints.innerHTML);	
		return pointPrev;
	}
	this.augmenter = function () {
		this.plus = this.plus*this.fact;
		this.points += this.plus;
		this.divPointsPlus.style.visibility = 'visible';
		this.checkLevel();
		this.afficher();
	}
	this.afficher = function () {
		this.setNextLevel();
		this.setLevel();
		this.setPoints();
		this.setPlus();
		
		var self = this;
		clearTimeout(this.timer);
		this.timer = setTimeout(function () {
			self.divPointsPlus.style.visibility = 'hidden';
		}, 1000);
	}
	
	this.checkLevel = function () {
		for ( var i=0; i<this.allLevel.length; i++ ) {
			if ( this.points >= this.allLevel[i] && this.level < i+1 ) {
				this.levelUp();	
			}
		}
	}
	this.levelUp = function () {
		this.Timer.accelerate();
		this.level = this.level + 1;
		
		this.Style.addClass(this.divLevel, 'levelUp');
		var self = this;
		setTimeout(function () {
			self.Style.removeClass(self.divLevel, 'levelUp'); 
		}, 
		3000);
		
		if ( this.mode == 'bonus' ) {
			switch ( this.level ) {
				case 1:
					this.Bonus.add('niveau1');	
					break;
				case 3:
					this.Bonus.add('niveau3');	
					break;
				case 5:
					this.Bonus.add('niveau5');	
					break;
				case 7:
					this.Bonus.add('niveau7');	
					break;
				case 9:
					this.Bonus.add('niveau8');	
					break;
			}
		}
	}
	
	this.setNextLevel = function () {
		this.divNextLevelTxt.innerHTML = this.allLevel[this.level];	
	}
	this.setLevel = function () {
		this.divLevelTxt.innerHTML = this.level+1;	
	}
	this.setPoints = function () {
		this.divPointsTxt.innerHTML = this.points;	
	}
	this.setPlus = function () {
		this.divPointsPlusTxt.innerHTML = this.plus;	
	}
	
	this.bonus = function (fact, duree) {
		this.fact = fact;
		var self = this;
		setTimeout(function () {
			self.fact = 1;
		},
		duree);
	}
}








function Piece () {
	this.Style = new Style();
	this.mode;
	this.nextTypeBloc = false;
	
	this.bloc;
	this.nextBloc;
	
	this.color;
	this.nextColor;
	
	this.positions = new Array();
	
	this.initialize = function (mode) {
		this.mode = mode;
		this.nextColor = false;
		this.nextTypeBloc = false;
		this.build();	
	}
	
	this.cleanPositions = function () {
		var bloc = new Bloc();
		for ( var i=0; i<=bloc.posMaxY; i++ ) {
			this.positions[i] = new Array();
			for ( var j=0; j<=bloc.posMaxX; j++ ) {
				this.positions[i].push(0);
			}
		}	
		
		var nextPositions = new Array();
		for ( var i=0; i<7; i++ ) {
			nextPositions[i] = new Array();
			for ( var j=0; j<5; j++ ) {
				nextPositions[i][j] = 0;
			}
		}
		this.Style.nextBloc(nextPositions);
		this.Style.actualize(this.positions);
	}
	
	this.choose = function (elem) {
		var bonus = elem.getElementsByTagName('a')[0].getAttribute('title');
		this.build(bonus);
	}
	
	this.build = function (bonus) {
		this.bloc = new Array();
		this.nextBloc = new Array();
		
		var bloc = new Bloc();
		
		if ( this.mode == 'classic' ) {
			var nbBloc = 7;
		}
		else {
			var nbBloc = bloc.allType.length;
		}
		
		// Type de bloc
		
		var allType = bloc.allType;
		var typeBloc;
		
		if ( bonus ) {
			typeBloc = bonus;
		}
		else {
			if ( this.nextTypeBloc === false ) {
				typeBloc = this.getRandom(0, nbBloc);
			}
			else {
				typeBloc = this.nextTypeBloc;
			}
		}
		
		var nextTypeBloc = this.getRandom(0, nbBloc);
		this.nextTypeBloc = nextTypeBloc;
		
		
		
		// Couleur du bloc
		
		var indColor = this.getRandom(0, this.Style.allColors.length)
		this.color = this.Style.allColors[indColor];
		
		if ( !this.nextColor ) {
			indColor = this.getRandom(0, this.Style.allColors.length);
			this.color = this.Style.allColors[indColor];
		}
		else {
			this.color = this.nextColor;
		}
		
		var indNextColor = this.getRandom(0, this.Style.allColors.length);
		this.nextColor = this.Style.allColors[indNextColor];
		
		
		
		// Création des blocs
		
		for ( var i=0; i<allType[typeBloc].length; i++ ) {
			this.bloc[i] = bloc.create(typeBloc, i);
		}
		for ( var i=0; i<allType[typeBloc].length; i++ ) {
			this.nextBloc[i] = bloc.create(typeBloc, i);
		}
		
		this.nextPositions(allType[nextTypeBloc]);
	}
	
	this.getRandom = function (nMin, nMax) {
		var n = Math.floor((Math.random() * (nMax-nMin)) + nMin);
		return n;	
	}
	
	
	this.nextPositions = function (type) {
		var nextPositions = new Array();
		
		for ( var i=0; i<7; i++ ) {
			nextPositions[i] = new Array();
			for ( var j=0; j<5; j++ ) {
				nextPositions[i][j] = 0;
			}
		}
		for ( var i=0; i<type.length; i++ ) {
			nextPositions[3 + type[i][0]][2 + type[i][1]] = 1;
		}
		this.Style.nextBloc(nextPositions, this.nextColor);	
	}
	
	
	this.checkLines = function () {
		var complete = false;
		
		for ( var i=0; i<this.positions.length; i++ ) {
			var flag = true;
			
			for	 ( var j=0; j<this.positions[i].length; j++ ) {
				if ( this.positions[i][j] == 0 ) {
					flag = false;
				}
			}
			
			if ( flag ) {
				if ( !complete ) {
					complete = new Array();
				}
				complete.push(i);
			}
		}
		
		if ( complete ) {
			flag = new Array('collapse', complete);
		}
		else {
			flag = false;
		}
		
		return flag;
	}
	
	this.collapse = function (complete) {
		for ( var k=0; k<complete.length; k++ ) {
			var line = complete[k];
			this.emptyLine(line);
			
			for ( var i=line-1; i>=0; i-- ) {
				for ( var j=0; j<this.positions[i].length; j++ ) {
					if ( this.positions[i][j] == 1 ) {
						this.positions[i][j] = 0;
						this.positions[i+1][j] = 1;
						
						this.Style.translateColor(i+1, j);
					}
				}
			}
		}
		this.Style.actualize(this.positions);	
		this.build();
	}
    
	this.emptyLine = function (line) {
		for ( var j=0; j<this.positions[0].length; j++ ) {
			this.positions[line][j] = 0;
		}
	}
	
	
	this.changePos = function(direction) {
		var flag = true;
		
		for ( var i=0; i<this.bloc.length; i++ ) {
			if ( !this.bloc[i].canChangePos(direction, this.positions) ) {
				flag = false;
			}
		}
		
		if ( flag ) {
			this.Style.actualize(this.positions);	
			
			for ( var i=0; i<this.bloc.length; i++ ) {
				this.bloc[i].changePos(direction);
				this.Style.fill(this.bloc[i].posX, this.bloc[i].posY, 'main', this.color);
			}
		}
		else if ( direction == 'down' ) {
			var flag = this.finished();
		}
		
		return flag;
	}
	
	
	this.finished = function (bloc) {
		var flag = true;
		
		for ( var i=0; i<this.bloc.length; i++ ) {
			if ( this.bloc[i].posY < 0 ) {
				flag = false;	
			}
			else {
				this.positions[this.bloc[i].posY][this.bloc[i].posX] = 1;
			}
		}
			
		if ( flag ) {
			var checkLines = this.checkLines();
			if ( checkLines ) {
				return checkLines;
			}
			
			this.build();
			return true;
		}
		else {
			return false;	
		}
	}
	
	
	
	this.rotate = function () {
		var pos = new Array();
		var flag;
		
		for ( var i=0; i<this.bloc.length; i++ ) {
			var thisPos = this.bloc[i].canRotate(this.positions);
			
			if ( !thisPos ) {
				flag = false;
				break;
			}
			else {
				flag = true;
				pos.push(thisPos);
			}
		}
		
		if ( flag ) {
			this.Style.actualize(this.positions);	
			
			for ( var i=0; i<this.bloc.length; i++ ) {
				this.bloc[i].rotate(pos[i]);
				this.Style.fill(this.bloc[i].posX, this.bloc[i].posY, 'main', this.color);
			}
		}
	}
}




	
function Bloc () {
	this.posX ;
	this.posY;
	this.posMaxX = 9;
	this.posMaxY = 19;
	this.startPosX = 4;
	this.startPosY = -1;	
	
	this.numBloc;	
	this.type;	
	this.etat = 0;	
	
	this.allType = new Array(
							new Array(           // Barre
								new Array(-1,0),
								new Array(0,0),
								new Array(1,0),
								new Array(2,0)
								),
							new Array(         // L à l'envers
								new Array(0,0),
								new Array(-1,0),
								new Array(1,0),
								new Array(1,1)
								),
							new Array(           // N à l'envers
								new Array(0,0),
								new Array(0,-1),
								new Array(1,0),
								new Array(1,1)
								),
							new Array(           // N
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1),
								new Array(0,1)
								),
							new Array(           // L
								new Array(0,0),
								new Array(1,0),
								new Array(-1,0),
								new Array(-1,1)
								),
							new Array(            // Carré
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1),
								new Array(0,-1)
								),
							new Array(            // _|_
								new Array(0,0),
								new Array(0,-1),
								new Array(1,0),
								new Array(-1,0)
								),
							
												// MODE BONUS
												
							new Array(          // S
								new Array(0,0),
								new Array(1,0),
								new Array(1,1),
								new Array(-1,0),
								new Array(-1,-1)
								),
							new Array(          // S à l'envers
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1),
								new Array(-1,0),
								new Array(-1,1)
								),
							new Array(          // 3 ptits blocs
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1)
								),
							new Array(          // 3 ptits blocs
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1)
								),
							new Array(            // U
								new Array(0,0),
								new Array(1,0),
								new Array(1,-1),
								new Array(-1,0),
								new Array(-1,-1)
								),
							new Array(            // Barre 1 blocs
								new Array(0,0)
								),
							new Array(            // Barre 1 blocs
								new Array(0,0)
								),
							new Array(            // Barre 2 blocs
								new Array(0,0),
								new Array(0,1)
								),
							new Array(            // Barre 3 blocs
								new Array(-1,0),
								new Array(0,0),
								new Array(1,0)
								),
							new Array(            // Barre 5 blocs
								new Array(-2,0),
								new Array(-1,0),
								new Array(0,0),
								new Array(1,0),
								new Array(2,0)
								),
							new Array(            // Barre 6 blocs
								new Array(-2,0),
								new Array(-1,0),
								new Array(0,0),
								new Array(1,0),
								new Array(2,0),
								new Array(3,0)
								)
							);
	
	
	this.canChangePos = function (direction, positions) {
		switch (direction) {
			case 'down' :
				if ( this.posY < this.posMaxY && (this.posY+1 < 0 || positions[this.posY+1][this.posX] == 0 ) ) {
					return true;
				}
				break;
				
			case 'left' :
				if ( this.posX > 0 && ( this.posY < 0 || positions[this.posY][this.posX-1] == 0 ) ) {
					return true;
				}
				break;
				
			case 'right' :
				if ( this.posX < this.posMaxX && ( this.posY < 0 || positions[this.posY][this.posX+1] == 0 ) ) {
					return true;
				}
				break;
		}
		return false;
	}
	
	this.changePos = function (direction) {
		switch (direction) {
			case 'down': this.posY++;
				break;
			case 'left': this.posX--;
				break;
			case 'right': this.posX++;
				break;
		}	
	}
	
	this.create = function (type, numBloc) {
		var bloc = new Bloc();
		
		var x = this.allType[type][numBloc][0];
		var y = this.allType[type][numBloc][1];
		
		bloc.xBase = x;
		bloc.yBase = y;
		
		bloc.posX = this.startPosX + x;
		bloc.posY = this.startPosY + y;
		bloc.type = type;
		bloc.numBloc = numBloc;
		
		return bloc;
	}
	
	this.canRotate = function (positions) {
		coord = this.coord(this.xBase, this.yBase);
		x = coord[0];
		y = coord[1];
		
		newPosX = this.posX - this.xBase + x;
		newPosY = this.posY - this.yBase + y;

		if ( newPosX < this.posMaxX && newPosX >= 0 && newPosY <= this.posMaxY && ( newPosY < 0 || positions[newPosY][newPosX] == 0 ) ) {
			return {x:x, y:y, newPosX:newPosX, newPosY:newPosY};
		}
		return false;
	}
	
	this.rotate = function (pos) {
		this.posX = pos.newPosX;
		this.posY = pos.newPosY
		
		this.xBase = pos.x;
		this.yBase = pos.y;
	}
	
	this.coord = function (x, y) {
		var previousX = x;
		var previousY = y;

		
		if ( previousY == 0 ) {
			x = 0;
		}
		else {
			x = previousY;
		}
		
		if ( previousX == 0 ) {
			y = 0;
		}
		else {
			y = -previousX;
		}
		
		return new Array(x, y);	
	}
}






function Style () {
	this.allColors = new Array('grey', 'yellow', 'orange', 'red');
	
	this.actualize = function (positions) {
		
		for ( var i=0; i<positions.length; i++ ) {
			for ( var j=0; j<positions[i].length; j++ ) {
				
				if ( positions[i][j] == 0 ) {
					this.empty(j, i, 'main');	
				}
				else {
					this.fill(j, i, 'main', false);
				}
				
			}
		}
	}
	
	this.fill = function(i, j, id, color) {
		id = '#'+id+' ';
		
		var elem = document.querySelector(id + 'table tr:nth-child('+(j+1)+') td:nth-child('+(i+1)+')');
		if ( elem ) {
			this.addClass(elem, 'bloc');	
			
			if ( color ) {
				this.removeColors(elem);
				
				this.addClass(elem, color);	
			}
		}
	}
	
	this.empty = function (i, j, id, color) {
		id = '#'+id+' ';
		
		var elem = document.querySelector(id + 'table tr:nth-child('+(j+1)+') td:nth-child('+(i+1)+')');
		if ( elem ) {
			this.removeClass(elem, 'bloc');
			this.removeColors(elem);
		}
	}
	
	this.translateColor = function (i, j) {
		var elem_collapsing = document.getElementById('main').getElementsByTagName('tr')[i-1].getElementsByTagName('td')[j];
		var color = this.getColor(elem_collapsing);
		
		var color = '';
		for ( var k=0; k<this.allColors.length; k++ ) {
			if ( this.hasClass(elem_collapsing, this.allColors[k]) ) {
				var color = this.allColors[k];
			}
		}
		
		var elem = document.getElementById('main').getElementsByTagName('tr')[i].getElementsByTagName('td')[j];
		this.removeColors(elem);
		
		this.addClass(elem, color);
	}
	
	
	this.nextBloc = function (positions, color) {
		for ( var i=0; i<positions.length; i++ ) {
			for ( var j=0; j<positions[0].length; j++ ) {
				if ( positions[i][j] == 0 ) { 
					this.empty(i, j, 'nextBloc');	
				}
				else {
					this.fill(i, j, 'nextBloc', color);
				}
				
			}
		}
	}
	
	
	this.collapse = function (complete) {
		for ( var k=0; k<complete.length; k++ ) {
			for ( var i=0; i<10; i++ ) {
				elem = document.getElementById('main').getElementsByTagName('tr')[complete[k]].getElementsByTagName('td')[i];
				this.addClass(elem, 'collapsing');
			}
		}	
	}
	
	this.collapseEnd = function (complete) {
		for ( var k=0; k<complete.length; k++ ) {
			for ( var i=0; i<10; i++ ) {
				elem = document.getElementById('main').getElementsByTagName('tr')[complete[k]].getElementsByTagName('td')[i];
				this.removeClass(elem, 'collapsing');
			}
		}	
	}
	
	this.removeColors = function (elem) {
		for ( var i=0; i<this.allColors.length; i++ ) {
			this.removeClass(elem, this.allColors[i]);
		}
	}
	
	this.getColor = function (elem) {
		for ( var i=0; i<this.allColors.length; i++ ) {
			if ( this.hasClass(elem, this.allColors[i]) ) {
				return this.allColors[i];	
			}
			return false;
		}
	}
	
	this.hasClass = function (ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}
	 
	this.addClass = function (ele,cls) {
		if (!this.hasClass(ele,cls)) {
			ele.className += " "+cls;
		}
	}
	 
	this.removeClass = function (ele,cls) {
		if ( this.hasClass(ele,cls) ) {
			var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		}
	}
}





var Tet = new Tetris();
Tet.initialize();
Tet.Feedback.display('regles');

document.addEventListener('keydown', function(e) {Tet.keypad(e)}, false);
document.getElementById('play').addEventListener('click', function() {Tet.bouton_play();}, false);
document.getElementById('stop').addEventListener('click', function() {Tet.bouton_stop();}, false);
document.querySelector('#feedback .close').addEventListener('click', function() {Tet.bouton_close();}, false);
document.querySelector('#utiliser_bonus').addEventListener('click', function() {Tet.bouton_bonus();}, false);




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

function empty(str) {
	if ( str == '' || str == 'undefined' || str == 0 ) {
		return true;
	}
	return false;
}
function is_int (mixed_var) {
    return mixed_var === ~~mixed_var;
}