// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update});

// Groupes
var banc;
var obstacles;

// Mode debug
var debug = false;
var text;
var boutonDebug;

//Constantes a parametriser
var FISH_NUMBER = 15;
var NEIGHBOUR_RADIUS = 100;
var MAX_SPEED = 2;
var MAX_FORCE = 0.15;
var DESIRED_SEPARATION = 45;

var COLOR_COHERE = 0xd300cc;
var COLOR_SEPARATION = 0xffd900;
var COLOR_ALIGN = 0x3fd300;

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.getMagnitude() > MAX){

		this.setMagnitude(MAX);
	}

	return this;
}

// Constructeur de l'objet fish
var Fish = function(x, y, graphics,fleche) {

	if(x > game.width / 2){
		Phaser.Sprite.call(this, game, x, y, 'fish');
		this.animations.add('droite', [0,1,2,3,4], 5, true);
		this.animations.add('gauche', [6,7], 5, true);

		this.scale.setTo(0.15,0.15);
	}else {
		Phaser.Sprite.call(this, game, x, y, 'fish2');
		this.animations.add('droite', [0,1,2,3,4,5,6], 5, true);
		//this.animations.add('gauche', [7,8,9,10,11,12], 5, true);
		this.scale.setTo(0.4,0.4);
	}

	this.pointText = game.add.text(0,0, "",{font: "12px Arial", fill: "#ffffff"});
	this.pointText.visible = false;
	
	//Permet de savoir quel poisson est en debug
	this.isDebug = false;

	//Permet de créer le cercle
	this.graphics = graphics;
	
	//Créer une pointe pour la cohesion
	createFleche(fleche,COLOR_COHERE);
	this.pointeCohere = game.add.sprite(0, 0, fleche.generateTexture());
	this.pointeCohere.anchor.y = 0.5;
	this.pointeCohere.visible = false;
	fleche.clear();
	
	//Créer un vecteur de direction (align)
	createFleche(fleche,COLOR_ALIGN);
	this.vecteurAlign = game.add.sprite(0, 0, fleche.generateTexture());

	this.vecteurAlign.anchor.y = 0.5;
	//this.vecteurAlign.anchor.set(0.5);
	this.vecteurAlign.visible = false;
	fleche.clear();
	
	//Créer un vecteur de direction (separation)
	createFleche(fleche,COLOR_SEPARATION);
	this.vecteurSeparation = game.add.sprite(0, 0, fleche.generateTexture());
	this.vecteurSeparation.anchor.y = 0.5;
	this.vecteurSeparation.visible = false;
	fleche.clear();
	
	//Permet de créer une droite
	//this.fleche = fleche;
	
	this.specimen = "";

	// Vitesse de depart
	this.velocity = new Phaser.Point();

	//Si on clique sur un poisson
	this.events.onInputDown.add(this.clickFish, this);

	// Relier a lobjet sprite de phaser
	this.anchor.setTo(0.5, 0.5);
	this.game.physics.arcade.enableBody(this);

	// Animations
	
	this.animations.play('droite');
	//this.scale.setTo(0.15,0.15);

};

// Definition de l'objet fish et de son constructeur
Fish.prototype = Object.create(Phaser.Sprite.prototype);
Fish.prototype.constructor = Fish;

// Function sur un clic dur un poisson
Fish.prototype.clickFish = function (){
	
	//Efface tout les dessins
	this.effaceInfo();
	
	//Si c'est PAS le même poission 
	if(!this.isDebug && debug){
		//Met tout les possion sans debug
		banc.setAll('isDebug', false);
		this.drawCircle();		
	} 

	this.isDebug = !this.isDebug;
}

// Function sur un clic dur un poisson
Fish.prototype.drawCircle = function (){

	//Cercle de séparation
	this.graphics.beginFill(COLOR_SEPARATION, 0.5);
	this.graphics.drawCircle(this.body.x + ((this.body.width)/2), this.body.y + ((this.body.height)/2), DESIRED_SEPARATION * 2);
	
	//Cercle d'alignement
	this.graphics.beginFill(COLOR_ALIGN, 0.5);
	this.graphics.drawCircle(this.body.x + ((this.body.width)/2), this.body.y + ((this.body.height)/2), NEIGHBOUR_RADIUS*2);
	
	
	//Cercle de cohesion
	this.graphics.beginFill(COLOR_COHERE, 0.5);
	this.graphics.drawCircle(this.body.x + ((this.body.width)/2), this.body.y + ((this.body.height)/2), 500);
	
	this.pointText.x = this.body.x;
	this.pointText.y = this.body.y;
	this.pointText.text = "(" + this.body.x.toFixed(0) + "," + this.body.y.toFixed(0) + ")";

	this.pointText.visible = true;
	

}

