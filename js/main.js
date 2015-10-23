// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});

// Groupe de poissons
var banc;
var fishNumber = 10;
var nemo;

//Constantes a parametriser
var NEIGHBOUR_RADIUS = 120;
var MAX_SPEED = 1;
var MAX_FORCE = 10;
var DESIRED_SEPARATION = 100;
//var SEPARATION_WEIGHT = 10;
//var ALIGNMENT_WEIGHT = 10;
//var COHESION_WEIGHT = 10;

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.getMagnitude() > MAX){

		this.setMagnitude(MAX);
	}

	return this;
}

// Constructeur de l'objet fish
var Fish = function(x, y) {

	if(x > 300){
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
	this.velocity = new Phaser.Point();//Math.random()*2-1, Math.random()*2-1);
	

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

	var separation = this.separate(neighbours);//.multiply(10000,10000);
	var alignment = this.align(neighbours);//.multiply(10000,10000);
	var cohesion = this.cohere(neighbours);//.multiply(10000,10000);

	return Phaser.Point.add(Phaser.Point.add(separation, alignment), cohesion);

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
		
		var d = Phaser.Point.distance(this.body.position, neighbours.children[x].body.position);

		if (d > 0 && d < DESIRED_SEPARATION){

			var diff = Phaser.Point.subtract(this.body.position, neighbours.children[x].body.position);
			diff.normalize();
			diff.divide(d, d);
			mean.add(diff.x, diff.y);
			count++;
		}
	}

	mean = this.checkBorders(count, mean);

  	if(mean.getMagnitude() > 0) {
	    mean.normalize();
	    mean.multiply(MAX_SPEED, MAX_SPEED);
	    mean.subtract(this.body.velocity.x, this.body.velocity.y);
	    mean.limit(MAX_FORCE);
  	}

	return mean;
}


Fish.prototype.checkBorders = function(count, mean) {

	

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

  	return mean;
}


function preload() {

    game.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
	game.load.spritesheet('fish2', 'assets/poisson3.png', 122, 70);
 }
 
function create() {

	game.stage.backgroundColor = "#0099FF";
	
	banc = game.add.group();

	for(var i = 0; i < fishNumber; i++) {
			banc.add(new Fish(i - 100 + game.width /2, i + game.height / 2));
    }

    //banc.add(new Fish(100, 100));
    nemo = banc.add(new Fish(50, 50));
   

}

function update(){

	for (var x in banc.children){
		banc.children[x].step(banc);
		//if (banc.children[x].velocity.x < 0)
			//banc.children[x].animations.play('gauche');
		//else
			banc.children[x].animations.play('droite');
	}

}

function render () {

     // debug helper
     game.debug.bodyInfo(nemo, 16, 24);
}



