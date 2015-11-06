// Pierre-Alexandre Lassonde
// Julien Perron
// Firas Cherif

MyGame.Game = function (game) {

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
};

MyGame.Game.prototype = {

    create : function (game) {
		
		// création de l'arrière-plan
		this.game.add.tileSprite(0, 0, game.width, game.height, 'background');
				
		//VariableGlobal
		this.variable = new variable(game);

		this.banc =[];
		
		// creation mur
		this.game.add.sprite(0, 0, 'wall');
		this.game.add.sprite(0, 580, 'wall');
		this.game.add.sprite(0, 0, 'wall2');
		this.game.add.sprite(1007,0, 'wall2');
		
		// creation obstacle
		this.obstacles = [];
		
		var obstacle1 = this.game.add.sprite(785, 440, 'obstacle1');
		this.game.physics.arcade.enableBody(obstacle1);
		
		var obstacle2 = this.game.add.sprite(412, 200, 'obstacle2');
		this.game.physics.arcade.enableBody(obstacle2);
		
		this.obstacles.push(obstacle1);
		this.obstacles.push(obstacle2);
		
		for (var x in this.banc){
			this.obstacles[x].anchor.set(0.5);
		}

		//active ou desactive le mode Debug
		this.actionKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.actionKey.onDown.add(this.debugText, this);
		
		this.actionKeyCohere = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
		this.actionKeyCohere.onDown.add(this.setCohereVision, this);
		
		this.actionKeySeperate = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.actionKeySeperate.onDown.add(this.setSeperateVision, this);
		
		this.actionKeyAlign = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.actionKeyAlign.onDown.add(this.setAlignVision, this);

		//Texte pour le mode debug
		var style = {font: "12px Arial", fill: "#ffffff"};
		this.text = this.add.text(25,25, "Debug activé (appuyer sur un poisson)", style);
		this.text.visible = false;
		
		var style2 = {font: "12px Arial", fill: "#ffffff"};
		this.boutonDebug = this.add.text(25,25, "Appuyer sur D pour activer le mode debug", style2);
		this.boutonDebug.visible = true;

		
		// creer les poissons sur la scene
		for(var i = 0; i < this.variable.FISH_NUMBER; i++) {
			this.banc.push(new Fish(Math.random() * game.width / 1.1 + 100, Math.random() * game.height/1.1 + 100, 
									this.game,this.banc,this.variable, this.obstacles));
			
		}
		
	},
	
	update: function () {
		
		var nbPoisson = document.getElementById("nbPoisson").value;
		var speed = document.getElementById("vitessePoisson").value;
		var alignment_radius = document.getElementById("rayonMoyenAlignement").value;
		var cohesion_radius = document.getElementById("rayonMoyenCohesion").value;
		var separation_radius = document.getElementById("rayonMoyenSeparation").value;
		var rotation = document.getElementById("vitesseAngulairePoisson").value;
		var force = document.getElementById("force").value;
		
		if(this.variable.FISH_NUMBER !== nbPoisson){
			this.variable.FISH_NUMBER = nbPoisson;
			this.createPoisson();
		}
		
		if(this.variable.SEPARATION_RADIUS !== separation_radius){
			this.variable.SEPARATION_RADIUS = separation_radius;
		}
		
		if(this.variable.COHESION_RADIUS !== cohesion_radius){
			this.variable.COHESION_RADIUS = cohesion_radius;
		}
		
		if(this.variable.ALIGNMENT_RADIUS !== alignment_radius){
			this.variable.ALIGNMENT_RADIUS = alignment_radius;
		}

		this.variable.MAX_SPEED = speed;
		this.variable.MAX_FORCE = force;
		this.variable.ROTATION_MAX = rotation;
		
		for (var x in this.banc){
			this.banc[x].step(this.banc);
		}
		
    },
	
	setTexte : function (){
		if(this.variable.debug){
			 this.text.setText("Debug activé (appuyer sur un poisson)" + "\nDébug Cohésion (appuyer sur C) : " + this.variable.visibleCohere + "\nDébug Sépération (appuyer sur S) : " + this.variable.visibleSeperation + "\nDébug Alignement (appuyer sur A) : " + this.variable.visibleAlign);
		}
	},
	
	setCohereVision : function (){
		this.variable.visibleCohere = !this.variable.visibleCohere;
		this.setTexte();
		this.variable.cercles_cohere.visible = (this.variable.visibleCohere ||  this.variable.visibleSeperation);
		
	},
	
	setSeperateVision : function (a,b){
		this.variable.visibleSeperation = !this.variable.visibleSeperation;
		this.setTexte();
		this.variable.cercles_separation.visible = this.variable.visibleSeperation;
		this.variable.cercles_cohere.visible = (this.variable.visibleCohere ||  this.variable.visibleSeperation);
		this.variable.cercles_align.visible = (this.variable.visibleAlign || this.variable.visibleSeperation);
	},
	
	setAlignVision : function (a,b){
		this.variable.visibleAlign = !this.variable.visibleAlign;
		this.setTexte();
		this.variable.cercles_align.visible = (this.variable.visibleAlign || this.variable.visibleSeperation);
	},
	
	debugText: function (){

		this.variable.debug = !this.variable.debug;
		this.text.visible = this.variable.debug;
		this.setTexte();
		this.boutonDebug.visible = !this.variable.debug;
		
		//Desactive-active l'Action de clique sur le poisson
		for (var x in this.banc){
			this.banc[x].poisson.inputEnabled = this.variable.debug;
		}

		afficherInformation(this.variable.debug, this.banc);
	},
	
	createPoisson: function (){
		
		for (var x in this.banc){
			this.banc[x].effaceInfo();
			this.banc[x].poisson.destroy();
		}
		this.banc = [];
		
		// creer les poissons sur la scene
		for(var i = 0; i < this.variable.FISH_NUMBER; i++) {
			this.banc.push(new Fish(Math.random() * this.game.width, Math.random() * this.game.height, 
									this.game,this.banc,this.variable, this.obstacles));
		}

	}
};

