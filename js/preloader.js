MyGame.Preloader = function(game) {
    this.preloadBar = null;
    this.ready = false;
};

MyGame.Preloader.prototype = {

    preload: function () {

        // this.preloadProg = this.add.sprite(this.world.centerX, this.world.centerY, 'progression');
		// this.preloadProg.anchor.setTo(0.5, 0.5);
		
		// this.load.setPreloadSprite(this.preloadProg);
		
		
		this.load.image('wall', 'assets/wall.png');
		this.load.image('wall2', 'assets/wall2.png');
		this.load.image('background', 'assets/background.png');
		this.load.spritesheet('fish', 'assets/poisse.png', 300, 200);
		this.load.spritesheet('fish2', 'assets/poisson3.png', 122, 70);
		this.load.image('obstacle1', 'assets/obstacle1.png');
		this.load.image('obstacle2', 'assets/obstacle2.png');
    },

    create: function () {
		this.state.start('game');
    },

    update: function () {

     //this.state.start('game');

    }
};