Fish.prototype.effaceInfo = function (){
	
	//Efface tout les cercles
	this.graphics.clear();
	this.graphics.position = new Phaser.Point();
	
	//Efface tous les point
	banc.setAll('pointText.visible', false);
	banc.setAll('vecteurAlign.visible', false);
	banc.setAll('vecteurSeparation.visible',false);
	banc.setAll('pointeCohere.visible',false);
	
	
}

//Affiche ou efface les info. suplémentaire si on clique sur 'D'
function afficherInformation (bool){

	//Si le mode Debug est activé (on regard si il n'avait pas un poisson en mode debug)
	if(bool){
		for (var x in banc.children){
			if(banc.children[x].isDebug){
				banc.children[x].drawCircle();
			}
		}
	}else {
		banc.children[0].effaceInfo();
	}
	
}

// Premiere fonction du mouvement des poissons
Fish.prototype.step = function (neighbours){
	
	acceleration = this.flock(neighbours);
	stayin = this.checkMurs();
	dodge = this.checkObstacles();
	
	this.velocity.add(acceleration.x, acceleration.y).add(dodge.x, dodge.y).add(stayin.x, stayin.y).limit(MAX_SPEED);
	this.body.position.add(this.velocity.x, this.velocity.y);
	
	if(this.isDebug && debug){
		this.graphics.position.add(this.velocity.x, this.velocity.y); 
		this.pointText.position.add(this.velocity.x, this.velocity.y); 
		this.pointText.text = "(" + this.pointText.x.toFixed(0) + "," + this.pointText.y.toFixed(0) + ")";
	}
}

// Algo principale qui agrege toutes les fonctions du comportement
Fish.prototype.flock = function (neighbours){

	this.body.acceleration.setTo(0,0);

	var separation = this.separate(neighbours);//.multiply(10000,10000);
	var alignment = this.align(neighbours);//.multiply(10000,10000);
	var cohesion = this.cohere(neighbours);//.multiply(10000,10000);
	

	this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
	
		//sprite.rotation = this.rotation;
/*	if (this.angle > 20){
		this.angle = 20;
	}*/

	return separation.add(alignment.x, alignment.y).add(cohesion.x, cohesion.y);

}

// Algo plus bas niveau qui definit la cohesion
Fish.prototype.cohere = function (neighbours){

	var sum = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){

		var d = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (d > 0 && d < NEIGHBOUR_RADIUS){
			

			//Si un poisson en Debug et le debug est actif
			if(this.isDebug && debug){
				neighbours.children[x].pointText.x = neighbours.children[x].body.x;
				neighbours.children[x].pointText.y = neighbours.children[x].body.y;
				neighbours.children[x].pointText.text = "(" + neighbours.children[x].body.x.toFixed(0) + "," + neighbours.children[x].body.y.toFixed(0) + ")";
				neighbours.children[x].pointText.visible = true;
			}
			

			sum.add(neighbours.children[x].body.x, neighbours.children[x].body.y);
			count++;
		}else{

			//Assure d'Afficher seulement ceux qui sont dans le rayon
			if(this.isDebug && debug && d !==0){
				neighbours.children[x].pointText.visible = false;
			}
		}		
	}

	if (count > 0){


		var target = sum.divide(count, count);
		
		if(this.isDebug && debug){
			this.pointeCohere.x = this.body.x + ((this.body.width)/2);
			this.pointeCohere.y = this.body.y + ((this.body.height)/2);
			this.pointeCohere.rotation = Math.atan2(target.y - this.pointeCohere.y, target.x - this.pointeCohere.x);			
			this.pointeCohere.visible = true;
		}
		
		return this.steer_to(target);
	}
	else {

		return sum;
	}
}