variable = function (game) {

		this.FISH_NUMBER = 10;
		this.ALIGNMENT_RADIUS = 300;
		this.COHESION_RADIUS = 300;
		this.SEPARATION_RADIUS = 80;
		this.MAX_SPEED = 4;
		this.MAX_FORCE = 1;
		this.COLOR_COHERE = 0xd300cc;
		this.COLOR_SEPARATION = 0xffd900;
		this.COLOR_ALIGN = 0x3fd300;
		this.ROTATION_MAX = 100;
		this.distance = 100;
		this.debug = false;
		this.visibleCohere = true;
		this.visibleSeperation = true;
		this.visibleAlign = true;
		
		//Graphic pour dessiner disque
		this.cercles_separation = game.add.graphics(0, 0);
		this.cercles_align = game.add.graphics(0, 0);
		this.cercles_cohere = game.add.graphics(0, 0);
};

Fish = function (x, y, game, banc, variable, obstacles) {

	this.variable = variable;
	this.obstacles = obstacles;
	this.banc = banc;
	
	if(x > game.width / 2){
		this.poisson = game.add.sprite(x, y, 'fish');
		this.poisson.animations.add('droite', [0,1,2,3,4], 5, true);
		this.poisson.scale.setTo(0.15,0.15);

	}else {	
		this.poisson = game.add.sprite(x, y, 'fish2');
		this.poisson.animations.add('droite', [0,1,2,3,4,5,6], 5, true);
		this.poisson.scale.setTo(0.4,0.4);
	}
	
	this.pointText = game.add.text(0,0, "",{font: "12px Arial", fill: "#ffffff"});
	this.pointText.visible = false;
	
	//Permet de savoir quel poisson est en debug
	this.isDebug = false;

	this.magnitudeRelentir = 0;
	
	var graphics = game.add.graphics(0, 0);
	//Créer une pointe pour la cohesion
	createFleche(graphics,this.variable.COLOR_COHERE);
	this.pointeCohere = game.add.sprite(0, 0, graphics.generateTexture());
	this.pointeCohere.anchor.y = 0.5;
	this.pointeCohere.visible = false;
	graphics.clear();
	
	// //Créer un vecteur de direction (align)
	createFleche(graphics,this.variable.COLOR_ALIGN);
	this.vecteurAlign = game.add.sprite(0, 0, graphics.generateTexture());
	this.vecteurAlign.anchor.y = 0.5;
	this.vecteurAlign.visible = false;
	graphics.clear();
	
	// //Créer un vecteur de direction (separation)
	createFleche(graphics, this.variable.COLOR_SEPARATION);
	this.vecteurSeparation = game.add.sprite(0, 0, graphics.generateTexture());
	this.vecteurSeparation.anchor.y = 0.5;
	this.vecteurSeparation.visible = false;
	graphics.clear();
	
	// Vitesse de depart
	this.velocity = new Phaser.Point();

	//Si on clique sur un poisson
	this.poisson.events.onInputDown.add(this.clickFish, this);
	this.poisson.inputEnabled = this.variable.debug;
	
	// Relier a lobjet sprite de phaser
	this.poisson.anchor.setTo(0.5, 0.5);
	game.physics.arcade.enableBody(this.poisson);
	this.poisson.body.collideWorldBounds = true;

	// Animations
	this.poisson.animations.play('droite');

};


