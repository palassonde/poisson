// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});

// Groupe de poissons
var banc;

//Constates a parametriser
var NEIGHBOUR_RADIUS = 30;
var MAX_SPEED = 5;
var MAX_FORCE = 5;
var DESIRED_SEPARATION = 10;
var SEPARATION_WEIGHT = 10;
var ALIGNMENT_WEIGHT = 10;
var COHESION_WEIGHT = 10;

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.x > MAX || this.y > MAX){

		this.x = MAX;
		this.y = MAX;
	}
}

// Constructeur de l'objet fish
var Fish = function(x, y, group) {

	Phaser.Sprite.call(this, game, x, y, 'fish');

	this.velocity = new Phaser.Point(Math.random()*2-1, Math.random()*2-1);
	this.neighbours = group;
	
	// Relier a lobjet sprite de phaser
	this.anchor.setTo(0.5, 0.5);
	this.game.physics.arcade.enableBody(this);

	// Animations
	this.animations.add('droite', [0,1,2,3,4], 5, true);
	this.animations.add('gauche', [6,7], 5, true);
	this.animations.play('droite');
	this.scale.setTo(0.15,0.15);

};

// Definition de l'objet fish et de son constructeur
Fish.prototype = Object.create(Phaser.Sprite.prototype);
Fish.prototype.constructor = Fish;

// Premiere fonction du mouvement des poissons
Fish.prototype.step = function (neighbours){

	acceleration = this.flock(neighbours);

	this.velocity = Phaser.Point.add(this.velocity, acceleration);
	this.velocity.limit(MAX_SPEED);
	this.body.position = Phaser.Point.add(this.body.position, this.velocity);

}

// Algo principale qui agrege toutes les fonctions du comportement
Fish.prototype.flock = function (neighbours){


	var separation = this.separate(neighbours).multiply(SEPARATION_WEIGHT,SEPARATION_WEIGHT);
	var alignment = this.align(neighbours).multiply(ALIGNMENT_WEIGHT,ALIGNMENT_WEIGHT);
	var cohesion = this.cohere(neighbours).multiply(COHESION_WEIGHT,COHESION_WEIGHT);


	var result = Phaser.Point.add(Phaser.Point.add(separation, alignment), cohesion);
	return result;
}

// Algo plus bas niveau qui definit la cohesion
Fish.prototype.cohere = function (){

	var sum = new Phaser.Point();
	var count = 0;

	for (var x in banc.children){
		
		var distance = Phaser.Point.distance(this.body.position, banc.children[x].body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
		
			sum = Phaser.Point.add(sum, banc.children[x]);
			count++;
		}		
	}

	if (count > 0){
				
		var target = new Phaser.Point(sum.x / count, sum.y / count);
		return this.steer_to(target);
	}
	else {
	
		return sum;
	}
}

// Algo qui determine la direction que le poisson prend
Fish.prototype.steer_to = function(target) {

	var desired = Phaser.Point.subtract(target, this.position);
	var d = desired.getMagnitude();
	// Meilelur facon de faire ?
	//var steer = new Phaser.Point(0,0);
	
	if (d > 0){
	
		desired.normalize();
		
		if (d < 100.0)
			desired.multiply(MAX_SPEED * (d/100.0));
		else
			desired.multiply(MAX_SPEED);
	
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
	var count = 0;

	for (var x in banc.children){
		
		var distance = Phaser.Point.distance(this.body.position, banc.children[x].body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
		
			mean = Phaser.Point.add(mean, banc.children[x]);
			count++;
		}		
	}

	if (count > 0){
		mean = new Phaser.Point(mean.x / count, mean.y / count);
	}

	mean.limit(MAX_FORCE);
	return mean;
}

Fish.prototype.separate = function (neighbours){

	var mean = new Phaser.Point();
	var count = 0;

	for (var x in banc.children){
		
		var distance = Phaser.Point.distance(this.body.position, banc.children[x].body.position);

		if (distance > 0 && distance < DESIRED_SEPARATION){

			// A revoir
			mean = Phaser.Point.add(mean, Phaser.Point.subtract(this.body.position, banc.children[x].body.position).normalize().divide(distance, distance));
			count++;
		}		
	}

	if (count > 0){
		mean = new Phaser.Point(mean.x / count, mean.y / count);
	}

	return mean;

}

function preload() {

    game.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
 }
 
function create() {

	game.stage.backgroundColor = "#0099FF";
	
	banc = game.add.group();

	for(var i = 0; i < 10; i++) {
        banc.add(new Fish(Math.random()*300, Math.random()*300, banc));
    }
    
    //game.add.tween(fish).to({ x: game.width }, 10000, Phaser.Easing.Linear.None, true);

}

function update(){

	for (var x in banc.children){
		banc.children[x].step(banc);
	}

}

function render () {

     // debug helper
     //game.debug.bodyInfo(banc, 16, 24);
}



