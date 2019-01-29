// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the images and sounds 
        game.load.image('player', 'assets/birdy.png'); 
        game.load.image('rock', 'assets/rock.png')
        game.load.image('cloud', 'assets/icns_clouds128.png');
        game.load.image('ufo', 'assets/ufo.png');
        game.load.image('meteor', 'assets/meteor128.png');
        game.load.image('gold', 'assets/gold64.png');

        game.load.image('dead', 'assets/game_over.png');

        game.load.audio('jump', 'assets/jump.wav'); 
        game.load.audio('piano', 'assets/purple_planet_piano_at_night.wav');

    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  
        game.stage.backgroundColor = '#001372'; // 0 19 117
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.jumpSound = game.add.audio('jump'); 
        this.music = game.add.audio('piano');
        this.music.play();

        this.bird = game.add.sprite(100, 245, 'player');

        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        this.bird.anchor.setTo(-0.2, 0.5); 


        var spaceKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        if (this.bird.y < 0 || this.bird.y > 490) {
            this.die();
        }

        this.projectiles = game.add.group(); 
        this.clouds = game.add.group();
        this.coins = game.add.group();
        this.timer_coins = game.time.events.loop(1700, this.addCoinCluster, this);
        this.timer_rocks = game.time.events.loop(1700, this.spawnProjectile, this); 
        this.timer_clouds = game.time.events.loop(5500, this.addCloudCluster, this);
        this.timer_ufo = game.time.events.loop(3000, this.spawnUFO, this);
        this.timer_metor = game.time.events.loop(6000, this.spawnMeteor, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", 
            { font: "30px Helvetica", fill: "#ffffff" });

    },

    update: function() {

        if (this.bird.angle < 20)
            this.bird.angle += 1; 

        game.physics.arcade.overlap(this.bird, this.coins, this.incrementScore, null, this);
        game.physics.arcade.overlap(this.bird, this.projectiles, this.collide, null, this);  
    },

    incrementScore: function() {
        if (this.bird.alive) {
            this.score++;
            this.labelScore.text = this.score; 
        }
    },

    // Make the bird jump 
    jump: function() {
        if (this.bird.alive == false) 
            return;

        this.jumpSound.play();
        this.bird.body.velocity.y = -350;

        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start(); 
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    spawnProjectile: function() {
        for (var i = 0; i < 8; i++)
            {
                var rock = game.add.sprite(400, i, 'rock');
                this.projectiles.add(rock);

                game.physics.arcade.enable(rock);

                rock.body.velocity.x = -300; 
                rock.body.velocity.y = 300;

                rock.checkWorldBounds = true;
                rock.outOfBoundsKill = true;
            }
    },

    spawnUFO: function() {
        var pos = Math.floor(Math.random() * 4) + 1;
        var ufo = game.add.sprite(400, pos*100, 'ufo');
        this.projectiles.add(ufo);

        game.physics.arcade.enable(ufo);

        ufo.body.velocity.x = -500; 
        ufo.checkWorldBounds = true;
        ufo.outOfBoundsKill = true;
    },

    spawnMeteor: function() {
        var meteor = game.add.sprite(400, 0, 'meteor');
        this.projectiles.add(meteor);
        game.physics.arcade.enable(meteor);
        
        meteor.body.velocity.x = -1000; 
        meteor.body.velocity.y = 1500;

        meteor.checkWorldBounds = true;
        meteor.outOfBoundsKill = true;
    },

    addCloud: function(x, y) {
        var cloud = game.add.sprite(x, y, 'cloud');
        this.clouds.add(cloud);

        game.physics.arcade.enable(cloud);
        cloud.body.velocity.x = -100; 

        cloud.checkWorldBounds = true;
        cloud.outOfBoundsKill = true;
    },

    addCloudCluster: function() {
        this.addCloud(400, 5); 
        this.addCloud(430, 10); 
        this.addCloud(420, 35); 
        this.addCloud(380, 1); 
    },

    addCoin: function(x, y) {
        var coin = game.add.sprite(x, y, 'gold');
        this.coins.add(coin);

        game.physics.arcade.enable(coin);
        coin.body.velocity.x = -200;
        coin.body.velocity.y = 100;

        coin.checkWorldBounds = true;
        coin.outOfBoundsKill = true;

    },

    addCoinCluster: function() {
        var range = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < range; i ++) {
            var pos_x = Math.floor(Math.random() * 4) + 1;
            var pos_y = Math.floor(Math.random() * 4) + 1;
            this.addCoin(400, 100*pos_y);
        }

    }, 
    
    collide: function() {
        if (this.bird.alive == false)
            return;

        this.bird.alive = false;

        game.time.events.remove(this.timer_coins);
        game.time.events.remove(this.timer_rocks);
        game.time.events.remove(this.timer_clouds);
        game.time.events.remove(this.timer_ufo);
        game.time.events.remove(this.timer_metor);

        this.projectiles.forEach(function(p) {
            p.body.velocity.x = 0;
        }, this);

        this.die();

    }, 

    die: function() {
        var dead = game.add.sprite(45, 90, 'dead');
        game.physics.arcade.enable(dead);

        restartMsg = game.add.text(45, 300, "0", 
            { font: "25px Courier", fill: "#ffffff" });
        restartMsg.text = "Press ENTER to restart";

        var restartKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.ENTER);
        restartKey.onDown.add(this.restartGame, this); 
    },

};

var game = new Phaser.Game(400, 490);
game.state.add('main', mainState); 
game.state.start('main');

window.onload = function() {
    document.getElementById('h1').value = this.game.state.score;
}