// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});

var banc;
var neighbour_radius = 50;

var Fish = function(x, y, group) {

	Phaser.Sprite.call(this, game, x, y, 'fish');
	
	this.anchor.setTo(0.5, 0.5);
	this.group = group;
	this.game.physics.arcade.enableBody(this);

	// Animations
	this.animations.add('droite', [0,1,2,3,4], 5, true);
	this.animations.add('gauche', [6,7], 5, true);
	this.animations.play('droite');
	this.scale.setTo(0.15,0.15);

};

Fish.prototype = Object.create(Phaser.Sprite.prototype);
Fish.prototype.constructor = Fish;

Fish.prototype.move = function (){

	this.body.velocity.x += 2;

}

Fish.prototype.cohesion = function (){

	var sum = new Phaser.Point();
	var count = 0;

	for (var x in banc.children){
		
		var distance = Phaser.Point.distance(this.body.position, banc.children[x].body.position);

		if (distance > 0 && distance < neighbour_radius){
		
			sum.add(banc.children[x].body.position.x, banc.children[x].body.position.y);
			count++;
		}
		
		if (count > 0){
				
			var target = new Phaser.Point(sum.x / count, sum.y / count);
			return this.steer_to(target);
		}
		else {
		
			return sum;
		}
		
	}
}

Fish.prototype.steer_to = function(target) {

	var desired = Phaser.Point(target, this.position)
	//console.log(target);
	
}

Fish.prototype.align = function (){

}

Fish.prototype.seperate = function (){

}

function preload() {

    game.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
 }
 
function create() {

	game.stage.backgroundColor = "#AAAAAA";
	
	banc = game.add.group();

	for(var i = 0; i < 10; i++) {
        banc.add(new Fish(Math.random()*300, Math.random()*300, banc));
    }
    
    //game.add.tween(fish).to({ x: game.width }, 10000, Phaser.Easing.Linear.None, true);

}

function update(){

	for (var x in banc.children){
		banc.children[x].move();
		banc.children[x].cohesion();
	}

}

function render () {

     // debug helper
     //game.debug.bodyInfo(banc, 16, 24);
}



