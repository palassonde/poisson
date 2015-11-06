

var MyGame = {};

MyGame.Boot = function (game) {
};


MyGame.Boot.prototype = {
    
    init: function () {
		this.input.maxPointers = 1;
		this.stage.backgroundColor = 0xFFFFFF;
    },

    preload: function () {
		this.load.image('progression', 'assets/bar_prog.png');
    },

    create: function () {
        this.state.start('preloader');
    }
};