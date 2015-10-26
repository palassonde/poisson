// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});

// Groupe de poissons
var banc;
var fishNumber = 30;

//Constantes a parametriser
var NEIGHBOUR_RADIUS = 150;
var MAX_SPEED = 2.5;
var MAX_FORCE = 0.1;
var DESIRED_SEPARATION = 50;

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.getMagnitude() > MAX){

		this.setMagnitude(MAX);
	}

	return this;
}

// Constructeur de l'objet fish
var Fish = function(x, y) {

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

	this.specimen = "";

	// Vitesse de depart
	this.velocity = new Phaser.Point();
	

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

// Premiere fonction du mouvement des poissons
Fish.prototype.step = function (neighbours){

	acceleration = this.flock(neighbours);

	this.velocity = Phaser.Point.add(this.velocity, acceleration).limit(MAX_SPEED);
	this.body.position.add(this.velocity.x, this.velocity.y);
}

// Algo principale qui agrege toutes les fonctions du comportement
Fish.prototype.flock = function (neighbours){

	this.body.acceleration.setTo(0,0);

	var separation = this.separate(neighbours);//.multiply(10000,10000);
	var alignment = this.align(neighbours);//.multiply(10000,10000);
	var cohesion = this.cohere(neighbours);//.multiply(10000,10000);
	var dodge = this.checkObstacles();

	this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
	if (this.angle > 20){
		this.angle = 20;
	}

	return separation.add(alignment.x, alignment.y).add(cohesion.x, cohesion.y).add(dodge.x, dodge.y);

}

// Algo plus bas niveau qui definit la cohesion
Fish.prototype.cohere = function (neighbours){

	var sum = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){
		
		var d = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (d > 0 && d < NEIGHBOUR_RADIUS){
		
			sum.add(neighbours.children[x].body.x, neighbours.children[x].body.y);
			count++;
		}		
	}

	if (count > 0){
				
		var target = sum.divide(count, count);
		return this.steer_to(target);
	}
	else {
	
		return sum;
	}
}

// Algo qui determine la direction que le poisson prend
Fish.prototype.steer_to = function(target) {

	var desired = Phaser.Point.subtract(target, this.body.position);
	var d = desired.getMagnitude();

	// Meilelur facon de faire ?
	//var steer = new Phaser.Point(0,0);
	
	if (d > 0){
	
		desired.normalize();
		
		if (d < 100.0)
			desired.multiply(MAX_SPEED * (d/100.0), MAX_SPEED * (d/100.0));
		else
			desired.multiply(MAX_SPEED, MAX_SPEED);
	
		var steer = Phaser.Point.subtract(desired, this.velocity);
		
		// limit custom function
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
		
		var distance = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
		
			mean.add(neighbours.children[x].velocity.x, neighbours.children[x].velocity.y);
			count++;
		}		
	}

	if (count > 0){

		mean.divide(count, count);
		mean.normalize();
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
	    mean.multiply(MAX_SPEED, MAX_SPEED);
	    mean.subtract(this.body.velocity.x, this.body.velocity.y);
	    mean.limit(MAX_FORCE);
  	}

	return mean;
}


Fish.prototype.checkObstacles = function() {

	var mean = new Phaser.Point(0,0);

	

  	return mean;
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
 }
 
function create() {

	// création de l'arrière-plan
		game.add.tileSprite(0, 0, 1024, 600, 'background');
	
	// création de l'arrière-plan
		game.add.tileSprite(0, 0, 1024, 600, 'background');
	
	// creation mur
		game.add.sprite(0, 0, 'wall');
		game.add.sprite(0, 585, 'wall');
		game.add.sprite(0, 0, 'wall2');
		game.add.sprite(1007,0, 'wall2');
	// creation obstacle
		game.add.sprite(770, 440, 'obstacle1');
		game.add.sprite(315, 455, 'obstacle2');
		
		
	// bouger obstacle3
		sprite = game.add.sprite(500, 300, 'obstacle3');
		sprite.anchor.set(0.5);
		sprite.smoothed = true;
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		sprite.body.immovable = true;
		game.add.tween(sprite.scale).to( { x: 1.25, y: 1.25 }, 1500, Phaser.Easing.Linear.None, true, 0, 1000, true);
	
	banc = game.add.group();

	for(var i = 0; i < fishNumber; i++) {
		banc.add(new Fish(Math.random() * game.width, Math.random() * game.height));
    }
   

}

function update(){

	for (var x in banc.children){
		banc.children[x].step(banc);
	}
}

function render () {

     // debug helper
     //game.debug.bodyInfo(nemo, 16, 24);
}


/*
var diff = Phaser.Point();



	var distanceMurDroite = Phaser.Point.distance(this.body.position, new Phaser.Point(game.width, this.body.y));

	var distanceMurGauche = Phaser.Point.distance(this.body.position, new Phaser.Point(0, this.body.y));
	var distanceMurHaut = Phaser.Point.distance(this.body.position, new Phaser.Point(this.body.x, 0));
	var distanceMurBas= Phaser.Point.distance(this.body.position, new Phaser.Point(this.body.x , game.height));

	if (distanceMurDroite < DESIRED_SEPARATION){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(game.width, this.body.y));
			diff.normalize();
			diff.divide(distanceMurDroite, distanceMurDroite);
			mean.add(diff.x, diff.y);
			count++;
	}

	if (distanceMurGauche < DESIRED_SEPARATION){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(0, this.body.y));
			diff.normalize();
			diff.divide(distanceMurGauche, distanceMurGauche);
			mean.add(diff.x, diff.y);
			count++;
	}

	if (distanceMurHaut < DESIRED_SEPARATION){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(this.body.x, 0));
			diff.normalize();
			diff.divide(distanceMurHaut, distanceMurHaut);
			mean.add(diff.x, diff.y);
			count++;
	}

	if (distanceMurBas < DESIRED_SEPARATION){

			diff = Phaser.Point.subtract(this.body.position, new Phaser.Point(this.body.x , game.height));
			diff.normalize();
			diff.divide(distanceMurBas, distanceMurBas);
			mean.add(diff.x, diff.y);
			count++;
	}

	if (count > 0){
		mean.divide(count, count);
	}

  	return mean;*/