// Algo qui determine la direction que le poisson prend
Fish.prototype.steer_to = function(target) {

	var desired = Phaser.Point.subtract(target, this.body.position);
	var d = desired.getMagnitude();;
	
	if (d > 0){

		desired.normalize();
		
		if (d < 100.0)
			desired.multiply(MAX_SPEED * (d/100.0), MAX_SPEED * (d/100.0));
		else
			desired.multiply(MAX_SPEED, MAX_SPEED);

		var steer = Phaser.Point.subtract(desired, this.velocity);
		
		steer.limit(MAX_FORCE);
	}
	else{

		steer = new Phaser.Point(0,0);
	}
	
	return steer;
}

Fish.prototype.align = function (neighbours){

	var mean = new Phaser.Point();
	var steer = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){
		var voisin = neighbours.children[x];
		var distance = Phaser.Point.distance(this.body.position, voisin.body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
			
			if(this.isDebug && debug){	
				voisin.vecteurAlign.x = voisin.body.x + ((voisin.body.width)/2);
				voisin.vecteurAlign.y = voisin.body.y + ((voisin.body.height)/2);
				voisin.vecteurAlign.rotation = Math.atan2(voisin.velocity.y, voisin.velocity.x);			
				voisin.vecteurAlign.visible = true;
			}
			
			mean.add(voisin.velocity.x, voisin.velocity.y);
			count++;
		}else{
			if(this.isDebug && debug){					
				voisin.vecteurAlign.visible = false;
			}
		}		
	}

	if (count > 0){

		mean.divide(count, count);
		mean.normalize();
		
		if(this.isDebug && debug){	
			this.vecteurAlign.x = this.body.x + ((this.body.width)/2);
			this.vecteurAlign.y = this.body.y + ((this.body.height)/2);
			this.vecteurAlign.rotation = Math.atan2(mean.y, mean.x);		
			this.vecteurAlign.visible = true;
		}
		
		mean.multiply(MAX_SPEED, MAX_SPEED);
		steer = Phaser.Point.subtract(mean, this.velocity);
		steer.limit(MAX_FORCE);
	}

	return steer;
}

Fish.prototype.separate = function (neighbours){

	var mean = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){
		
		var d = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (d > 0 && d < DESIRED_SEPARATION){

			var diff = Phaser.Point.subtract(this.body.position, neighbours.children[x].body.position);
			diff.normalize();
			diff.divide(d, d);
			mean.add(diff.x, diff.y);
			count++;
		}
	}

	if(mean.getMagnitude() > 0) {
		mean.normalize();
		
		if(this.isDebug && debug){	
			this.vecteurSeparation.x = this.body.x + ((this.body.width)/2);
			this.vecteurSeparation.y = this.body.y + ((this.body.height)/2);
			this.vecteurSeparation.rotation = Math.atan2(mean.y, mean.x);		
			this.vecteurSeparation.visible = true;
		}
		
		mean.multiply(MAX_SPEED, MAX_SPEED);
		mean.subtract(this.body.velocity.x, this.body.velocity.y);
		mean.limit(MAX_FORCE);
	}else{
		if(this.isDebug && debug){			
			this.vecteurSeparation.visible = false;
		}
	}

	if (count > 1){

		mean.divide(count,count);
	}

	return mean;
}

Fish.prototype.checkObstacles = function() {

	var mean = new Phaser.Point();

	for (var x in obstacles.children){

		var d = Phaser.Point.distance(this.body.position, obstacles.children[x].body.position);

		if (d > 0 && d < 75){

			var diff = Phaser.Point.subtract(this.body.position, obstacles.children[x].body.position);
			diff.normalize();
			diff.divide(d, d);
			mean.add(diff.x, diff.y);
		}
	}

	if(mean.getMagnitude() > 0) {
		mean.normalize();
		mean.multiply(MAX_SPEED, MAX_SPEED);
		mean.subtract(this.body.velocity.x, this.body.velocity.y);
		mean.limit(MAX_FORCE);
	}

	return mean;

}

