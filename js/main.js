// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render : render});


var fish;

function preload() {

    game.load.spritesheet('poisson', 'assets/poisse.png', 300, 200);
 }

function create() {

	game.stage.background = "#AAAAAA";

    fish = game.add.sprite(0,300, 'poisson');
    fish.animations.add('droite', [0,1,2,3,4], 5, true);
    fish.animations.add('gauche', [6,7], 5, true);
    fish.animations.play('droite');
    fish.scale.setTo(0.3,0.3);
    game.physics.enable(fish, Phaser.Physics.ARCADE);
    game.add.tween(fish).to({ x: game.width }, 10000, Phaser.Easing.Linear.None, true);

}

function update(){

}

function render () {

     // debug helper
     // game.debug.bodyInfo(fish, 16, 24);

}
