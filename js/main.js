// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});

// Groupe de poissons
var banc;

//Constantes a parametriser
var NEIGHBOUR_RADIUS = 100;
var MAX_SPEED = 1;
var MAX_FORCE = 10;
var DESIRED_SEPARATION = 40;
var SEPARATION_WEIGHT = 0.5;
var ALIGNMENT_WEIGHT = 0.5;
var COHESION_WEIGHT = 0.5;

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.getMagnitude() > MAX){

		this.setMagnitude(MAX);
	}

	return this;
}

// Constructeur de l'objet fish
var Fish = function(x, y) {

	Phaser.Sprite.call(this, game, x, y, 'fish');

	// Vitesse de depart
	this.velocity = new Phaser.Point(Math.random()*2-1, Math.random()*2-1);
	this.radius = Math.sqrt(this.height * this.height + this.width * this.width) / 2;

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

	this.velocity = Phaser.Point.add(this.velocity, acceleration).limit(MAX_SPEED);
	this.body.position.add(this.velocity.x, this.velocity.y);
	this.checkBorders();
}

// Algo principale qui agrege toutes les fonctions du comportement
Fish.prototype.flock = function (neighbours){

	var separation = this.separate(neighbours).multiply(SEPARATION_WEIGHT,SEPARATION_WEIGHT);
	var alignment = this.align(neighbours).multiply(ALIGNMENT_WEIGHT,ALIGNMENT_WEIGHT);
	var cohesion = this.cohere(neighbours).multiply(COHESION_WEIGHT,COHESION_WEIGHT);

	return Phaser.Point.add(Phaser.Point.add(separation, alignment), cohesion);

}

// Algo plus bas niveau qui definit la cohesion
Fish.prototype.cohere = function (neighbours){

	var sum = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){
		
		var distance = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
		
			sum = Phaser.Point.add(sum, neighbours.children[x]);
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
	var count = 0;

	for (var x in neighbours.children){
		
		var distance = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (distance > 0 && distance < NEIGHBOUR_RADIUS){
		
			mean = Phaser.Point.add(mean, neighbours.children[x]);
			count++;
		}		
	}

	if (count > 0){
		mean.divide(count, count)
	}

	mean.limit(MAX_FORCE);
	return mean;
}

Fish.prototype.separate = function (neighbours){

	var mean = new Phaser.Point();
	var count = 0;

	for (var x in neighbours.children){
		
		var distance = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		

		if (distance > 0 && distance < DESIRED_SEPARATION){

			// A revoir
			mean = Phaser.Point.add(mean, Phaser.Point.subtract(this.body.position, neighbours.children[x].body.position).normalize().divide(distance, distance));
			count++;

		}		
	}

	if (count > 0){
		mean.divide(count, count);
	}

	return mean;
}


Fish.prototype.checkBorders = function() {

  if(this.body.position.x < -this.radius ){
    this.body.position.x = this.game.width + this.radius;
  }
  if(this.body.position.y < -this.radius ){
    this.body.position.y = this.game.height + this.radius;
  }
  if(this.body.position.x > this.game.width + this.radius ){
    this.body.position.x = -this.radius;
  }
  if(this.body.position.y > this.game.height + this.radius ){
    this.body.position.y = -this.radius;
  }
}


function preload() {

    game.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
 }
 
function create() {

	game.stage.backgroundColor = "#0099FF";
	
	banc = game.add.group();

	for(var i = 0; i < 100; i++) {
        //banc.add(new Fish(Math.random()*500, Math.random()*500, banc));
        banc.add(new Fish(300,300));
    }
    
    //game.add.tween(fish).to({ x: game.width }, 10000, Phaser.Easing.Linear.None, true);

}

function update(){

	for (var x in banc.children){
		banc.children[x].step(banc);
		if (banc.children[x].velocity.x < 0)
			banc.children[x].animations.play('gauche');
		else
			banc.children[x].animations.play('droite');
	}

}

function render () {

     // debug helper
     //game.debug.bodyInfo(banc, 16, 24);
}