Fish.prototype.checkMurs = function() {

	var mean = new Phaser.Point();
	var diff = Phaser.Point();

	var distanceMurDroite = Phaser.Point.distance(this.body.position, new Phaser.Point(game.width - 50, this.body.y));
	var distanceMurGauche = Phaser.Point.distance(this.body.position, new Phaser.Point(50, this.body.y));
	var distanceMurHaut = Phaser.Point.distance(this.body.position, new Phaser.Point(this.body.x, 50));
	var distanceMurBas= Phaser.Point.distance(this.body.position, new Phaser.Point(this.body.x , game.height - 50));

	if (distanceMurDroite < 300){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(game.width, this.body.y));
			diff.normalize();
			diff.divide(distanceMurDroite, distanceMurDroite);
			mean.add(diff.x, diff.y);
	}

	if (distanceMurGauche < 300){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(0, this.body.y));
			diff.normalize();
			diff.divide(distanceMurGauche, distanceMurGauche);
			mean.add(diff.x, diff.y);
	}

	if (distanceMurHaut < 300){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(this.body.x, 0));
			diff.normalize();
			diff.divide(distanceMurHaut, distanceMurHaut);
			mean.add(diff.x, diff.y);
	}

	if (distanceMurBas < 300){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(this.body.x , game.height));
			diff.normalize();
			diff.divide(distanceMurBas, distanceMurBas);
			mean.add(diff.x, diff.y);
	}

	return mean;
}

//Permet de creer un fleche
function createFleche(graphic, color){
	graphic.lineStyle(5, color, 0.7);
	graphic.beginFill(color, 0.7);
	
	graphic.moveTo(0,10);
	graphic.lineTo(40,10);
	graphic.lineTo(40,5);
	graphic.lineTo(50,10);
	graphic.lineTo(40,15);
	graphic.lineTo(40,10);
		//fleche.lineTo(10, 70);
		graphic.endFill();
}

function preload() {

	this.game.load.image('wall', 'assets/wall.png');
	this.game.load.image('wall2', 'assets/wall2.png');
	this.game.load.image('background', 'assets/background.png');
	this.game.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
	this.game.load.spritesheet('fish2', 'assets/poisson3.png', 122, 70);
	this.game.load.image('obstacle1', 'assets/obstacle1.png');
	this.game.load.image('obstacle2', 'assets/obstacle2.png');
	this.game.load.image('obstacle3', 'assets/obstacle3.png');
	this.game.load.image('obstacle4', 'assets/obstacle4.png');
	this.game.load.image('obstacle5', 'assets/obstacle5.png');
	this.game.load.image('obstacle6', 'assets/obstacle6.png');
}

function create() {

	// création de l'arrière-plan
	var background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
	
	// Creation des groupes 
	banc = game.add.group();
	obstacles = game.add.group();
	obstacles.enableBody = true;

	// creation mur
	game.add.sprite(0, 0, 'wall');
	game.add.sprite(0, 580, 'wall');
	game.add.sprite(0, 0, 'wall2');
	game.add.sprite(1007,0, 'wall2');
	
	// creation obstacle
	obstacles.create(785, 440, 'obstacle1');
	obstacles.create(115, 455, 'obstacle2');
	obstacles.create(700, 140, 'obstacle3');
	obstacles.create(150, 50, 'obstacle4');
	obstacles.create(400, 200, 'obstacle5');
	obstacles.create(500, 492, 'obstacle6');
	obstacles.setAll('anchor.set', 0.5);

	//active ou desactive le mode Debug
	this.actionKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.actionKey.onDown.add(debugText, this);

	//Graphic pour dessiner disque
	var graphics = game.add.graphics(0, 0);
	
	//Graphique pour dessiner fleche/ligne
	var fleche = game.add.graphics(0, 0);

	//Texte pour le mode debug
	var style = {font: "12px Arial", fill: "#ffffff"};
	text = this.add.text(0,0, "Debug activé (appuyer sur un poisson)", style);
	text.visible = false;
	
	var style2 = {font: "12px Arial", fill: "#ffffff"};
	boutonDebug = this.add.text(0,0, "Appuyer sur D pour activer le mode debug", style2);
	boutonDebug.visible = true;

	// creer les poissons sur la scene
	for(var i = 0; i < FISH_NUMBER; i++) {
		banc.add(new Fish(Math.random() * game.width, Math.random() * game.height, graphics,fleche));
	}

	banc.setAll('inputEnabled', debug);

}

function debugText (){

	debug = !debug;
	text.visible = debug;
	boutonDebug.visible = !debug;
	banc.setAll('inputEnabled', debug);

	afficherInformation(debug);
}

function update(){

	for (var x in banc.children){
		banc.children[x].step(banc);
	}
}