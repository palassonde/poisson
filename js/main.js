// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

var game = new Phaser.Game(1024, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update});//,render : remder});

var server = 'http://localhost:8080/';

function preload() {

    game.load.image('fish', 'fish.png');

 }

function create() {

    var fish = game.add.sprite(200,100, 'cloud');
    var tween = game.add.tween(fish);
    tween.to({x: 650}, 3000);

}

function createPlatforms(){

    
}

function render () {

     // //debug helper
     game.debug.bodyInfo(fish, 16, 24);

}