Fish.prototype = {

	// Premiere fonction du mouvement des poissons
	step: function (neighbours){
		this.magnitudeRelentir = 1;
		var acceleration = this.flock(neighbours);
		var stayin = this.checkMurs().multiply(20,20);
		var dodge = this.checkObstacles();
		
		this.velocity.add(acceleration.x, acceleration.y).add(dodge.x, dodge.y).add(stayin.x, stayin.y).limit(this.variable.MAX_SPEED);
		
		var magnitude = this.velocity.getMagnitude();
		
		var maxAngle = this.poisson.game.math.degToRad((this.variable.ROTATION_MAX * this.poisson.game.time.elapsed) / 1000); //Donne l'angle maximal pour x temps.
		
		var angleVoulu = this.poisson.game.math.angleBetween(
			this.poisson.x, this.poisson.y,
			(this.velocity.x + this.poisson.x), (this.velocity.y + this.poisson.y)
		);
		
		if (this.poisson.rotation !== angleVoulu) {

			var dif = angleVoulu - this.poisson.rotation;

			if (dif > Math.PI){
				dif -= Math.PI * 2;
			} 
			if (dif < -Math.PI){
				dif += Math.PI * 2;
			} 

			if (dif > 0) {
				this.poisson.rotation += maxAngle;
			} else {
				this.poisson.rotation -= maxAngle;
			}

			if (Math.abs(dif) < maxAngle) {
				this.poisson.rotation = angleVoulu;
			}
		}
		
		this.velocity.x = Math.cos(this.poisson.rotation) * magnitude * this.magnitudeRelentir;
		this.velocity.y = Math.sin(this.poisson.rotation) * magnitude * this.magnitudeRelentir;
		
		this.poisson.body.position.add(this.velocity.x, this.velocity.y);
		
		if(this.isDebug && this.variable.debug){
			this.variable.cercles_separation.position.add(this.velocity.x, this.velocity.y); 
			this.variable.cercles_align.position.add(this.velocity.x, this.velocity.y);
			this.variable.cercles_cohere.position.add(this.velocity.x, this.velocity.y);
			 
			this.pointText.position.add(this.velocity.x, this.velocity.y); 
			this.pointText.text = "(" + this.pointText.x.toFixed(0) + "," + this.pointText.y.toFixed(0) + ")";
			this.pointText.visible = this.variable.visibleCohere;
		}
	},

	// Algo principale qui agrege toutes les fonctions du comportement
	flock: function (neighbours){
		this.poisson.body.acceleration.setTo(0,0);

		var separation = this.separate(neighbours);
		var alignment = this.align(neighbours);
		var cohesion = this.cohere(neighbours);
		
		return separation.add(alignment.x, alignment.y).add(cohesion.x, cohesion.y);
	},
	
	separate: function (neighbours){

		var mean = new Phaser.Point();
		var count = 0;

		for (var x in neighbours){
			
			var d = Phaser.Point.distance(this.poisson.body.position, neighbours[x].poisson.body.position);
			
			if (d > 0 && d < this.variable.SEPARATION_RADIUS){
				var diff = Phaser.Point.subtract(this.poisson.body.position, neighbours[x].poisson.body.position);
				diff.normalize();
				diff.divide(d, d);
				mean.add(diff.x, diff.y);
				count++;
				
				tmp = d/(this.variable.SEPARATION_RADIUS);
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
			}
		}

		if(mean.getMagnitude() > 0) {
			mean.normalize();
			if(this.isDebug && this.variable.debug){	
				this.vecteurSeparation.x = this.poisson.body.x + ((this.poisson.body.width)/2);
				this.vecteurSeparation.y = this.poisson.body.y + ((this.poisson.body.height)/2);
				this.vecteurSeparation.rotation = Math.atan2(mean.y, mean.x);		
				this.vecteurSeparation.visible = this.variable.visibleSeperation;
			}
			
			mean.multiply(this.variable.MAX_SPEED, this.variable.MAX_SPEED);
			mean.subtract(this.poisson.body.velocity.x, this.poisson.body.velocity.y);
			mean.limit(this.variable.MAX_FORCE);
		}else{
			if(this.isDebug && this.variable.debug){			
				this.vecteurSeparation.visible = false;
			}
		}

		if (count > 1){
			mean.divide(count,count);
		}
		mean.multiply(20,20);

		return mean;
	},
	
	// Algo plus bas niveau qui definit la cohesion
	cohere: function (neighbours){

		var sum = new Phaser.Point();
		var count = 0;

		for (var x in neighbours){

			var d = Phaser.Point.distance(this.poisson.body.position, neighbours[x].poisson.body.position);

			if (d > 0 && d < this.variable.COHESION_RADIUS){
				

				//Si un poisson en Debug et le debug est actif
				if(this.isDebug && this.variable.debug){
					neighbours[x].pointText.x = neighbours[x].poisson.body.x;
					neighbours[x].pointText.y = neighbours[x].poisson.body.y;
					neighbours[x].pointText.text = "(" + neighbours[x].poisson.body.x.toFixed(0) + "," + neighbours[x].poisson.body.y.toFixed(0) + ")";
					neighbours[x].pointText.visible = this.variable.visibleCohere;
				}
				

				sum.add(neighbours[x].poisson.body.x, neighbours[x].poisson.body.y);
				count++;
			}else{

				//Assure d'Afficher seulement ceux qui sont dans le rayon
				if(this.isDebug && this.variable.debug && d !==0){
					neighbours[x].pointText.visible = false;
				}
			}		
		}

		if (count > 0){


			var target = sum.divide(count, count);
			
			if(this.isDebug && this.variable.debug){
				this.pointeCohere.x = this.poisson.body.x + ((this.poisson.body.width)/2);
				this.pointeCohere.y = this.poisson.body.y + ((this.poisson.body.height)/2);
				this.pointeCohere.rotation = Math.atan2(target.y - this.pointeCohere.y, target.x - this.pointeCohere.x);			
				this.pointeCohere.visible = this.variable.visibleCohere;
			}
			
			return this.steer_to(target);
		}
		else {

			return sum;
		}
	},
	
	// Algo qui determine la direction que le poisson prend
	steer_to: function(target) {

		var desired = Phaser.Point.subtract(target, this.poisson.body.position);
		var d = desired.getMagnitude();;
		
		if (d > 0){

			desired.normalize();
			
			if (d < 100.0)
				desired.multiply(this.variable.MAX_SPEED * (d/100.0), this.variable.MAX_SPEED * (d/100.0));
			else
				desired.multiply(this.variable.MAX_SPEED, this.variable.MAX_SPEED);

			var steer = Phaser.Point.subtract(desired, this.velocity);
			
			steer.limit(this.variable.MAX_FORCE);
		}
		else{

			steer = new Phaser.Point(0,0);
		}
		
		return steer;
	},
	
	align: function (neighbours){

		var mean = new Phaser.Point();
		var steer = new Phaser.Point();
		var count = 0;

		for (var x in neighbours){
			var voisin = neighbours[x];
			var distance = Phaser.Point.distance(this.poisson.body.position, voisin.poisson.body.position);

			if (distance > 0 && distance < this.variable.ALIGNMENT_RADIUS){
				
				if(this.isDebug && this.variable.debug){	
					voisin.vecteurAlign.x = voisin.poisson.body.x + ((voisin.poisson.body.width)/2);
					voisin.vecteurAlign.y = voisin.poisson.body.y + ((voisin.poisson.body.height)/2);
					voisin.vecteurAlign.rotation = Math.atan2(voisin.velocity.y, voisin.velocity.x);			
					voisin.vecteurAlign.visible = this.variable.visibleAlign;
				}
				
				mean.add(voisin.velocity.x, voisin.velocity.y);
				count++;
			}else{
				if(this.isDebug && this.variable.debug){					
					voisin.vecteurAlign.visible = false;
				}
			}		
		}

		if (count > 0){

			mean.divide(count, count);
			mean.normalize();
			
			if(this.isDebug && this.variable.debug){	
				this.vecteurAlign.x = this.poisson.body.x + ((this.poisson.body.width)/2);
				this.vecteurAlign.y = this.poisson.body.y + ((this.poisson.body.height)/2);
				this.vecteurAlign.rotation = Math.atan2(mean.y, mean.x);		
				this.vecteurAlign.visible = this.variable.visibleAlign;
			}
			
			mean.multiply(this.variable.MAX_SPEED, this.variable.MAX_SPEED);
			steer = Phaser.Point.subtract(mean, this.velocity);
			steer.limit(this.variable.MAX_FORCE);
		}

		return steer;
	},
	
	// Function sur un clic dur un poisson
	clickFish: function (){
	
		//Efface tout les dessins
		this.effaceInfo();
		
		//Si c'est PAS le même poisson 
		if(!this.isDebug && this.variable.debug){
			//Met tout les possion sans debug
			for (var x in this.banc){
				this.banc[x].isDebug = false;
			}
			
			this.drawCircle();		
		} 

		this.isDebug = !this.isDebug;
	},
	
	// Function sur un clic dur un poisson
	drawCircle: function (){

		//Cercle de séparation
		this.variable.cercles_separation.beginFill(this.variable.COLOR_SEPARATION, 0.5);
		this.variable.cercles_separation.drawCircle(this.poisson.body.x + ((this.poisson.body.width)/2), this.poisson.body.y + ((this.poisson.body.height)/2), this.variable.SEPARATION_RADIUS * 2);
		
		//Cercle d'alignement
		this.variable.cercles_align.beginFill(this.variable.COLOR_ALIGN, 0.5);
		this.variable.cercles_align.drawCircle(this.poisson.body.x + ((this.poisson.body.width)/2), this.poisson.body.y + ((this.poisson.body.height)/2), this.variable.ALIGNMENT_RADIUS*2);
			
		//Cercle de cohesion
		this.variable.cercles_cohere.beginFill(this.variable.COLOR_COHERE, 0.5);
		this.variable.cercles_cohere.drawCircle(this.poisson.body.x + ((this.poisson.body.width)/2), this.poisson.body.y + ((this.poisson.body.height)/2), this.variable.COHESION_RADIUS*2);
		
		this.pointText.x = this.poisson.body.x;
		this.pointText.y = this.poisson.body.y;
		this.pointText.text = "(" + this.poisson.body.x.toFixed(0) + "," + this.poisson.body.y.toFixed(0) + ")";

		this.pointText.visible = true;
	

	},
	
	effaceInfo: function (){
	
		//Efface tout les cercles
		this.variable.cercles_separation.clear();
		this.variable.cercles_separation.position = new Phaser.Point();
		
		this.variable.cercles_align.clear();
		this.variable.cercles_align.position = new Phaser.Point();
		
		this.variable.cercles_cohere.clear();
		this.variable.cercles_cohere.position = new Phaser.Point();
		
		//Efface tous les point
		for (var x in this.banc){
			this.banc[x].pointText.visible = false;
			this.banc[x].vecteurAlign.visible = false;
			this.banc[x].vecteurSeparation.visible = false;
			this.banc[x].pointeCohere.visible = false;
		}
	},
	
	checkObstacles: function() {

		var mean = new Phaser.Point();
		for (var x in this.obstacles){

			var d = Phaser.Point.distance(this.poisson.body.position, this.obstacles[x].body.position);

			if (d > 0 && d < 300){

				var diff = Phaser.Point.subtract(this.poisson.body.position, this.obstacles[x].body.position);
				diff.normalize();
				diff.divide(d, d);
				mean.add(diff.x, diff.y);
				
				tmp = d/(75 + 150);
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
			}
		}

		if(mean.getMagnitude() > 0) {
			mean.normalize();
			mean.multiply(this.variable.MAX_SPEED, this.variable.MAX_SPEED);
			mean.subtract(this.poisson.body.velocity.x, this.poisson.body.velocity.y);
			mean.limit(this.variable.MAX_FORCE);
		}

		return mean;

	},
	
	checkMurs: function() {

		var mean = new Phaser.Point();
		var diff = Phaser.Point();
		var count = 0;
		
		var distanceMurDroite = Phaser.Point.distance(this.poisson.body.position, new Phaser.Point(this.poisson.game.width - 50, this.poisson.body.y));
		var distanceMurGauche = Phaser.Point.distance(this.poisson.body.position, new Phaser.Point(50, this.poisson.body.y));
		var distanceMurHaut = Phaser.Point.distance(this.poisson.body.position, new Phaser.Point(this.poisson.body.x, 50));
		var distanceMurBas= Phaser.Point.distance(this.poisson.body.position, new Phaser.Point(this.poisson.body.x , this.poisson.game.height - 50));

		var i = 3;
		
		if (distanceMurDroite < this.variable.distance){
				
				var tmp;
				
				if(distanceMurDroite <= 0){
					var tmp = 0;
				}else{
					tmp = Math.sqrt(distanceMurDroite)/Math.sqrt(this.variable.distance);
				}
				
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
				
				diff = Phaser.Point.subtract(this.poisson.body.position, new Phaser.Point(this.poisson.game.width - 50, this.poisson.body.y));
				diff.normalize();
				diff.divide(distanceMurDroite, distanceMurDroite);
				//mean.add(diff.x, diff.y);
				mean.x -= i;
				//mean.Y += 1;
				count++;
		}

		if (distanceMurGauche < this.variable.distance){

				var tmp;
				
				if(distanceMurGauche <= 0){
					var tmp = 0;
				}else{
					tmp = Math.sqrt(distanceMurGauche)/Math.sqrt(this.variable.distance);
				}
				
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
		
				diff = Phaser.Point.subtract(this.poisson.body.position, new Phaser.Point(50, this.poisson.body.y));
				diff.normalize();
				diff.divide(distanceMurGauche, distanceMurGauche);
				//mean.add(diff.x, diff.y);
				count++;
				
				mean.x += i;
				//mean.Y += 1;
		}

		if (distanceMurHaut < this.variable.distance){
				
				var tmp;
				
				if(distanceMurHaut <= 0){
					var tmp = 0;
				}else{
					tmp = Math.sqrt(distanceMurHaut)/Math.sqrt(this.variable.distance);
				}
				
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
				
				diff = Phaser.Point.subtract(this.poisson.body.position, new Phaser.Point(this.poisson.body.x, 50));
				diff.normalize();
				diff.divide(distanceMurHaut, distanceMurHaut);
				//mean.add(diff.x, diff.y);
				count++;
				
				//mean.x += 1;
				mean.y += i;
		}

		if (distanceMurBas < this.variable.distance){
				
				var tmp;
				
				if(distanceMurBas <= 0){
					var tmp = 0;
				}else{
					tmp = Math.sqrt(distanceMurBas)/Math.sqrt(this.variable.distance);
				}
				
				if (this.magnitudeRelentir > tmp){
					this.magnitudeRelentir = tmp;
				}
				
				diff = Phaser.Point.subtract(this.poisson.body.position, new Phaser.Point(this.poisson.body.x , this.poisson.game.height - 50));
				diff.normalize();
				diff.divide(distanceMurBas, distanceMurBas);
				//mean.add(diff.x, diff.y);
				count++;
				
				//mean.x += 1;
				mean.y -= i;
		}
		
		if (count > 1){

			//mean.divide(count,count);
		}
		
		return mean;
	},
};


//Affiche ou efface les info. suplémentaire si on clique sur 'D'
function afficherInformation (bool, banc){

	//Si le mode Debug est activé (on regard si il n'avait pas un poisson en mode debug)
	if(bool){
		for (var x in banc){
			if(banc[x].isDebug){
				banc[x].drawCircle();
			}
		}
	}else {
		banc[0].effaceInfo();
	}
	
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

// Fonction limitatrice ajouter a lobjet Phaser.Point
Phaser.Point.prototype.limit = function(MAX) {

	if (this.getMagnitude() > MAX){

		this.setMagnitude(MAX);
	}
	return this;
}
