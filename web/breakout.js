
var Breakout = function(canvas) {
  if (canvas) {
    context = canvas.getContext('2d');
    inputHandler = new InputHandler(canvas);
    var scene = new Scene("breakout", context, inputHandler);
    var assetFiles = ['nebula.jpg', 'assets/breakout.png', 'assets/explosion.png'];
    var loadedAssets = [];
    var numAssetsLoaded = 0; 
    var numLives = 3;
    var currentLife = 3;
    var gameInProgress = false;
    
    // frames of the explosion animation
    var explosionCells = [];
    var explosionCellSize = 64;
    var explosionRows = 5;
    var explosionCols = 5;
    for (var i=0; i < explosionRows; ++i) {
     for (var j=0; j < explosionCols; ++j) {
       explosionCells.push(
          {
            x: explosionCellSize*j,
            y: explosionCellSize*i,
            width: explosionCellSize,
            height: explosionCellSize
          }
        );
      }
    }
    
    this.setInputControllerAddress = function(url)
    {
        inputHandler.oscOpenController(url);
    }
    
    function handleAssetLoad(e) {
      ++numAssetsLoaded;
      
      // check to see if assets are done being loaded
      if (numAssetsLoaded == assetFiles.length) {
        initScene();
      }
    }
    
    // pre load our assets before beginning
    for (var i=0; i < assetFiles.length; ++i) {
      var asset = new Image();
      asset.onload = handleAssetLoad;
      asset.src = assetFiles[i];
      loadedAssets.push(asset);
    }
  
    function initScene() {
      scene.addLayer("boundary");
      scene.addLayer("background");
      scene.addLayer("blocks");
      scene.addLayer("paddle_ball");
      scene.addLayer("explosions");
      
      createBackground();
      createBlocks();
      createPaddle();
      createBall();
      
      scene.start();
    }
    
    this.stop = function()
    {
        scene.stop();
    }
    
    this.start = function()
    {
        scene.start();
    }
    
    function createBackground() {
      var nebula = new Sprite('nebula', new NebulaRenderer(loadedAssets[0]), [],
                              0, 0, canvas.width, canvas.height);
      scene.addSpriteToLayer('background', nebula);
    
      var textSize = 60;
      var lifeText = new Sprite('lifeText', 
      													new TextRenderer(currentLife, new Color(255, 255, 0), new Color(255, 255, 0), 'Helvetica'), 
      													[new ColorChangerEffect(['R+', 'G+', 'R-', 'B+', 'G-', 'R+', 'B-', 'R-'])],
                                canvas.width-textSize, canvas.height-(canvas.height-textSize), 60, 60);
      scene.addSpriteToLayer('background', lifeText);
    }

    function createBlocks() {
      var i = 0;
      var blockWidth = 45;
      var blockHeight = 15;
      var rows = 14;
      var cols = [];
      for (var i=1; i <= rows; ++i) {
        cols.push(i);
      }
      
      var blockCellWidth = 15;
      var blockCellHeight = 7;
      var blockOffset = 1;
      var cellWidth = 15;
      var cellRows = 5;
      var cellCols = 8;
      var startXOffset = 4;
      for (var i=0; i < cols.length; ++i) {
        for (var j=0; j < cols[i]; ++j) {
          var offset = j % parseInt(cellCols/2);
          var cell = {x:(startXOffset*offset*blockCellWidth)+(startXOffset*offset*blockOffset), y:2*blockCellHeight+blockOffset, width:blockCellWidth, height:blockCellHeight};
          
          blockSprite = new Sprite('rect', 
                        new ImageRenderer(loadedAssets[1], [cell]),
                        [],
                        canvas.width*.5-(blockWidth*cols[i]/2) + (blockWidth * j), 
                        canvas.height*.15+(blockHeight*i), 
                        blockWidth, 
                        blockHeight)
          scene.addSpriteToLayer("blocks", blockSprite);
        }    
      }
    }
    
    function createPaddle() {
      paddleColor = new Color(82, 197, 75);
      paddleWidth = 80;
      paddleHeight = 20;
      var paddleBounds = {x:0, y: canvas.height*.95, width: canvas.width, height: canvas.height};
      paddleSprite = new Sprite('paddle', 
                      new RectRenderer(new Color(57,64,70), 3, paddleColor), 
                      [new MouseDragEffect(inputHandler, 'MIDDLE', paddleBounds)], 
                      canvas.width*.5-paddleWidth, 
                      canvas.height*.95, 
                      paddleWidth, 
                      paddleHeight);
                      
      scene.addSpriteToLayer('paddle_ball', paddleSprite);
    }
   
    var handleBallPaddleCollision = function(ball, paddle) {
      var yModifierValues = [1.1, 1.05, 0.95, 1.05, 1.1];
      var xModifierValues = [1.75, 1.1, 0.5, 1.1, 1.75];
  
      var maxVelocity = 0.5;
      var minVelocity = .01;
      var bounds = ball.getBounds();
      var middle = bounds.left+bounds.width/2;
      var paddleMiddle = paddle.left+paddle.width/2;
      var sectionLength = paddle.width/yModifierValues.length;
      var hitDirection = middle - paddleMiddle;
  
      var hitSection = Math.round((middle-paddle.left)/sectionLength);
      
      if (hitDirection < 0) {
        ball.velocity.x = (ball.velocity.x < 0) ? ball.velocity.x : -ball.velocity.x;
      }
      else {
        ball.velocity.x = Math.abs(ball.velocity.x);
      }
  
      ball.velocity.x *= xModifierValues[hitSection];
      ball.velocity.y = -1 * yModifierValues[hitSection] * ball.velocity.y;
      
      if (Math.abs(ball.velocity.x) < minVelocity) {
        ball.velocity.x = (ball.velocity.x < 0) ? -minVelocity : minVelocity;;
      }
      else if (Math.abs(ball.velocity.x) > maxVelocity) {
        ball.velocity.x = (ball.velocity.x < 0) ? -maxVelocity : maxVelocity;
      }
      
      if (Math.abs(ball.velocity.y) < minVelocity) {
        ball.velocity.y = (ball.velocity.y < 0) ? -minVelocity : minVelocity;
      }
      else if (Math.abs(ball.velocity.y) > maxVelocity) {
        ball.velocity.y = (ball.velocity.y < 0) ? -maxVelocity : maxVelocity;
      }
    };
    
    var handleBallBlockCollision = function(ball, collider) {
      var left = collider.left;
      var top = collider.top;
      var width = collider.width;
      var height = collider.height;
      var colliderLayer = collider.layer;
      colliderLayer.removeSprite(collider);
      
      ball.velocity.x *= -0.98;
      ball.velocity.y *= -0.98;
  
      var explosion = new Sprite('explosion', 
                                 new ImageRenderer(loadedAssets[2], explosionCells, 0.5, false), 
                                 [], 
                                 left, 
                                 top-height/2, 
                                 width, 
                                 width);
      scene.addSpriteToLayer('explosions', explosion);
    };
    
    var handleBallOutOfBounds = function(ball, collider) {
    	if (gameInProgress) {
      	--currentLife;
      	gameInProgress = false;
      }

      if (currentLife <= 0) {
        currentLife = numLives;
        reset();
      }
      else {
        ball.addEffect(new FollowLeaderEffect(paddleSprite, paddleWidth/2, -paddleHeight/2));
        ball.addEffect(new MouseActionEffect(inputHandler, 'LEFT', handleStartBreakout));
      }
      
      var lifeText = scene.getLayer("background").getSprite('lifeText');
      if (lifeText) {
        lifeText.renderer.text = currentLife;
      }
    }
    
    var handleStartBreakout = function(context, sprite, time, mouseCoords) {
      // setup the paddle for mouse following
      var paddleBounds = {x:0, y: canvas.height*.95, width: canvas.width, height: canvas.height};
      paddleSprite.clearEffects();
      paddleSprite.addEffect(new MouseFollowerEffect(inputHandler, paddleBounds));
      
      sprite.clearEffects();
      var spriteBounds = sprite.getBounds();
      
      // calculate velocity based on mouse distance from ball/paddle
      var deltaX = Math.abs(sprite.left - mouseCoords.x);
      var deltaY = Math.abs(sprite.top - mouseCoords.y);
      var velocity = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
      var xMultiplier = deltaX / velocity;
      var yMultiplier = deltaY / velocity;
  
      var velocityX = velocity * xMultiplier;
      var velocityY = velocity * yMultiplier;
      velocityX = ((mouseCoords.x - sprite.left+spriteBounds.width/2) < 0) ? -velocityX : velocityX;
      velocityY = ((mouseCoords.y - sprite.top+spriteBounds.height/2) < 0) ? -velocityY: velocityY;
      
      sprite.addEffect(new BoundedVelocityEffect(velocityX, velocityY));
      sprite.addEffect(new ColliderEffect(scene.getLayer('blocks').sprites, handleBallBlockCollision));
      sprite.addEffect(new ColliderEffect(scene.getLayer('paddle_ball').sprites, handleBallPaddleCollision));
      
      var bottomBoundary = new Sprite('bottomBoundary', 
                                      new RectRenderer(Color.black(), 3, paddleColor), 
                                      [], 
                                      0, 
                                      canvas.height-paddleSprite.height/2, 
                                      canvas.width, 
                                      40);
      scene.addSpriteToLayer("boundary", bottomBoundary);
      sprite.addEffect(new ColliderEffect(scene.getLayer("boundary").sprites, handleBallOutOfBounds));
      
      gameInProgress = true;
    };
    
    function createBall() {
      var ballRadius = 15; 
      var ballSprite = new Sprite('ball', 
                        new CircleRenderer(7, new Color(220, 240, 2), new Color(220, 240, 2)),
                        [new FollowLeaderEffect(paddleSprite, paddleWidth/2, -paddleHeight/2),
                         new MouseActionEffect(inputHandler, 'LEFT', handleStartBreakout)],
                        canvas.width*.5-paddleWidth,
                        canvas.height*.9-paddleHeight-ballRadius*2,
                        7,
                        7);
        
      scene.addSpriteToLayer('paddle_ball', ballSprite);
    }
    
    function reset() {
      scene.getLayer('blocks').removeAllSprites();
      scene.getLayer('paddle_ball').removeAllSprites();
      scene.getLayer('explosions').removeAllSprites();
      
      createBlocks();
      createPaddle();
      createBall();  
    }  
  }
}